export function generateRandomKey(nombre?: string, nombreCurso?: string) {
  const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const nameSafe = String(nombre || '').trim();
  const courseSafe = String(nombreCurso || '').trim();

  const randomChars = (chars: string, length: number) =>
    Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

  // Iniciales del nombre (máx 3 letras)
  const nameInitials = nameSafe
    .split(' ')
    .map(word => word[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 3)
    .padEnd(3, 'X');

  // Iniciales del curso (máx 3 letras)
  const courseInitials = courseSafe
    .split(' ')
    .map(word => word[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 3)
    .padEnd(3, 'X');

  // Segmento alfanumérico aleatorio
  const randomSegment = randomChars(alphanumeric, 4);

  // Secuencia de 5 dígitos
  const sequence = String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0');

  // Timestamp en base 36 para unicidad
  const timePart = Date.now().toString(36).slice(-4).toUpperCase();

  return `ENS-${nameInitials}-${courseInitials}-${randomSegment}-${sequence}-${timePart}`;
}

export default generateRandomKey;