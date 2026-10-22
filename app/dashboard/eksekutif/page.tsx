import React, { Suspense } from 'react';
import { EksekutifClient } from './EksekutifClient';

export default function EksekutifPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
          <div className="w-7 h-7 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
          <span>Memuat Dashboard Eksekutif Kemenko PMK...</span>
        </div>
      }
    >
      <EksekutifClient />
    </Suspense>
  );
}
