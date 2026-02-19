/**
 * Parses a Spanish-formatted date string and returns an ISO date string (YYYY-MM-DD).
 *
 * Supported formats:
 *  - 11/febrero/2025
 *  - 11-febrero-2025
 *  - 08 de diciembre de 2025
 *  - diciembre/2025
 *  - 2025-02-11 (already ISO, passed through)
 *
 * @param input - Raw date string, possibly with surrounding braces, quotes or spaces
 * @returns ISO date string or null if parsing fails
 */
export function parseSpanishDate(input?: string): string | null {
  if (!input) return null;

  // Normalize: lowercase, remove accents from the entire string for easier matching
  const s = input.trim().toLowerCase();

  // Remove surrounding braces { }, quotes (straight and typographic), and extra spaces
  const cleaned = s
    .replace(/^[\s{}""\u201C\u201D\u2018\u2019']+/, '')
    .replace(/[\s{}""\u201C\u201D\u2018\u2019']+$/, '');

  if (!cleaned) return null;

  const months: Record<string, number> = {
    enero: 1,
    febrero: 2,
    marzo: 3,
    abril: 4,
    mayo: 5,
    junio: 6,
    julio: 7,
    agosto: 8,
    septiembre: 9,
    octubre: 10,
    noviembre: 11,
    diciembre: 12,
  };

  /**
   * Normalizes a month name by:
   * 1. Stripping diacritics (e.g. "febrero" → "febrero", already clean)
   * 2. Looking up the month number
   */
  const resolveMonth = (raw: string): number | null => {
    const normalized = raw
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
    return months[normalized] ?? null;
  };

  const patterns: RegExp[] = [
    /^(\d{1,2})\s*[\/\-]\s*([a-záéíóúñ]+)\s*[\/\-]\s*(\d{4})$/, // 11/febrero/2025
    /^(\d{1,2})\s+de\s+([a-záéíóúñ]+)\s+de\s+(\d{4})$/,          // 08 de diciembre de 2025
    /^([a-záéíóúñ]+)\s*[\/\-]\s*(\d{4})$/,                         // diciembre/2025
    /^(\d{4})-(\d{2})-(\d{2})$/,                                    // 2025-02-11 (ISO passthrough)
    /^(\d{1,2})\s*[\/\-]\s*(\d{1,3})\s*[\/\-]\s*(\d{4})$/,          // 02/02/2006 or 02/002/2006
  ];

  for (let i = 0; i < patterns.length; i++) {
    const m = patterns[i].exec(cleaned);
    if (!m) continue;

    // ISO passthrough
    if (i === 3) {
      return `${m[1]}-${m[2]}-${m[3]}`;
    }

    // Format with DD/MM/YYYY
    if (i === 4) {
      const day = m[1].padStart(2, '0');
      const parsedMonth = parseInt(m[2], 10);
      if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
        console.warn(`[parseSpanishDate] Invalid month parsing number: "${m[2]}" (input: "${input}")`);
        return null;
      }
      const year = m[3];
      return `${year}-${String(parsedMonth).padStart(2, '0')}-${day}`;
    }

    // Formats with day + monthName + year (groups: day, monthName, year)
    if (i === 0 || i === 1) {
      const day = m[1].padStart(2, '0');
      const month = resolveMonth(m[2]);
      const year = m[3];
      if (!month) {
        console.warn(`[parseSpanishDate] Unknown month name: "${m[2]}" (input: "${input}")`);
        return null;
      }
      return `${year}-${String(month).padStart(2, '0')}-${day}`;
    }

    // Format with only monthName + year (groups: monthName, year)
    if (i === 2) {
      const month = resolveMonth(m[1]);
      const year = m[2];
      if (!month) {
        console.warn(`[parseSpanishDate] Unknown month name: "${m[1]}" (input: "${input}")`);
        return null;
      }
      return `${year}-${String(month).padStart(2, '0')}-01`;
    }
  }

  console.warn(`[parseSpanishDate] No pattern matched for input: "${input}"`);
  return null;
}

export default parseSpanishDate;