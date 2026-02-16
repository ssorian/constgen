import * as XLSX from 'xlsx';
import { ExcelImportData } from './types/certificate';

export function parseExcelFile(file: File): Promise<ExcelImportData[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const allCertificates: ExcelImportData[] = [];

                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

                    if (jsonData.length === 0) return;

                    // Regex to parse header: Name [Course] (Hours) {StartDate} "EndDate"
                    // Example matches:
                    // 1. Name
                    // 2. Course (in brackets)
                    // 3. Hours (in parentheses)
                    // 4. StartDate (in braces)
                    // 5. EndDate (in quotes)
                    const headerRegex = /^(.*?)\[(.*?)\]\s*\((\d+)\)\s*\{(.*?)\}\s*"(.*?)"$/;

                    // Iterate over columns (headers are in the first row)
                    const headers = jsonData[0];

                    headers.forEach((header: string, colIndex: number) => {
                        if (!header || typeof header !== 'string') return;

                        const match = headerRegex.exec(header.trim());
                        if (match) {
                            const [_, name, course, hoursStr, startDate, endDate] = match;
                            const hours = parseInt(hoursStr, 10);

                            // Iterate over rows to find status
                            // Start from row 1 (index 1) since row 0 is header
                            for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) {
                                const row = jsonData[rowIndex];
                                const status = row[colIndex];

                                if (status === 'REALIZADO') {
                                    allCertificates.push({
                                        name: name.trim(),
                                        course: course.trim(),
                                        hours: hours,
                                        startDate: startDate.trim(),
                                        endDate: endDate.trim(),
                                        status: 'REALIZADO'
                                    });
                                }
                            }
                        }
                    });
                });

                resolve(allCertificates);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
}
