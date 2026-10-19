import React, { useState } from 'react';
import { ArrowLeft, LayoutDashboard, TableProperties, AlertCircle, ChevronRight } from 'lucide-react';
import { PillarData } from '@/types/dashboard';
import { PillarKendalaSection } from './PillarKendalaSection';
import { PillButton } from '@/components/atoms/PillButton';
import { PillarIndicatorSection } from './PillarIndicatorSection';
import { CardKendalaModal } from '@/components/molecules/CardKendalaModal';

type DetailTab = 'ringkasan' | 'indikator' | 'kendala';

interface PendidikanDetailViewProps {
  onBackToHome: () => void;
  pillar: PillarData;
}

interface MetricCardItem {
  title: string;
  value: string;
  unit: string;
  status: string;
  target: string;
  subtext?: string;
  kendala?: string;
  tindakLanjut?: string;
}

interface AnnualIndicatorRow {
  name: string;
  subUnit?: string;
  y2025: { t: string; c: string };
  y2026: { t: string; c: string; note?: string };
  y2027: { t: string; c: string };
  y2028: { t: string; c: string };
  y2029: { t: string; c: string };
}

export const PendidikanDetailView: React.FC<PendidikanDetailViewProps> = ({
  onBackToHome,
  pillar,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('ringkasan');
  const [selectedKendalaCard, setSelectedKendalaCard] = useState<MetricCardItem | null>(null);

  // 1. Exact 6 Metric Cards from Gambar 1 & Gambar 2
  const metricCards: MetricCardItem[] = [
    {
      title: 'Revitalisasi Satuan Pendidikan',
      value: '36.669',
      unit: 'satuan pendidikan',
      status: 'Capaian 2026',
      target: 'Target 2026: 80.282 satuan pendidikan',
      kendala: 'ABT 7.131 madrasah belum disetujui; 41 madrasah terdampak bencana butuh penanganan',
      tindakLanjut: 'Percepatan persetujuan ABT, realokasi sekolah terdampak bencana, penerbitan instruksi Mendagri untuk dukungan daerah',
    },
    {
      title: 'SNT operasional',
      value: '17',
      unit: 'satuan pendidikan',
      status: 'Capaian 2026',
      target: 'Target 2026: 35 satuan pendidikan',
      kendala: 'RPerpres belum ditetapkan; terkendala kesiapan lahan dan kebutuhan guru',
      tindakLanjut: 'Percepatan RPerpres SNT: finalisasi regulasi, usulan status PSN, kepastian lahan & NPSN, rekrutmen GTK, dan rencana anggaran',
    },
    {
      title: 'Sekolah Unggul Garuda Baru',
      value: '3',
      unit: 'satuan pendidikan',
      status: 'Capaian 2026',
      target: 'Target 2026: 4 satuan pendidikan',
      kendala: 'Perpres Tunjangan GTK belum ditetapkan',
      tindakLanjut: 'Percepatan Perpres Tunjangan GTK SUG, penegasan kewenangan, dan penyelesaian pembangunan',
    },
    {
      title: 'Sekolah Unggul Garuda Transformasi',
      value: '42',
      unit: 'satuan pendidikan',
      status: 'Capaian 2026: 30 satuan pendidikan',
      target: 'Target 2026: 30 satuan pendidikan',
      subtext: 'Capaian 2025 : 12 satuan pendidikan',
      kendala: 'Perpres Tunjangan GTK belum ditetapkan',
      tindakLanjut: 'Percepatan Perpres Tunjangan GTK SUG, penegasan kewenangan, dan penyelesaian pembangunan',
    },
    {
      title: 'Digitalisasi Pendidikan',
      value: '727.436',
      unit: 'unit',
      status: 'Capaian 2026 (Berproses disalurkan)',
      target: 'Target 2026: 727.436 unit',
    },
    {
      title: 'Indeks Modal Manusia (IMM)',
      value: '0,562',
      unit: 'poin',
      status: 'Capaian 2025',
      target: 'Target 2026: 0.57',
      subtext: 'Target 2029: 0.59',
    },
  ];

  // 2. Exact 6 Table Rows from Gambar 3
  const tableRows: AnnualIndicatorRow[] = [
    {
      name: 'Revitalisasi satuan pendidikan',
      subUnit: 'satdik · target per tahun',
      y2025: { t: '12.825', c: '17.508' },
      y2026: { t: '80.282', c: '36.669' },
      y2027: { t: '99.423', c: '—' },
      y2028: { t: '116.614', c: '—' },
      y2029: { t: '98.375', c: '—' },
    },
    {
      name: 'Indeks Modal Manusia',
      subUnit: 'poin',
      y2025: { t: '0,56', c: '—' },
      y2026: { t: '0.57', c: '—' },
      y2027: { t: '0.575', c: '—' },
      y2028: { t: '0.58', c: '—' },
      y2029: { t: '0.59', c: '—' },
    },
    {
      name: 'SNT operasional',
      subUnit: 'unit · kumulatif',
      y2025: { t: '—', c: '—' },
      y2026: { t: '35', c: '17' },
      y2027: { t: '135', c: '—' },
      y2028: { t: '335', c: '—' },
      y2029: { t: '500', c: '—' },
    },
    {
      name: 'SUG baru',
      subUnit: 'unit · target per tahun',
      y2025: { t: '4', c: '—' },
      y2026: { t: '4', c: '3' },
      y2027: { t: '5', c: '—' },
      y2028: { t: '4', c: '—' },
      y2029: { t: '3', c: '—' },
    },
    {
      name: 'SUG Transformasi',
      subUnit: 'unit',
      y2025: { t: '12', c: '12' },
      y2026: { t: '30', c: '30' },
      y2027: { t: '50', c: '—' },
      y2028: { t: '—', c: '—' },
      y2029: { t: '—', c: '—' },
    },
    {
      name: 'IFP diproduksi dan disalurkan',
      subUnit: '(perangkat & satdik)',
      y2025: { t: '288.865', c: '288.865 (100%)' },
      y2026: {
        t: '727.436',
        c: '727.436 (100%)',
        note: '(Berproses disalurkan)',
      },
      y2027: { t: '—', c: '—' },
      y2028: { t: '—', c: '—' },
      y2029: { t: '—', c: '—' },
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Top Main Panel */}
      <div className="bg-white rounded-xl p-5 md:p-7 border border-slate-200/90 shadow-2xs">
        {/* Header: Title "Pendidikan" + Submenu Tabs + Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Pendidikan
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

            {/* 1. Grid of 6 Metric Cards (3 columns x 2 rows, shared clean borders) */}
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
                      <span className="text-xs font-medium text-slate-600">
                        {card.unit}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2.5 mt-2 border-t border-slate-100 text-xs flex-1 flex flex-col justify-between">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-700">
                        {card.status}
                      </div>
                      <div className="text-slate-600 font-medium">
                        {card.target}
                      </div>
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
              pillarTitle="Pendidikan"
            />
          </div>
        )}

        {/* Tab Content 2: Indikator (Tabel & Visualisasi 2-segment) */}
        {activeTab === 'indikator' && (
          <PillarIndicatorSection
            pillarName="Pendidikan"
            pillarId="pendidikan"
            tableRows={tableRows}
          />
        )}

        {/* Tab Content 3: Kendala */}
        {activeTab === 'kendala' && (
          <div className="animate-in fade-in duration-150">
            <PillarKendalaSection
              kendalaList={pillar.kendalaLengkap}
              pillarTitle="Pendidikan"
              embedded={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};
