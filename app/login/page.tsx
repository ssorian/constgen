import type { Metadata } from 'next';
import Link from 'next/link';
import LoginForm from '@/lib/components/LoginForm';

export const metadata: Metadata = {
    title: 'Iniciar Sesión - ENSultepec',
    description: 'Acceso al sistema de constancias de la Escuela Normal de Sultepec.',
};

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#4a1324] p-5 font-sans box-border selection:bg-[#d5b981] selection:text-[#4a1324]">
            <main className="w-full max-w-[420px]">
                <LoginForm />

                <Link
                    href="/"
                    className="block text-center mt-6 text-[#d5b981] no-underline font-bold hover:text-white transition-colors duration-300 text-sm md:text-base"
                >
                    ← Regresar al Inicio
                </Link>
            </main>
        </div>
    );
}
