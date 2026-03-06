'use server';

import pool from '@/lib/infrastructure/db';
import { RowDataPacket } from 'mysql2';
import { PostCertificatePayload } from '@/lib/domain/Certificate';
import parseSpanishDate from '@/lib/utils/parseSpanishDate';

/**
 * Internal helper (NOT a public action): parses a raw date string to YYYY-MM-DD.
 */
function parseDbDate(rawDate?: string): string {
    if (!rawDate) return new Date().toISOString().split('T')[0];
    const parsed = parseSpanishDate(rawDate);
    if (parsed) return parsed;
    const fallback = new Date(rawDate);
    return isNaN(fallback.getTime()) ? rawDate : fallback.toISOString().split('T')[0];
}

/**
 * Application action: Registers a certificate in the DB.
 * Silently skips duplicates (by titulo or CUV).
 */
export async function registerCertificate(payload: PostCertificatePayload): Promise<void> {
    const { alumno_id, curso, cuv, emision, vencimiento, horas, url_certificado } = payload;

    const cleanCurso = curso.trim().toUpperCase();
    const cleanEmision = parseDbDate(emision);
    const cleanVencimiento = parseDbDate(vencimiento);

    const [titleCheck] = await pool.execute(
        `SELECT constancia_id FROM constancias WHERE alumno_id = ? AND curso = ?`,
        [alumno_id, cleanCurso],
    );
    if ((titleCheck as any[]).length > 0) {
        console.warn(`[certificates/register] Duplicate titulo "${cleanCurso}" for alumno_id ${alumno_id}`);
        return;
    }

    const [cuvCheck] = await pool.execute(
        `SELECT constancia_id FROM constancias WHERE cuv = ?`,
        [cuv],
    );
    if ((cuvCheck as any[]).length > 0) {
        console.warn(`[certificates/register] Duplicate CUV "${cuv}"`);
        return;
    }

    await pool.execute(
        `INSERT INTO constancias (alumno_id, curso, cuv, emision, vencimiento, horas, url_certificado)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [alumno_id, cleanCurso, cuv, cleanEmision, cleanVencimiento, horas, url_certificado],
    );
}

/**
 * Application action: Returns the next AUTO_INCREMENT value for the constancias table.
 * Used to deterministically pre-generate sequential CUVs for bulk operations.
 */
export async function getNextCertificateIncrement(): Promise<number> {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
        [process.env.DB_NAME, 'constancias'],
    );
    return rows[0]?.AUTO_INCREMENT ?? 1;
}
