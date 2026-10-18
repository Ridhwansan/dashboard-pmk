import React, { useState } from 'react';
import { ArrowLeft, LayoutDashboard, TableProperties, AlertCircle } from 'lucide-react';
import { PillarData } from '@/types/dashboard';
import { PillarKendalaSection } from './PillarKendalaSection';
import { PillButton } from '@/components/atoms/PillButton';
import { PillarIndicatorSection } from './PillarIndicatorSection';

type DetailTab = 'ringkasan' | 'indikator' | 'kendala';

interface KemiskinanDetailViewProps {
  onBackToHome: () => void;
  pillar: PillarData;
}

interface MetricCardItem {
  title: string;
  value: string;
  unit?: string;
  status?: string;
  target?: string;
  subtext?: string;
}

interface AnnualIndicatorRow {
  name: string;
  subUnit?: string;
  y2025: { t: string; c: string };
  y2026: { t: string; c: string };
  y2027: { t: string; c: string };
  y2028: { t: string; c: string };
  y2029: { t: string; c: string };
}

export const KemiskinanDetailView: React.FC<KemiskinanDetailViewProps> = ({
  onBackToHome,
  pillar,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('ringkasan');

  // Exact 9 Metric Cards from Image 3 (Gambar 3 - Detail Penurunan Kemiskinan)
  const metricCards: MetricCardItem[] = [
    {
      title: 'Tingkat kemiskinan',
      value: '8,07',
      status: 'Capaian 2026 • % penduduk',
      target: 'Target 2026: 6,5–7,5',
    },
    {
      title: 'Kemiskinan ekstrem',
      value: '0.78',
      status: 'Capaian 2025 • % penduduk',
      target: 'Target 2026: 0–0,5',
    },
    {
      title: 'Bantuan permakanan lansia',
      value: '116.754',
      status: 'Capaian 2025 • orang penerima',
      target: 'Target 2027 ≥116.754 | 2026 terhenti',
    },
    {
      title: 'Bantuan permakanan disabilitas',
      value: '36.000',
      status: 'Capaian 2025 • orang penerima',
      target: 'Target 2027 ≥36.000 | 2026 terhenti',
    },
    {
      title: 'Cakupan lansia desil 1–5',
      value: '0,66',
      status: 'Capaian 2025 • % sasaran',
      target: '2026 belum tersedia',
    },
    {
      title: 'Cakupan disabilitas desil 1–5',
      value: '0,41',
      status: 'Capaian 2025 • % sasaran',
      target: '2026 belum tersedia',
    },
    {
      title: 'Bantuan Operasional Sekolah Reguler',
      value: '432.654 (99%)',
      status: 'Capaian 2026 • sekolah penerima',
      target: 'Target 2026 432.716',
    },
    {
      title: 'Bantuan Operasional Pendidikan',
      value: '396.618',
      status: 'Capaian 2026 • Lembaga Penerima',
      target: 'Target 2026 406.741',
    },
    {
      title: 'Bantuan Operasional Sekolah Madrasah',
      value: '10.36',
      status: 'Capaian 2026 • juta penerima',
      target: 'Target 2026 .',
    },
  ];

  // Exact 6 Table Rows from Image 3 (Gambar 3 - Detail Penurunan Kemiskinan)
  const tableRows: AnnualIndicatorRow[] = [
    {
      name: 'Tingkat kemiskinan',
      subUnit: '% penduduk',
      y2025: { t: '—', c: '8,25' },
      y2026: { t: '6,5–7,5', c: '8,07' },
      y2027: { t: '6,0–6,5', c: '—' },
      y2028: { t: '—', c: '—' },
      y2029: { t: '4,5–5,0', c: '—' },
    },
    {
      name: 'Kemiskinan ekstrem',
      subUnit: '% penduduk',
      y2025: { t: '—', c: '—' },
      y2026: { t: '0–0,5', c: '—' },
      y2027: { t: '0', c: '—' },
      y2028: { t: '—', c: '—' },
      y2029: { t: '—', c: '—' },
    },
    {
      name: 'Bantuan permakanan lansia',
      subUnit: 'orang penerima',
      y2025: { t: '—', c: '116.754' },
      y2026: { t: '—', c: 'Terhenti' },
      y2027: { t: '≥116.754', c: '—' },
      y2028: { t: '—', c: '—' },
      y2029: { t: '—', c: '—' },
    },
    {
      name: 'Bantuan permakanan disabilitas',
      subUnit: 'orang penerima',
      y2025: { t: '—', c: '36.000' },
      y2026: { t: '—', c: 'Terhenti' },
      y2027: { t: '≥36.000', c: '—' },
      y2028: { t: '—', c: '—' },
      y2029: { t: '—', c: '—' },
    },
    {
      name: 'Cakupan lansia desil 1–5',
      subUnit: '% sasaran',
      y2025: { t: '—', c: '0,66' },
      y2026: { t: '—', c: '—' },
      y2027: { t: '—', c: '—' },
      y2028: { t: '—', c: '—' },
      y2029: { t: '—', c: '—' },
    },
    {
      name: 'Cakupan disabilitas desil 1–5',
      subUnit: '% sasaran',
      y2025: { t: '—', c: '0,41' },
      y2026: { t: '—', c: '—' },
      y2027: { t: '—', c: '—' },
      y2028: { t: '—', c: '—' },
      y2029: { t: '—', c: '—' },
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Top Main Panel */}
      <div className="bg-white rounded-xl p-5 md:p-7 border border-slate-200/90 shadow-2xs">
        {/* Header: Title "Penurunan Kemiskinan" + Submenu Tabs + Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Penurunan Kemiskinan
            </h2>
          </div>

          {/* Submenu Tabs: Ringkasan, Indikator, Kendala */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 overflow-x-auto self-start sm:self-center">
            <PillButton
              variant="tab"
              size="sm"
              active={activeTab === 'ringkasan'}
              onClick={() => setActiveTab('ringkasan')}
              icon={<LayoutDashboard className="h-3.5 w-3.5 text-blue-600" />}
            >
              Ringkasan
            </PillButton>
            <PillButton
              variant="tab"
              size="sm"
              active={activeTab === 'indikator'}
              onClick={() => setActiveTab('indikator')}
              icon={<TableProperties className="h-3.5 w-3.5 text-emerald-600" />}
            >
              Indikator
            </PillButton>
            <PillButton
              variant="tab"
              size="sm"
              active={activeTab === 'kendala'}
              onClick={() => setActiveTab('kendala')}
              icon={<AlertCircle className="h-3.5 w-3.5 text-amber-600" />}
            >
              Kendala ({pillar.kendalaLengkap.length})
            </PillButton>
          </div>

          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Ringkasan</span>
          </button>
        </div>

        {/* Tab Content 1: Ringkasan */}
        {activeTab === 'ringkasan' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Ringkasan Capaian Utama
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Sorotan 9 indikator prioritas dan realisasi tahun berjalan 2026
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {metricCards.length} Indikator Kunci
              </span>
            </div>

            {/* 1. Grid of 9 Metric Cards (3 columns x 3 rows) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
              {metricCards.map((card, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 md:p-6 flex flex-col justify-between hover:bg-slate-50/50 transition-colors"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 tracking-tight leading-snug">
                      {card.title}
                    </h3>

                    <div className="flex items-baseline gap-2 mt-2 mb-3 flex-wrap">
                      <span className="text-2xl lg:text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
                        {card.value}
                      </span>
                      {card.unit && (
                        <span className="text-xs font-medium text-slate-600">
                          {card.unit}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-0.5 pt-2.5 border-t border-slate-100 text-xs">
                    {card.status && (
                      <div className="font-semibold text-slate-700">
                        {card.status}
                      </div>
                    )}
                    {card.target && (
                      <div className="text-slate-600 font-medium">
                        {card.target}
                      </div>
                    )}
                    {card.subtext && (
                      <div className="text-slate-600 font-medium">
                        {card.subtext}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 2: Indikator (Tabel & Visualisasi 2-segment) */}
        {activeTab === 'indikator' && (
          <PillarIndicatorSection
            pillarName="Penurunan Kemiskinan"
            pillarId="kemiskinan"
            tableRows={tableRows}
          />
        )}

        {/* Tab Content 3: Kendala */}
        {activeTab === 'kendala' && (
          <div className="animate-in fade-in duration-150">
            <PillarKendalaSection
              kendalaList={pillar.kendalaLengkap}
              pillarTitle="Penurunan Kemiskinan"
              embedded={true}
            />
          </div>
        )}
      </div>

    </div>
  );
};
