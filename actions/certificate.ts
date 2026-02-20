'use server';

import QRCode from 'qrcode';
import { generatePdf, generateBulkPdfs } from '@/lib/generatePdf';
import { CertificateData } from '@/lib/types/certificate';
import generateRandomKey from '@/lib/utils/generateRandomKey';
import { uploadToBlob, uploadBulkToBlob, BlobUploadResult } from './blob';
import { createStudent, getNextIncrement, postCertificate } from './db';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CertificateUploadResult {
    nombre: string;
    success: boolean;
    url?: string;
    error?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Genera un nombre de archivo único para el certificado */
function getCertificateFilename(data: CertificateData): string {
    const safeName = data.nombre.trim().replace(/\s+/g, '-');
    const safeCuv = data.cuv ? `-${data.cuv}` : ''; // Agrega CUV si existe para evitar colisiones
    return `constancia-${safeName}${safeCuv}.pdf`;
}

/** Genera el QR del certificado y lo embebe en data.qrCodeDataUrl */
async function attachQrCode(data: CertificateData): Promise<CertificateData> {
    const fileName = getCertificateFilename(data);
    const blobBaseUrl = 'https://escuelanormal.blob.core.windows.net/constancias/';
    const qrUrl = `${blobBaseUrl}${fileName}`;

    try {
        const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
            width: 200,
            margin: 1,
            color: { dark: '#000000', light: '#ffffff' },
        });
        return { ...data, qrCodeDataUrl };
    } catch {
        // Si el QR falla, continúa sin él
        return data;
    }
}

/** Asegura que el CUV esté generado */
async function ensureCuv(
    data: CertificateData,
    baseIncrement?: number,
): Promise<CertificateData> {
    if (!data.cuv) {
        const increment = baseIncrement ?? (await getNextIncrement());
        return {
            ...data,
            cuv: await generateRandomKey(data.matricula, data.curso, data.endDate, () =>
                Promise.resolve(increment),
            ),
        };
    }
    return data;
}

/** Registra alumno + certificado en la base de datos */
async function registerInDatabase(certData: CertificateData, blobUrl: string): Promise<void> {
    try {
        const { alumno_id } = await createStudent(
            certData.matricula,
            certData.curp,
            certData.nombre,
        );

        if (alumno_id) {
            await postCertificate({
                alumno_id,
                curso: certData.curso,
                cuv: certData.cuv,
                emision: certData.emision || new Date().toISOString().split('T')[0],
                vencimiento: certData.vencimiento || new Date().toISOString().split('T')[0],
                horas: certData.horas,
                url_certificado: blobUrl,
            });
        }
    } catch (error) {
        const message = (error as Error).message ?? '';

        if (message.startsWith('DUPLICATE_TITULO')) {
            // Puedes mostrar un toast, setear un estado, etc.
            console.warn('⚠️ Constancia duplicada:', message);
            return; // No es un error fatal, solo se omite el registro
        }

        if (message.startsWith('DUPLICATE_CUV')) {
            console.warn('⚠️ CUV duplicado:', message);
            return;
        }

        // Cualquier otro error sí se registra como crítico
        console.error('Error registrando certificado en DB:', error);
    }
}
// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Genera el PDF de UN certificado y lo sube a Azure Blob Storage.
 * Opcionalmente registra el alumno y el documento en la base de datos.
 * Retorna la URL pública del blob.
 */
export async function generateAndUpload(
    data: CertificateData,
): Promise<{ url: string }> {
    const certData = await ensureCuv(data);
    const certWithQr = await attachQrCode(certData);

    const pdfBuffer = await generatePdf(certWithQr);
    const fileName = getCertificateFilename(certWithQr);

    const { url } = await uploadToBlob(pdfBuffer, fileName);

    // Registro en DB (no bloquea si falla)
    await registerInDatabase(certData, url);

    return { url };
}

/**
 * Genera y sube a Azure Blob Storage TODOS los certificados del lote.
 * Retorna un resultado individual por certificado.
 */
export async function generateAndUploadBulk(
    certs: CertificateData[],
): Promise<CertificateUploadResult[]> {
    if (!certs || certs.length === 0) {
        throw new Error('No hay constancias para procesar');
    }

    // ── FIX 1: CUVs generados SECUENCIALMENTE ────────────────────────────────
    // Obtener el primer AUTO_INCREMENT disponible y luego asignar
    // offsets manuales (0, 1, 2, …) para garantizar unicidad sin
    // volver a consultar la BD en paralelo.
    const baseIncrement = await getNextIncrement();

    const certsWithCuv: CertificateData[] = [];
    for (let i = 0; i < certs.length; i++) {
        certsWithCuv.push(await ensureCuv(certs[i], baseIncrement + i));
    }

    const certsWithQr: CertificateData[] = await Promise.all(
        certsWithCuv.map(cert => attachQrCode(cert))
    );

    // Call the optimized bulk PDF generator (runs 1 browser, 1 base64 read for the whole batch)
    const pdfBuffers = await generateBulkPdfs(certsWithQr);

    const prepared = certsWithQr.map((certData, i) => {
        const fileName = getCertificateFilename(certData);
        return { buffer: pdfBuffers[i], fileName, certData };
    });

    const blobResults: BlobUploadResult[] = await uploadBulkToBlob(
        prepared.map(({ buffer, fileName }) => ({ buffer, fileName })),
    );

    // ── Execute DB Registrations sequentially to avoid race condition ────────────────
    // When a single student has multiple certificates, concurrent registrations
    // cause duplicate UNIQUE constraint errors during DB insertion, leading exactly 
    // to 1 saved certificate per student. Sequential execution avoids this completely.
    for (let i = 0; i < blobResults.length; i++) {
        const blobResult = blobResults[i];
        const { certData } = prepared[i];

        if (blobResult.success && blobResult.url) {
            await registerInDatabase(certData, blobResult.url);
        }
    }

    // ── Armar resultado final ─────────────────────────────────────────────────
    return blobResults.map((blobResult, i) => {
        const { certData } = prepared[i];
        if (blobResult.success && blobResult.url) {
            return { nombre: certData.nombre, success: true, url: blobResult.url };
        }
        return {
            nombre: certData.nombre,
            success: false,
            error: blobResult.error ?? 'Error desconocido',
        };
    });
}