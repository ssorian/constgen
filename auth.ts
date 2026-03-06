import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from '@/lib/infrastructure/db';
import { RowDataPacket } from 'mysql2';
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "CURP o Correo", type: "text" },
                password: { label: "Contraseña", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null;

                const identifier = (credentials.username as string).trim();
                const password = (credentials.password as string).trim();
                const isEmail = identifier.includes('@');

                try {
                    if (isEmail) {
                        // Flujo de Docente
                        const [rows] = await pool.query<RowDataPacket[]>(
                            `SELECT id, email, password FROM docente WHERE email = ? LIMIT 1`,
                            [identifier]
                        );

                        if (rows.length === 0) return null;
                        const user = rows[0];

                        // Si la password no está hasheada aún, usar:
                        if (password === user.password) {
                            return {
                                id: String(user.id),
                                email: user.email,
                                role: 'docente'
                            };
                        }
                    } else {
                        // Flujo de Alumno
                        const curp = identifier.toUpperCase();
                        const [rows] = await pool.query<RowDataPacket[]>(
                            `SELECT alumno_id, matricula, nombre_completo, password FROM alumno WHERE curp = ? LIMIT 1`,
                            [curp]
                        );

                        if (rows.length === 0) return null;
                        const user = rows[0];

                        // Si la password no está hasheada aún, usar:
                        if (password === user.password) {
                            return {
                                id: String(user.alumno_id),
                                name: user.nombre_completo,
                                role: 'alumno',
                                matricula: user.matricula, // custom field
                            };
                        }
                    }

                    return null;
                } catch (error) {
                    console.error("Authentication error:", error);
                    return null;
                }
            }
        })
    ],
});
