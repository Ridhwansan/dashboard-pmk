import React from 'react';
import { MetricBox } from '@/components/molecules/MetricBox';

interface CardBesar1Props {
  className?: string;
  onNavigateToDetail?: () => void;
}

export const CardBesar1: React.FC<CardBesar1Props> = ({ className = '' }) => {
  return (
    <section aria-labelledby="macro-indicators-heading" className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h2 id="macro-indicators-heading" className="text-sm font-bold tracking-tight text-slate-900">
          Indikator Makro Strategis 2026
        </h2>
        <span className="text-xs text-slate-700 font-semibold">
          Pengawalan RPJMN 2025–2029
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Indeks Modal Manusia (IMM) */}
        <MetricBox
          id="imm"
          category="Modal Manusia"
          title="Indeks Modal Manusia (IMM)"
          heroValue="0,57"
          heroLabel="Target RPJMN 2026"
          info="Trajektori RPJMN: 2025: 0,56 → 2029: 0,59"
          trend="Proyeksi bertahap hingga 0,59"
        />

        {/* 2. Tingkat Kemiskinan Nasional */}
        <MetricBox
          id="kemiskinan-makro"
          category="Pilar 4 · Kesejahteraan"
          title="Tingkat Kemiskinan Nasional"
          heroValue="8,07%"
          heroLabel="Realisasi BPS (Maret 2026)"
          badge={{
            text: 'Target: 6,5–7,5%',
            variant: 'warning',
          }}
          info="Realisasi 2025: 8,25% (turun -0,18%) · Ekstrem Target: 0–0,5%"
          trend="Realisasi Maret 2026: 8,07%"
        />

        {/* 3. Indeks Pembangunan Masyarakat (IPMas) */}
        <MetricBox
          id="ipmas"
          category="Modal Sosial"
          title="Indeks Pemb. Masyarakat (IPMas)"
          heroValue="66,15"
          heroLabel="Target RPJMN 2026"
          info="Trajektori RPJMN: 2025: 65,49 → 2029: 68,13 (+0,66/thn)"
          trend="Kenaikan target 0,66 poin/tahun"
        />

        {/* 4. Insidensi TB & Kerugian Bencana */}
        <MetricBox
          id="tb-bencana"
          category="Pilar 2 & 3 · Kesehatan & Bencana"
          title="Insidensi TB & Bencana"
          heroValue="252"
          heroUnit="/100.000"
          heroLabel="Target Insidensi TB 2026"
          info="Kerugian Bencana: Target 0,137% PDB · TB 2025: 382 → 2029: 190"
          trend="Penurunan target insidensi TB"
        />
      </div>
    </section>
  );
};


