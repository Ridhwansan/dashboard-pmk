import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, AlertCircle, MapPin } from 'lucide-react';
import { PillarData } from '@/types/dashboard';
import { INDONESIA_REGIONS } from '@/data/dashboardData';

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
  const [showOrchestration, setShowOrchestration] = useState(true);
  const [showRegional, setShowRegional] = useState(false);
  const [expandedIssueId, setExpandedIssueId] = useState<number | null>(null);

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

  const toggleIssue = (id: number) => {
    setExpandedIssueId(expandedIssueId === id ? null : id);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Main Panel */}
      <div className="bg-white rounded-xl p-5 md:p-7 border border-slate-200/90 shadow-2xs">
        {/* Header: Title "Penurunan Kemiskinan" (No Dropdown) + Back Button */}
        <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-100">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Penurunan Kemiskinan
          </h2>

          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Ringkasan</span>
          </button>
        </div>

        <div className="space-y-6">
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

          {/* 2. Target dan capaian tahunan */}
          <div className="pt-2">
            <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight mb-3">
              Target dan capaian tahunan
            </h3>

            <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/90 text-slate-900 font-bold">
                    <th className="py-3 px-4 md:px-5 min-w-[240px]">
                      Indikator dan satuan
                    </th>
                    <th className="py-3 px-3 md:px-4 text-center min-w-[110px] text-slate-800">
                      2025
                    </th>
                    <th className="py-3 px-3 md:px-4 text-center min-w-[150px] font-bold text-blue-950 bg-blue-100/70 border-x border-blue-200">
                      2026
                    </th>
                    <th className="py-3 px-3 md:px-4 text-center min-w-[110px] text-slate-800">
                      2027
                    </th>
                    <th className="py-3 px-3 md:px-4 text-center min-w-[110px] text-slate-800">
                      2028
                    </th>
                    <th className="py-3 px-3 md:px-4 text-center min-w-[110px] text-slate-800">
                      2029
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {tableRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Column 1: Indikator dan satuan */}
                      <td className="py-3.5 px-4 md:px-5 align-top">
                        <div className="font-bold text-slate-900 text-xs md:text-sm">
                          {row.name}
                        </div>
                        {row.subUnit && (
                          <div className="text-[11px] md:text-xs text-slate-600 font-medium mt-0.5">
                            {row.subUnit}
                          </div>
                        )}
                      </td>

                      {/* Column 2: 2025 */}
                      <td className="py-3.5 px-3 md:px-4 text-center align-top tabular-nums">
                        <div className="text-slate-700">T: {row.y2025.t}</div>
                        <div className="text-slate-900 font-semibold">
                          C: {row.y2025.c}
                        </div>
                      </td>

                      {/* Column 3: 2026 (Highlighted Column) */}
                      <td className="py-3.5 px-3 md:px-4 text-center align-top tabular-nums font-bold text-slate-950 bg-blue-50/50 border-x border-blue-100">
                        <div className="text-slate-800">T: {row.y2026.t}</div>
                        <div className="text-blue-950 font-bold">
                          C: {row.y2026.c}
                        </div>
                      </td>

                      {/* Column 4: 2027 */}
                      <td className="py-3.5 px-3 md:px-4 text-center align-top tabular-nums">
                        <div className="text-slate-700">T: {row.y2027.t}</div>
                        <div className="text-slate-800 font-semibold">
                          C: {row.y2027.c}
                        </div>
                      </td>

                      {/* Column 5: 2028 */}
                      <td className="py-3.5 px-3 md:px-4 text-center align-top tabular-nums">
                        <div className="text-slate-700">T: {row.y2028.t}</div>
                        <div className="text-slate-800 font-semibold">
                          C: {row.y2028.c}
                        </div>
                      </td>

                      {/* Column 6: 2029 */}
                      <td className="py-3.5 px-3 md:px-4 text-center align-top tabular-nums">
                        <div className="text-slate-700">T: {row.y2029.t}</div>
                        <div className="text-slate-800 font-semibold">
                          C: {row.y2029.c}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footnote verbatim */}
            <p className="mt-3 text-xs text-slate-600 font-medium leading-relaxed">
              T = target • C = capaian • — = belum tersedia, bukan nol • 2026
              merupakan posisi berjalan • Satuan mengikuti setiap indikator
            </p>
          </div>
        </div>
      </div>

      {/* Accordion / Secondary Sections: Kendala Pelaksanaan & Tindak Lanjut Orkestrasi */}
      <div className="bg-white rounded-xl p-5 md:p-6 border border-slate-200/90 shadow-2xs">
        <button
          type="button"
          onClick={() => setShowOrchestration(!showOrchestration)}
          className="w-full flex items-center justify-between text-left group cursor-pointer focus-visible:outline-2 focus-visible:outline-slate-400 rounded-lg"
          aria-expanded={showOrchestration}
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-800 transition-colors">
                Kendala Pelaksanaan dan Tindak Lanjut Orkestrasi
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Uraian hambatan regulasi dan langkah percepatan lintas K/L
              </p>
            </div>
          </div>
          {showOrchestration ? (
            <ChevronUp className="h-5 w-5 text-slate-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-600" />
          )}
        </button>

        {showOrchestration && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
            {pillar.kendalaLengkap.map((issue) => {
              const isExpanded = expandedIssueId === issue.id;

              return (
                <div
                  key={issue.id}
                  className="rounded-lg border border-slate-200 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleIssue(issue.id)}
                    aria-expanded={isExpanded}
                    className="w-full p-3.5 md:p-4 flex items-center justify-between gap-3 text-left bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-700 w-5">
                        {issue.id}.
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {issue.title}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-700 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-700 shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-slate-200 space-y-3">
                      {issue.kendala && (
                        <div>
                          <span className="text-xs font-bold text-slate-800 block mb-1">
                            Kendala Pelaksanaan:
                          </span>
                          <p className="text-xs md:text-sm text-slate-800 leading-relaxed font-medium">
                            {issue.kendala}
                          </p>
                        </div>
                      )}

                      <div>
                        <span className="text-xs font-bold text-slate-800 block mb-1">
                          Tindak Lanjut Orkestrasi:
                        </span>
                        <p className="text-xs md:text-sm text-slate-800 leading-relaxed font-medium">
                          {issue.tindakLanjut}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Accordion / Secondary Sections: Peta & Progres Wilayah */}
      <div className="bg-white rounded-xl p-5 md:p-6 border border-slate-200/90 shadow-2xs">
        <button
          type="button"
          onClick={() => setShowRegional(!showRegional)}
          className="w-full flex items-center justify-between text-left group cursor-pointer focus-visible:outline-2 focus-visible:outline-slate-400 rounded-lg"
          aria-expanded={showRegional}
        >
          <div className="flex items-center gap-2.5">
            <MapPin className="h-5 w-5 text-blue-600 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-800 transition-colors">
                Sebaran 6 Koridor Wilayah Indonesia
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Progres rata-rata PKPN dan Agenda Transformasi per wilayah
              </p>
            </div>
          </div>
          {showRegional ? (
            <ChevronUp className="h-5 w-5 text-slate-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-600" />
          )}
        </button>

        {showRegional && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {INDONESIA_REGIONS.map((region) => (
              <div
                key={region.id}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">
                    {region.name}
                  </span>
                  <span className="text-xs font-bold text-slate-900 numeric tabular-nums">
                    {region.progressOverall}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${region.progressOverall}%` }}
                  />
                </div>
                <p className="text-xs text-slate-700 font-medium line-clamp-2">
                  {region.statusPKPN}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
