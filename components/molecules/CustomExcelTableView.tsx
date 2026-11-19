'use client';

import React, { useState, useMemo } from 'react';
import { Search, Download } from 'lucide-react';
import { CustomExcelTableData, CustomExcelColumn } from '@/types/cms';
import { formatIndonesianDateTime, generateCustomTableCsv, downloadFile } from '@/lib/excelParser';

interface CustomExcelTableViewProps {
  data?: CustomExcelTableData | null;
  className?: string;
}

export const CustomExcelTableView: React.FC<CustomExcelTableViewProps> = ({ data, className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const rawRows = useMemo(() => data?.rows || [], [data?.rows]);
  const rawColumns = data?.columns;

  const columns: CustomExcelColumn[] = useMemo(() => {
    if (rawColumns && rawColumns.length > 0) return rawColumns;
    if (rawRows.length > 0) {
      return Object.keys(rawRows[0] || {}).map((k, i) => ({
        id: `col_${i + 1}`,
        key: k,
        name: k,
        label: k,
      }));
    }
    return [];
  }, [rawColumns, rawRows]);

  // Filter rows based on search query
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rawRows;
    const q = searchQuery.toLowerCase().trim();
    return rawRows.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(q))
    );
  }, [rawRows, searchQuery]);

  if (!data || !data.rows || data.rows.length === 0) {
    return null;
  }

  const formattedTime = formatIndonesianDateTime(data.uploadedAt || data.lastUploadedAt);

  const handleDownloadCsv = () => {
    const csvContent = generateCustomTableCsv(columns, data.rows);
    const filename = `${(data.title || data.tableName || 'Data_Indikator').replace(/\s+/g, '_')}.csv`;
    downloadFile(filename, csvContent);
  };

  const handleDownloadTemplate = () => {
    if (data.templateFileBase64 && data.templateFileName) {
      const link = document.createElement('a');
      link.href = data.templateFileBase64;
      link.download = data.templateFileName;
      link.click();
    } else {
      const csvContent = generateCustomTableCsv(columns, []);
      const filename = `Template_${(data.title || data.tableName || 'Indikator').replace(/\s+/g, '_')}.csv`;
      downloadFile(filename, csvContent);
    }
  };

  return (
    <div className={`w-full bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col ${className}`}>
      {/* Header with Title, Timestamp, and Search */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white">
        <div className="space-y-0.5 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
            {data.title || data.tableName || 'Matriks Rincian Komponen & Data Khusus'}
          </h3>
          <p className="text-xs text-slate-600 font-normal truncate">
            {data.fileName ? `Sumber file: ${data.fileName} • ` : ''}
            Hasil unggahan template spreadsheet resmi
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Timestamp Log Badge */}
          <div className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
            <span>
              Data dimutakhirkan: <strong>{formattedTime}</strong>
              <span className="text-slate-500 ml-1">({data.rows.length} baris)</span>
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dalam tabel..."
              className="h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 transition-colors w-40 sm:w-52"
            />
          </div>

          {/* Download Template button */}
          <button
            type="button"
            onClick={handleDownloadTemplate}
            title="Unduh format template spreadsheet resmi"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-hidden"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Unduh Template</span>
          </button>

          {/* Download CSV button */}
          <button
            type="button"
            onClick={handleDownloadCsv}
            title="Unduh data tabel dalam format CSV/Excel"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-hidden"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Unduh Data</span>
          </button>
        </div>
      </div>

      {/* Styled Table Container matching Image 3 (Light green header bar #70ad47 style) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#70ad47] text-white font-extrabold border-b border-[#5b8c38]">
              {columns.map((col, idx) => (
                <th
                  key={col.id || col.key || idx}
                  style={col.width ? { width: col.width } : undefined}
                  className={`py-3 px-4 font-bold text-xs tracking-wide uppercase border-r border-[#86bc61]/40 last:border-r-0 ${
                    idx === 0 ? 'text-center' : ''
                  }`}
                >
                  {col.label || col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-slate-400 text-xs italic">
                  Tidak ada data yang sesuai dengan pencarian &quot;{searchQuery}&quot;
                </td>
              </tr>
            ) : (
              filteredRows.map((row, rowIdx) => {
                // Highlight row 0 with subtle light green tint like Excel image 3
                const isFirstRow = rowIdx === 0;
                return (
                  <tr
                    key={rowIdx}
                    className={`transition-colors hover:bg-emerald-50/40 ${
                      isFirstRow ? 'bg-[#f4f9f0]' : rowIdx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                    }`}
                  >
                    {columns.map((col, colIdx) => {
                      const colLabel = col.label || col.name;
                      const val = row[col.key] || (colLabel ? row[colLabel] : '') || '';
                      return (
                        <td
                          key={col.id || col.key || colIdx}
                          className={`py-3 px-4 text-slate-800 font-medium align-top leading-relaxed border-r border-slate-200/70 last:border-r-0 whitespace-pre-line ${
                            colIdx === 0 ? 'text-center font-bold text-slate-900 bg-slate-100/50' : ''
                          }`}
                        >
                          {val || '—'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer showing row count and status */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span>
          Menampilkan <strong className="text-slate-800">{filteredRows.length}</strong> dari{' '}
          <strong className="text-slate-800">{data.rows.length}</strong> baris data
        </span>
        <span className="text-slate-600 font-medium">
          Format Tabel Terstruktur
        </span>
      </div>
    </div>
  );
};
