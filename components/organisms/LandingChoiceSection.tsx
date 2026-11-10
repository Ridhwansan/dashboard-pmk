'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  BarChart3,
  Map,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  User,
  UserCircle,
  Sliders,
  LogOut,
} from 'lucide-react';
import { DASHBOARD_META } from '@/data/dashboardData';
import { useAuth } from '@/lib/useAuth';

interface LandingChoiceSectionProps {
  onSelectIkhtisar: () => void;
  onSelectProfilWilayah: () => void;
}

export const LandingChoiceSection: React.FC<LandingChoiceSectionProps> = ({
  onSelectIkhtisar,
  onSelectProfilWilayah,
}) => {
  const [meta, setMeta] = useState(DASHBOARD_META);
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    const loadMeta = async () => {
      try {
        const res = await fetch('/api/meta');
        if (res.ok) {
          const json = await res.json();
          if (active && json.data) {
            setMeta(json.data);
          }
        }
      } catch {
        // baseline fallback
      }
    };
    loadMeta();
    return () => {
      active = false;
    };
  }, []);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
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
    <div className="relative w-full max-w-5xl mx-auto py-6 sm:py-12 space-y-9 animate-in fade-in duration-300">
      {/* Discreet Frameless User Account Control (Only shown when an authorized user is logged in) */}
      {user && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-8 z-30" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
            aria-label="Menu akun pengguna"
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs ${
                user.role === 'ADMIN' ? 'bg-blue-600' : 'bg-emerald-600'
              }`}
            >
              {user.role === 'ADMIN' ? (
                <ShieldCheck className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>

            <div className="text-left hidden sm:block max-w-[150px]">
              <div className="text-xs font-bold text-white group-hover:text-white truncate">
                {user.name}
              </div>
              <div className="text-[10px] text-slate-300 font-medium leading-none mt-0.5">
                {user.role === 'ADMIN' ? 'Administrator' : 'Pengguna'}
              </div>
            </div>

            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-300 group-hover:text-white transition-transform duration-150 ${
                isUserMenuOpen ? 'rotate-180 text-white' : ''
              }`}
            />
          </button>

          {/* User Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-full pt-2 z-50 w-64 animate-in fade-in zoom-in-95 duration-100">
              <div
                role="menu"
                aria-label="Menu Pilihan Pengguna"
                className="bg-white rounded-2xl border border-slate-200 shadow-xl p-2 text-xs divide-y divide-slate-100 text-slate-900"
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

                  {/* Admin CMS Panel */}
                  {user.role === 'ADMIN' && (
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
      )}

      {/* 1. Header with Official Kemenko PMK Emblem (Navbar is removed on landing) */}
      <div className="text-center space-y-4 max-w-2xl mx-auto flex flex-col items-center">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg mb-1">
          <div className="relative h-7 w-7 sm:h-8 sm:w-8 shrink-0 overflow-hidden rounded-full shadow-xs ring-1 ring-white/30">
            <Image
              src="/images/logo-pmk-garuda.png"
              alt="Logo Kemenko PMK"
              width={32}
              height={32}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-white tracking-wider uppercase">
            Kemenko PMK
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
          {meta.title || 'Pusat Pemantauan Program Kerja Prioritas Nasional'}
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 font-medium pt-1">
          Pembaruan data: {meta.cutoffDate}
        </p>
      </div>

      {/* 2. Two Distinct Choice Cards with Generous Whitespace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* CARD 1: IKHTISAR */}
        <div
          onClick={onSelectIkhtisar}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectIkhtisar();
            }
          }}
          className="group bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-white/60 hover:border-blue-500 shadow-2xl hover:shadow-blue-500/15 transition-all duration-300 cursor-pointer flex flex-col justify-between text-left focus:outline-hidden focus:ring-4 focus:ring-blue-500/30"
        >
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
              <BarChart3 className="h-7 w-7" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-blue-900 transition-colors tracking-tight">
                Ikhtisar
              </h2>

              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Pemantauan terpadu target, capaian realisasi, dan kendala pada 4 pilar pembangunan.
              </p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-end">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all group-hover:translate-x-1">
              <span>Buka Ikhtisar</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* CARD 2: PROFIL WILAYAH */}
        <div
          onClick={onSelectProfilWilayah}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectProfilWilayah();
            }
          }}
          className="group bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-white/60 hover:border-emerald-500 shadow-2xl hover:shadow-emerald-500/15 transition-all duration-300 cursor-pointer flex flex-col justify-between text-left focus:outline-hidden focus:ring-4 focus:ring-emerald-500/30"
        >
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200">
              <Map className="h-7 w-7" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-emerald-900 transition-colors tracking-tight">
                PKPN Wilayah
              </h2>

              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Peta interaktif geospasial 38 provinsi serta profil capaian kinerja per wilayah.
              </p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-end">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all group-hover:translate-x-1">
              <span>Buka PKPN Wilayah</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
