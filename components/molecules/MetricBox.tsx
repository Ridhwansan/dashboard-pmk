import React from 'react';

export interface MetricBoxProps {
  id?: string;
  category?: string;
  title: string;
  target?: string;
  capaian?: string;
  heroValue?: string;
  heroUnit?: string;
  heroLabel?: string;
  badge?: {
    text: string;
    variant: 'alert' | 'warning' | 'success' | 'neutral';
  };
  info: string;
  trend?: string;
  className?: string;
}

export const MetricBox: React.FC<MetricBoxProps> = ({
  category,
  title,
  target,
  heroValue,
  heroUnit,
  heroLabel,
  badge,
  info,
  className = '',
}) => {
  const displayValue = heroValue || target || '—';

  return (
    <div
      className={`p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Top Header: Title & Status Badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            {category && (
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-0.5">
                {category}
              </span>
            )}
            <h3 className="text-sm md:text-base font-semibold text-slate-900 tracking-tight">
              {title}
            </h3>
          </div>
          {badge && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md shrink-0 border ${
                badge.variant === 'alert'
                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                  : badge.variant === 'warning'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : badge.variant === 'success'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-slate-100 text-slate-800 border-slate-300'
              }`}
            >
              {badge.text}
            </span>
          )}
        </div>

        {/* Hero Number - Refined Font Size & Weight */}
        <div className="my-2">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 numeric tabular-nums">
              {displayValue}
            </span>
            {heroUnit && (
              <span className="text-xs md:text-sm font-semibold text-slate-700">
                {heroUnit}
              </span>
            )}
          </div>
          {heroLabel && (
            <p className="text-xs font-semibold text-slate-700 mt-1">
              {heroLabel}
            </p>
          )}
        </div>
      </div>

      {/* Trajectory / Detail Info - Direct and High Contrast */}
      <div className="mt-3 pt-2.5 border-t border-slate-200 text-xs text-slate-700 font-medium leading-relaxed">
        {info}
      </div>
    </div>
  );
};


