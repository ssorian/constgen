import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db"; // ajusta la ruta según tu proyecto

export async function POST(req: NextRequest) {
    try {
        const { matricula, curp, nombre_completo } = await req.json();

        // Validar campos requeridos
        if (!matricula || !curp || !nombre_completo) {
            return NextResponse.json(
                { error: "Faltan campos requeridos: matricula, curp, nombre_completo" },
                { status: 400 }
            );
        }

        // Verificar que la matrícula no esté duplicada
        const [existe] = await pool.execute(
            `SELECT alumno_id FROM alumnos WHERE matricula = ?`,
            [matricula]
        );

        if ((existe as any[]).length > 0) {
            const existingId = (existe as any[])[0].alumno_id;
            return NextResponse.json(
                { message: "Alumno ya existe", alumno_id: existingId, matricula, curp, nombre_completo },
                { status: 200 }
            );
        }

        // Insertar alumno (password = matricula)
        const [result] = await pool.execute(
            `INSERT INTO alumnos (matricula, curp, nombre_completo, password)
             VALUES (?, ?, ?, ?)`,
            [matricula, curp, nombre_completo, matricula]
        );

        const insertId = (result as any).insertId;

        return NextResponse.json(
            {
                message: "Alumno creado exitosamente",
                alumno_id: insertId,
                matricula,
                curp,
                nombre_completo,
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Error al crear alumno:", error);
        return NextResponse.json(
            { error: "Error interno del servidor", detalle: error.message },
            { status: 500 }
        );
    }
}