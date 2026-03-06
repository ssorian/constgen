'use server';

import { signIn } from '@/auth';
import { LoginResult } from '@/lib/domain/Auth';

/**
 * Application action: Authenticates a student or teacher by CURP/Email + password.
 * On success, NextAuth creates an HTTP-only cookie.
 * Replaces auth.php.
 */
export async function login(
    prevState: LoginResult,
    formData: FormData,
): Promise<LoginResult> {
    const curpOrEmail = (formData.get('curp') as string ?? '').trim();
    const password = (formData.get('password') as string ?? '').trim();

    if (!curpOrEmail || !password) {
        return { success: false, error: 'Por favor completa todos los campos.' };
    }

    const isEmail = curpOrEmail.includes('@');
    const redirectPath = isEmail ? '/constgen' : '/mis-constancias';

    try {
        await signIn('credentials', {
            username: curpOrEmail,
            password: password,
            redirectTo: redirectPath, // NextAuth will natively resolve the redirect
        });

        return { success: true };
    } catch (err: any) {
        console.error('[auth/login] error:', err);
        // Auth.js redirects immediately on success or throws specific errors
        if (err.type === 'CredentialsSignin') {
            return { success: false, error: 'Credenciales inválidas. Verifica tus datos.' };
        }

        // Handle NextAuth redirect exceptions implicitly 
        // next-auth intentionally throws Next.js redirects that we must rethrow
        if (err.message === 'NEXT_REDIRECT') {
            throw err;
        }

        return { success: false, error: 'Error interno del servidor. Intenta más tarde.' };
    }
}
