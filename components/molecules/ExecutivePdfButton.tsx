'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FileDown, ChevronDown, Loader2, Check, FileText } from 'lucide-react';
import { PillarId } from '@/types/dashboard';
import { generateExecutiveSummaryPdf } from '@/lib/exportExecutivePdf';

interface ExecutivePdfButtonProps {
  currentPillar?: PillarId;
  variant?: 'toolbar' | 'outline' | 'subtle';
  className?: string;
  showDropdown?: boolean;
}

export const ExecutivePdfButton: React.FC<ExecutivePdfButtonProps> = ({
  currentPillar,
  variant = 'toolbar',
  className = '',
  showDropdown = true,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPillarLabel = (p?: PillarId) => {
    switch (p) {
      case 'pendidikan':
        return 'Pilar Pendidikan';
      case 'kesehatan':
        return 'Pilar Kesehatan';
      case 'bencana':
        return 'Pilar Bencana';
      case 'kemiskinan':
        return 'Pilar Penurunan Kemiskinan';
      default:
        return 'Pilar Terpilih';
    }
  };

  const handleDownload = async (specific?: PillarId) => {
    setDropdownOpen(false);
    setIsGenerating(true);
    setIsSuccess(false);

    try {
      await generateExecutiveSummaryPdf(
        specific ? { specificPillar: specific } : undefined
      );
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 2500);
    } catch (err) {
      console.error('Gagal mencetak dokumen PDF eksekutif:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 'toolbar' style matches the segmented category pill [ PKPN | Isu Strategis | RPJMN ]
  const isToolbar = variant === 'toolbar';

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={dropdownRef}>
      {/* Outer wrapper matching segmented button toolbar styling */}
      <div
        className={
          isToolbar
            ? 'inline-flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shadow-2xs'
            : 'inline-flex items-center gap-1 bg-white p-0.5 rounded-xl border border-slate-200/90 shadow-2xs'
        }
      >
        {/* Main Action Button */}
        <button
          type="button"
          onClick={() => handleDownload()}
          disabled={isGenerating}
          aria-label="Unduh Ringkasan PDF Eksekutif"
          className="h-8 px-3 inline-flex items-center gap-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer disabled:opacity-75 disabled:cursor-wait bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 border border-slate-200/80 shadow-2xs active:scale-[0.99]"
        >
          {isGenerating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
          ) : isSuccess ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <FileDown className="w-3.5 h-3.5 shrink-0 text-blue-600" />
          )}

          <span className="whitespace-nowrap">
            {isGenerating
              ? 'Menyiapkan PDF...'
              : isSuccess
              ? 'PDF Terunduh'
              : 'Unduh Ringkasan PDF'}
          </span>
        </button>

        {/* Dropdown Chevron Toggle Button */}
        {showDropdown && (
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            disabled={isGenerating}
            aria-label="Pilihan Opsi Unduhan PDF"
            aria-expanded={dropdownOpen}
            className="h-8 w-7 inline-flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all duration-150 cursor-pointer disabled:opacity-75"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-150 ${
                dropdownOpen ? 'rotate-180 text-blue-600' : ''
              }`}
            />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Format Laporan Eksekutif
          </div>

          {/* Option 1: Ringkasan Lengkap 4 Pilar */}
          <button
            type="button"
            onClick={() => handleDownload()}
            className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                Seluruh Pilar (4 Pilar)
              </div>
              <div className="text-[11px] text-slate-500 font-medium leading-tight">
                Ikhtisar lengkap capaian &amp; tindak lanjut 4 pilar
              </div>
            </div>
          </button>

          {/* Option 2: Pilar Aktif Saja (if applicable) */}
          {currentPillar && (
            <button
              type="button"
              onClick={() => handleDownload(currentPillar)}
              className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <FileDown className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  {getPillarLabel(currentPillar)} Saja
                </div>
                <div className="text-[11px] text-slate-500 font-medium leading-tight">
                  Ringkasan khusus pilar aktif yang sedang dibuka
                </div>
              </div>
            </button>
          )}

          <div className="px-3 py-1.5 mt-1 border-t border-slate-100 text-[10px] text-slate-400 font-medium text-center">
            Dokumen resmi Kemenko PMK (PDF Vektor A4)
          </div>
        </div>
      )}
    </div>
  );
};
