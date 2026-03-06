'use server';

import pool from '@/lib/infrastructure/db';
import { RowDataPacket } from 'mysql2';
import { fetchPdfFromUrl } from '@/lib/infrastructure/blob';

/**
 * Application action: Downloads the PDF for a given CUV.
 * Returns the PDF as a Base64 string and the suggested filename.
 * Replaces the api/descargar_certificado route.
 *
 * The client receives the base64 string and triggers a browser download
 * via URL.createObjectURL or a data URL.
 */
export async function downloadCertificate(
    cuv: string,
): Promise<{ ok: true; base64: string; filename: string } | { ok: false; error: string }> {
    const cuvUpper = cuv.trim().toUpperCase();

    if (!cuvUpper) {
        return { ok: false, error: 'CUV no proporcionado.' };
    }

    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT url_certificado, curso FROM constancias WHERE TRIM(UPPER(cuv)) = TRIM(UPPER(?))',
            [cuvUpper],
        );

        if (rows.length === 0) {
            return { ok: false, error: 'Documento no encontrado.' };
        }

        const { url_certificado: url, curso: titulo } = rows[0];

        const pdfBuffer = await fetchPdfFromUrl(url);

        const cleanTitle = titulo
            .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-_]/g, '')
            .trim()
            .replace(/\s+/g, '_');

        const filename = `${cleanTitle}_${cuvUpper}.pdf`;
        const base64 = pdfBuffer.toString('base64');

        return { ok: true, base64, filename };
    } catch (err) {
        console.error('[certificates/download] Error:', err);
        return { ok: false, error: 'Error al descargar el documento. Intenta más tarde.' };
    }
}
