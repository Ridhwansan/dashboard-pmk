'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FileDown, ChevronDown, Loader2, Check, FileText } from 'lucide-react';
import { PillarId } from '@/types/dashboard';
import { generateExecutiveSummaryPdf } from '@/lib/exportExecutivePdf';

interface ExecutivePdfButtonProps {
  currentPillar?: PillarId;
  variant?: 'toolbar' | 'outline' | 'subtle';
  className?: string;
}

export const ExecutivePdfButton: React.FC<ExecutivePdfButtonProps> = ({
  currentPillar,
  className = '',
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
        return 'Pilar Kebencanaan';
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

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={dropdownRef}>
      {/* Single clean button without any outer card wrapper */}
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        disabled={isGenerating}
        aria-label="Unduh Ringkasan PDF Eksekutif"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        className={`h-9 px-3.5 inline-flex items-center gap-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer disabled:opacity-75 disabled:cursor-wait bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 border border-slate-200 shadow-2xs active:scale-[0.99] select-none ${
          dropdownOpen ? 'ring-2 ring-blue-500/20 border-blue-400 text-blue-900' : ''
        }`}
      >
        {isGenerating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
        ) : isSuccess ? (
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        ) : (
          <FileDown className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        )}

        <span className="whitespace-nowrap">
          {isGenerating
            ? 'Menyiapkan PDF...'
            : isSuccess
            ? 'PDF Terunduh'
            : 'Unduh Ringkasan PDF'}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            dropdownOpen ? 'rotate-180 text-blue-600' : 'text-slate-500'
          }`}
        />
      </button>

      {/* Simplified Dropdown Menu: Clean and title-only */}
      {dropdownOpen && (
        <div role="menu" aria-label="Pilihan Unduh Ringkasan PDF" className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-slate-200/90 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* Option 1: Ringkasan Lengkap 4 Pilar */}
          <button
            type="button"
            onClick={() => handleDownload()}
            role="menuitem"
            className="w-full px-3 py-2 text-left rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800 hover:text-blue-700"
          >
            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">Seluruh Pilar (4 Pilar)</span>
          </button>

          {/* Option 2: Pilar Aktif Saja */}
          {currentPillar && (
            <button
              type="button"
              onClick={() => handleDownload(currentPillar)}
              role="menuitem"
            className="w-full px-3 py-2 text-left rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800 hover:text-amber-700 border-t border-slate-100"
            >
              <FileDown className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="truncate">{getPillarLabel(currentPillar)} Saja</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
