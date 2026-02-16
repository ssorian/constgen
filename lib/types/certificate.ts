export interface CertificateData {
    nombre: string;
    curso: string;
    horas: number;
    fecha: string;
    cuv: string;
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
