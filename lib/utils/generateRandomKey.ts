export async function generateRandomKey(
  matricula?: string,
  nombreCurso?: string,
  fechaTermino?: Date | string,
  getNextIncrement: () => Promise<number> = async () => 1
): Promise<string> {

  // --- Segmento de matrícula (3 dígitos) ---
  const digits = (matricula || '').replace(/\D/g, ''); // solo números
  const matriculaSegment = digits.length >= 3
    ? digits.slice(0, 3)
    : String(Math.floor(Math.random() * 900) + 100); // 100–999

  // --- Primeras 3 letras del curso ---
  const courseSafe = (nombreCurso || '').trim().replace(/\s+/g, '');
  const courseSegment = courseSafe.slice(0, 3).toUpperCase().padEnd(3, 'X');

  // --- Fecha de término (formato YYYYMMDD o DDMMYYYY según prefieras) ---
  const fecha = fechaTermino ? new Date(fechaTermino) : new Date();
  const fechaSegment = [
    String(fecha.getFullYear()),
    String(fecha.getMonth() + 1).padStart(2, '0'),
    String(fecha.getDate()).padStart(2, '0'),
  ].join('');

  // --- Autoincrement desde MySQL ---
  const increment = await getNextIncrement();
  const incrementSegment = String(increment).padStart(3, '0');

  return `ENS-${matriculaSegment}-${courseSegment}-${fechaSegment}-${incrementSegment}`;
}

export default generateRandomKey;