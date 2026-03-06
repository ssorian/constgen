'use server';

import { auth } from '@/auth';
import { StudentSession } from '@/lib/domain/Auth';

/**
 * Application action: Reads the session from Auth.js and returns the
 * parsed StudentSession, or null if the user is not authenticated as a student.
 */
export async function getSession(): Promise<StudentSession | null> {
    const session = await auth();

    if (!session || !session.user) return null;

    // Filter to ensure only students are processed when fetching student state
    if ((session.user as any).role === 'alumno') {
        return {
            alumno_id: Number((session.user as any).id),
            nombre: session.user.name || '',
            matricula: (session.user as any).matricula || '',
        };
    }

    return null;
}
