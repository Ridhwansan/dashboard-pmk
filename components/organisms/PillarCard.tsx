import React from 'react';
import { PillarData, PillarId } from '@/types/dashboard';
import {
  ArrowUpRight,
  GraduationCap,
  HeartPulse,
  ShieldAlert,
  TrendingDown,
} from 'lucide-react';

interface PillarCardProps {
  data: PillarData;
  onSelect(pillarId: PillarId): void;
  className?: string;
}

export const PillarCard: React.FC<PillarCardProps> = ({
  data,
  onSelect,
  className = '',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(data.id);
    }
  };

  // Structured configuration per pillar: icon, title, lead metric, and secondary indicators
  const getPillarConfig = (pillarId: PillarId) => {
    switch (pillarId) {
      case 'pendidikan':
        return {
          icon: GraduationCap,
          iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
          title: 'Pendidikan',
          lead: {
            label: 'Revitalisasi Satuan Pendidikan',
            value: '45,7%',
            target: '80.282 satuan pendidikan',
            realisasi: '36.669 satuan pendidikan',
          },
          secondary: [
            { label: 'Sekolah Nasional Terintegrasi (SNT)', value: '17 (T: 35 SNT Operasional)' },
            { label: 'Sekolah Unggul Garuda Baru', value: '3 (T: 4 satuan pendidikan)' },
            { label: 'SUG Transformasi', value: '42 (T: 30 satuan pendidikan)' },
          ],
        };
      case 'kesehatan':
        return {
          icon: HeartPulse,
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          title: 'Kesehatan',
          lead: {
            label: 'Cek Kesehatan Gratis (CKG)',
            value: '81,5%',
            target: '130 Juta Jiwa',
            realisasi: '105,98 Juta Jiwa',
          },
          secondary: [
            { label: 'Penemuan Kasus TB', value: '617.244 (T: 972.000)' },
            { label: 'Insidensi TB (/100rb)', value: '382 (T: 252)' },
            { label: 'Cakupan MBG Ibu Hamil', value: '38,6% (T: 50%)' },
          ],
        };
      case 'bencana':
        return {
          icon: ShieldAlert,
          iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
          title: 'Bencana',
          lead: {
            label: 'Hunian Sementara (Huntara)',
            value: '99,0%',
            target: '20.470 unit',
            realisasi: '20.267 unit',
          },
          secondary: [
            { label: 'Huntap Terbangun', value: '1.707 (T: 39.501 unit)' },
            { label: 'Pengungsi Mandiri', value: '100% (T: 100%)' },
            { label: 'Infrastruktur Pascabencana', value: '99% (T: 100%)' },
          ],
        };
      case 'kemiskinan':
        return {
          icon: TrendingDown,
          iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
          title: 'Penurunan Kemiskinan',
          lead: {
            label: 'Tingkat Kemiskinan Nasional',
            value: '8,07%',
            target: '6,5% – 7,5%',
            realisasi: '8,07% (Mar \'26)',
          },
          secondary: [
            { label: 'Kemiskinan Ekstrem', value: '0,83% (T: 0–0,5%)' },
            { label: 'Permakanan MBG Lansia', value: '116.754 (T: Terhenti)' },
            { label: 'Permakanan Disabilitas', value: '36.000 (T: Terhenti)' },
          ],
        };
      default:
        return {
          icon: GraduationCap,
          iconBg: 'bg-slate-50 text-slate-600 border-slate-200',
          title: data.name,
          lead: {
            label: 'Capaian Program',
            value: '—',
            target: '—',
            realisasi: '—',
          },
          secondary: [],
        };
    }
  };

  const config = getPillarConfig(data.id);
  const IconComponent = config.icon;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(data.id)}
      onKeyDown={handleKeyDown}
      aria-label={`Buka detail pemantauan ${config.title}`}
      className={`group bg-white rounded-2xl p-5 md:p-6 border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-slate-300 hover:ring-1 hover:ring-slate-300/40 transition-all duration-200 cursor-pointer flex flex-col justify-between relative ${className}`}
    >
      <div>
        {/* Top Header: Pillar Icon + Title + Arrow Button */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${config.iconBg}`}
            >
              <IconComponent className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-sm md:text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors tracking-tight">
              {config.title}
            </h3>
          </div>

          {/* Subtle Diagonal Arrow CTA Button */}
          <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-200 transition-all duration-150 shrink-0">
            <ArrowUpRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        {/* Hero Metric - Clean, Refined Focal Point */}
        <div className="my-2.5 pb-2.5 border-b border-slate-100">
          <div className="text-xs font-medium text-slate-500 mb-0.5">
            {config.lead.label}
          </div>

          <div className="text-2xl lg:text-3xl font-bold text-slate-900 numeric tabular-nums tracking-tight my-0.5">
            {config.lead.value}
          </div>

          {/* Target & Realisasi Row: High Legibility & Strong Contrast */}
          <div className="flex items-center justify-between text-xs sm:text-[13px] pt-2 mt-2 border-t border-slate-200/90 gap-2">
            <span className="text-slate-600">
              Target:{' '}
              <strong className="text-slate-950 font-bold tabular-nums">
                {config.lead.target}
              </strong>
            </span>
            <span className="text-slate-600">
              Realisasi:{' '}
              <strong className="text-slate-950 font-bold tabular-nums">
                {config.lead.realisasi}
              </strong>
            </span>
          </div>
        </div>

        {/* Sub-Indikator List - Uniform, standardized format */}
        <div>
          <div className="divide-y divide-slate-100">
            {config.secondary.map((ind, idx) => (
              <div
                key={idx}
                className="py-1.5 flex items-center justify-between text-xs gap-2 hover:bg-slate-50/60 px-1 rounded transition-colors"
              >
                <span className="text-slate-600 font-normal truncate">
                  {ind.label}
                </span>
                <span className="numeric tabular-nums font-semibold text-slate-800 shrink-0 text-right">
                  {ind.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
