'use server';

import pool from '@/lib/infrastructure/db';
import { Student } from '@/lib/domain/Student';

/**
 * Application action: Creates a student if they don't exist, or returns the existing record.
 * Default password is set to the student's matricula.
 * Replaces the api/create-student route and createStudent from actions/db.ts.
 */
export async function createStudent(
    matricula: string,
    curp: string,
    nombre_completo: string,
): Promise<Student> {
    if (!matricula || !curp || !nombre_completo) {
        throw new Error('Faltan campos requeridos: matricula, curp, nombre_completo');
    }

    const cleanMatricula = matricula.trim().toUpperCase();
    const cleanCurp = curp.trim().toUpperCase();
    const cleanNombre = nombre_completo.trim().toUpperCase();

    const [rows] = await pool.execute(
        `SELECT alumno_id FROM alumno WHERE curp = ?`,
        [cleanCurp],
    );

    if ((rows as any[]).length > 0) {
        const alumno_id = (rows as any[])[0].alumno_id as number;
        return { alumno_id, matricula: cleanMatricula, curp: cleanCurp, nombre_completo: cleanNombre, created: false };
    }

    const [result] = await pool.execute(
        `INSERT INTO alumno (matricula, curp, nombre_completo, password) VALUES (?, ?, ?, ?)`,
        [cleanMatricula, cleanCurp, cleanNombre, cleanMatricula],
    );

    const alumno_id = (result as any).insertId as number;
    return { alumno_id, matricula: cleanMatricula, curp: cleanCurp, nombre_completo: cleanNombre, created: true };
}
