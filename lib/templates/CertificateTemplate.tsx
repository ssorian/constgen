import { CertificateData } from "../types/certificate";
import { Montserrat } from "next/font/google";
import parseSpanishDate from "../utils/parseSpanishDate";

interface CertificateTemplateProps {
  data: CertificateData;
}

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const CertificateTemplate = ({ data }: CertificateTemplateProps) => {

  const nombre = data.nombre ? data.nombre.toUpperCase() : "SANTIAGO GONZALEZ SORIANO";
  const curso = data.curso ? data.curso.toUpperCase() : "CURSO DE INFORMATICA";

  return (
    <div
      className={`w-[11in] h-[8.5in] bg-[#9F2241] flex items-center justify-center relative ${montserrat.className}`}
    >
      <div className=" w-[9.5in] h-[7in] border-[4px] border-[#BC955C] bg-gradient-to-br from-white to-gray-100 p-[0.1in] relative shadow-inner">
        <img src="/Colibrii.png" alt="Colibri" width={300} className="absolute bottom-6 left-[-77]" />
        <div className="h-full flex flex-col justify-between">

          {/* Header */}
          <div className="flex pl-3">
            <img src="/Header.png" alt="Header" width={650} />
          </div>

          {/* Content */}
          <div className="ml-36 flex flex-col justify-center  text-center text-black">
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
                <p className="text-3xl font-bold">{nombre}</p>
                <div className="mt-3 h-[9px] w-full bg-[#BC955C] bg-gradient-to-r from-[#BC955C] to-white"></div>
                <p className="text-md text-justify mt-5">Por haber <span className="font-semibold">acreditado</span> satisfactoriamente el <span className="font-semibold">CURSO: {curso}</span>. En la modalidad presencial con una duracion de <span className="font-semibold">{data.horas || "20"}</span> horas realizado {formatDateRange(data.startDate, data.endDate)}.</p>
              </div>
            </div>
          </div>

          <footer className="relative ml-3 flex justify-around items-end">
            <img src="Sello.png" alt="Sello" width={260} />
            <div className="relative px-3 flex flex-col justify-center text-center items-center text-black">
              <img src="Firma.png" alt="Firma" width={160} className="absolute bottom-6" />
              <div className="w-full h-[0.5px] bg-black"></div>
              <p className="text-md">Mtro. Rafael Rodriguez Albíter</p>
              <p className="text-md">Director escolar</p>
            </div>
            <div className="relative text-xs flex flex-col text-black">
              <p>Sultepec, Estado de México a 2025</p>
              <img src="Logos.png" alt="Logos" width={300} />
              {data.qrCodeDataUrl && (
                <img src={data.qrCodeDataUrl} className="w-32 h-32 absolute border border-gray-300 bg-white bottom-7.5 right-4" alt="QR Code" />
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

const formatDateRange = (start: string, end: string) => {
  if (!start || !end) return `del ${start || '...'} al ${end || '...'}`;

  let dateStart = new Date(start);
  if (isNaN(dateStart.getTime())) {
    const parsedStart = parseSpanishDate(start);
    if (parsedStart) dateStart = new Date(parsedStart);
  }

  let dateEnd = new Date(end);
  if (isNaN(dateEnd.getTime())) {
    const parsedEnd = parseSpanishDate(end);
    if (parsedEnd) dateEnd = new Date(parsedEnd);
  }

  // If we STILL couldn't parse it, return raw string to avoid Invalid Date NaN nonsense
  if (isNaN(dateStart.getTime()) || isNaN(dateEnd.getTime())) {
    return `del ${start} al ${end}`;
  }

  const dayStart = dateStart.getUTCDate();
  const monthStart = dateStart.toLocaleString('es-MX', { month: 'long', timeZone: 'UTC' });
  const yearStart = dateStart.getUTCFullYear();

  const dayEnd = dateEnd.getUTCDate();
  const monthEnd = dateEnd.toLocaleString('es-MX', { month: 'long', timeZone: 'UTC' });
  const yearEnd = dateEnd.getUTCFullYear();

  if (yearStart === yearEnd) {
    return `del ${dayStart} de ${monthStart} al ${dayEnd} de ${monthEnd} de ${yearEnd}`;
  } else {
    return `del ${dayStart} de ${monthStart} de ${yearStart} al ${dayEnd} de ${monthEnd} de ${yearEnd}`;
  }
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

  const nombre = data.nombre ? data.nombre.toUpperCase() : "SANTIAGO GONZALEZ SORIANO";
  const curso = data.curso ? data.curso.toUpperCase() : "CURSO DE INFORMATICA";

  const dateRangeText = formatDateRange(data.startDate, data.endDate);

  const fechaEmisionRaw = data.endDate || new Date().toISOString();
  let emisionDate = new Date(fechaEmisionRaw);
  if (isNaN(emisionDate.getTime())) {
    const parsedEmision = parseSpanishDate(fechaEmisionRaw);
    if (parsedEmision) emisionDate = new Date(parsedEmision);
  }

  const fechaEmision = isNaN(emisionDate.getTime()) ? fechaEmisionRaw : emisionDate.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet">
      <script src="https://cdn.tailwindcss.com"></script>
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
      </style>
    </head>
    <body class="m-0 p-0">

      <div class="w-[11in] h-[8.5in] bg-[#9F2241] flex items-center justify-center relative">
        <div class="w-[9.5in] h-[7in] border-[4px] border-[#BC955C] bg-gradient-to-br from-white to-gray-100 p-[0.1in] relative shadow-inner">
          <img src="${images?.colibri || assetPath + '/Colibrii.png'}" alt="Colibri" width="300" class="absolute bottom-6 left-[-77px]" />
          <div class="h-full flex flex-col justify-between">

            <div class="flex pl-3">
              <img src="${images?.header || assetPath + '/Header.png'}" alt="Header" width="650" />
            </div>

            <div class="ml-36 flex flex-col justify-center text-center text-black">
              <p class="text-sm leading-relaxed text-black">
                "<span class="text-[#9F2241] font-extrabold">2025. </span>Año del Bicentenario de la Vida Municipal del Estado de México"
              </p>
              <div class="flex justify-center mt-2">
                <p class="max-w-[670px] text-lg font-semibold">La Secretaría de Educación, Ciencia, Tecnología e Innovación, a través de la Escuela Normal de Sultepec, otorgan la presente:</p>
              </div>
              <div class="flex justify-center text-center">
                <div class="flex flex-col w-full max-w-[600px] mt-4">
                  <h2 class="text-7xl font-extrabold text-[#9F2241]">CONSTANCIA</h2>
                  <p class="text-xl font-bold">a:</p>
                  <p class="text-3xl font-bold">${nombre || "SANTIAGO GONZALEZ SORIANO"}</p>
                  <div class="mt-3 h-[9px] w-full bg-[#BC955C] bg-gradient-to-r from-[#BC955C] to-white"></div>
                  <p class="text-base text-justify mt-5">Por haber <span class="font-semibold">acreditado</span> satisfactoriamente el <span class="font-semibold">CURSO: ${curso || "CURSO DE INFORMATICA"}</span>. En la modalidad presencial con una duración de <span class="font-semibold">${data.horas || "20"}</span> horas realizado ${dateRangeText}.</p>
                </div>
              </div>
            </div>

            <footer class="relative ml-3 flex justify-around items-end">
              <img src="${images?.sello || assetPath + '/Sello.png'}" alt="Sello" width="260" />
              <div class="relative px-3 flex flex-col justify-center text-center items-center text-black">
                <img src="${images?.firma || assetPath + '/Firma.png'}" alt="Firma" width="160" class="absolute bottom-6" />
                <div class="w-full h-[0.5px] bg-black"></div>
                <p class="text-base">Mtro. Rafael Rodríguez Albíter</p>
                <p class="text-base">Director Escolar</p>
              </div>
              <div class="relative text-xs flex flex-col text-black">
                <p>Sultepec, Estado de México a ${fechaEmision}</p>
                <img src="${images?.logos || assetPath + '/Logos.png'}" alt="Logos" width="300" />
                ${data.qrCodeDataUrl ? `<img src="${data.qrCodeDataUrl}" class="w-32 h-32 absolute border border-gray-300 bg-white bottom-[30px] right-4" alt="QR Code" />` : ''}
                <p class="text-[11px] text-gray-500 font-mono">CUV: ${data.cuv || 'N/A'}</p>
              </div>
            </footer>

          </div>
        </div>
        <img src="${images?.flores || assetPath + '/Flores.png'}" alt="Flores" class="absolute bottom-0 left-0" />
      </div>

    </body>
    </html>
  `;
};