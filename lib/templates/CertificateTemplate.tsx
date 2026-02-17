import { CertificateData } from "../types/certificate";
import { Montserrat } from "next/font/google";

interface CertificateTemplateProps {
  data: CertificateData;
}

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const CertificateTemplate = ({ data }: CertificateTemplateProps) => {
  const formattedDate = data.fecha
    ? new Date(data.fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    : 'Fecha no válida';

  return (
    <div
      className={`w-[11in] h-[8.5in] bg-[#9F2241] flex items-center justify-center relative ${montserrat.className}`}
    >
      <div className=" w-[9.5in] h-[7in] border-[4px] border-[#BC955C] bg-gradient-to-br from-white to-gray-100 p-[0.1in] relative shadow-inner">
        <img src="/Colibrii.png" alt="Colibri" width={300} className="absolute bottom-6 left-[-77]" />
        <div className="h-full flex flex-col ">

          {/* Header */}
          <div className="flex pl-3">
            <img src="/Header.png" alt="Header" width={650} />
          </div>

          {/* Content */}
          <div className="ml-20 flex flex-col justify-center  text-center text-black">
            <p className="text-sm leading-relaxed text-black ">
              "<span className="text-[#9F2241] font-extrabold">2025. </span>Año del Bicentenario de la Vida Municipal del Estado de Mexico"
            </p>

            <div className="flex justify-center mt-2">
              <p className="max-w-[670px] text-lg font-semibold">La Secretaria de Educacion, Ciencia, Tecnologia e Innovacion, a traves de la Escuela Normal de Sultepec, otorgan la presente:</p>
            </div>


            <div className="flex justify-center text-center ">
              <div className="flex flex-col w-full max-w-[600px] mt-4 ">
                <h2 className="text-7xl font-extrabold text-[#9F2241]">CONSTANCIA</h2>
                <p className="text-xl font-bold">a:</p>
                <p className="text-3xl font-bold">{data.nombre || "SANTIAGO GONZALEZ SORIANO"}</p>
                <div className="mt-3 h-[9px] w-full bg-[#BC955C] bg-gradient-to-r from-[#BC955C] to-white"></div>
                <p className="text-md text-justify mt-5">Por haber <span className="font-semibold">acreditado</span> satisfactoriamente el <span className="font-semibold">CURSO: {data.curso || "CURSO DE INFORMATICA"}</span>. En la modalidad presencial con una duracion de <span className="font-semibold">{data.horas || "20"}</span> horas realizado del {data.startDate || "2025"} al {data.endDate || "2025"}.</p>
              </div>
            </div>
          </div>

          <footer className="relative ml-3 flex justify-around items-end">
            <img src="Sello.png" alt="Sello" width={260} />
            <div className="relative px-3 flex flex-col justify-center text-center items-center text-black">
              <img src="Firma.png" alt="Firma" width={160} className="absolute bottom-6" />
              <div className="w-full h-[0.5px] bg-black"></div>
              <p className="text-md">Mtro. José Luis Guadarrama Rosales</p>
              <p className="text-md">Director escolar</p>
            </div>
            <div className="relative flex flex-col text-black">
              <p>Sultepec, Estado de México a {data.endDate || "2025"}</p>
              <img src="Logos.png" alt="Logos" width={300} />
              {data.qrCodeDataUrl && (
                <img src={data.qrCodeDataUrl} className="w-32 h-32 absolute border border-gray-300 bg-white bottom-7 right-5" alt="QR Code" />
              )}

              <p className="text-[11px] text-gray-500 font-mono">CUV: {data.cuv}</p>
            </div>
          </footer>


        </div>
      </div>
      <img src="Flores.png" alt="Flores" className="absolute bottom-0 left-0" />
    </div >
  );
};

export const generateCertificateHtml = (
  data: CertificateData,
  images?: {
    colibri?: string;
    header?: string;
    sello?: string;
    firma?: string;
    logos?: string;
    flores?: string;
  }
): string => {
  const assetPath = process.env.NEXT_PUBLIC_APP_URL || "";

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet">
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                burgundy: '#9F2241',
                gold: '#BC955C',
              },
              fontFamily: {
                montserrat: ['Montserrat', 'sans-serif'],
              }
            }
          }
        }
      </script>
      <style>
        body {
          font-family: 'Montserrat', sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        @page {
          size: 11in 8.5in;
          margin: 0;
        }

        /* Estilos específicos que Tailwind no puede manejar fácilmente */
        .gold-gradient {
          background: linear-gradient(to right, #BC955C, #ffffff);
        }
      </style>
    </head>
    <body class="m-0 p-0">
      <!-- Contenedor Principal -->
      <div class="w-[11in] h-[8.5in] bg-[#9F2241] flex items-center justify-center relative overflow-hidden">
        <!-- Marco Interior -->
        <div class="w-[9.5in] h-[7in] border-4 border-[#BC955C] bg-gradient-to-br from-white to-gray-100 p-[0.1in] relative shadow-inner flex flex-col justify-between z-10">
          
          <!-- Colibrí decorativo -->
          <img src="${images?.colibri || assetPath + '/Colibrii.png'}" 
               class="absolute bottom-6 -left-[77px] w-[300px] z-20" 
               alt="Colibri" />

          <!-- Header -->
          <div class="flex pl-3">
            <img src="${images?.header || assetPath + '/Header.png'}" 
                 class="w-[650px]" 
                 alt="Header" />
          </div>

          <!-- Contenido Principal -->
          <div class="ml-20 flex flex-col justify-center text-center text-black">
            <p class="text-sm leading-relaxed text-black">
              "<span class="text-[#9F2241] font-extrabold">2025. </span>Año del Bicentenario de la Vida Municipal del Estado de México"
            </p>

            <div class="flex justify-center mt-2">
              <p class="max-w-[670px] text-lg font-semibold">
                La Secretaría de Educación, Ciencia, Tecnología e Innovación, a través de la Escuela Normal de Sultepec, otorgan la presente:
              </p>
            </div>

            <div class="flex justify-center text-center">
              <div class="flex flex-col w-full max-w-[600px] mt-4">
                <h2 class="text-7xl font-extrabold text-[#9F2241]">CONSTANCIA</h2>
                <p class="text-xl font-bold">a:</p>
                <p class="text-3xl font-bold uppercase">
                  ${data.nombre || "SANTIAGO GONZALEZ SORIANO"}
                </p>
                
                <!-- Línea decorativa con gradiente -->
                <div class="mt-3 h-[9px] w-full gold-gradient"></div>
                
                <p class="text-base text-justify mt-5 leading-relaxed">
                  Por haber <span class="font-semibold">acreditado</span> satisfactoriamente el 
                  <span class="font-semibold">CURSO: ${data.curso || "CURSO DE INFORMÁTICA"}</span>. 
                  En la modalidad presencial con una duración de 
                  <span class="font-semibold">${data.horas || "20"}</span> horas 
                  realizado del ${data.startDate || "2025"} al ${data.endDate || "2025"}.
                </p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <footer class="relative ml-3 flex justify-around items-end">
            <!-- Sello -->
            <img src="${images?.sello || assetPath + '/Sello.png'}" 
                 class="w-[260px]" 
                 alt="Sello" />
            
            <!-- Firma -->
            <div class="relative px-3 flex flex-col justify-center text-center items-center text-black w-[250px]">
              <img src="${images?.firma || assetPath + '/Firma.png'}" 
                   class="absolute bottom-6 w-[160px]" 
                   alt="Firma" />
              <div class="w-full h-[0.5px] bg-black mb-1"></div>
              <p class="text-sm font-bold m-0">Mtro. José Luis Guadarrama Rosales</p>
              <p class="text-sm m-0">Director escolar</p>
            </div>

            <!-- Logos y QR -->
            <div class="relative flex flex-col text-black text-right">
              <p class="text-sm mb-2">Sultepec, Estado de México a ${data.endDate || "2025"}</p>
              <img src="${images?.logos || assetPath + '/Logos.png'}" 
                   class="w-[300px]" 
                   alt="Logos" />
              
              ${data.qrCodeDataUrl ? `
                <img src="${data.qrCodeDataUrl}" 
                     class="absolute bottom-8 right-5 w-32 h-32 border border-gray-300 bg-white" 
                     alt="QR Code" />
              ` : ''}

              <p class="font-mono text-[11px] text-gray-500 mt-1">CUV: ${data.cuv || 'N/A'}</p>
            </div>
          </footer>

        </div>
        
        <!-- Flores decorativas -->
        <img src="${images?.flores || assetPath + '/Flores.png'}" 
             class="absolute bottom-0 left-0 " 
             alt="Flores" />
      </div>
    </body>
    </html>
  `;
};

