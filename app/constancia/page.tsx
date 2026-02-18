'use client';

import { useState, useEffect } from 'react';
import CertificateForm from './CertificateForm';
import CertificatePreview from './CertificatePreview';
import ExcelUploader from './ExcelUploader';
import { CertificateData } from '@/lib/types/certificate';
import generateRandomKey from '@/lib/utils/generateRandomKey';
import QRCode from 'qrcode';

export default function ConstanciaPage() {
    const [certificateData, setCertificateData] = useState<CertificateData>({
        nombre: '',
        curso: '',
        horas: 0,
        fecha: '',
        startDate: '',
        endDate: '',
        matricula: '',
        curp: '',
    });

    const [importedCertificates, setImportedCertificates] = useState<CertificateData[]>([]);
    const [viewMode, setViewMode] = useState<'single' | 'batch'>('single');
    const [uploadResults, setUploadResults] = useState<{ name: string; status: 'success' | 'error'; url?: string }[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // QR preview generation
    useEffect(() => {
        const generatePreviewQR = async () => {
            const textToEncode = certificateData.validationUrl || 'https://constgen.example.com/preview-placeholder';
            try {
                const qrUrl = await QRCode.toDataURL(textToEncode, {
                    width: 200,
                    margin: 1,
                    color: {
                        dark: certificateData.validationUrl ? '#2c5282' : '#cbd5e0',
                        light: '#ffffff',
                    },
                });
                if (qrUrl !== certificateData.qrCodeDataUrl) {
                    setCertificateData(prev => ({ ...prev, qrCodeDataUrl: qrUrl }));
                }
            } catch (err) {
                console.error('Error generating preview QR:', err);
            }
        };

        const timeoutId = setTimeout(generatePreviewQR, 500);
        return () => clearTimeout(timeoutId);
    }, [certificateData.validationUrl, certificateData.qrCodeDataUrl]);

    const handleDataImported = (data: any[]) => {
        const formattedData: CertificateData[] = data.map((item, index) => ({
            nombre: item.nombre,
            curso: item.curso,
            horas: item.horas,
            fecha: item.fecha,
            validationUrl: '',
            isImported: true,
        }));

        setImportedCertificates(formattedData);
        setViewMode('batch');
        if (formattedData.length > 0) setCertificateData(formattedData[0]);
    };

    const handleSelectCertificate = (cert: CertificateData) => {
        setCertificateData(cert);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 1. Genera el PDF como Blob llamando a la API interna
    const generatePdfBlob = async (data: CertificateData): Promise<{ blob: Blob; fileName: string }> => {
        // Asegurar CUV generado
        if (!data.cuv) {
            data.cuv = generateRandomKey(data.nombre, data.curso);
        }

        const response = await fetch('/api/pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data }),
        });

        if (!response.ok) throw new Error('Error al generar el PDF');

        const blob = await response.blob();
        const fileName = `constancia-${data.nombre.replace(/\s+/g, '-')}.pdf`;
        return { blob, fileName };
    };

    // 2. Sube el Blob directo a la API de Azure Blob Storage
    const uploadToBlob = async (blob: Blob, fileName: string, certData?: CertificateData): Promise<{ url: string }> => {
        const response = await fetch('/api/upload-certificate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
            body: blob,
        });

        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error(text || 'Respuesta inesperada del servidor');
        }

        if (!response.ok) {
            throw new Error(data?.error || 'Error al subir a Azure Blob Storage');
        }

        // Consumir la API de creación/obtención de alumno y luego registrar el documento
        if (certData) {
            try {
                // Crear u obtener alumno
                const createStudentRes = await fetch('/api/create-student', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        matricula: certData.matricula,
                        curp: certData.curp,
                        nombre_completo: certData.nombre,
                    })
                });

                const studentData = await createStudentRes.json();
                const alumno_id = studentData.alumno_id;

                if (alumno_id) {
                    await fetch('/api/post-certificate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            alumno_id,
                            titulo: certData.curso,
                            cuv: certData.cuv,
                            ano_emision: Number(certData.fecha?.slice(0, 4)) || new Date().getFullYear(),
                            ano_vencimiento: Number(certData.fecha?.slice(0, 4)) || new Date().getFullYear(),
                            numeros_horas: certData.horas,
                            url_certificado: data.url || '',
                        })
                    });
                }
            } catch (e) {
                console.error('Error registrando certificado en DB:', e);
            }
        }

        return data;
    };

    const validateFields = (): boolean => {
        if (!certificateData.nombre || !certificateData.curso || !certificateData.horas ||
            !certificateData.fecha || !certificateData.matricula || !certificateData.curp) {
            setError('Por favor, completa todos los campos antes de continuar');
            return false;
        }
        return true;
    };

    // Subida de constancia individual
    const handleUploadSingle = async () => {
        if (!validateFields()) return;

        setIsUploading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const { blob, fileName } = await generatePdfBlob(certificateData);
            const { url } = await uploadToBlob(blob, fileName, certificateData);
            setSuccessMessage(`Constancia subida correctamente. URL: ${url}`);
        } catch (err: any) {
            setError(err.message || 'Error al subir la constancia');
        } finally {
            setIsUploading(false);
        }
    };

    // Subida masiva de constancias importadas
    const handleUploadAll = async () => {
        if (importedCertificates.length === 0) {
            setError('No hay constancias para procesar');
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadResults([]);

        const results: typeof uploadResults = [];
        let successCount = 0;
        let failCount = 0;

        for (const cert of importedCertificates) {
            try {
                const { blob, fileName } = await generatePdfBlob(cert);
                const { url } = await uploadToBlob(blob, fileName, cert);
                results.push({ name: cert.nombre, status: 'success', url });
                successCount++;
            } catch (err) {
                console.error(`Error procesando ${cert.nombre}:`, err);
                results.push({ name: cert.nombre, status: 'error' });
                failCount++;
            }
            setUploadResults([...results]);
        }

        setSuccessMessage(`Proceso completado — Subidos: ${successCount}, Fallidos: ${failCount}`);
        setIsUploading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Generador de Constancias</h1>
                    <p className="text-lg text-gray-600">
                        Completa el formulario o importa un Excel para subir constancias a Azure Blob Storage
                    </p>
                </div>

                <ExcelUploader onDataImported={handleDataImported} />

                {/* Tabla de importados */}
                {importedCertificates.length > 0 && (
                    <div className="mb-8 p-4 bg-white rounded-lg shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Constancias Importadas ({importedCertificates.length})
                            </h3>
                            <div className="flex gap-2">
                                {viewMode === 'batch' && (
                                    <button
                                        onClick={handleUploadAll}
                                        disabled={isUploading}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        {isUploading ? 'Subiendo...' : 'Subir Todo a Azure'}
                                    </button>
                                )}
                                <button
                                    onClick={() => setViewMode(viewMode === 'single' ? 'batch' : 'single')}
                                    className="text-blue-600 hover:text-blue-800 font-medium px-3 py-2"
                                >
                                    {viewMode === 'single' ? 'Ver Lista' : 'Ocultar Lista'}
                                </button>
                            </div>
                        </div>

                        {/* Barra de progreso */}
                        {uploadResults.length > 0 && (
                            <div className="mb-4">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${(uploadResults.length / importedCertificates.length) * 100}%` }}
                                    />
                                </div>
                                <p className="text-xs text-center mt-1 text-gray-500">
                                    {uploadResults.length} de {importedCertificates.length} procesados
                                </p>
                            </div>
                        )}

                        {viewMode === 'batch' && (
                            <div className="overflow-x-auto max-h-60 overflow-y-auto border rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {importedCertificates.map((cert, idx) => {
                                            const result = uploadResults.find(r => r.name === cert.nombre);
                                            return (
                                                <tr
                                                    key={idx}
                                                    className="hover:bg-gray-50 cursor-pointer"
                                                    onClick={() => handleSelectCertificate(cert)}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cert.nombre}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cert.curso}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {result ? (
                                                            result.status === 'success'
                                                                ? <span className="text-green-600">Subido ✅</span>
                                                                : <span className="text-red-600">Error ❌</span>
                                                        ) : (
                                                            <span className="text-gray-400">Pendiente</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                className="text-blue-600 hover:text-blue-800"
                                                                onClick={(e) => { e.stopPropagation(); handleSelectCertificate(cert); }}
                                                            >
                                                                Ver
                                                            </button>
                                                            {result?.url && (
                                                                <a
                                                                    href={result.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-green-600 hover:text-green-800"
                                                                    onClick={e => e.stopPropagation()}
                                                                >
                                                                    Abrir ↗
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Formulario + Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                    <div className="lg:col-span-4 bg-white rounded-xl shadow-xl p-8">
                        <CertificateForm data={certificateData} onChange={setCertificateData} />
                    </div>
                    <div className="lg:col-span-8 bg-white rounded-xl shadow-xl p-8">
                        <CertificatePreview data={certificateData} />
                    </div>
                </div>

                {/* Botón de subida individual */}
                <div className="text-center flex flex-col items-center gap-4">
                    <button
                        onClick={handleUploadSingle}
                        disabled={isUploading}
                        className={`
                            px-8 py-4 rounded-lg font-semibold text-white text-lg
                            transition-all transform hover:scale-105 active:scale-95
                            shadow-lg hover:shadow-xl
                            ${isUploading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                            }
                        `}
                    >
                        {isUploading ? 'Subiendo...' : 'Generar y Subir a Azure Blob'}
                    </button>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg w-full max-w-2xl">
                            <p className="text-red-700 font-medium">Error</p>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {successMessage && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg w-full max-w-2xl">
                            <p className="text-green-700 font-medium">¡Éxito!</p>
                            <p className="text-green-600 text-sm">{successMessage}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}