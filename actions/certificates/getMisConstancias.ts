'use server';

import pool from '@/lib/infrastructure/db';
import { RowDataPacket } from 'mysql2';
import { MiConstancia } from '@/lib/domain/Certificate';

/**
 * Application action: Retrieves all certificates for the given student.
 * Used by the server component at /mis-constancias.
 * Replaces the SQL in mis_constancias.php.
 */
export async function getMisConstancias(alumnoId: number): Promise<MiConstancia[]> {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT curso AS titulo, cuv, YEAR(emision) AS ano_emision, horas AS numeros_horas
             FROM constancias WHERE alumno_id = ?`,
            [alumnoId],
        );
        return rows as MiConstancia[];
    } catch (err) {
        console.error('[certificates/getMisConstancias] DB error:', err);
        return [];
    }
}
