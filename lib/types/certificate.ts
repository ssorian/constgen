export interface CertificateData {
    nombre: string;
    curso: string;
    horas: number;
    cuv: string;
    curp: string;
    matricula: string;
    startDate: string,
    endDate: string,
    emision?: string; // Fecha de emisión (YYYY-MM-DD)
    vencimiento?: string; // Fecha de vencimiento (YYYY-MM-DD)
    validationUrl?: string; // URL for the QR code
    qrCodeDataUrl?: string; // Base64 QR code to be passed to the template
    isImported?: boolean; // Flag to indicate if data came from Excel
}

export interface ExcelImportData {
    name: string;
    course: string;
    hours: number;
    startDate: string;
    endDate: string;
    status: string; // 'REALIZADO' | 'NO REALIZADO'
}

export interface PdfGenerationRequest {
    data: CertificateData;
}

export interface PdfGenerationResponse {
    success: boolean;
    error?: string;
}
