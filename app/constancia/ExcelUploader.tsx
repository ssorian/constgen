'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';

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

                // Regex to parse header: [Course] (Hours) {StartDate} "EndDate"
                const headerRegex = /^\[(.*?)\]\s*\((\d+)\)\s*\{(.*?)\}\s*"(.*?)"$/;

                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    // Retrieve JSON with header:1 to get array of arrays [ [header1, header2], [row1col1, row1col2] ... ]
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

                    if (jsonData.length === 0) return;

                    const headers = jsonData[0];

                    // Identify indices
                    let nameIndex = -1;
                    // We can also look for CURP if needed, but requirements focus on Name
                    const courseColumns: { index: number, courseInfo: any }[] = [];

                    headers.forEach((header: any, index: number) => {
                        if (typeof header !== 'string') return;

                        const headerTrimmed = header.trim();
                        // Find Name column (case-insensitive)
                        if (headerTrimmed.toLowerCase().includes('nombre')) {
                            nameIndex = index;
                        }

                        // Find Course columns
                        const match = headerRegex.exec(headerTrimmed);
                        if (match) {
                            courseColumns.push({
                                index,
                                courseInfo: {
                                    courseName: match[1].trim(),
                                    hours: parseInt(match[2], 10),
                                    startDate: match[3].trim(),
                                    endDate: match[4].trim()
                                }
                            });
                        }
                    });

                    if (nameIndex === -1) {
                        // If no "nombre" column found, skip sheet or error?
                        // Let's trying to continue if we found course columns, maybe first column is name? 
                        // But safer to error or warn. 
                        // For now, let's skip sheet if no name column found.
                        console.warn(`Sheet ${sheetName} skipped: No 'Nombre' column found.`);
                        return;
                    }

                    // Iterate rows
                    for (let i = 1; i < jsonData.length; i++) {
                        const row = jsonData[i];
                        const personName = row[nameIndex];

                        if (!personName) continue; // Skip empty names

                        // Check each course column for this person
                        courseColumns.forEach(col => {
                            const status = row[col.index];
                            if (status === 'REALIZADO') {
                                allCertificates.push({
                                    nombre: personName,
                                    curso: col.courseInfo.courseName,
                                    horas: col.courseInfo.hours,
                                    fechaInicio: col.courseInfo.startDate,
                                    fecha: col.courseInfo.endDate,
                                    status: 'REALIZADO',
                                    sourceSheet: sheetName
                                });
                            }
                        });
                    }
                });

                if (allCertificates.length === 0) {
                    setError('No se encontraron registros con estado "REALIZADO" o el formato del archivo es incorrecto (Falta columna "Nombre" o formato de curso).');
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
        <div className="mb-8">
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`
                    border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                    ${isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }
                `}
            >
                <input
                    type="file"
                    id="excel-upload"
                    className="hidden"
                    accept=".xlsx, .xls"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                <label htmlFor="excel-upload" className="cursor-pointer space-y-2 block">
                    <div className="text-4xl">📊</div>
                    <div className="text-gray-600 font-medium">
                        {fileName ? (
                            <span className="text-blue-600">{fileName}</span>
                        ) : (
                            <span>Arrastra tu archivo Excel aquí o haz clic para buscar</span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        El archivo debe tener una columna <strong>"Nombre"</strong> y columnas de curso con el formato: <br />
                        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">[Curso] (Horas) &#123;Fecha Inicio&#125; "Fecha Termino"</code>
                    </p>
                </label>
            </div>
            {error && (
                <div className="mt-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
                    <span className="mr-2">⚠️</span> {error}
                </div>
            )}
        </div>
    );
}
