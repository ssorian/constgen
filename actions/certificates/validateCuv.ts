'use server';

import pool from '@/lib/infrastructure/db';
import { RowDataPacket } from 'mysql2';
import { CUVResult } from '@/lib/domain/Certificate';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

/**
 * Application action: Validates a CUV and returns certificate metadata.
 * Replaces validar_cuv.php.
 */
export async function validateCuv(cuv: string): Promise<CUVResult> {
    const cuvUpper = cuv.trim().toUpperCase();

    if (!cuvUpper) {
        return { encontrado: false, mensaje: 'Por favor, ingresa un CUV.' };
    }

    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT A.nombre_completo, C.curso, YEAR(C.emision) AS ano_emision, C.horas
             FROM constancias C
             JOIN alumno A ON A.alumno_id = C.alumno_id
             WHERE TRIM(UPPER(C.cuv)) = ?`,
            [cuvUpper],
        );

        if (rows.length === 1) {
            const doc = rows[0];
            return {
                encontrado: true,
                titulo_curso: doc.curso,
                nombre_alumno: titleCase(doc.nombre_completo),
                ano_emision: doc.ano_emision,
                numero_horas: doc.horas,
            };
        }

        return { encontrado: false, mensaje: 'CUV no existente. Verifica que esté bien escrito.' };
    } catch (err) {
        console.error('[certificates/validateCuv] DB error:', err);
        return { encontrado: false, mensaje: 'Error interno del servidor. Intenta más tarde.' };
    }
}

function titleCase(str: string): string {
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}
