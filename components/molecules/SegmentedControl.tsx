import React from 'react';
import { LayoutGrid, MapPin } from 'lucide-react';
import { Layer1ViewMode } from '@/types/dashboard';

interface SegmentedControlProps {
  value: Layer1ViewMode;
  onChange: (val: Layer1ViewMode) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  value,
  onChange,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 select-none ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange('cards')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer ${
          value === 'cards'
            ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
        }`}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        <span>Ringkasan Kartu</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('map')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer ${
          value === 'map'
            ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
        }`}
      >
        <MapPin className="h-3.5 w-3.5" />
        <span>Peta Wilayah</span>
      </button>
    </div>
  );
};
