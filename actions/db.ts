'use server';

import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import parseSpanishDate from '@/lib/utils/parseSpanishDate';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreateStudentResult {
    alumno_id: number;
    matricula: string;
    curp: string;
    nombre_completo: string;
    created: boolean;
}

interface PostCertificatePayload {
    alumno_id: number;
    curso: string;
    cuv: string;
    emision: string;
    vencimiento: string;
    horas: number;
    url_certificado: string;
}

interface InsertResult {
    insertId: number;
    affectedRows: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseDbDate(rawDate?: string): string {
    if (!rawDate) return new Date().toISOString().split('T')[0];
    const parsed = parseSpanishDate(rawDate);
    if (parsed) return parsed;

    // Fallback if not parsable
    let fallback = new Date(rawDate);
    if (isNaN(fallback.getTime())) {
        return rawDate;
    }
    return fallback.toISOString().split('T')[0];
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Crea un alumno si no existe, o retorna el existente.
 * La contraseña inicial es igual a la matrícula.
 */
export async function createStudent(
    matricula: string,
    curp: string,
    nombre_completo: string,
): Promise<CreateStudentResult> {
    if (!matricula || !curp || !nombre_completo) {
        throw new Error('Faltan campos requeridos: matricula, curp, nombre_completo');
    }

    const cleanMatricula = matricula.trim().toUpperCase();
    const cleanCurp = curp.trim().toUpperCase();
    const cleanNombre = nombre_completo.trim().toUpperCase();

    // ¿Ya existe?
    const [rows] = await pool.execute(
        `SELECT alumno_id FROM alumno WHERE matricula = ?`,
        [cleanMatricula],
    );

    if ((rows as any[]).length > 0) {
        const alumno_id = (rows as any[])[0].alumno_id as number;
        return { alumno_id, matricula: cleanMatricula, curp: cleanCurp, nombre_completo: cleanNombre, created: false };
    }

    // Insertar (password = matricula por defecto)
    const [result] = await pool.execute(
        `INSERT INTO alumno (matricula, curp, nombre_completo, password) VALUES (?, ?, ?, ?)`,
        [cleanMatricula, cleanCurp, cleanNombre, cleanMatricula],
    );

    const alumno_id = (result as InsertResult).insertId;
    return { alumno_id, matricula: cleanMatricula, curp: cleanCurp, nombre_completo: cleanNombre, created: true };
}

/**
 * Registra un certificado en la tabla `documentos`.
 * Retorna el ID del registro creado.
 */
export async function postCertificate(payload: PostCertificatePayload): Promise<{ id: number }> {
    const {
        alumno_id, curso, cuv, emision,
        vencimiento, horas, url_certificado,
    } = payload;

    const requiredKeys = [
        'alumno_id', 'curso', 'cuv', 'emision',
        'vencimiento', 'horas', 'url_certificado',
    ] as const;

    const missing = requiredKeys.filter((k) => !payload[k]);
    if (missing.length > 0) {
        throw new Error(`Campos requeridos faltantes: ${missing.join(', ')}`);
    }

    const cleanCurso = curso.trim().toUpperCase();
    const cleanEmision = parseDbDate(emision);
    const cleanVencimiento = parseDbDate(vencimiento);

    // ── Validar título duplicado para el mismo alumno ──
    const [titleCheck] = await pool.execute(
        `SELECT constancia_id FROM constancias WHERE alumno_id = ? AND curso = ?`,
        [alumno_id, cleanCurso]
    );
    if ((titleCheck as any[]).length > 0) {
        throw new Error(`DUPLICATE_TITULO: El alumno ya tiene una constancia del curso "${cleanCurso}"`);
    }

    // ── Validar CUV duplicado global ──
    const [cuvCheck] = await pool.execute(
        `SELECT constancia_id FROM constancias WHERE cuv = ?`,
        [cuv]
    );
    if ((cuvCheck as any[]).length > 0) {
        throw new Error(`DUPLICATE_CUV: Ya existe una constancia con el CUV ${cuv}`);
    }

    const [result] = await pool.execute(
        `INSERT INTO constancias
            (alumno_id, curso, cuv, emision, vencimiento, horas, url_certificado)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [alumno_id, cleanCurso, cuv, cleanEmision, cleanVencimiento, horas, url_certificado],
    );

    return { id: (result as InsertResult).insertId };
}


export async function getNextIncrement(): Promise<number> {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
        [process.env.DB_NAME, 'constancias']
    );
    return rows[0]?.AUTO_INCREMENT ?? 1;
}