'use client';

import React, { Suspense } from 'react';
import { Navbar } from '@/components/organisms/Navbar';
import { SubHeader } from '@/components/organisms/SubHeader';

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans">
      {/* 1. Top Navbar */}
      <Suspense fallback={<div className="w-full h-14 bg-white border-b border-slate-200/80" />}>
        <Navbar />
      </Suspense>

      {/* 2. Sub-Header Area */}
      <Suspense fallback={<div className="w-full h-12 bg-white border-b border-slate-200/80" />}>
        <SubHeader />
      </Suspense>

      {/* 3. Main Dashboard Content Area */}
      <div className="w-full px-4 lg:px-8 flex-1 flex flex-col">
        <main className="flex-1 w-full max-w-[1600px] mx-auto pt-3 sm:pt-3.5 pb-8">
          <Suspense fallback={<div className="py-12 text-center text-slate-400 text-sm">Memuat konten...</div>}>
            {children}
          </Suspense>
        </main>
      </div>

      {/* Clean White Executive Footer */}
      <footer className="w-full bg-white border-t border-slate-200/90 py-4 px-4 lg:px-8 mt-auto">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500 font-normal">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="font-semibold text-slate-700">
              Kemenko PMK &amp; Badan Pusat Statistik (BPS)
            </span>
            <span className="text-slate-300">·</span>
            <span>Sistem Pengawalan Program Prioritas Nasional</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Hak Cipta © 2026 Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan. Seluruh hak cipta dilindungi.
          </div>
        </div>
      </footer>
    </div>
  );
}
