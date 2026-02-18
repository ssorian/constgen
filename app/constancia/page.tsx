'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import CertificateForm from './CertificateForm';
import CertificatePreview from './CertificatePreview';
import ExcelUploader from './ExcelUploader';
import { CertificateData } from '@/lib/types/certificate';
import QRCode from 'qrcode';

export default function ConstanciaPage() {
    const { data: session } = useSession();
    const [certificateData, setCertificateData] = useState<CertificateData>({
        nombre: '',
        curso: '',
        horas: 0,
        fecha: '',
        cuv: '',
        validationUrl: '',
    });

    const [importedCertificates, setImportedCertificates] = useState<CertificateData[]>([]);
    const [viewMode, setViewMode] = useState<'single' | 'batch'>('single');
    const [uploadResults, setUploadResults] = useState<any[]>([]);

    const handleDataImported = (data: any[]) => {
        const formattedData: CertificateData[] = data.map((item, index) => ({
            nombre: item.nombre,
            curso: item.curso,
            horas: item.horas,
            fecha: item.fecha,
            cuv: `GEN-${Date.now()}-${index}`, // Placeholder CUV
            validationUrl: '',
            isImported: true
        }));

        setImportedCertificates(formattedData);
        setViewMode('batch');
        if (formattedData.length > 0) {
            setCertificateData(formattedData[0]);
        }
    };

    const handleSelectCertificate = (cert: CertificateData) => {
        setCertificateData(cert);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle real-time QR code generation for preview
    useEffect(() => {
        const generatePreviewQR = async () => {
            // Use validationUrl if it exists, otherwise use a placeholder for preview
            const textToEncode = certificateData.validationUrl || 'https://constgen.example.com/preview-placeholder';

            try {
                const qrUrl = await QRCode.toDataURL(textToEncode, {
                    width: 200,
                    margin: 1,
                    color: {
                        dark: certificateData.validationUrl ? '#2c5282' : '#cbd5e0', // Lighter color for placeholder
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

        const timeoutId = setTimeout(generatePreviewQR, 500); // Debounce QR generation
        return () => clearTimeout(timeoutId);
    }, [certificateData.validationUrl, certificateData.qrCodeDataUrl]);

    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const generatePdfBlob = async (data: CertificateData): Promise<{ blob: Blob, fileName: string }> => {
        const response = await fetch('/api/pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data }),
        });

        if (!response.ok) {
            throw new Error('Error al generar el PDF');
        }

        const blob = await response.blob();
        const fileName = `constancia-${data.nombre.replace(/\s+/g, '-')}.pdf`;
        return { blob, fileName };
    };

    const uploadToOneDrive = async (file: File, fileName: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', fileName);

        const response = await fetch('/api/upload-certificate', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al subir a OneDrive');
        }

        return await response.json();
    };

    const handleGeneratePdf = async (downloadVal = true) => {
        // Validate all fields are filled
        if (!certificateData.nombre || !certificateData.curso || !certificateData.horas ||
            !certificateData.fecha || !certificateData.cuv) {
            setError('Por favor, completa todos los campos antes de generar el PDF');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const { blob, fileName } = await generatePdfBlob(certificateData);

            if (downloadVal) {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }

            return { blob, fileName };
        } catch (err) {
            setError('Error al generar el PDF. Por favor, inténtalo de nuevo.');
            console.error('Error:', err);
            throw err;
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateAndUpload = async () => {
        if (!session) {
            setError("Debes iniciar sesión para subir a OneDrive");
            return;
        }

        setIsUploading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const { blob, fileName } = await handleGeneratePdf(false) as { blob: Blob, fileName: string };
            const file = new File([blob], fileName, { type: 'application/pdf' });

            const result = await uploadToOneDrive(file, fileName);
            setSuccessMessage(`Archivo subido correctamente: ${fileName}`);
        } catch (err: any) {
            setError(err.message || "Error al subir a OneDrive");
        } finally {
            setIsUploading(false);
            setIsGenerating(false); // Ensure generating state is cleared
        }
    };

    const handleGenerateAllAndUpload = async () => {
        if (!session) {
            setError("Debes iniciar sesión para subir a OneDrive");
            return;
        }

        if (importedCertificates.length === 0) {
            setError("No hay constancias para procesar");
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadResults([]);

        let successCount = 0;
        let failCount = 0;

        try {
            // Process sequentially to show progress
            // Note: We could use bulk API but sequential allows better progress feedback 
            // and separate PDF generation calls.
            // Or generate all PDFs first then bulk upload? 
            // Generating all PDFs at once might timeout on serverless functions if too many.
            // Let's do batches of 10 or sequential. Sequential is safer for now.

            const results = [];

            for (let i = 0; i < importedCertificates.length; i++) {
                const cert = importedCertificates[i];
                try {
                    // 1. Generate PDF
                    // We need to ensure each cert has QrCode if needed, logic above does it for `certificateData`
                    // But imported ones might not have it pre-generated. 
                    // The API generates it if validationUrl is sent.

                    const { blob, fileName } = await generatePdfBlob(cert);
                    const file = new File([blob], fileName, { type: 'application/pdf' });

                    // 2. Upload
                    await uploadToOneDrive(file, fileName);

                    results.push({ name: cert.nombre, status: 'success' });
                    successCount++;
                } catch (err) {
                    console.error(`Error processing ${cert.nombre}:`, err);
                    results.push({ name: cert.nombre, status: 'error' });
                    failCount++;
                }

                // Update progress
                setUploadResults([...results]);
            }

            setSuccessMessage(`Proceso completado. Subidos: ${successCount}, Fallidos: ${failCount}`);

        } catch (err: any) {
            setError(err.message || "Error en proceso masivo");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="absolute top-4 right-4">
                {session ? (
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700">Hola, {session.user?.name}</span>
                        <button
                            onClick={() => signOut()}
                            className="text-sm bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded-md transition-colors"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => signIn("microsoft-entra-id")}
                        className="flex items-center gap-2 bg-[#2F2F2F] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#F25022" d="M1 1H10V10H1V1Z" />
                            <path fill="#00A4EF" d="M1 12H10V21H1V12Z" />
                            <path fill="#7FBA00" d="M12 1H21V10H12V1Z" />
                            <path fill="#FFB900" d="M12 12H21V21H12V12Z" />
                        </svg>
                        <span>Iniciar con Microsoft</span>
                    </button>
                )}
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Generador de Constancias
                    </h1>
                    <p className="text-lg text-gray-600">
                        Completa el formulario o importa un Excel para generar tus constancias
                    </p>
                </div>

                <ExcelUploader onDataImported={handleDataImported} />

                {importedCertificates.length > 0 && (
                    <div className="mb-8 p-4 bg-white rounded-lg shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Constancias Importadas ({importedCertificates.length})
                            </h3>
                            <div className="flex gap-2">
                                {viewMode === 'batch' && session && (
                                    <button
                                        onClick={handleGenerateAllAndUpload}
                                        disabled={isUploading}
                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {isUploading ? 'Procesando...' : 'Generar y Subir Todo a OneDrive'}
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

                        {uploadResults.length > 0 && (
                            <div className="mb-4">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full"
                                        style={{ width: `${(uploadResults.length / importedCertificates.length) * 100}%` }}
                                    ></div>
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
                                            const result = uploadResults.find(r => r.name === cert.nombre); // Simple match by name, ideally allow ID
                                            return (
                                                <tr key={idx} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectCertificate(cert)}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cert.nombre}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cert.curso}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {result ? (
                                                            result.status === 'success' ? (
                                                                <span className="text-green-600">Subido ✅</span>
                                                            ) : (
                                                                <span className="text-red-600">Error ❌</span>
                                                            )
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                                        <button onClick={(e) => { e.stopPropagation(); handleSelectCertificate(cert); }}>
                                                            Ver
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-4 bg-white rounded-xl shadow-xl p-8">
                        <CertificateForm
                            data={certificateData}
                            onChange={setCertificateData}
                        />
                    </div>

                    {/* Right Column - Preview */}
                    <div className="lg:col-span-8 bg-white rounded-xl shadow-xl p-8">
                        <CertificatePreview data={certificateData} />
                    </div>
                </div>

                {/* Generate PDF Buttons */}
                <div className="text-center flex flex-col items-center gap-4">
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleGeneratePdf(true)}
                            disabled={isGenerating || isUploading}
                            className={`
                                px-8 py-4 rounded-lg font-semibold text-white text-lg
                                transition-all transform hover:scale-105 active:scale-95
                                shadow-lg hover:shadow-xl
                                ${isGenerating || isUploading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                }
                            `}
                        >
                            {isGenerating && !isUploading ? 'Generando...' : 'Descargar PDF'}
                        </button>

                        {session && (
                            <button
                                onClick={handleGenerateAndUpload}
                                disabled={isGenerating || isUploading}
                                className={`
                                    px-8 py-4 rounded-lg font-semibold text-white text-lg
                                    transition-all transform hover:scale-105 active:scale-95
                                    shadow-lg hover:shadow-xl
                                    ${isGenerating || isUploading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-[#0078D4] hover:bg-[#005a9e]' // OneDrive blue
                                    }
                                `}
                            >
                                {isUploading ? 'Subiendo...' : 'Generar y Subir a OneDrive'}
                            </button>
                        )}
                    </div>

                    {!session && (
                        <p className="text-sm text-gray-500">Inicia sesión con Microsoft para habilitar la subida a OneDrive</p>
                    )}

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
