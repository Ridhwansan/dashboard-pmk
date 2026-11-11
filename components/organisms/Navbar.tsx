'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/atoms/Logo';
import { LayerType, PillarId } from '@/types/dashboard';
import { useAuth } from '@/lib/useAuth';
import {
  BarChart3,
  Map,
  ChevronDown,
  Sliders,
  LogOut,
  User,
  LogIn,
  ShieldCheck,
  UserCircle,
} from 'lucide-react';

interface NavbarProps {
  currentLayer?: LayerType;
  selectedPillar?: PillarId;
  onSelectLayer1?: () => void;
  onSelectPillar?: (pillarId: PillarId) => void;
  onSelectMasterData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedPillar: propSelectedPillar,
  onSelectLayer1,
  onSelectPillar,
}) => {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view');
  const pillarParam = (searchParams.get('pillar') as PillarId) || null;

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Active state determinations
  const isIkhtisarActive =
    currentView === 'ikhtisar' || pathname.startsWith('/dashboard/pilar');
  const isProfilWilayahActive = currentView === 'profil-wilayah';

  // Close dropdowns on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200/80 px-4 lg:px-8 h-16 transition-colors shadow-2xs flex items-center">
        <div className="max-w-[1600px] mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-4 w-full h-full">
          {/* 1. Left: Brand Logo & Title */}
          <div className="flex items-center justify-start shrink-0">
            <Link
              href="/dashboard/eksekutif"
              onClick={() => {
                setIsUserMenuOpen(false);
                onSelectLayer1?.();
              }}
              aria-label="Kembali ke Halaman Pilihan Dashboard"
              className="text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-slate-400 rounded-lg p-1 -m-1"
            >
              <Logo />
            </Link>
          </div>

          {/* 2. Center: Navigation Menus (True Precision Grid Center - No Dropdown) */}
          <div className="flex items-center justify-center">
            <nav
              aria-label="Navigasi Utama Dashboard"
              className="flex items-center gap-1 sm:gap-2 shrink-0"
            >
              {/* Menu 1: Ikhtisar (Direct Link - No Dropdown) */}
              <Link
                href="/dashboard/eksekutif?view=ikhtisar"
                onClick={() => {
                  setIsUserMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
                  isIkhtisarActive
                    ? 'text-blue-600 font-bold bg-blue-50/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <BarChart3 className={`h-4 w-4 ${isIkhtisarActive ? 'text-blue-600' : 'text-slate-500'}`} />
                <span>Ikhtisar</span>
              </Link>

              {/* Menu 2: PKPN Wilayah */}
              <Link
                href="/dashboard/eksekutif?view=profil-wilayah"
                onClick={() => {
                  setIsUserMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
                  isProfilWilayahActive
                    ? 'text-blue-600 font-bold bg-blue-50/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Map className={`h-4 w-4 ${isProfilWilayahActive ? 'text-blue-600' : 'text-slate-500'}`} />
                <span>PKPN Wilayah</span>
              </Link>
            </nav>
          </div>

          {/* 3. Right: Logged-in Account (Frameless - No Card Wrapper) */}
          <div className="flex items-center justify-end shrink-0" ref={userMenuRef}>
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  aria-label="Menu akun pengguna"
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100/80 transition-colors cursor-pointer group"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs ${
                      isAdmin ? 'bg-blue-600' : 'bg-emerald-600'
                    }`}
                  >
                    {isAdmin ? (
                      <ShieldCheck className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>

                  <div className="text-left hidden sm:block max-w-[150px]">
                    <div className="text-xs font-bold text-slate-800 group-hover:text-slate-900 truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">
                      {isAdmin ? 'Administrator' : 'Pengguna'}
                    </div>
                  </div>

                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-150 ${
                      isUserMenuOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>

                {/* User Dropdown Menu with 2 Main Choices: Profil & Logout */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full pt-2 z-50 w-64 animate-in fade-in zoom-in-95 duration-100">
                    <div
                      role="menu"
                      aria-label="Menu Pilihan Pengguna"
                      className="bg-white rounded-2xl border border-slate-200 shadow-xl p-2 text-xs divide-y divide-slate-100"
                    >
                      {/* Dropdown Header: Account Overview */}
                      <div className="p-2.5 pb-3">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Akun Terhubung
                        </p>
                        <p className="text-sm font-extrabold text-slate-900 truncate mt-0.5">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate font-mono">
                          @{user.username}
                        </p>
                      </div>

                      {/* Dropdown Action Items */}
                      <div className="py-1.5 space-y-1">
                        {/* Option 1: Profil */}
                        <Link
                          href="/dashboard/profil"
                          role="menuitem"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-semibold transition-colors cursor-pointer"
                        >
                          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                            <UserCircle className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800">Profil</div>
                            <div className="text-[11px] text-slate-500 font-normal">
                              Rincian identitas & akun
                            </div>
                          </div>
                        </Link>

                        {/* Admin CMS Panel (Only for Admin, inside profile dropdown) */}
                        {isAdmin && (
                          <Link
                            href="/dashboard/cms"
                            role="menuitem"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-blue-700 hover:bg-blue-50 font-semibold transition-colors cursor-pointer"
                          >
                            <div className="p-1.5 rounded-lg bg-blue-100/70 text-blue-700">
                              <Sliders className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-blue-900">
                                Panel CMS Admin
                              </div>
                              <div className="text-[11px] text-blue-600 font-normal">
                                Kelola kartu & indikator
                              </div>
                            </div>
                          </Link>
                        )}
                      </div>

                      {/* Option 2: Logout */}
                      <div className="pt-1.5">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-semibold transition-colors cursor-pointer"
                        >
                          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                            <LogOut className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-rose-700">Logout</div>
                            <div className="text-[11px] text-rose-500 font-normal">
                              Keluar dari sesi ini
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </header>
    </>
  );
};
