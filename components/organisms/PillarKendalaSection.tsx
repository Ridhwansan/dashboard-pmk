import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';
import { IssueOrchestration } from '@/types/dashboard';

interface PillarKendalaSectionProps {
  kendalaList: IssueOrchestration[];
  pillarTitle?: string;
  className?: string;
  embedded?: boolean;
}

export const PillarKendalaSection: React.FC<PillarKendalaSectionProps> = ({
  kendalaList,
  pillarTitle,
  className = '',
  embedded = false,
}) => {
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);

  const selectedIndex = kendalaList.findIndex((item) => item.id === selectedIssueId);
  const selectedIssue = selectedIndex !== -1 ? kendalaList[selectedIndex] : null;

  const handleClose = useCallback(() => {
    setSelectedIssueId(null);
  }, []);

  const handlePrev = useCallback(() => {
    if (selectedIndex > 0) {
      setSelectedIssueId(kendalaList[selectedIndex - 1].id);
    }
  }, [selectedIndex, kendalaList]);

  const handleNext = useCallback(() => {
    if (selectedIndex < kendalaList.length - 1) {
      setSelectedIssueId(kendalaList[selectedIndex + 1].id);
    }
  }, [selectedIndex, kendalaList]);

  // Handle ESC key and arrow keys for keyboard navigation
  useEffect(() => {
    if (!selectedIssue) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock body scroll while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedIssue, handleClose, handlePrev, handleNext]);

  return (
    <div
      className={
        embedded
          ? className
          : `bg-white rounded-xl p-5 md:p-6 border border-slate-200/90 shadow-2xs ${className}`
      }
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0 text-amber-700">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Kendala Pelaksanaan & Tindak Lanjut Operasi
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/70">
                {kendalaList.length} Isu
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Klik kartu kendala di bawah untuk rincian hambatan dan langkah tindak lanjut operasi lintas K/L
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Small Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {kendalaList.map((issue, idx) => (
          <div
            key={issue.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedIssueId(issue.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedIssueId(issue.id);
              }
            }}
            aria-haspopup="dialog"
            aria-label={`Buka detail kendala: ${issue.title}`}
            className="group relative flex flex-col justify-between p-4 rounded-xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md hover:ring-1 hover:ring-blue-100/60 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer text-left select-none"
          >
            <div>
              {/* Card Top: Number pill + subtle expand icon */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center justify-center h-5 px-2 rounded-md bg-slate-100 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-700 text-xs font-bold transition-colors">
                  #{idx + 1}
                </span>
                <span className="w-6 h-6 rounded-md bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 border border-slate-200/60 group-hover:border-blue-200 flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>

              {/* Card Title */}
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-900 transition-colors leading-snug line-clamp-2">
                {issue.title}
              </h4>
            </div>

            {/* Card Footer: Call to action */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-blue-700 group-hover:text-blue-800">
              <span>Lihat Detail Operasi</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Pop-Up Modal */}
      {selectedIssue && (
        <div
          role="presentation"
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-kendala-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                    {pillarTitle ? `Pilar ${pillarTitle}` : 'Detail Pilar'}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    Agenda {selectedIndex + 1} dari {kendalaList.length}
                  </span>
                </div>
                <h3
                  id="modal-kendala-title"
                  className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug"
                >
                  {selectedIssue.title}
                </h3>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Tutup modal kendala"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar">
              {/* Box 1: Kendala Pelaksanaan */}
              <div className="p-4 sm:p-5 rounded-xl bg-amber-50/70 border border-amber-200/90 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Kendala Pelaksanaan
                  </h4>
                </div>
                <p className="text-sm md:text-[15px] font-medium text-slate-800 leading-relaxed pl-8">
                  {selectedIssue.kendala ||
                    'Perlu kepastian postur anggaran, skema pembiayaan, serta koordinasi teknis regulasi lintas kementerian/lembaga.'}
                </p>
              </div>

              {/* Box 2: Tindak Lanjut Operasi */}
              <div className="p-4 sm:p-5 rounded-xl bg-blue-50/70 border border-blue-200/90 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-800 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                    Tindak Lanjut Operasi
                  </h4>
                </div>
                <p className="text-sm md:text-[15px] font-medium text-slate-800 leading-relaxed pl-8">
                  {selectedIssue.tindakLanjut}
                </p>
              </div>
            </div>

            {/* Modal Footer with Carousel Navigation */}
            <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={selectedIndex === 0}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={selectedIndex === kendalaList.length - 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
