/**
 * Robust parser for Indonesian formatted numbers in indicator metrics
 * Handles: "12.825" -> 12825, "105,98" -> 105.98, "80%" -> 80, "36.669" -> 36669, "80.282 Satuan Pendidikan" -> 80282
 */
export function parseMetricNumber(val: string | number | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  const str = String(val).trim();
  if (str === '—' || str === '-' || str === '') return null;

  // Strip notes in parentheses e.g. "(100%)" or "(Berproses)"
  const withoutParens = str.replace(/\(.*?\)/g, '').trim();

  // Explicit qualitative phrases that signify non-numeric / pending data
  if (
    /belum ditetapkan|tahap|harmonisasi|berproses|menunggu|inventarisasi|terhenti|nihil|persiapan/i.test(
      withoutParens
    )
  ) {
    return null;
  }

  // Remove common metric prefixes and unit suffixes
  const strippedWords = withoutParens
    .replace(/^(target\s*(20\d\d)?\s*:?|realisasi\s*(20\d\d)?\s*:?|capaian\s*:?)/i, '')
    .replace(
      /(satuan\s*pendidikan|satdik|sekolah|unit|orang|jiwa|kpm|persen|poin|ha|rs|rsud|kasus|lembaga|juta|jt|penerima|desa|kabupaten|kota|lokasi|kab\/kota)/gi,
      ''
    )
    .trim();

  // If there are still alphabetic words remaining and no digits, treat as qualitative
  if (/[a-zA-Z]{3,}/.test(strippedWords) && !/\d/.test(strippedWords)) {
    return null;
  }

  const clean = strippedWords.replace(/[^0-9,.-]/g, '').trim();
  if (!clean || !/\d/.test(clean)) return null;

  let normalized = clean;
  if (normalized.includes('.') && normalized.includes(',')) {
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  } else if (normalized.includes('.')) {
    const parts = normalized.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      normalized = normalized.replace(/\./g, '');
    }
  } else if (normalized.includes(',')) {
    normalized = normalized.replace(',', '.');
  }

  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

/**
 * Calculates percentage from capaian and target
 * Returns rounded float with 1 decimal place, e.g. 45.7 or 100, or null if uncalculable
 */
export function calculatePercentage(
  capaian: string | number | null | undefined,
  target: string | number | null | undefined
): number | null {
  const cNum = parseMetricNumber(capaian);
  const tNum = parseMetricNumber(target);

  if (cNum === null || tNum === null || tNum <= 0) return null;
  const pct = (cNum / tNum) * 100;
  return Math.round(pct * 10) / 10;
}

