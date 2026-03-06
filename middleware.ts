import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

export const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const userRole = (req.auth?.user as any)?.role;

    // Rutas protegidas
    const isConstgenRoute = req.nextUrl.pathname.startsWith('/constgen');
    const isMisConstanciasRoute = req.nextUrl.pathname.startsWith('/mis-constancias');

    // 1. Proteger /constgen (Solo Docentes)
    if (isConstgenRoute) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL('/login', req.nextUrl));
        }
        if (userRole !== 'docente') {
            return NextResponse.redirect(new URL('/', req.nextUrl)); // Alumnos o anónimos fuera
        }
    }

    // 2. Proteger /mis-constancias (Solo Alumnos)
    if (isMisConstanciasRoute) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL('/login', req.nextUrl));
        }
        if (userRole !== 'alumno') {
            return NextResponse.redirect(new URL('/', req.nextUrl)); // Docentes  fuera
        }
    }

    return NextResponse.next();
});

// Especificar en qué paths ejecuta el middleware (ignorando API y estáticos)
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
