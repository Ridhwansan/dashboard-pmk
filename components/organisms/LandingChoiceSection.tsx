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
    <div className="w-full max-w-5xl mx-auto py-6 sm:py-12 space-y-9 animate-in fade-in duration-300">
      {/* 1. Header with Official Kemenko PMK Emblem (Navbar is removed on landing) */}
      <div className="text-center space-y-4 max-w-2xl mx-auto flex flex-col items-center">
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg mb-1">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/20 p-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-kemenko-pmk.png"
              alt="Logo Kemenko PMK"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="text-left">
            <span className="block text-xs font-extrabold text-white tracking-wider uppercase">
              KEMENKO PMK
            </span>
            <span className="block text-[10px] font-medium text-slate-300">
              Pembangunan Manusia dan Kebudayaan
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
          Pusat Pemantauan Program Prioritas Nasional
        </h1>

        <p className="text-sm sm:text-base text-slate-200 font-normal leading-relaxed max-w-xl">
          Pilih fokus analisis dashboard untuk memantau capaian indikator atau eksplorasi geospasial wilayah.
        </p>

        <p className="text-xs text-slate-300 font-medium pt-0.5">
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
          className="group bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-white/60 hover:border-blue-500 shadow-2xl hover:shadow-blue-500/15 transition-all duration-300 cursor-pointer flex flex-col justify-between text-left focus:outline-hidden focus:ring-4 focus:ring-blue-500/30"
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
                Monitoring komprehensif target, capaian 2026, trajektori RPJMN 2025–2029, dan matriks kendala yang terbagi dalam 4 pilar: Pendidikan, Kesehatan, Bencana, dan Penurunan Kemiskinan.
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
          className="group bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-white/60 hover:border-emerald-500 shadow-2xl hover:shadow-emerald-500/15 transition-all duration-300 cursor-pointer flex flex-col justify-between text-left focus:outline-hidden focus:ring-4 focus:ring-emerald-500/30"
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
