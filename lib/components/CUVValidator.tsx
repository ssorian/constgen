'use client';

import { useState, useTransition } from 'react';
import { validateCuv } from '@/actions/certificates/validateCuv';
import { downloadCertificate } from '@/actions/certificates/download';
import { CUVResult } from '@/lib/domain/Certificate';

export default function CUVValidator() {
    const [cuv, setCuv] = useState('');
    const [result, setResult] = useState<CUVResult | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    const handleValidate = () => {
        if (!cuv.trim()) return;
        setDownloadError(null);
        startTransition(async () => {
            const data = await validateCuv(cuv);
            setResult(data);
        });
    };

    const handleDownload = async () => {
        if (!cuv.trim()) return;
        setIsDownloading(true);
        setDownloadError(null);
        try {
            const res = await downloadCertificate(cuv);
            if (res.ok) {
                const url = `data:application/pdf;base64,${res.base64}`;
                const link = document.createElement('a');
                link.href = url;
                link.download = res.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                setDownloadError(res.error || 'Error al descargar la constancia.');
            }
        } catch (err) {
            setDownloadError('Ocurrió un error inesperado al descargar.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="max-w-[700px] mx-auto">
            <form
                className="p-6 md:p-8 bg-white rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-gray-100"
                id="cuvForm"
                onSubmit={(e) => { e.preventDefault(); handleValidate(); }}
            >
                <div className="mb-5">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Clave Única de Validación (CUV)</label>
                    <input
                        type="text"
                        id="cuvInput"
                        name="cuv"
                        placeholder="Ingresa el CUV (ej. RjMh18YaAlP)"
                        value={cuv}
                        onChange={(e) => setCuv(e.target.value.toUpperCase())}
                        className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#691c32] focus:ring-2 focus:ring-[#691c32] focus:ring-opacity-20 outline-none transition-all uppercase text-gray-700 shadow-sm"
                        required
                    />
                </div>
                <button
                    type="submit"
                    id="cuvSubmit"
                    disabled={isPending}
                    className="w-full bg-[#691c32] hover:bg-[#8b2a4a] text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg disabled:opacity-70 flex justify-center items-center"
                >
                    {isPending ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : null}
                    {isPending ? 'Validando...' : 'Validar CUV'}
                </button>
            </form>

            {result && (
                <div id="cuvResult" className={`mt-6 p-6 rounded-xl border-l-[6px] shadow-sm transition-all duration-500 break-words ${result.encontrado ? 'border-[#691c32] bg-[#fdfbf7]' : 'border-red-500 bg-red-50'}`}>
                    {result.encontrado ? (
                        <div id="cuvResultText" className="text-gray-800">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-green-700 mb-1 flex items-center">
                                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        CUV válido
                                    </h3>
                                    <p className="text-sm text-gray-600 font-medium italic">Los datos de la constancia son los siguientes:</p>
                                </div>
                                <button
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    className="bg-[#d5b981] hover:bg-[#c4a66a] text-[#4a1324] font-bold py-2 px-4 rounded-lg transition-colors duration-300 shadow-sm hover:shadow flex justify-center items-center text-sm disabled:opacity-70"
                                >
                                    {isDownloading ? (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#4a1324]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    )}
                                    {isDownloading ? 'Descargando...' : 'Descargar PDF'}
                                </button>
                            </div>

                            {downloadError && (
                                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded shadow-sm">
                                    {downloadError}
                                </div>
                            )}

                            <hr className="border-t border-[#d5b981] mb-5 opacity-50" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white p-4 rounded-lg border border-gray-100 shadow-[inset_0_0_5px_rgba(0,0,0,0.02)]">
                                <div><strong className="text-gray-900 block font-bold text-xs uppercase tracking-wider opacity-70 mb-1">Alumno:</strong> <span className="text-base font-medium">{result.nombre_alumno}</span></div>
                                <div><strong className="text-gray-900 block font-bold text-xs uppercase tracking-wider opacity-70 mb-1">Curso:</strong> <span className="text-base font-medium">{result.titulo_curso}</span></div>
                                <div><strong className="text-gray-900 block font-bold text-xs uppercase tracking-wider opacity-70 mb-1">Horas:</strong> <span className="text-base font-medium">{result.numero_horas}</span></div>
                                <div><strong className="text-gray-900 block font-bold text-xs uppercase tracking-wider opacity-70 mb-1">Año de emisión:</strong> <span className="text-base font-medium">{result.ano_emision}</span></div>
                            </div>
                        </div>
                    ) : (
                        <div id="cuvResultText" className="text-red-700 flex items-center font-medium">
                            <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {result.mensaje}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
