import React, { useState } from 'react';
import { ArrowLeft, LayoutDashboard, TableProperties, AlertCircle, ChevronRight } from 'lucide-react';
import { PillarData } from '@/types/dashboard';
import { PillarKendalaSection } from './PillarKendalaSection';
import { PillButton } from '@/components/atoms/PillButton';
import { PillarIndicatorSection } from './PillarIndicatorSection';
import { CardKendalaModal } from '@/components/molecules/CardKendalaModal';

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
  kendala?: string;
  tindakLanjut?: string;
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
  const [selectedKendalaCard, setSelectedKendalaCard] = useState<MetricCardItem | null>(null);

  // Exact 9 Metric Cards from Image 1 (Gambar 1 - Ringkasan Kesehatan & Gambar 3 - Kendala)
  const metricCards: MetricCardItem[] = [
    {
      title: 'Cek Kesehatan Gratis',
      value: '105,98',
      unit: 'juta jiwa',
      status: 'Capaian 2026',
      target: 'Target 2026: 130',
      kendala: 'Tata Kelola pemeriksaan lanjutan; ketersediaan bahan medis habis pakai',
      tindakLanjut: 'Percepatan faskes TNI/Polri untuk percepatan daerah Indonesia timur',
    },
    {
      title: 'Penemuan kasus TB',
      value: '656.517',
      unit: 'kasus',
      status: 'Capaian 2026',
      target: 'Target 2026: 972.000',
      kendala: 'Anggaran, stigma, dan dukungan nutrisi',
      tindakLanjut: 'Peningkatan alokasi anggaran',
    },
    {
      title: 'Renovasi RSUD Tipe D ke C',
      value: '39',
      unit: 'RSUD',
      status: 'Capaian 2025 : 21 RSUD · Capaian 2026: 18 RSUD proses konstruksi',
      target: 'Target 2026: 20 RSUD',
      subtext: 'Target 2027: 66 RSUD',
      kendala: 'Ketersediaan dokter spesialis dan alat kesehatan',
      tindakLanjut: 'Mendorong Kemenkes dan Kemdiktisaintek untuk percepatan penyediaan dokter spesialis dan penyediaan alat kesehatan.',
    },
    {
      title: 'Stunting',
      value: '19,8%',
      status: 'Capaian 2024 (Survei SKI)',
      target: 'Target 14% pada 2029',
      kendala: 'Revisi Perpres 72/2021 belum ditetapkan',
      tindakLanjut: 'Percepatan revisi Perpres',
    },
    {
      title: 'MBG balita non-PAUD',
      value: '4,89',
      unit: 'juta jiwa',
      status: 'Capaian 2026 • 29,2% dari sasaran',
      target: 'Target 2026: 16,7 juta jiwa',
      kendala: 'Ketepatan sasaran, integrasi data, kualitas layanan',
      tindakLanjut: 'Refocusing MBG 3B pada wilayah 3T dan penguatan Pemda dalam pengawalan MBG',
    },
    {
      title: 'MBG ibu hamil',
      value: '656',
      unit: 'ribu jiwa',
      status: 'Capaian 2026 • 26,3% dari sasaran',
      target: 'Target 2026: 2,49 juta jiwa',
      kendala: 'Ketepatan sasaran, integrasi data, kualitas layanan',
      tindakLanjut: 'Refocusing MBG 3B pada wilayah 3T dan penguatan Pemda dalam pengawalan MBG',
    },
    {
      title: 'MBG ibu menyusui',
      value: '1,77',
      unit: 'juta jiwa',
      status: 'Capaian 2026 • 64,5% dari sasaran',
      target: 'Target 2026: 2,75 juta jiwa',
      kendala: 'Ketepatan sasaran, integrasi data, kualitas layanan',
      tindakLanjut: 'Refocusing MBG 3B pada wilayah 3T dan penguatan Pemda dalam pengawalan MBG',
    },
    {
      title: 'Revitalisasi Puskesmas',
      value: '10.000',
      unit: 'puskesmas',
      status: 'Target 2027',
      target: 'Target 2027: 10.000 puskesmas',
      kendala: 'Dukungan anggaran',
      tindakLanjut: 'Mendorong Kemenkes untuk melakukan inventarisasi status kelayakan',
    },
    {
      title: 'Revitalisasi RS',
      value: '450',
      unit: 'RS',
      status: 'Target 2027-2028',
      target: 'Target 2027-2028: 450 RS',
      kendala: 'Dukungan anggaran',
      tindakLanjut: 'Mendorong Kemenkes untuk melakukan inventarisasi status kelayakan',
    },
  ];

  // Exact 6 Table Rows from Image 2 (Gambar 2 - Indikator Kesehatan)
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
      y2026: { t: '972.000', c: '656.517' },
      y2027: { t: '963.014', c: '—' },
      y2028: { t: '954.035', c: '—' },
      y2029: { t: '945.058', c: '—' },
    },
    {
      name: 'MBG ibu hamil',
      subUnit: '% dari sasaran',
      y2025: { t: '—', c: '—' },
      y2026: { t: '50', c: '26,3' },
      y2027: { t: '70', c: '—' },
      y2028: { t: '70', c: '—' },
      y2029: { t: '100', c: '—' },
    },
    {
      name: 'MBG ibu menyusui',
      subUnit: '% dari sasaran',
      y2025: { t: '—', c: '—' },
      y2026: { t: '50', c: '64,5' },
      y2027: { t: '70', c: '—' },
      y2028: { t: '70', c: '—' },
      y2029: { t: '100', c: '—' },
    },
    {
      name: 'MBG balita non-PAUD',
      subUnit: '% dari sasaran',
      y2025: { t: '—', c: '—' },
      y2026: { t: '16', c: '29,2' },
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
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-800 tracking-tight leading-snug">
                        {card.title}
                      </h3>
                    </div>

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

                  <div className="pt-2.5 mt-2 border-t border-slate-100 text-xs flex-1 flex flex-col justify-between">
                    <div className="space-y-0.5">
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

                    {card.kendala && (
                      <div className="pt-3 mt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedKendalaCard(card)}
                          className="w-full h-[40px] min-h-[40px] inline-flex items-center justify-between px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/90 hover:border-slate-300 text-xs font-semibold transition-all cursor-pointer shadow-2xs group"
                        >
                          <span className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                            <span>Kendala &amp; Tindak Lanjut</span>
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5 shrink-0" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Detail Kendala & Tindak Lanjut Per Kartu */}
            <CardKendalaModal
              isOpen={!!selectedKendalaCard}
              onClose={() => setSelectedKendalaCard(null)}
              item={selectedKendalaCard}
              pillarTitle="Kesehatan"
            />
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
