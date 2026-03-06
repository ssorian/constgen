'use server';

import { signOut } from '@/auth';

/**
 * Application action: Destroys the Auth.js session and redirects to /login.
 * Replaces logout.php.
 */
export async function logout(): Promise<void> {
    await signOut({ redirectTo: '/login' });
}
