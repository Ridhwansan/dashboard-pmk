import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {/* Logo Kemenko PMK Only */}
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full shadow-xs ring-1 ring-slate-900/10">
        <Image
          src="/images/logo-kemenko-pmk-baru.png"
          alt="Logo Kemenko PMK"
          width={40}
          height={40}
          className="h-full w-full object-contain"
          priority
        />
      </div>

      {/* Two-Line Title */}
      <div className="flex flex-col leading-snug">
        <span className="text-sm sm:text-base font-bold tracking-heading text-slate-900 leading-tight">
          Dashboard
        </span>
        <span className="text-[11px] sm:text-xs font-semibold text-slate-700 tracking-normal hidden sm:inline">
          Pembangunan Manusia dan Kebudayaan
        </span>
        <span className="text-[11px] font-semibold text-slate-700 tracking-normal sm:hidden">
          Kemenko PMK
        </span>
      </div>
    </div>
  );
};
