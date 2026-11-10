'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserSession } from '@/lib/useAuth';
import {
  X,
  User,
  ShieldCheck,
  Mail,
  AtSign,
  KeyRound,
  Sliders,
  LogOut,
  CheckCircle2,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserSession | null;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const isAdmin = user.role === 'ADMIN';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-dialog-title"
      >
        {/* Header with PMK branding */}
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 text-white text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup modal profil"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex justify-center mb-3">
            <div className="p-1 bg-white/10 backdrop-blur-md rounded-full ring-1 ring-white/20 shadow-inner w-12 h-12 flex items-center justify-center overflow-hidden">
              <Image
                src="/images/logo-pmk-garuda.png"
                alt="Logo Kemenko PMK"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h3 id="profile-dialog-title" className="text-lg font-extrabold tracking-tight">
            Profil Pengguna
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Informasi identitas akun dan hak akses sistem PMK
          </p>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-5">
          {/* User Hero Banner */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-xs shrink-0 ${
                isAdmin ? 'bg-blue-600' : 'bg-emerald-600'
              }`}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-base font-bold text-slate-900 truncate">{user.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isAdmin
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {isAdmin ? (
                    <ShieldCheck className="h-3 w-3" />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                  <span>{isAdmin ? 'Administrator' : 'Pengguna Eksekutif'}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Aktif</span>
                </span>
              </div>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center gap-2.5 text-slate-600">
                <AtSign className="h-4 w-4 text-slate-400" />
                <span className="font-medium">Username</span>
              </div>
              <span className="font-bold text-slate-900 font-mono">@{user.username}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="font-medium">Email Dinas</span>
              </div>
              <span className="font-semibold text-slate-900">
                {user.email || `${user.username}@kemenkopmk.go.id`}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center gap-2.5 text-slate-600">
                <KeyRound className="h-4 w-4 text-slate-400" />
                <span className="font-medium">Otoritas Akses</span>
              </div>
              <span className="font-semibold text-slate-900 text-right">
                {isAdmin ? 'CMS & Pengelolaan Data' : 'Pemantauan Eksekutif'}
              </span>
            </div>
          </div>

          {/* Quick CMS Link if Admin */}
          {isAdmin && (
            <Link
              href="/dashboard/cms"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 text-blue-900 transition-colors text-xs font-semibold cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="h-4 w-4 text-blue-600" />
                <span>Buka Panel CMS Pengelolaan Data</span>
              </div>
              <span className="text-[11px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                Akses &rarr;
              </span>
            </Link>
          )}

          {/* Footer Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

