// ─── Certificate domain types ─────────────────────────────────────────────────

/** The certificate data used for PDF generation and DB storage */
export interface CertificateData {
    nombre: string;
    curso: string;
    horas: number;
    cuv: string;
    curp: string;
    matricula: string;
    startDate: string;
    endDate: string;
    emision?: string;
    vencimiento?: string;
    validationUrl?: string;
    qrCodeDataUrl?: string;
    isImported?: boolean;
}

/** Result of a CUV validation lookup */
export interface CUVResult {
    encontrado: boolean;
    titulo_curso?: string;
    nombre_alumno?: string;
    ano_emision?: number;
    numero_horas?: number;
    mensaje?: string;
}

/** A single certificate document in the student's history */
export interface CertificadoDoc {
    tipo_documento: string;
    anio_emision: number;
    anio_vencimiento: number;
    horas: number;
    cuv: string;
    url_certificado: string;
}

/** Search result for certificates by name or matricula */
export interface SearchResult {
    encontrado: boolean;
    nombre_completo?: string;
    matricula?: string;
    documentos?: CertificadoDoc[];
    mensaje?: string;
}

/** A single constancia row associated to the logged-in student */
export interface MiConstancia {
    titulo: string;
    cuv: string;
    ano_emision: number;
    numeros_horas: number;
}

/** Result of a single certificate upload */
export interface CertificateUploadResult {
    nombre: string;
    success: boolean;
    url?: string;
    error?: string;
}

/** Payload for registering a certificate in the database */
export interface PostCertificatePayload {
    alumno_id: number;
    curso: string;
    cuv: string;
    emision: string;
    vencimiento: string;
    horas: number;
    url_certificado: string;
}
