'use client';

import React from 'react';
import { BarChart3, Map, ArrowRight } from 'lucide-react';
import { DASHBOARD_META } from '@/data/dashboardData';

interface LandingChoiceSectionProps {
  onSelectIkhtisar: () => void;
  onSelectProfilWilayah: () => void;
}

export const LandingChoiceSection: React.FC<LandingChoiceSectionProps> = ({
  onSelectIkhtisar,
  onSelectProfilWilayah,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto py-8 sm:py-14 space-y-10 animate-in fade-in duration-200">
      {/* 1. Header: Clean title without chips or redundant marketing copy */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Pusat Pemantauan Program Prioritas Nasional
        </h1>

        <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
          Pilih fokus analisis dashboard untuk memantau capaian indikator atau eksplorasi geospasial wilayah.
        </p>

        <p className="text-xs text-slate-500 font-medium pt-1">
          Pembaruan data: {DASHBOARD_META.cutoffDate} · RPJMN 2025–2029
        </p>
      </div>

      {/* 2. Two Distinct Choice Cards with Generous Whitespace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* CARD 1: IKHTISAR */}
        <div
          onClick={onSelectIkhtisar}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectIkhtisar();
            }
          }}
          className="group bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 hover:border-blue-600 shadow-2xs hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between text-left focus:outline-hidden focus:ring-4 focus:ring-blue-500/20"
        >
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
              <BarChart3 className="h-7 w-7" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-blue-900 transition-colors tracking-tight">
                Ikhtisar
              </h2>

              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Monitoring komprehensif target, capaian 2026, trajektori RPJMN 2025–2029, dan matriks kendala yang terbagi dalam 4 pilar: Pendidikan, Kesehatan, Kebencanaan, dan Penurunan Kemiskinan.
              </p>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">
              4 Pilar Prioritas
            </span>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all group-hover:translate-x-1">
              <span>Buka Ikhtisar</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* CARD 2: PROFIL WILAYAH */}
        <div
          onClick={onSelectProfilWilayah}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectProfilWilayah();
            }
          }}
          className="group bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 hover:border-emerald-600 shadow-2xs hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between text-left focus:outline-hidden focus:ring-4 focus:ring-emerald-500/20"
        >
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200">
              <Map className="h-7 w-7" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-emerald-900 transition-colors tracking-tight">
                Profil Wilayah
              </h2>

              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Eksplorasi peta interaktif geospasial tematik 38 provinsi di seluruh Indonesia, dilengkapi rincian profil performa dan capaian 4 pilar untuk wilayah yang dipilih langsung di bawah peta.
              </p>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">
              Peta Layar Penuh
            </span>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all group-hover:translate-x-1">
              <span>Buka Profil Wilayah</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
