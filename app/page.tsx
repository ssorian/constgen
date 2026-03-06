import type { Metadata } from 'next';
import Link from 'next/link';
import CUVValidator from '@/lib/components/CUVValidator';

export const metadata: Metadata = {
    title: 'Escuela Normal de Sultepec',
    description: 'Página oficial de la Escuela Normal de Sultepec. Información educativa, oferta académica y búsqueda de certificados.',
    other: {
        'google-site-verification': 'cV-i4O51LHHkjvGAuxQG3hyMKZIlORVbveLSHgbqPMg',
    },
};

export default function HomePage() {
    return (
        <div className="font-sans bg-[#f4f4f4] text-[#333] leading-relaxed overflow-x-hidden min-h-screen">
            {/* Mobile overlay */}
            <div className="hidden fixed inset-0 bg-black/50 z-[999] transition-opacity" id="overlayEl" />

            {/* Mobile sidebar */}
            <aside className="md:hidden fixed top-0 left-[-250px] w-[250px] h-full bg-[#691c32] text-white shadow-[2px_0_5px_rgba(0,0,0,0.5)] transition-all duration-300 z-[1000]" id="mobileSidebar">
                <div className="p-5 text-center bg-[#4a1324]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/Img/EscNom.png" alt="Logo de la Escuela Normal de Sultepec" className="max-w-[80px] mb-2.5 mx-auto block" />
                    <h1 className="font-['Arial_Black',sans-serif] font-bold text-[1.2em] m-0">Escuela Normal de Sultepec</h1>
                </div>
                <div className="flex flex-col">
                    <a href="#inicio" className="block text-white no-underline py-[15px] px-[20px] font-bold border-b border-[#4a1324] transition-colors duration-300 hover:bg-[#8b2a4a] bg-[#8b2a4a]">Inicio</a>
                    <Link href="/login" className="block text-white no-underline py-[15px] px-[20px] font-bold border-b border-[#4a1324] transition-colors duration-300 hover:bg-[#8b2a4a]">Iniciar Sesión</Link>
                    <a href="#acerca" className="block text-white no-underline py-[15px] px-[20px] font-bold border-b border-[#4a1324] transition-colors duration-300 hover:bg-[#8b2a4a]">Acerca de</a>
                    <a href="#misyvis" className="block text-white no-underline py-[15px] px-[20px] font-bold border-b border-[#4a1324] transition-colors duration-300 hover:bg-[#8b2a4a]">Misión y Visión</a>
                    <a href="#oferta" className="block text-white no-underline py-[15px] px-[20px] font-bold border-b border-[#4a1324] transition-colors duration-300 hover:bg-[#8b2a4a]">Oferta Educativa</a>
                    <a href="#cuv" className="block text-white no-underline py-[15px] px-[20px] font-bold border-b border-[#4a1324] transition-colors duration-300 hover:bg-[#8b2a4a]">Validador de Constancias</a>
                    <a href="#contacto" className="block text-white no-underline py-[15px] px-[20px] font-bold border-b border-[#4a1324] transition-colors duration-300 hover:bg-[#8b2a4a]">Contacto</a>
                </div>
                <button id="closeMenuButton" className="hidden" />
            </aside>

            <header className="bg-[#691c32] text-white py-2.5 px-5 text-center relative flex justify-between items-center md:block">
                <button className="md:hidden text-[30px] bg-transparent border-none text-white cursor-pointer p-1.5 focus:outline-none" id="openMenuButton">☰</button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Img/EscNom.png" alt="Logo de la Escuela Normal de Sultepec" className="block max-w-[90%] h-auto mx-auto md:max-w-none md:inline" />
            </header>

            <nav className="bg-[#4a1324] hidden md:flex justify-center gap-5 p-2.5 flex-wrap">
                <a href="#inicio" className="text-white no-underline font-bold py-2 px-3 rounded transition-colors duration-300 hover:bg-[#8b2a4a] bg-[#8b2a4a]">Inicio</a>
                <Link href="/login" className="text-white no-underline font-bold py-2 px-3 rounded transition-colors duration-300 hover:bg-[#8b2a4a]">Iniciar Sesión</Link>
                <a href="#acerca" className="text-white no-underline font-bold py-2 px-3 rounded transition-colors duration-300 hover:bg-[#8b2a4a]">Acerca de</a>
                <a href="#misyvis" className="text-white no-underline font-bold py-2 px-3 rounded transition-colors duration-300 hover:bg-[#8b2a4a]">Misión y Visión</a>
                <a href="#oferta" className="text-white no-underline font-bold py-2 px-3 rounded transition-colors duration-300 hover:bg-[#8b2a4a]">Oferta Educativa</a>
                <a href="#cuv" className="text-white no-underline font-bold py-2 px-3 rounded transition-colors duration-300 hover:bg-[#8b2a4a]">Validador de Constancias</a>
                <a href="#contacto" className="text-white no-underline font-bold py-2 px-3 rounded transition-colors duration-300 hover:bg-[#8b2a4a]">Contacto</a>
            </nav>

            <main className="max-w-[1200px] my-5 mx-auto p-5 md:p-8 bg-white md:rounded-lg md:shadow-[0_0_15px_rgba(0,0,0,0.05)] w-full box-border">
                {/* ─── Hero ─────────────────────────────────────────────── */}
                <section id="inicio" className="text-center py-10 px-5 bg-[#691c32] text-white rounded-lg mb-10 shadow-[0_0_10px_rgba(0,0,0,0.1)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/Img/LOGO.png" alt="Logo de la Escuela Normal de Sultepec" className="max-w-[200px] mb-5 mx-auto block" />
                    <h2 className="text-[#d5b981] border-none pb-0 text-2xl md:text-3xl font-bold mb-4">Bienvenidos a la Escuela Normal de Sultepec</h2>
                    <p className="max-w-3xl mx-auto text-lg opacity-90">
                        Formamos estudiantes con valores, conocimientos y habilidades para el futuro. Nuestra institución se dedica a
                        proporcionar una educación de calidad en un entorno seguro y motivador.
                    </p>
                </section>

                {/* ─── Acerca de ────────────────────────────────────────── */}
                <section id="acerca" className="mb-10">
                    <h2 className="text-[#691c32] border-b-2 border-[#691c32] pb-2.5 mb-5 text-2xl font-bold">Acerca de la Escuela</h2>
                    <p className="mb-4 text-justify">
                        Esta institución fue fundada el 1° de septiembre de 1974, cuando por acuerdo del poder ejecutivo estatal, se
                        establece la Escuela Normal No. 13 de Sultepec, gracias al impulso que el Profr. Carlos Hank González,
                        Gobernador del Estado de México, da al normalismo en la entidad; su primera directora fue la Profra. María del
                        Socorro Carbajal Rodríguez, se ubicó en la cabecera municipal de Sultepec, pueblo con fisonomía típica colonial
                        que permite gozar de hermosos paisajes naturales, de monumentos y acontecimientos históricos, se caracteriza por
                        sus casas cubiertas con teja roja, por sus calles empedradas y sus románticos callejones.
                    </p>
                    <p className="mb-4 text-justify">
                        En el ámbito educativo para atender a la población de nivel superior cuenta con una Unidad de Estudios
                        Superiores de la Universidad Mexiquense del Bicentenario y la Escuela Normal de Sultepec, que hasta la fecha
                        tiene un total de 300 egresados como profesores de Educación Primaria y 1161 como licenciados en Educación en
                        sus diferentes especialidades (Primaria, Telesecundaria, Tele-Educación, Ciencias Sociales, Ciencias Naturales,
                        Administración y Español). Alberga en sus aulas a la Juventud inquieta y estudiosa de la región que comprende
                        los municipios de Sultepec, Texcaltitlán, Almoloya de Alquisiras, Zacualpan y actualmente se han incorporado
                        alumnos de San Simón de Guerrero, Tejupilco, Amatepec y Tlatlaya.
                    </p>
                    <p className="mb-6 text-justify">
                        El programa educativo que actualmente ofrece es el de La Licenciatura en Educación Secundaria con Especialidad
                        en Español (sexto y octavo semestre), Licenciatura en Enseñanza y Aprendizaje en Telesecundaria y Licenciatura
                        en Educación Primaria, con una matricula total de 356 alumnos, con una planta de personal integrada por 36
                        docentes (3 directivos, 7 investigadores, 15 pedagogos &ldquo;A&rdquo;, 9 profesores horas clase y dos formadores de
                        inglés). La institución se ubica en domicilio conocido Unidad Deportiva S/N, Barrio de Coaxusco, Sultepec
                        México; C.P. 51600, Tel. 017161480224, correo electrónico normalsultepec@edugem.gob.mx
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/Img/todos.jpg" className="w-full h-auto rounded-lg shadow-sm" alt="Foto de imágenes Docentes Escuela Normal de Sultepec" />
                </section>

                {/* ─── Misión y Visión ──────────────────────────────────── */}
                <section id="misyvis" className="mb-10">
                    <h2 className="text-[#691c32] border-b-2 border-[#691c32] pb-2.5 mb-5 text-2xl font-bold">Misión y Visión</h2>
                    <h3 className="text-[#d5b981] text-xl font-bold mb-3">Misión Estatal</h3>
                    <p className="mb-6 text-justify">
                        La Subdirección de Escuelas Normales gestiona, organiza y administra, las condiciones académico-administrativas
                        para la formación integral de profesionales de la Educación en los niveles de Licenciatura, especialidad,
                        maestría y doctorado a través de modelos educativos innovadores, pertinentes y aprendizajes relevantes, que
                        contribuyan al desarrollo de la educación obligatoria con inclusión, equidad y excelencia educativa.
                    </p>
                    <h3 className="text-[#d5b981] text-xl font-bold mb-3">Visión Estatal</h3>
                    <p className="mb-2 text-justify">
                        En el 2030 la Autoridad Educativa Estatal de las ENPEM consolidará ofertas educativas de excelencia para la
                        formación inicial y continua con programas educativos acreditados y procesos certificados, reconocidos a nivel
                        nacional e internacional, sustentados en el diseño y análisis curricular, investigación, innovación, cuerpos
                        académicos, redes de colaboración, y extensión con impacto social; en instituciones caracterizadas por procesos
                        eficientes de gestión, planeación participativa, estratégica y prospectiva que cuentan con una infraestructura
                        física, académica y tecnológica optima que fortalece el trabajo colegiado, certificadas en tecnologías y
                        lenguas, transparencia, y rendición de cuentas, con una perspectiva de género igualdad sustantiva e inclusión.
                    </p>
                </section>

                {/* ─── Oferta Educativa ─────────────────────────────────── */}
                <section id="oferta" className="mb-10">
                    <h2 className="text-[#691c32] border-b-2 border-[#691c32] pb-2.5 mb-5 text-2xl font-bold">Oferta Educativa</h2>
                    <p className="mb-3">Ofrecemos las siguientes licenciaturas:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-2">
                        <li>Licenciatura en Educación Primaria</li>
                        <li>Licenciatura en Enseñanza y Aprendizaje en Telesecundaria</li>
                        <li>Licenciatura en Español</li>
                    </ul>
                </section>

                {/* ─── Validador de Constancias ─────────────────────────── */}
                <section id="cuv" className="mb-10 p-6 md:p-8 bg-[#f9f9f9] rounded-xl border border-gray-100">
                    <div className="text-center mb-6">
                        <h2 className="text-[#691c32] pb-2.5 mb-2 text-2xl font-bold inline-block border-b-2 border-[#691c32]">Validador de Constancias</h2>
                        <p className="text-gray-600">Ingresa el CUV (Clave Única de Validación) de la constancia.</p>
                    </div>
                    <CUVValidator />
                </section>

                {/* ─── Contacto ─────────────────────────────────────────── */}
                <section id="contacto" className="mb-10 bg-gray-50 p-6 md:p-8 rounded-xl border border-gray-100">
                    <h2 className="text-[#691c32] border-b-2 border-[#691c32] pb-2.5 mb-5 text-2xl font-bold">Contacto</h2>
                    <div className="mb-6 space-y-2">
                        <p><strong>Dirección:</strong> Unidad Deportiva S/N. Barrio Coaxusco. C.P. 51600. Sultepec, Estado de México.</p>
                        <p><strong>Teléfono:</strong> (716)1480224</p>
                        <p><strong>Email:</strong> normalsultepec@edugem.gob.mx</p>
                        <p><strong>Horarios de oficina:</strong> Lunes a viernes de 7:00 a 16 horas.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="text-[#d5b981] font-bold text-lg mb-2">Dirección Escolar</h3>
                            <p className="mb-1 text-sm font-medium">Mtro. Rafael Rodríguez Albíter</p>
                            <p className="mb-1 text-sm text-[#691c32] hover:underline">normalsultepec@edugem.gob.mx</p>
                            <p className="text-sm">Teléfono: (716) 1480 224.</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="text-[#d5b981] font-bold text-lg mb-2">Subdirección Académica</h3>
                            <p className="mb-1 text-sm font-medium">Mtra. Minerva Flores Barón</p>
                            <p className="mb-1 text-sm text-[#691c32] hover:underline">minerva.flores@normalsultepec.edu.mx</p>
                            <p className="text-sm">Teléfono: (716) 1480 224.</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="text-[#d5b981] font-bold text-lg mb-2">Subdirección Administrativa</h3>
                            <p className="mb-1 text-sm font-medium">Lic. Jaime Albiter Valdez</p>
                            <p className="mb-1 text-sm text-[#691c32] hover:underline">jaime.albiter@normalsultepec.edu.mx</p>
                            <p className="text-sm">Teléfono: (716) 1480 224.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-[#691c32] text-white text-center p-6 w-full">
                <p className="opacity-90">© 2025 Escuela Normal de Sultepec. Todos los derechos reservados.</p>
            </footer>

            {/* Legacy script for mobile menu toggle — handles DOM interactions */}
            {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        </div>
    );
}