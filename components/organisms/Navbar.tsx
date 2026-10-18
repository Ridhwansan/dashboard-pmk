'use client';

import React, { useState, useRef } from 'react';
import { Logo } from '@/components/atoms/Logo';
import { PillButton } from '@/components/atoms/PillButton';
import { LayerType, PillarId } from '@/types/dashboard';
import {
  Database,
  ChevronDown,
  GraduationCap,
  HeartPulse,
  ShieldAlert,
  TrendingDown,
  Check,
} from 'lucide-react';

interface NavbarProps {
  currentLayer: LayerType;
  selectedPillar: PillarId;
  onSelectLayer1: () => void;
  onSelectPillar: (pillarId: PillarId) => void;
  onSelectMasterData: () => void;
}

interface PillarNavItem {
  id: PillarId;
  label: string;
  icon: React.ReactNode;
  desc: string;
}

const PILLARS_NAV: PillarNavItem[] = [
  {
    id: 'pendidikan',
    label: 'Pendidikan',
    icon: <GraduationCap className="h-4 w-4 text-blue-600" />,
    desc: 'Revitalisasi Sekolah, SNT, SUG, IFP & IMM',
  },
  {
    id: 'kesehatan',
    label: 'Kesehatan',
    icon: <HeartPulse className="h-4 w-4 text-emerald-600" />,
    desc: 'CKG, Penuntasan TB, MBG 3B & RSUD',
  },
  {
    id: 'bencana',
    label: 'Ketahanan Bencana',
    icon: <ShieldAlert className="h-4 w-4 text-[#7c3f1d]" />,
    desc: 'Huntap, Huntara & Kesiapsiagaan EWS',
  },
  {
    id: 'kemiskinan',
    label: 'Penurunan Kemiskinan',
    icon: <TrendingDown className="h-4 w-4 text-red-600" />,
    desc: 'Bansos Tepat Sasaran, Desil 1–2 DTSEN & MBG',
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentLayer,
  selectedPillar,
  onSelectLayer1,
  onSelectPillar,
  onSelectMasterData,
}) => {
  const [isPilarDropdownOpen, setIsPilarDropdownOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsPilarDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsPilarDropdownOpen(false);
    }, 200);
  };

  const selectedPillarLabel =
    PILLARS_NAV.find((p) => p.id === selectedPillar)?.label || 'Pendidikan';

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200/80 px-4 lg:px-8 py-2.5 transition-colors">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 flex-wrap lg:flex-nowrap">
        {/* Left: Brand Logos & Title */}
        <button
          type="button"
          onClick={onSelectLayer1}
          aria-label="Kembali ke Ringkasan Nasional Layer 1"
          className="text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-slate-400 rounded-lg p-1 -m-1"
        >
          <Logo />
        </button>

        {/* Center: Simplified 2-Item Nav Menu (Eksekutif & Pilar dengan Hover Dropdown) */}
        <nav
          aria-label="Navigasi Utama Dashboard"
          className="order-3 lg:order-2 w-full lg:w-auto flex items-center justify-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80"
        >
          {/* Menu 1: Eksekutif */}
          <button
            type="button"
            onClick={onSelectLayer1}
            className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              currentLayer === 'layer1'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span>Eksekutif</span>
          </button>

          {/* Menu 2: Pilar dengan Hover Dropdown */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => {
                if (currentLayer !== 'layer2') {
                  onSelectPillar(selectedPillar);
                }
                setIsPilarDropdownOpen((prev) => !prev);
              }}
              aria-haspopup="true"
              aria-expanded={isPilarDropdownOpen}
              className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                currentLayer === 'layer2'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span>Pilar</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-150 ${
                  isPilarDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Hover Floating Dropdown for Pilar Sub-Menus */}
            {isPilarDropdownOpen && (
              <div
                className="absolute left-0 top-full pt-1.5 z-50 w-72 sm:w-80 animate-in fade-in zoom-in-95 duration-100"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 text-xs">
                  <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100 mb-1 flex items-center justify-between">
                    <span>4 Pilar Prioritas Nasional</span>
                    <span className="text-[9.5px] font-semibold text-blue-600">Klik untuk telaah</span>
                  </div>
                  <div className="space-y-0.5">
                    {PILLARS_NAV.map((p) => {
                      const isCurrentPillar =
                        currentLayer === 'layer2' && selectedPillar === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            onSelectPillar(p.id);
                            setIsPilarDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                            isCurrentPillar
                              ? 'bg-blue-50 text-blue-950 font-bold border border-blue-200/80'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span className="p-1.5 rounded-md bg-white border border-slate-200 shrink-0 mt-0.5 shadow-2xs">
                              {p.icon}
                            </span>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                <span>{p.label}</span>
                                {isCurrentPillar && (
                                  <Check className="h-3.5 w-3.5 text-blue-600" />
                                )}
                              </div>
                              <div className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">
                                {p.desc}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right: Master Data DTSEN Button */}
        <div className="order-2 lg:order-3 flex items-center gap-2 ml-auto lg:ml-0">
          <PillButton
            variant="action"
            size="sm"
            active={currentLayer === 'layer3'}
            onClick={onSelectMasterData}
            icon={<Database className="h-3.5 w-3.5" />}
            className="whitespace-nowrap"
          >
            Master Data DTSEN
          </PillButton>
        </div>
      </div>
    </header>
  );
};
