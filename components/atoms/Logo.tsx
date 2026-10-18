import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {/* Logos Container */}
      <div className="flex items-center gap-2.5">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/10 p-0.5">
          <Image
            src="/images/logo-kemenko-pmk.png"
            alt="Logo Kemenko PMK"
            width={36}
            height={36}
            className="h-full w-full object-contain"
            priority
          />
        </div>
        <span className="text-slate-300 font-light text-base select-none">|</span>
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-50 p-0.5 border border-slate-100">
          <Image
            src="/images/logo-bps.png"
            alt="Logo BPS"
            width={36}
            height={36}
            className="h-full w-full object-contain"
            priority
          />
        </div>
      </div>

      {/* Two-Line Title */}
      <div className="flex flex-col leading-snug">
        <span className="text-base font-bold tracking-heading text-slate-900">
          Dashboard
        </span>
        <span className="text-xs font-semibold text-slate-700 tracking-normal">
          Pembangunan Manusia dan Kebudayaan
        </span>
      </div>
    </div>
  );
};
