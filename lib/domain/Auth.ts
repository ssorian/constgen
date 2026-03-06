// ─── Auth domain types ────────────────────────────────────────────────────────

export interface StudentSession {
    alumno_id: number;
    nombre: string;
    matricula: string;
}

export interface LoginResult {
    success: boolean;
    error?: string;
}
