import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login', // All logins point here
    },
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            // First time jwt runs, "user" will be populated with what resolve from `authorize`
            if (user) {
                token.role = (user as any).role;
                token.id = user.id; // Important
                if ((user as any).role === 'alumno') {
                    token.matricula = (user as any).matricula;
                }
            }
            return token;
        },
        async session({ session, token }) {
            // Forward elements from the token into the session accessible server/client-side
            if (token && session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                if (token.role === 'alumno') {
                    (session.user as any).matricula = token.matricula;
                }
            }
            return session;
        }
    },
    providers: [], // Added in auth.ts to avoid Edge Runtime issues
} satisfies NextAuthConfig;
