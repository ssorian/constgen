'use server';

import QRCode from 'qrcode';
import { generateBulkPdfs } from '@/lib/generatePdf';
import { CertificateData, CertificateUploadResult } from '@/lib/domain/Certificate';
import generateRandomKey from '@/lib/utils/generateRandomKey';
import { uploadMultiplePdfsToBlob } from '@/lib/infrastructure/blob';
import { createStudent } from '@/actions/students/create';
import { registerCertificate, getNextCertificateIncrement } from '@/actions/certificates/register';

// ─── Private helpers ──────────────────────────────────────────────────────────

function buildFilename(data: CertificateData): string {
    const safeName = data.nombre.trim().replace(/\s+/g, '-');
    const safeCuv = data.cuv ? `-${data.cuv}` : '';
    return `constancia-${safeName}${safeCuv}.pdf`;
}

async function withQrCode(data: CertificateData): Promise<CertificateData> {
    const blobBaseUrl = 'https://escuelanormal.blob.core.windows.net/constancias/';
    const qrUrl = `${blobBaseUrl}${buildFilename(data)}`;
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
            width: 200, margin: 1,
            color: { dark: '#000000', light: '#ffffff' },
        });
        return { ...data, qrCodeDataUrl };
    } catch {
        return data;
    }
}

async function persistToDb(certData: CertificateData, blobUrl: string): Promise<void> {
    try {
        const { alumno_id } = await createStudent(certData.matricula, certData.curp, certData.nombre);
        if (alumno_id) {
            await registerCertificate({
                alumno_id,
                curso: certData.curso,
                cuv: certData.cuv,
                emision: certData.emision || new Date().toISOString().split('T')[0],
                vencimiento: certData.vencimiento || new Date().toISOString().split('T')[0],
                horas: certData.horas,
                url_certificado: blobUrl,
            });
        }
    } catch (err) {
        console.error('[certificates/generateAndUploadBulk] DB persistence error:', err);
    }
}

// ─── Public Server Action ─────────────────────────────────────────────────────

/**
 * Application action: Generates PDFs for all certificates in a batch, uploads them
 * to Azure Blob, and persists each one to the database sequentially to avoid race conditions.
 * Returns an individual result per certificate.
 */
export async function generateAndUploadBulk(
    certs: CertificateData[],
    templateId?: string,
): Promise<CertificateUploadResult[]> {
    if (!certs || certs.length === 0) {
        throw new Error('No hay constancias para procesar');
    }

    // Assign sequential CUVs from a single DB query to ensure uniqueness
    const baseIncrement = await getNextCertificateIncrement();

    const certsWithCuv: CertificateData[] = [];
    for (let i = 0; i < certs.length; i++) {
        const data = certs[i];
        if (!data.cuv) {
            const cuv = await generateRandomKey(data.matricula, data.curso, data.endDate, () =>
                Promise.resolve(baseIncrement + i),
            );
            certsWithCuv.push({ ...data, cuv });
        } else {
            certsWithCuv.push(data);
        }
    }

    const certsWithQr = await Promise.all(certsWithCuv.map(withQrCode));

    const pdfBuffers = await generateBulkPdfs(certsWithQr, templateId);

    const prepared = certsWithQr.map((certData, i) => ({
        buffer: pdfBuffers[i],
        fileName: buildFilename(certData),
        certData,
    }));

    const blobResults = await uploadMultiplePdfsToBlob(
        prepared.map(({ buffer, fileName }) => ({ buffer, fileName })),
    );

    // Register in DB sequentially to avoid races when the same student has multiple certs
    for (let i = 0; i < blobResults.length; i++) {
        const blob = blobResults[i];
        if (blob.success && blob.url) {
            await persistToDb(prepared[i].certData, blob.url);
        }
    }

    return blobResults.map((blob, i) =>
        blob.success && blob.url
            ? { nombre: prepared[i].certData.nombre, success: true, url: blob.url }
            : { nombre: prepared[i].certData.nombre, success: false, error: blob.error ?? 'Error desconocido' },
    );
}
