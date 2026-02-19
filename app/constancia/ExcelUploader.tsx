'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';

interface ExcelUploaderProps {
    onDataImported: (data: any[]) => void;
}

const DEV_ROW_LIMIT = 5; // 🔧 Development: remove or increase for production

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

                // Regex to parse header: [Course] (Hours) {StartDate} "EndDate"
                const headerRegex = /^\[(.*?)\]\s*\((\d+)\)\s*\{(.*?)\}\s*"(.*?)"$/;

                workbook.SheetNames.forEach((sheetName) => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                        header: 1,
                    }) as any[][];

                    if (jsonData.length === 0) return;

                    const headers = jsonData[0];

                    let nameIndex = -1;
                    let matriculaIndex = -1;
                    let curpIndex = -1;
                    const courseColumns: { index: number; courseInfo: any }[] = [];

                    headers.forEach((header: any, index: number) => {
                        if (typeof header !== 'string') return;
                        const headerTrimmed = header.trim().toLowerCase();

                        if (headerTrimmed.includes('nombre')) {
                            nameIndex = index;
                        } else if (headerTrimmed.includes('matricula') || headerTrimmed.includes('matrícula')) {
                            matriculaIndex = index;
                        } else if (headerTrimmed.includes('curp')) {
                            curpIndex = index;
                        }

                        const match = headerRegex.exec(header.trim());
                        if (match) {
                            courseColumns.push({
                                index,
                                courseInfo: {
                                    courseName: match[1].trim(),
                                    hours: parseInt(match[2], 10),
                                    startDate: match[3].trim(),
                                    endDate: match[4].trim(),
                                },
                            });
                        }
                    });

                    if (nameIndex === -1) {
                        console.warn(`Sheet "${sheetName}" skipped: No 'Nombre' column found.`);
                        return;
                    }

                    // 🔧 Dev limit: only process first DEV_ROW_LIMIT data rows
                    const dataRows = jsonData.slice(1, 1 + DEV_ROW_LIMIT);

                    dataRows.forEach((row) => {
                        const personName = row[nameIndex];
                        if (!personName) return;

                        const matricula = matriculaIndex !== -1 ? row[matriculaIndex] ?? '' : '';
                        const curp = curpIndex !== -1 ? row[curpIndex] ?? '' : '';

                        courseColumns.forEach((col) => {
                            const status = row[col.index];
                            if (status === 'REALIZADO') {
                                allCertificates.push({
                                    nombre: personName,
                                    matricula: String(matricula).trim(),
                                    curp: String(curp).trim(),
                                    curso: col.courseInfo.courseName,
                                    horas: col.courseInfo.hours,
                                    fechaInicio: col.courseInfo.startDate,
                                    fecha: col.courseInfo.endDate,
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
            {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-amber-500 mt-1">
                    🔧 Modo desarrollo: solo se procesan las primeras {DEV_ROW_LIMIT} filas por hoja.
                </p>
            )}
            {error && (
                <div className="mt-3 text-red-500 text-sm">
                    ⚠️ {error}
                </div>
            )}
        </div>
    );
}