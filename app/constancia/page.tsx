'use client';

import { useState, useEffect } from 'react';
import CertificateForm from './CertificateForm';
import CertificatePreview from './CertificatePreview';
import ExcelUploader from './ExcelUploader';
import { CertificateData } from '@/lib/types/certificate';
import QRCode from 'qrcode';

export default function ConstanciaPage() {
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
    const [error, setError] = useState<string | null>(null);

    const handleGeneratePdf = async () => {
        // Validate all fields are filled
        if (!certificateData.nombre || !certificateData.curso || !certificateData.horas ||
            !certificateData.fecha || !certificateData.cuv) {
            setError('Por favor, completa todos los campos antes de generar el PDF');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch('/api/pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: certificateData }),
            });

            if (!response.ok) {
                throw new Error('Error al generar el PDF');
            }

            // Download the PDF
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `constancia-${certificateData.nombre.replace(/\s+/g, '-')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError('Error al generar el PDF. Por favor, inténtalo de nuevo.');
            console.error('Error:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
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
                            <button
                                onClick={() => setViewMode(viewMode === 'single' ? 'batch' : 'single')}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                {viewMode === 'single' ? 'Ver Lista' : 'Ocultar Lista'}
                            </button>
                        </div>

                        {viewMode === 'batch' && (
                            <div className="overflow-x-auto max-h-60 overflow-y-auto border rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {importedCertificates.map((cert, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectCertificate(cert)}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cert.nombre}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cert.curso}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                                    <button onClick={(e) => { e.stopPropagation(); handleSelectCertificate(cert); }}>
                                                        Ver
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
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

                {/* Generate PDF Button */}
                <div className="text-center">
                    <button
                        onClick={handleGeneratePdf}
                        disabled={isGenerating}
                        className={`
                            px-8 py-4 rounded-lg font-semibold text-white text-lg
                            transition-all transform hover:scale-105 active:scale-95
                            shadow-lg hover:shadow-xl
                            ${isGenerating
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                            }
                        `}
                    >
                        {isGenerating ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Generando PDF...
                            </span>
                        ) : (
                            'Generar PDF'
                        )}
                    </button>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
