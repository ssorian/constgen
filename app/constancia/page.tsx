'use client';

import { useState, useEffect } from 'react';
import CertificateForm from './CertificateForm';
import CertificatePreview from './CertificatePreview';
import ExcelUploader from './ExcelUploader';
import { CertificateData } from '@/lib/types/certificate';
import { generateAndUpload, generateAndUploadBulk, CertificateUploadResult } from '@/actions/certificate';
import QRCode from 'qrcode';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos locales
// ─────────────────────────────────────────────────────────────────────────────

type UploadStatus = { name: string; status: 'success' | 'error'; url?: string };
type ViewMode = 'single' | 'batch';

const EMPTY_CERTIFICATE: CertificateData = {
    nombre: '',
    curso: '',
    horas: 0,
    startDate: '',
    endDate: '',
    matricula: '',
    curp: '',
    emision: '',
    vencimiento: '',
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

export default function ConstanciaPage() {
    // ── Estado ───────────────────────────────────────────────────────────────
    const [certificateData, setCertificateData] = useState<CertificateData>(EMPTY_CERTIFICATE);
    const [importedCertificates, setImportedCertificates] = useState<CertificateData[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('single');
    const [uploadResults, setUploadResults] = useState<UploadStatus[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // ── QR preview (regenera con debounce al cambiar la validationUrl) ───────
    useEffect(() => {
        const controller = new AbortController();

        const generatePreviewQR = async () => {
            const url = certificateData.validationUrl || 'https://constgen.example.com/preview-placeholder';
            const isDraft = !certificateData.validationUrl;

            try {
                const qrDataUrl = await QRCode.toDataURL(url, {
                    width: 200,
                    margin: 1,
                    color: {
                        dark: isDraft ? '#000000ff' : '#000000ff',
                        light: '#ffffff',
                    },
                });

                if (!controller.signal.aborted && qrDataUrl !== certificateData.qrCodeDataUrl) {
                    setCertificateData((prev) => ({ ...prev, qrCodeDataUrl: qrDataUrl }));
                }
            } catch (err) {
                console.error('Error generando QR de vista previa:', err);
            }
        };

        const timeout = setTimeout(generatePreviewQR, 500);
        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [certificateData.validationUrl, certificateData.qrCodeDataUrl]);

    // ── Validación de campos del formulario individual ────────────────────────
    const validateSingleForm = (): boolean => {
        const { nombre, curso, horas, matricula, curp, startDate, endDate, emision, vencimiento } = certificateData;

        if (!nombre || !curso || !horas || !matricula || !curp || !startDate || !endDate || !emision || !vencimiento) {
            setError('Por favor, completa todos los campos (incluyendo fechas de inicio, fin, emisión y vencimiento) antes de continuar.');
            return false;
        }

        if (curp.length !== 18) {
            setError('La CURP debe tener exactamente 18 caracteres.');
            return false;
        }

        return true;
    };

    // ── Importar desde Excel ──────────────────────────────────────────────────
    const handleDataImported = (data: any[]) => {
        const formatted: CertificateData[] = data.map((item) => ({
            nombre: item.nombre,
            curso: item.curso,
            curp: item.curp,
            matricula: item.matricula,
            horas: item.horas,
            startDate: item.startDate ?? '',
            endDate: item.endDate ?? '',
            // Si el excel trae fechas de emision/vencimiento, usarlas, sino dejar vacío o defaults
            emision: item.emision ?? new Date().toISOString().split('T')[0],
            vencimiento: item.vencimiento ?? '',
            validationUrl: '',
            isImported: true,
        }));

        setImportedCertificates(formatted);
        setViewMode('batch');
        if (formatted.length > 0) setCertificateData(formatted[0]);
    };

    const handleSelectCertificate = (cert: CertificateData) => {
        setCertificateData(cert);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ── Subida individual ─────────────────────────────────────────────────────
    const handleUploadSingle = async () => {
        if (!validateSingleForm()) return;

        setIsUploading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const { url } = await generateAndUpload(certificateData);
            setSuccessMessage(`Constancia subida correctamente. URL: ${url}`);
        } catch (err: any) {
            setError(err?.message || 'Error al subir la constancia.');
        } finally {
            setIsUploading(false);
        }
    };

    // ── Subida masiva ─────────────────────────────────────────────────────────
    const handleUploadAll = async () => {
        if (importedCertificates.length === 0) {
            setError('No hay constancias para procesar.');
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadResults([]);

        try {
            const results: CertificateUploadResult[] = await generateAndUploadBulk(importedCertificates);

            const statuses: UploadStatus[] = results.map((r) => ({
                name: r.nombre,
                status: r.success ? 'success' : 'error',
                url: r.url,
            }));

            setUploadResults(statuses);

            const successCount = statuses.filter((r) => r.status === 'success').length;
            const failCount = statuses.length - successCount;
            setSuccessMessage(`Proceso completado — Subidos: ${successCount}, Fallidos: ${failCount}`);
        } catch (err: any) {
            setError(err?.message || 'Error durante la carga masiva.');
        } finally {
            setIsUploading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    const progressPercent =
        importedCertificates.length > 0
            ? (uploadResults.length / importedCertificates.length) * 100
            : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* ── Encabezado ── */}
                <header className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Generador de Constancias</h1>
                    <p className="text-lg text-gray-600">
                        Completa el formulario o importa un Excel para subir constancias a Azure Blob Storage.
                    </p>
                </header>

                {/* ── Importar desde Excel ── */}
                <ExcelUploader onDataImported={handleDataImported} />

                {/* ── Lista de constancias importadas ── */}
                {importedCertificates.length > 0 && (
                    <ImportedCertificatesPanel
                        certificates={importedCertificates}
                        uploadResults={uploadResults}
                        viewMode={viewMode}
                        isUploading={isUploading}
                        progressPercent={progressPercent}
                        onToggleViewMode={() => setViewMode(viewMode === 'single' ? 'batch' : 'single')}
                        onUploadAll={handleUploadAll}
                        onSelectCertificate={handleSelectCertificate}
                    />
                )}

                {/* ── Formulario + Vista previa ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 bg-white rounded-xl shadow-xl p-8">
                        <CertificateForm data={certificateData} onChange={setCertificateData} />
                    </div>
                    <div className="lg:col-span-8 bg-white rounded-xl shadow-xl p-8">
                        <CertificatePreview data={certificateData} />
                    </div>
                </div>

                {/* ── Acciones y mensajes ── */}
                <div className="text-center flex flex-col items-center gap-4">
                    <UploadButton isUploading={isUploading} onClick={handleUploadSingle} />
                    {error && <AlertBox type="error" message={error} />}
                    {successMessage && <AlertBox type="success" message={successMessage} />}
                </div>

            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componentes de UI (definidos en el mismo archivo para mantenerlo compacto)
// ─────────────────────────────────────────────────────────────────────────────

// ── Panel con la tabla de constancias importadas ──────────────────────────────

interface ImportedCertificatesPanelProps {
    certificates: CertificateData[];
    uploadResults: UploadStatus[];
    viewMode: ViewMode;
    isUploading: boolean;
    progressPercent: number;
    onToggleViewMode: () => void;
    onUploadAll: () => void;
    onSelectCertificate: (cert: CertificateData) => void;
}

function ImportedCertificatesPanel({
    certificates,
    uploadResults,
    viewMode,
    isUploading,
    progressPercent,
    onToggleViewMode,
    onUploadAll,
    onSelectCertificate,
}: ImportedCertificatesPanelProps) {
    return (
        <div className="p-4 bg-white rounded-lg shadow">
            {/* Cabecera del panel */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                    Constancias Importadas ({certificates.length})
                </h3>
                <div className="flex gap-2">
                    {viewMode === 'batch' && (
                        <button
                            onClick={onUploadAll}
                            disabled={isUploading}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {isUploading ? 'Subiendo...' : 'Subir Todo a Azure'}
                        </button>
                    )}
                    <button
                        onClick={onToggleViewMode}
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
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <p className="text-xs text-center mt-1 text-gray-500">
                        {uploadResults.length} de {certificates.length} procesados
                    </p>
                </div>
            )}

            {/* Tabla */}
            {viewMode === 'batch' && (
                <div className="overflow-x-auto max-h-60 overflow-y-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                {['Nombre', 'Curso', 'Estado', 'Acciones'].map((col) => (
                                    <th
                                        key={col}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {certificates.map((cert, idx) => {
                                const result = uploadResults.find((r) => r.name === cert.nombre);
                                return (
                                    <tr
                                        key={idx}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => onSelectCertificate(cert)}
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
                                                    onClick={(e) => { e.stopPropagation(); onSelectCertificate(cert); }}
                                                >
                                                    Ver
                                                </button>
                                                {result?.url && (
                                                    <a
                                                        href={result.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-green-600 hover:text-green-800"
                                                        onClick={(e) => e.stopPropagation()}
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
    );
}

// ── Botón de subida individual ────────────────────────────────────────────────

function UploadButton({ isUploading, onClick }: { isUploading: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            disabled={isUploading}
            className={`
                px-8 py-4 rounded-lg font-semibold text-white text-lg
                transition-all transform hover:scale-105 active:scale-95
                shadow-lg hover:shadow-xl
                ${isUploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}
            `}
        >
            {isUploading ? 'Subiendo...' : 'Generar y Subir a Azure Blob'}
        </button>
    );
}

// ── Alertas de error / éxito ──────────────────────────────────────────────────

function AlertBox({ type, message }: { type: 'error' | 'success'; message: string }) {
    const styles = {
        error: {
            wrapper: 'bg-red-50 border-red-200',
            title: 'text-red-700',
            body: 'text-red-600',
            label: 'Error',
        },
        success: {
            wrapper: 'bg-green-50 border-green-200',
            title: 'text-green-700',
            body: 'text-green-600',
            label: '¡Éxito!',
        },
    }[type];

    return (
        <div className={`mt-2 p-4 border rounded-lg w-full max-w-2xl ${styles.wrapper}`}>
            <p className={`font-medium ${styles.title}`}>{styles.label}</p>
            <p className={`text-sm ${styles.body}`}>{message}</p>
        </div>
    );
}