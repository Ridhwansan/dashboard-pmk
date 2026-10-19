'use client';

import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export interface CardKendalaItem {
  title: string;
  value?: string;
  unit?: string;
  kendala?: string;
  tindakLanjut?: string;
}

interface CardKendalaModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CardKendalaItem | null;
  pillarTitle?: string;
}

export const CardKendalaModal: React.FC<CardKendalaModalProps> = ({
  isOpen,
  onClose,
  item,
  pillarTitle,
}) => {
  // Handle ESC key and lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen || !item) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, item, onClose]);

  if (!isOpen || !item) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-kendala-item-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg md:max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header: Clean, neutral, no redundant chips */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-100 bg-white">
          <div className="space-y-0.5 pr-2">
            <h3
              id="modal-kendala-item-title"
              className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug"
            >
              {item.title}
            </h3>
            {pillarTitle && (
              <p className="text-xs text-slate-500 font-medium">
                Pilar {pillarTitle}
              </p>
            )}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal kendala"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content: Neutral cards for Kendala and Tindak Lanjut */}
        <div className="p-5 space-y-3.5 overflow-y-auto custom-scrollbar">
          {/* Box 1: Kendala Pelaksanaan */}
          <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Kendala Pelaksanaan
              </h4>
            </div>
            <div className="text-sm font-medium text-slate-800 leading-relaxed pl-7 whitespace-pre-line">
              {item.kendala ||
                'Perlu kepastian postur anggaran, skema pembiayaan, serta koordinasi teknis regulasi lintas kementerian/lembaga.'}
            </div>
          </div>

          {/* Box 2: Tindak Lanjut Orkestrasi */}
          <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Tindak Lanjut Orkestrasi
              </h4>
            </div>
            <div className="text-sm font-medium text-slate-800 leading-relaxed pl-7 whitespace-pre-line">
              {item.tindakLanjut ||
                'Peningkatan koordinasi dan penyesuaian tindak lanjut orkestrasi lintas kementerian/lembaga terkait.'}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3.5 border-t border-slate-100 bg-slate-50/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
