'use server';

import pool from '@/lib/infrastructure/db';
import { RowDataPacket } from 'mysql2';
import { SearchResult, CertificadoDoc } from '@/lib/domain/Certificate';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

/**
 * Application action: Searches certificates by student name or matricula.
 * Replaces buscar_certificado.php.
 */
export async function searchCertificates(query: string): Promise<SearchResult> {
    const queryLower = query.trim().toLowerCase();

    if (!queryLower) {
        return { encontrado: false, mensaje: 'Por favor, ingresa una matrícula o nombre.' };
    }

    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT A.nombre_completo, A.matricula,
                    C.curso, YEAR(C.emision) AS ano_emision, YEAR(C.vencimiento) AS ano_vencimiento,
                    C.horas, C.cuv
             FROM alumno A
             JOIN constancias C ON A.alumno_id = C.alumno_id
             WHERE A.matricula = ? OR LOWER(A.nombre_completo) LIKE ?`,
            [queryLower, `%${queryLower}%`],
        );

        if (rows.length > 0) {
            const nombre = titleCase(rows[0].nombre_completo);
            const documentos: CertificadoDoc[] = rows.map((r) => ({
                tipo_documento: r.curso,
                anio_emision: r.ano_emision,
                anio_vencimiento: r.ano_vencimiento,
                horas: r.horas,
                cuv: r.cuv,
                url_certificado: `${BASE_URL}/api/descargar_certificado?cuv=${encodeURIComponent(r.cuv)}`,
            }));

            return {
                encontrado: true,
                nombre_completo: nombre,
                matricula: rows[0].matricula,
                documentos,
                mensaje: `Se encontraron ${documentos.length} documentos para ${nombre}.`,
            };
        }

        return { encontrado: false, mensaje: 'No se encontraron documentos o el alumno no existe.' };
    } catch (err) {
        console.error('[certificates/search] DB error:', err);
        return { encontrado: false, mensaje: 'Error de conexión con la base de datos.' };
    }
}

function titleCase(str: string): string {
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}
