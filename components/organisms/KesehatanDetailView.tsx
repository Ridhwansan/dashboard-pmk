import React, { useState } from 'react';
import { ArrowLeft, LayoutDashboard, TableProperties, AlertCircle } from 'lucide-react';
import { PillarData } from '@/types/dashboard';
import { PillarKendalaSection } from './PillarKendalaSection';
import { PillButton } from '@/components/atoms/PillButton';
import { PillarIndicatorSection } from './PillarIndicatorSection';

type DetailTab = 'ringkasan' | 'indikator' | 'kendala';

interface KesehatanDetailViewProps {
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

export const KesehatanDetailView: React.FC<KesehatanDetailViewProps> = ({
  onBackToHome,
  pillar,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('ringkasan');

  // Exact 9 Metric Cards from Image 1 (Gambar 2 - Detail Kesehatan)
  const metricCards: MetricCardItem[] = [
    {
      title: 'Cek Kesehatan Gratis',
      value: '105,98',
      unit: 'juta jiwa',
      status: 'Capaian 2026',
      target: 'Target 2026: 130',
    },
    {
      title: 'Penemuan kasus TB',
      value: '617.244',
      unit: 'kasus',
      status: 'Capaian 2026',
      target: 'Target 2026: 972.000',
    },
    {
      title: 'Renovasi RSUD Tipe D ke C',
      value: '39',
      unit: 'RSUD',
      status: 'Capaian 2025 :21 RSUD  Capaian 2026: 18 RSUD proses konstruksi',
      target: 'Target 2026 : 20 RSUD',
      subtext: 'Target 2027: 66 RSUD',
    },
    {
      title: 'Stunting',
      value: '19,8%',
      status: 'Capaian 2024 (Survei SKI)',
      target: 'Target 14% pada 2029',
    },
    {
      title: 'MBG balita non-PAUD',
      value: '7,4',
      unit: 'juta jiwa',
      status: 'Capaian 2026 • 44,28% dari sasaran',
      target: 'Target 2026: 16,7 juta jiwa',
    },
    {
      title: 'MBG ibu hamil',
      value: '38,63',
      unit: 'juta jiwa',
      status: 'Capaian 2026 • 38,63% dari sasaran',
      target: 'Target 2026: 2,39 juta jiwa',
    },
    {
      title: 'MBG ibu menyusui',
      value: '86,87',
      status: 'Capaian 2026 • 86,87% dari sasaran',
      target: 'Target 2026: 2,75 juta jiwa',
    },
    {
      title: 'Revitalisasi Puskesmas',
      value: '10.000',
      target: 'Target 2027',
    },
    {
      title: 'Revitalisasi RS',
      value: '450',
      target: 'Target 2027-2028',
    },
  ];

  // Exact 6 Table Rows from Image 1 (Gambar 2 - Detail Kesehatan)
  const tableRows: AnnualIndicatorRow[] = [
    {
      name: 'Cek Kesehatan Gratis',
      subUnit: 'juta jiwa',
      y2025: { t: '102', c: '70,3' },
      y2026: { t: '130', c: '105,98' },
      y2027: { t: '157', c: '—' },
      y2028: { t: '174', c: '—' },
      y2029: { t: '199', c: '—' },
    },
    {
      name: 'Penemuan kasus TB',
      subUnit: 'kasus',
      y2025: { t: '981.000', c: '867.480' },
      y2026: { t: '972.000', c: '617.244' },
      y2027: { t: '963.014', c: '—' },
      y2028: { t: '954.035', c: '—' },
      y2029: { t: '945.058', c: '—' },
    },
    {
      name: 'MBG ibu hamil',
      subUnit: '% dari sasaran',
      y2025: { t: '—', c: '—' },
      y2026: { t: '50', c: '38,63' },
      y2027: { t: '70', c: '—' },
      y2028: { t: '70', c: '—' },
      y2029: { t: '100', c: '—' },
    },
    {
      name: 'MBG ibu menyusui',
      subUnit: '% dari sasaran',
      y2025: { t: '—', c: '—' },
      y2026: { t: '50', c: '86,87' },
      y2027: { t: '70', c: '—' },
      y2028: { t: '70', c: '—' },
      y2029: { t: '100', c: '—' },
    },
    {
      name: 'MBG balita non-PAUD',
      subUnit: '% dari sasaran',
      y2025: { t: '—', c: '—' },
      y2026: { t: '16', c: '44,28' },
      y2027: { t: '70', c: '—' },
      y2028: { t: '80', c: '—' },
      y2029: { t: '100', c: '—' },
    },
    {
      name: 'Insidensi TB',
      subUnit: 'kasus per 100.000 penduduk',
      y2025: { t: '—', c: '—' },
      y2026: { t: '252', c: '—' },
      y2027: { t: '231', c: '—' },
      y2028: { t: '211', c: '—' },
      y2029: { t: '190', c: '—' },
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Top Main Panel */}
      <div className="bg-white rounded-xl p-5 md:p-7 border border-slate-200/90 shadow-2xs">
        {/* Header: Title "Kesehatan" + Submenu Tabs + Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Kesehatan
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
            pillarName="Kesehatan"
            pillarId="kesehatan"
            tableRows={tableRows}
          />
        )}

        {/* Tab Content 3: Kendala */}
        {activeTab === 'kendala' && (
          <div className="animate-in fade-in duration-150">
            <PillarKendalaSection
              kendalaList={pillar.kendalaLengkap}
              pillarTitle="Kesehatan"
              embedded={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};
