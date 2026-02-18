import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { NextRequest } from 'next/server';

interface CertificateRequest {
    alumno_id: number;
    titulo: string;
    cuv: string;
    ano_emision: number;
    ano_vencimiento: number;
    numeros_horas: number;
    url_certificado: string;
}

interface InsertResult {
    insertId: number;
    affectedRows: number;
}

export async function POST(request: NextRequest) {
    try {
        const body: CertificateRequest = await request.json();

        const {
            alumno_id,
            titulo,
            cuv,
            ano_emision,
            ano_vencimiento,
            numeros_horas,
            url_certificado,
        } = body;

        // Validación básica
        const requiredFields: (keyof CertificateRequest)[] = ['alumno_id', 'titulo', 'cuv', 'ano_emision', 'ano_vencimiento', 'numeros_horas', 'url_certificado'];
        const missing = requiredFields.filter(field => !body[field]);

        if (missing.length > 0) {
            return NextResponse.json(
                { error: `Campos requeridos faltantes: ${missing.join(', ')}` },
                { status: 400 }
            );
        }

       const [result] = await pool.execute(
    `INSERT INTO documentos 
        (alumno_id, titulo, cuv, ano_emision, ano_vencimiento, numeros_horas, url_certificado)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [alumno_id, titulo, cuv, ano_emision, ano_vencimiento, numeros_horas, url_certificado]  // 👈 el 1 fijo
);

        return NextResponse.json(
            {
                message: 'Certificado creado exitosamente',
                id: (result as InsertResult).insertId,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error al insertar certificado:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}