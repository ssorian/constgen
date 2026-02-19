"use client";

import { useState } from 'react';
import * as XLSX from 'xlsx';
import parseSpanishDate from '@/lib/utils/parseSpanishDate';

interface ExcelUploaderProps {
    onDataImported: (data: any[]) => void;
}



export default function ExcelUploader({ onDataImported }: ExcelUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = (file: File) => {
        setError(null);
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const allCertificates: any[] = [];

                // Relaxed regex to capture dates like {02/febrero/2006} "02/febrero/2006"
                const headerRegex = /^\[(.*?)\]\s*\((\d+)\)\s*\{(.*?)\}\s*[\u201C\u201D\u2018\u2019"']?(.*?)[\u201C\u201D\u2018\u2019"']?$/;

                workbook.SheetNames.forEach((sheetName) => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                        header: 1,
                    }) as any[][];

                    console.log(`[Sheet: ${sheetName}] Total rows: ${jsonData.length}`);
                    console.log(`[Sheet: ${sheetName}] Headers:`, jsonData[0]);

                    if (jsonData.length === 0) return;

                    const headers = jsonData[0];

                    let nameIndex = -1;
                    let matriculaIndex = -1;
                    let curpIndex = -1;
                    const courseColumns: { index: number; courseInfo: any }[] = [];

                    headers.forEach((header: any, index: number) => {
                        if (typeof header !== 'string') return;

                        // ✅ FIX: Use a separate lowercase version for column detection only.
                        // The original `header` is used for the course regex to preserve casing.
                        const headerLower = header.trim().toLowerCase();

                        if (headerLower.includes('nombre')) {
                            nameIndex = index;
                        } else if (headerLower.includes('matricula') || headerLower.includes('matrícula')) {
                            matriculaIndex = index;
                        } else if (headerLower.includes('curp')) {
                            curpIndex = index;
                        }

                        // ✅ FIX: Run the regex on the original (non-lowercased) header
                        // so that the course name keeps its proper capitalization.
                        const headerOriginal = header.trim();
                        const match = headerRegex.exec(headerOriginal);

                        if (match) {
                            const rawStart = match[3] ? match[3].trim() : '';
                            const rawEnd = match[4] ? match[4].trim() : '';
                            let startDate = rawStart;
                            let endDate = rawEnd;

                            try {
                                const s = parseSpanishDate(rawStart);
                                const e = parseSpanishDate(rawEnd);
                                if (s) startDate = s;
                                if (e) endDate = e;
                            } catch {
                                // fallback: keep raw strings
                            }

                            if (!startDate || !endDate) {
                                console.warn(
                                    `[ExcelUploader] Could not parse dates for header: "${headerOriginal}"`,
                                    { rawStart, rawEnd, startDate, endDate }
                                );
                            }

                            courseColumns.push({
                                index,
                                courseInfo: {
                                    // ✅ FIX: Use match[1] from original header → uppercase
                                    courseName: match[1].trim().toUpperCase(),
                                    hours: parseInt(match[2], 10),
                                    startDate,
                                    endDate,
                                },
                            });
                        }
                    });

                    if (nameIndex === -1) {
                        console.warn(`Sheet "${sheetName}" skipped: No 'Nombre' column found.`);
                        return;
                    }

                    // Read all rows (skip header), limit to 5 per sheet for development
                    const dataRows = jsonData.slice(1, 6);

                    dataRows.forEach((row) => {

                        let personName = row[nameIndex];
                        if (!personName) return;
                        personName = String(personName).toUpperCase();

                        const matricula = matriculaIndex !== -1 ? row[matriculaIndex] ?? '' : '';
                        const curp = curpIndex !== -1 ? row[curpIndex] ?? '' : '';

                        courseColumns.forEach((col) => {
                            const status = row[col.index];
                            if (String(status ?? '').trim().toUpperCase() === 'REALIZADO') {
                                allCertificates.push({
                                    nombre: personName,
                                    matricula: String(matricula).trim(),
                                    curp: String(curp).trim(),
                                    curso: col.courseInfo.courseName,
                                    horas: col.courseInfo.hours,
                                    startDate: col.courseInfo.startDate,
                                    endDate: col.courseInfo.endDate,
                                    status: 'REALIZADO',
                                    sourceSheet: sheetName,
                                });
                            }
                        });
                    });
                });

                if (allCertificates.length === 0) {
                    setError(
                        'No se encontraron registros con estado "REALIZADO" o el formato del archivo es incorrecto (Falta columna "Nombre" o formato de curso).',
                    );
                } else {
                    onDataImported(allCertificates);
                }
            } catch (err) {
                console.error(err);
                setError('Error al procesar el archivo Excel.');
            }
        };

        reader.readAsBinaryString(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
            handleFileUpload(file);
        } else {
            setError('Por favor sube un archivo Excel (.xlsx, .xls)');
        }
    };

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
        >
            <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                id="excel-upload"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <label htmlFor="excel-upload" className="cursor-pointer">
                <div className="text-4xl mb-2">📊</div>
                {fileName ? (
                    <p className="text-blue-600 font-medium">{fileName}</p>
                ) : (
                    <p className="text-gray-500">Arrastra tu archivo Excel aquí o haz clic para buscar</p>
                )}
            </label>
            <p className="text-xs text-gray-400 mt-2">
                El archivo debe tener columnas <strong>Nombre</strong> y <strong>Matricula</strong>, y columnas de curso con el formato:{' '}
                <code>[Curso] (Horas) {'{Fecha Inicio}'} "Fecha Termino"</code>
            </p>

            {error && (
                <div className="mt-3 text-red-500 text-sm">
                    ⚠️ {error}
                </div>
            )}
        </div>
    );
}