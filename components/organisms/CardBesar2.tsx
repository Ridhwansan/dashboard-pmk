import React, { useState } from 'react';
import {
  CRITICAL_ALERTS,
  ORCHESTRATION_AGENDA,
  TARGET_TRAJECTORY_DATA,
} from '@/data/dashboardData';
import { Badge } from '@/components/atoms/Badge';
import { PillButton } from '@/components/atoms/PillButton';
import { AlertTriangle, ListChecks, TrendingUp } from 'lucide-react';

interface CardBesar2Props {
  className?: string;
}

export const CardBesar2: React.FC<CardBesar2Props> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'isu' | 'orkestrasi' | 'trajektori'>('isu');

  return (
    <div
      className={`bg-white rounded-xl p-5 md:p-6 border border-slate-200/90 shadow-2xs ${className}`}
    >
      {/* Header with Title and Executive Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              {activeTab === 'isu' && 'Sorotan Isu Kritis & Perlu Diwaspadai (2026)'}
              {activeTab === 'orkestrasi' && 'Kendala Pelaksanaan & Tindak Lanjut Orkestrasi'}
              {activeTab === 'trajektori' && 'Trajektori Target RPJMN 2025–2029'}
            </h2>
          </div>
          <p className="text-xs text-slate-700 font-medium mt-0.5">
            {activeTab === 'isu' && '5 isu kritis tahun berjalan yang memerlukan perhatian segera Menko PMK'}
            {activeTab === 'orkestrasi' && 'Rangkuman 8 agenda koordinasi lintas kementerian/lembaga & regulasi'}
            {activeTab === 'trajektori' && 'Perbandingan proyeksi capaian indikator makro tahunan RPJMN 2025–2029'}
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto shrink-0 border border-slate-200/60">
          <PillButton
            variant="tab"
            size="sm"
            active={activeTab === 'isu'}
            onClick={() => setActiveTab('isu')}
            icon={<AlertTriangle className="h-3.5 w-3.5 text-rose-600" />}
          >
            Isu Kritis (5)
          </PillButton>
          <PillButton
            variant="tab"
            size="sm"
            active={activeTab === 'orkestrasi'}
            onClick={() => setActiveTab('orkestrasi')}
            icon={<ListChecks className="h-3.5 w-3.5 text-blue-600" />}
          >
            Agenda Orkestrasi (8)
          </PillButton>
          <PillButton
            variant="tab"
            size="sm"
            active={activeTab === 'trajektori'}
            onClick={() => setActiveTab('trajektori')}
            icon={<TrendingUp className="h-3.5 w-3.5 text-emerald-600" />}
          >
            Trajektori RPJMN
          </PillButton>
        </div>
      </div>

      {/* Tab 1: 5 Critical Alerts - Proportional 6-col Grid Eliminating Blank Spaces */}
      {activeTab === 'isu' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {CRITICAL_ALERTS.map((alert, idx) => {
            const getAlertStat = (id: string) => {
              switch (id) {
                case 'kemiskinan':
                  return {
                    highlight: '8,07%',
                    target: 'Target: 6,5–7,5%',
                    statusBadge: 'Perlu Akselerasi',
                    badgeVariant: 'warning' as const,
                  };
                case 'huntap':
                  return {
                    highlight: '1.707 unit (4,3%)',
                    target: 'Target: 39.501 unit',
                    statusBadge: 'Kritis',
                    badgeVariant: 'critical' as const,
                  };
                case 'mbg-lansia':
                  return {
                    highlight: 'Terhenti sejak awal 2026',
                    target: 'Integrasi MBG belum jalan',
                    statusBadge: 'Terhenti',
                    badgeVariant: 'critical' as const,
                  };
                case 'verval-sekolah':
                  return {
                    highlight: '8.000 / 147.324 (5,4%)',
                    target: 'Target: 147.324 satdik',
                    statusBadge: 'Waspada',
                    badgeVariant: 'warning' as const,
                  };
                case 'gerakan-asri':
                  return {
                    highlight: '25% Sampah Terkelola',
                    target: 'Tata kelola & pembiayaan',
                    statusBadge: 'Waspada',
                    badgeVariant: 'warning' as const,
                  };
                default:
                  return null;
              }
            };

            const stat = getAlertStat(alert.id);
            // First 3 cards span 2 cols on lg (2+2+2 = 6). Last 2 cards span 3 cols on lg (3+3 = 6).
            const spanClass =
              idx < 3
                ? 'col-span-1 md:col-span-1 lg:col-span-2'
                : idx === 3
                ? 'col-span-1 md:col-span-1 lg:col-span-3'
                : 'col-span-1 md:col-span-2 lg:col-span-3';

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between ${spanClass}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                      {alert.title}
                    </h3>
                    {stat && (
                      <Badge variant={stat.badgeVariant} size="sm">
                        {stat.statusBadge}
                      </Badge>
                    )}
                  </div>

                  {stat && (
                    <div className="text-base md:text-lg font-bold text-slate-900 numeric tabular-nums my-1">
                      {stat.highlight}
                    </div>
                  )}

                  <p className="text-sm text-slate-600 font-normal leading-relaxed mt-2.5">
                    {alert.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: 8 Orchestration Agendas */}
      {activeTab === 'orkestrasi' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {ORCHESTRATION_AGENDA.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {index + 1}. {item.topic}
                </h3>
                <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-md">
                  {item.pillar}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {item.summary}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Target Trajectory Table 2025–2029 */}
      {activeTab === 'trajektori' && (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-300 text-slate-900 font-bold bg-slate-100">
                <th className="py-2.5 px-3">Indikator Program</th>
                <th className="py-2.5 px-3 text-center">2025</th>
                <th className="py-2.5 px-3 text-center font-bold text-blue-950 bg-blue-100/70 border-x border-blue-200">
                  2026 (T / C)
                </th>
                <th className="py-2.5 px-3 text-center">2027</th>
                <th className="py-2.5 px-3 text-center">2028</th>
                <th className="py-2.5 px-3 text-center">2029</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {TARGET_TRAJECTORY_DATA.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {row.indicator}
                  </td>
                  <td className="py-2.5 px-3 text-center numeric tabular-nums text-slate-700 font-medium">
                    {row.y2025}
                  </td>
                  <td className="py-2.5 px-3 text-center numeric tabular-nums font-bold text-blue-950 bg-blue-50/60 border-x border-blue-100">
                    {row.y2026}
                  </td>
                  <td className="py-3 px-3 text-center numeric tabular-nums text-slate-800 font-semibold">
                    {row.y2027}
                  </td>
                  <td className="py-3 px-3 text-center numeric tabular-nums text-slate-800 font-semibold">
                    {row.y2028}
                  </td>
                  <td className="py-3 px-3 text-center numeric tabular-nums text-slate-800 font-semibold">
                    {row.y2029}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Info: Clean attribution without redundant cutoff date */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 font-normal">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          <span>Pengawalan Regulasi &amp; Orkestrasi Lintas Sektoral: Kemenko PMK</span>
        </div>
        <span className="text-slate-400 text-[11px]">
          Sumber: Pemantauan Rutin K/L Teknis &amp; Sidang Kabinet
        </span>
      </div>
    </div>
  );
};

