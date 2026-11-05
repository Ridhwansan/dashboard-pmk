'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/atoms/Logo';
import { LayerType, PillarId } from '@/types/dashboard';
import {
  ChevronDown,
  GraduationCap,
  HeartPulse,
  ShieldAlert,
  TrendingDown,
  Check,
  LayoutGrid,
  BarChart3,
  Map,
} from 'lucide-react';

interface NavbarProps {
  currentLayer?: LayerType;
  selectedPillar?: PillarId;
  onSelectLayer1?: () => void;
  onSelectPillar?: (pillarId: PillarId) => void;
  onSelectMasterData?: () => void;
}

interface PillarNavItem {
  id: PillarId;
  label: string;
  icon: React.ReactNode;
}

const PILLARS_NAV: PillarNavItem[] = [
  {
    id: 'pendidikan',
    label: 'Pendidikan',
    icon: <GraduationCap className="h-4 w-4 text-blue-600" />,
  },
  {
    id: 'kesehatan',
    label: 'Kesehatan',
    icon: <HeartPulse className="h-4 w-4 text-emerald-600" />,
  },
  {
    id: 'bencana',
    label: 'Kebencanaan',
    icon: <ShieldAlert className="h-4 w-4 text-pillar-bencana" style={{ color: '#7a4b27' }} />,
  },
  {
    id: 'kemiskinan',
    label: 'Penurunan Kemiskinan',
    icon: <TrendingDown className="h-4 w-4 text-rose-600" />,
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentLayer: propCurrentLayer,
  selectedPillar: propSelectedPillar,
  onSelectLayer1,
  onSelectPillar,
  onSelectMasterData,
}) => {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view');
  const pillarParam = (searchParams.get('pillar') as PillarId) || null;

  const [isPilarDropdownOpen, setIsPilarDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Derive active states
  const isLandingActive =
    pathname === '/dashboard/eksekutif' && (!currentView || currentView === 'landing');
  const isIkhtisarActive =
    currentView === 'ikhtisar' || pathname.startsWith('/dashboard/pilar');
  const isProfilWilayahActive = currentView === 'profil-wilayah';

  // Extract active pillar
  const pathPillarSegment = pathname.startsWith('/dashboard/pilar/')
    ? (pathname.split('/')[3] as PillarId)
    : null;
  const currentPillarId: PillarId =
    pillarParam || pathPillarSegment || propSelectedPillar || 'pendidikan';

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsPilarDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPilarDropdownOpen(false);
      }
    };

    if (isPilarDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPilarDropdownOpen]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 w-full">
        {/* Left: Brand Logos & Title */}
        <Link
          href="/dashboard/eksekutif"
          onClick={() => {
            setIsPilarDropdownOpen(false);
            onSelectLayer1?.();
          }}
          aria-label="Kembali ke Halaman Pilihan Dashboard"
          className="text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-slate-400 rounded-lg p-1 -m-1 shrink-0"
        >
          <Logo />
        </Link>

        {/* Right: Clean, Well-Spaced 3-Item Nav Menu */}
        <nav
          aria-label="Navigasi Utama Dashboard"
          className="flex items-center gap-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shrink-0"
        >
          {/* Menu 1: Pilihan Menu */}
          <Link
            href="/dashboard/eksekutif"
            onClick={() => {
              setIsPilarDropdownOpen(false);
              onSelectLayer1?.();
            }}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-150 cursor-pointer flex items-center gap-2 ${
              isLandingActive
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <LayoutGrid className="h-4 w-4 text-slate-500" />
            <span className="hidden sm:inline">Pilihan Menu</span>
            <span className="sm:hidden">Menu</span>
          </Link>

          {/* Menu 2: Ikhtisar dengan Dropdown Terintegrasi */}
          <div ref={dropdownRef} className="relative">
            <div
              className={`inline-flex items-center rounded-xl transition-all duration-150 ${
                isIkhtisarActive
                  ? 'bg-white text-blue-900 shadow-2xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Link
                href="/dashboard/eksekutif?view=ikhtisar"
                onClick={() => setIsPilarDropdownOpen(false)}
                className="pl-3.5 sm:pl-4 pr-1.5 py-2 text-xs md:text-sm font-semibold flex items-center gap-2 cursor-pointer"
              >
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span>Ikhtisar</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsPilarDropdownOpen((prev) => !prev)}
                aria-expanded={isPilarDropdownOpen}
                aria-haspopup="true"
                aria-label="Buka pilihan tab pilar"
                className="pr-3 pl-1 py-2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-150 ${
                    isPilarDropdownOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>
            </div>

            {/* Dropdown for Pilar Sub-Menus */}
            {isPilarDropdownOpen && (
              <div className="absolute right-0 left-auto top-full pt-2 z-50 w-56 sm:w-60 max-w-[calc(100vw-2rem)] animate-in fade-in zoom-in-95 duration-100">
                <div role="menu" aria-label="Pilihan Tab Pilar" className="bg-white rounded-xl border border-slate-200 shadow-xl p-2 text-xs space-y-1">
                  {PILLARS_NAV.map((p) => {
                    const isCurrentPillar =
                      isIkhtisarActive && currentPillarId === p.id;
                    return (
                      <Link
                        key={p.id}
                        href={`/dashboard/eksekutif?view=ikhtisar&pillar=${p.id}`}
                        onClick={() => {
                          setIsPilarDropdownOpen(false);
                          onSelectPillar?.(p.id);
                        }}
                        role="menuitem"
                        className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                          isCurrentPillar
                            ? 'bg-blue-50 text-blue-950 font-bold border border-blue-200/80'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="p-1 rounded-md bg-white border border-slate-200 shrink-0">
                            {p.icon}
                          </span>
                          <span className="font-semibold text-xs text-slate-900 truncate">
                            {p.label}
                          </span>
                        </div>
                        {isCurrentPillar && (
                          <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Menu 3: PKPN Wilayah */}
          <Link
            href="/dashboard/eksekutif?view=profil-wilayah"
            onClick={() => setIsPilarDropdownOpen(false)}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-150 cursor-pointer flex items-center gap-2 ${
              isProfilWilayahActive
                ? 'bg-white text-emerald-950 shadow-2xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Map className="h-4 w-4 text-emerald-600" />
            <span>PKPN Wilayah</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};
