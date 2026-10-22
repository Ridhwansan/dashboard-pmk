'use client';

import React, { Suspense } from 'react';
import { Navbar } from '@/components/organisms/Navbar';

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

      {/* 2. Main Dashboard Content Area */}
      <div className="w-full px-4 lg:px-8 flex-1 flex flex-col">
        <main className="flex-1 w-full max-w-[1600px] mx-auto pt-5 sm:pt-6 pb-10">
          <Suspense fallback={<div className="py-12 text-center text-slate-400 text-sm">Memuat konten...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
