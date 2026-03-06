'use client';

import { useActionState } from 'react';
import { login } from '@/actions/auth/login';
import { LoginResult } from '@/lib/domain/Auth';

const initialState: LoginResult = { success: false };

export default function LoginForm() {
    const [state, formAction, isPending] = useActionState(login, initialState);

    return (
        <form
            action={formAction}
            className="w-full mx-auto p-8 bg-white shadow-xl rounded-2xl border border-gray-100"
            style={{ position: 'relative', zIndex: 10 }}
        >
            <div className="text-center mb-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Img/LOGO.png" alt="Logo ENSultepec" className="max-w-[100px] mx-auto mb-4 block" />
                <h2 className="text-[#691c32] text-xl font-bold m-0 border-none">Acceso al Sistema</h2>
            </div>

            <div className="mb-5">
                <label className="block text-[#1a2b3c] text-sm font-bold mb-2">CURP o Correo Electrónico</label>
                <input
                    type="text"
                    name="curp"
                    required
                    placeholder="Ingresa tu CURP o Email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#691c32] focus:ring-2 focus:ring-[#691c32] focus:ring-opacity-20 outline-none transition-all text-gray-700 shadow-sm"
                    onChange={(e) => {
                        // Si no contiene una arroba, asumimos CURP e intentamos ser amables poniéndolo en mayúsculas
                        if (!e.target.value.includes('@')) {
                            e.target.value = e.target.value.toUpperCase();
                        }
                    }}
                />
            </div>

            <div className="mb-6">
                <label className="block text-[#1a2b3c] text-sm font-bold mb-2">Contraseña</label>
                <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#691c32] focus:ring-2 focus:ring-[#691c32] focus:ring-opacity-20 outline-none transition-all text-gray-700 shadow-sm"
                />
            </div>

            {state?.error && (
                <div className="mb-5 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded shadow-sm flex items-center justify-center font-medium">
                    {state.error}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#691c32] hover:bg-[#8b2a4a] text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg disabled:opacity-70 flex justify-center items-center mt-2"
            >
                {isPending ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : null}
                {isPending ? 'Verificando...' : 'Entrar al Sistema'}
            </button>
        </form>
    );
}
