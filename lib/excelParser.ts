import { MapPointMarker, CustomExcelColumn } from '@/types/cms';

/**
 * Escapes a cell value for CSV/Excel export
 */
function escapeCsvCell(val: unknown, delimiter = ';'): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates CSV string with UTF-8 BOM so Microsoft Excel, Google Sheets,
 * and LibreOffice Calc open it natively without distorted characters.
 * Defaults to semicolon (;) delimiter which is standard for Indonesian Windows/Excel locale.
 */
export function generateCsv(headers: string[], rows: (string | number)[][] = [], delimiter = ';'): string {
  const bom = '\uFEFF';
  const headerLine = headers.map((h) => escapeCsvCell(h, delimiter)).join(delimiter);
  const dataLines = rows.map((r) => r.map((c) => escapeCsvCell(c, delimiter)).join(delimiter));
  return bom + [headerLine, ...dataLines].join('\r\n');
}

/**
 * Triggers a browser file download from string content
 */
export function downloadFile(filename: string, content: string, mimeType = 'text/csv;charset=utf-8;') {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Smart delimited parser (detects comma, semicolon, tab)
 * Handles quoted multi-line text and escaped quotes
 */
export function parseDelimitedText(rawText: string): {
  headers: string[];
  rows: Record<string, string>[];
  rawRows: string[][];
} {
  // Strip BOM if present
  let text = rawText;
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  // Detect delimiter from first non-empty line
  const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0) || '';
  let delimiter = ';';
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  if (tabCount > semicolonCount && tabCount > commaCount) {
    delimiter = '\t';
  } else if (commaCount > semicolonCount) {
    delimiter = ',';
  }

  // Robust line and field lexer
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') i++;
        currentRow.push(currentField.trim());
        if (currentRow.some((c) => c !== '')) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        if (currentRow.some((c) => c !== '')) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  // Push remainder
  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((c) => c !== '')) {
      lines.push(currentRow);
    }
  }

  if (lines.length === 0) {
    return { headers: [], rows: [], rawRows: [] };
  }

  const headers = lines[0].map((h) => h.trim());
  const dataRows = lines.slice(1);

  const rows: Record<string, string>[] = dataRows.map((line) => {
    const rowObj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      rowObj[header] = line[idx] !== undefined ? line[idx] : '';
    });
    return rowObj;
  });

  return {
    headers,
    rows,
    rawRows: dataRows,
  };
}

// ---------------------------------------------------------------------------
// Spatial Map Coordinates Format
// ---------------------------------------------------------------------------
export const MAP_MARKER_TEMPLATE_HEADERS = [
  'Nama Lokasi',
  'Kabupaten/Kota',
  'Provinsi',
  'Latitude',
  'Longitude',
  'Tahun',
  'Status',
  'Catatan',
];

export const MAP_MARKER_SAMPLE_ROWS: (string | number)[][] = [
  ['SDN 01 Menteng', 'Jakarta Pusat', 'DKI Jakarta', -6.1975, 106.8327, 2026, 'Selesai 2026', 'Rehabilitasi ruang kelas selesai'],
  ['SMPN 03 Surabaya', 'Kota Surabaya', 'Jawa Timur', -7.2575, 112.7521, 2026, 'Rehab 2026', 'Pekerjaan fisik tahap finishing'],
  ['SDN Candisari', 'Kota Semarang', 'Jawa Tengah', -6.9667, 110.4167, 2025, 'Selesai 2025', 'Pemanfaatan ruang aktif'],
];

/**
 * Parses MapPointMarker array from uploaded CSV rows
 */
export function parseMapMarkersFromRows(rows: Record<string, string>[]): MapPointMarker[] {
  const markers: MapPointMarker[] = [];

  rows.forEach((row, idx) => {
    // Flexible header lookup
    const name = row['Nama Lokasi'] || row['nama_lokasi'] || row['Nama'] || row['Sekolah'] || row['Lokasi'] || `Titik #${idx + 1}`;
    const kabKota = row['Kabupaten/Kota'] || row['kab_kota'] || row['Kabupaten'] || row['Kota'] || '';
    const provinsi = row['Provinsi'] || row['provinsi'] || 'Indonesia';

    const latStr = (row['Latitude'] || row['latitude'] || row['lat'] || '').replace(',', '.');
    const lngStr = (row['Longitude'] || row['longitude'] || row['lng'] || row['long'] || '').replace(',', '.');

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (!isNaN(lat) && !isNaN(lng) && lat >= -15 && lat <= 15 && lng >= 90 && lng <= 145) {
      const yearRaw = parseInt(row['Tahun'] || row['tahun'] || '2026', 10);
      const year = isNaN(yearRaw) ? 2026 : yearRaw;
      const status = row['Status'] || row['status'] || 'Realisasi 2026';
      const note = row['Catatan'] || row['catatan'] || row['Keterangan'] || '';

      markers.push({
        id: `m_${idx + 1}_${Math.random().toString(36).slice(2, 6)}`,
        name,
        kabKota,
        provinsi,
        lat,
        lng,
        year,
        status,
        note,
      });
    }
  });

  return markers;
}

/**
 * Formats date into standard Indonesian executive timestamp e.g. "19 Nov 2026, 09:30 WIB"
 */
export function generateMapMarkersCsv(existingMarkers?: MapPointMarker[]): string {
  const headers = MAP_MARKER_TEMPLATE_HEADERS;
  let rows: (string | number)[][] = [];

  if (existingMarkers && existingMarkers.length > 0) {
    rows = existingMarkers.map((m) => [
      m.name,
      m.kabKota || '',
      m.provinsi,
      m.lat,
      m.lng,
      m.year || 2026,
      m.status || '',
      m.note || '',
    ]);
  } else {
    rows = MAP_MARKER_SAMPLE_ROWS;
  }

  return generateCsv(headers, rows);
}

export function generateCustomTableCsv(
  columns: CustomExcelColumn[],
  initialRows?: Record<string, string>[]
): string {
  const headers = columns.map((c) => c.label || c.name);
  const rows: (string | number)[][] = [];

  if (initialRows && initialRows.length > 0) {
    initialRows.forEach((rowObj) => {
      const rowArr = columns.map((col) => {
        const colLabel = col.label || col.name;
        return rowObj[col.key] || (colLabel ? rowObj[colLabel] : '') || '';
      });
      rows.push(rowArr);
    });
  } else {
    // Provide a sample row matching user's Image 3
    const sampleRow = columns.map((col, idx) => {
      const colLabel = (col.label || col.name || '').toLowerCase();
      if (idx === 0) return '1';
      if (colLabel.includes('program') || colLabel.includes('komponen')) {
        return 'Revitalisasi Sekolah dan Madrasah';
      }
      if (colLabel.includes('indikasi') || colLabel.includes('khusus')) {
        return 'Penerima;\njenjang/status;\nkerusakan awal;\nruang direhabilitasi/dibangun;\nprogres fisik/anggaran;\ntarget selesai;\njumlah siswa;\npemanfaatan';
      }
      return `Contoh ${col.label || col.name} 1`;
    });
    rows.push(sampleRow);
  }

  return generateCsv(headers, rows);
}

/**
 * Formats date into standard Indonesian executive timestamp e.g. "19 Nov 2026, 09:30 WIB"
 */
export function formatIndonesianDateTime(isoString?: string): string {
  if (!isoString) return 'Baru saja';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
  } catch {
    return isoString;
  }
}
