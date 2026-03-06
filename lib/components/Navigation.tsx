'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navigation() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-[999] transition-opacity md:hidden ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden'
                    }`}
                id="overlayEl"
                onClick={closeMenu}
            />

            {/* Mobile sidebar */}
            <aside
                className={`md:hidden fixed top-0 w-[250px] h-full bg-[#691c32] text-white shadow-[2px_0_5px_rgba(0,0,0,0.5)] transition-all duration-300 z-[1000] ${isOpen ? 'left-0' : 'left-[-250px]'
                    }`}
                id="mobileSidebar"
            >
                <div className="p-5 text-center bg-[#4a1324] relative">
                    {/* Botón de cierre (oculto visualmente en el original, pero útil si se quiere hacer visible después, 
                        o sirve para lectores de pantalla) */}
                    <button
                        onClick={closeMenu}
                        className="absolute top-2 right-2 text-white border-none bg-transparent text-xl font-bold cursor-pointer hover:text-gray-300 focus:outline-none"
                    >
                        ×
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/Img/EscNom.png" alt="Logo de la Escuela Normal de Sultepec" className="max-w-[80px] mb-2.5 mx-auto block" />
                    <h1 className="font-['Arial_Black',sans-serif] font-bold text-[1.2em] m-0">Escuela Normal de Sultepec</h1>
                </div>
                <div className="flex flex-col">
                    <a href="#inicio" onClick={closeMenu} className="block text-white no-underline py-[15px] px-[20px] font-bold border-b border-[#4a1324] transition-colors duration-300 hover:bg-[#8b2a4a] bg-[#8b2a4a]">Inicio</a>
                    <Link href="/login" onClick={closeMenu} className="block text-white no-underline py-[15px] px-[20px] font-bold border-b border-[#4a1324] transition-colors duration-300 hover:bg-[#8b2a4a]">Iniciar Sesión</Link>
                    <a href="#acerca" onClick={closeMenu} className="block text-white no-underline py-[15px] px-[20px] font-bold border-b border-[#4a1324] transition-colors duration-300 hover:bg-[#8b2a4a]">Acerca de</a>
                    <a href="#misyvis" onClick={closeMenu} className="block text-white no-underline py-[15px] px-[20px] font-bold border-b border-[#4a1324] transition-colors duration-300 hover:bg-[#8b2a4a]">Misión y Visión</a>
                    <a href="#oferta" onClick={closeMenu} className="block text-white no-underline py-[15px] px-[20px] font-bold border-b border-[#4a1324] transition-colors duration-300 hover:bg-[#8b2a4a]">Oferta Educativa</a>
                    <a href="#cuv" onClick={closeMenu} className="block text-white no-underline py-[15px] px-[20px] font-bold border-b border-[#4a1324] transition-colors duration-300 hover:bg-[#8b2a4a]">Validador de Constancias</a>
                    <a href="#contacto" onClick={closeMenu} className="block text-white no-underline py-[15px] px-[20px] font-bold border-b border-[#4a1324] transition-colors duration-300 hover:bg-[#8b2a4a]">Contacto</a>
                </div>
            </aside>

            {/* Header (Móvil y Escritorio) */}
            <header className="bg-[#691c32] text-white py-2.5 px-5 text-center relative flex justify-between items-center md:block">
                <button
                    className="md:hidden text-[30px] bg-transparent border-none text-white cursor-pointer p-1.5 focus:outline-none z-[1001]"
                    id="openMenuButton"
                    onClick={toggleMenu}
                    aria-label="Abrir menú"
                >
                    ☰
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Img/EscNom.png" alt="Logo de la Escuela Normal de Sultepec" className="block max-w-[90%] h-auto mx-auto md:max-w-none md:inline" />
            </header>

            {/* Desktop Navigation */}
            <nav className="bg-[#4a1324] hidden md:flex justify-center gap-5 p-2.5 flex-wrap">
                <a href="#inicio" className="text-white no-underline font-bold py-2 px-3 rounded transition-colors duration-300 hover:bg-[#8b2a4a] bg-[#8b2a4a]">Inicio</a>
                <Link href="/login" className="text-white no-underline font-bold py-2 px-3 rounded transition-colors duration-300 hover:bg-[#8b2a4a]">Iniciar Sesión</Link>
                <a href="#acerca" className="text-white no-underline font-bold py-2 px-3 rounded transition-colors duration-300 hover:bg-[#8b2a4a]">Acerca de</a>
                <a href="#misyvis" className="text-white no-underline font-bold py-2 px-3 rounded transition-colors duration-300 hover:bg-[#8b2a4a]">Misión y Visión</a>
                <a href="#oferta" className="text-white no-underline font-bold py-2 px-3 rounded transition-colors duration-300 hover:bg-[#8b2a4a]">Oferta Educativa</a>
                <a href="#cuv" className="text-white no-underline font-bold py-2 px-3 rounded transition-colors duration-300 hover:bg-[#8b2a4a]">Validador de Constancias</a>
                <a href="#contacto" className="text-white no-underline font-bold py-2 px-3 rounded transition-colors duration-300 hover:bg-[#8b2a4a]">Contacto</a>
            </nav>
        </>
    );
}
