import React, { useState } from 'react';
import { ArrowLeft, LayoutDashboard, TableProperties, AlertCircle } from 'lucide-react';
import { PillarData } from '@/types/dashboard';
import { PillarKendalaSection } from './PillarKendalaSection';
import { PillButton } from '@/components/atoms/PillButton';
import { PillarIndicatorSection } from './PillarIndicatorSection';

type DetailTab = 'ringkasan' | 'indikator' | 'kendala';

interface BencanaDetailViewProps {
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

export const BencanaDetailView: React.FC<BencanaDetailViewProps> = ({
  onBackToHome,
  pillar,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('ringkasan');

  // Exact 6 Metric Cards from Image 2 (Gambar 3 - Detail Ketahanan Bencana)
  const metricCards: MetricCardItem[] = [
    {
      title: 'Jumlah kejadian bencana',
      value: '2.096',
      status: 'Tercatat s.d. Okt 2026 • kejadian',
      target: '2025: 4.727 kejadian',
    },
    {
      title: 'Pembangunan Huntara Sumatera',
      value: '20.267',
      status: 'Capaian 2026 • unit',
      target: 'Target 2026: 20.544',
    },
    {
      title: 'Pembangunan Huntap Sumatera',
      value: '1.707',
      status: 'Capaian 2026 • unit',
      target: 'Target 2026: 39.501',
    },
    {
      title: 'Provinsi/Kabupaten Terdampak Karhutla',
      value: '7/63',
      status: 'Data Oktober 2026',
    },
    {
      title: 'Provinsi/Kabupaten Terdampak Karhutla',
      value: '7/63',
      status: 'Data Oktober 2026',
    },
    {
      title: 'Kerugian bencana',
      value: '—',
      status: 'Capaian 2026 • % PDB',
      target: 'Target 2026: 0,137',
    },
  ];

  // Exact 4 Table Rows from Image 2 (Gambar 3 - Detail Ketahanan Bencana)
  const tableRows: AnnualIndicatorRow[] = [
    {
      name: 'Huntap Sumatera',
      subUnit: 'unit',
      y2025: { t: '—', c: '—' },
      y2026: { t: '39.501', c: '1.707' },
      y2027: { t: '39.501', c: '—' },
      y2028: { t: '—', c: '—' },
      y2029: { t: '—', c: '—' },
    },
    {
      name: 'Huntara Sumatera',
      subUnit: 'unit',
      y2025: { t: '—', c: '—' },
      y2026: { t: '20.544', c: '20.267' },
      y2027: { t: '—', c: '—' },
      y2028: { t: '—', c: '—' },
      y2029: { t: '—', c: '—' },
    },
    {
      name: 'Jumlah kejadian bencana',
      subUnit: 'kejadian · nasional',
      y2025: { t: '—', c: '3.176' },
      y2026: { t: '—', c: '2.096' },
      y2027: { t: '—', c: '—' },
      y2028: { t: '—', c: '—' },
      y2029: { t: '—', c: '—' },
    },
    {
      name: 'Kerugian bencana',
      subUnit: '% PDB',
      y2025: { t: '0,137', c: '—' },
      y2026: { t: '0,137', c: '—' },
      y2027: { t: '0,136', c: '—' },
      y2028: { t: '0,136', c: '—' },
      y2029: { t: '0,135', c: '—' },
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Top Main Panel */}
      <div className="bg-white rounded-xl p-5 md:p-7 border border-slate-200/90 shadow-2xs">
        {/* Header: Title "Ketahanan Bencana" + Submenu Tabs + Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Ketahanan Bencana
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
                  Sorotan 6 indikator prioritas dan realisasi tahun berjalan 2026
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {metricCards.length} Indikator Kunci
              </span>
            </div>

            {/* 1. Grid of 6 Metric Cards (3 columns x 2 rows) */}
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
            pillarName="Ketahanan Bencana"
            pillarId="bencana"
            tableRows={tableRows}
          />
        )}

        {/* Tab Content 3: Kendala */}
        {activeTab === 'kendala' && (
          <div className="animate-in fade-in duration-150">
            <PillarKendalaSection
              kendalaList={pillar.kendalaLengkap}
              pillarTitle="Ketahanan Bencana"
              embedded={true}
            />
          </div>
        )}
      </div>

    </div>
  );
};
