'use server';

import QRCode from 'qrcode';
import { generatePdf } from '@/lib/generatePdf';
import { CertificateData } from '@/lib/domain/Certificate';
import generateRandomKey from '@/lib/utils/generateRandomKey';
import { uploadPdfToBlob } from '@/lib/infrastructure/blob';
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

async function withCuv(data: CertificateData, baseIncrement?: number): Promise<CertificateData> {
    if (data.cuv) return data;
    const increment = baseIncrement ?? (await getNextCertificateIncrement());
    return {
        ...data,
        cuv: await generateRandomKey(data.matricula, data.curso, data.endDate, () => Promise.resolve(increment)),
    };
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
        console.error('[certificates/generateAndUpload] DB persistence error:', err);
    }
}

// ─── Public Server Action ─────────────────────────────────────────────────────

/**
 * Application action: Generates a single PDF certificate and uploads it to Azure Blob.
 * Registers the student and certificate in the database.
 * Returns the public blob URL.
 */
export async function generateAndUpload(data: CertificateData, templateId?: string): Promise<{ url: string }> {
    const withCuvData = await withCuv(data);
    const withQr = await withQrCode(withCuvData);
    const pdfBuffer = await generatePdf(withQr, templateId);
    const fileName = buildFilename(withQr);
    const { url } = await uploadPdfToBlob(pdfBuffer, fileName);
    await persistToDb(withCuvData, url);
    return { url };
}
