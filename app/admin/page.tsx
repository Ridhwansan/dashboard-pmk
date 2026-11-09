'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import {
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

export default function AdminPortalPage() {
  const router = useRouter();
  const { user, login, isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in as admin, redirect directly to CMS
  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin) {
      router.replace('/dashboard/cms');
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username dan password administrator wajib diisi');
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await login(username.trim(), password.trim());
    setSubmitting(false);

    if (result.success) {
      // Verify session role on server
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user?.role === 'ADMIN') {
          router.replace('/dashboard/cms');
          return;
        }
      }
      setError('Akun berhasil diautentikasi tetapi tidak memiliki hak akses Administrator.');
    } else {
      setError(result.error || 'Username atau password administrator tidak valid');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between font-sans bg-slate-950 text-white selection:bg-blue-600 selection:text-white">
      {/* Background Building Image with Adjusted Contrast & Elegance (Identical to user login) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: `url('/kemenko-pmk-building.jpg')` }}
        />
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/80" />
      </div>

      {/* Top Header Branding (Identical to user login) */}
      <header className="relative z-10 w-full px-6 py-6 sm:px-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 sm:h-12 sm:w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-white/20 shadow-lg bg-white/10 backdrop-blur-md p-1">
            <Image
              src="/images/logo-kemenko-pmk-baru.png"
              alt="Logo Kemenko PMK"
              width={48}
              height={48}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <span className="block text-xs sm:text-sm font-extrabold text-white tracking-wider uppercase">
              Kemenko PMK
            </span>
            <span className="block text-[11px] sm:text-xs text-slate-300 font-medium">
              Republik Indonesia
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-slate-200 font-medium">
          <ShieldAlert className="h-4 w-4 text-blue-400" />
          <span>Portal Administrator PMK</span>
        </div>
      </header>

      {/* Central Login Card Container (Identical to user login) */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200/90 text-slate-900 animate-in fade-in zoom-in-95 duration-200">
          {/* Card Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 mb-4 shadow-2xs">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Login Administrator PMK
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Silakan masukkan akun kredensial Administrator Anda untuk mengakses Content Management System (CMS).
            </p>
          </div>

          {/* Current Non-Admin Warning if logged in as normal user */}
          {isAuthenticated && !isAdmin && (
            <div className="mb-6 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Sedang Masuk sebagai Pengguna Biasa</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Akun aktif: <strong>{user?.name}</strong>. Silakan masukkan kredensial Administrator untuk beralih dan mengakses CMS.
              </p>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-username"
                className="block text-xs font-bold text-slate-700"
              >
                Username Administrator
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="admin-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Masukkan username administrator"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold text-slate-700"
              >
                Password Administrator
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Masukkan password administrator"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memverifikasi Hak Akses...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Masuk sebagai Administrator</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Secure Note */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Area administratif ini diawasi dan dicatat dalam audit log sistem Kemenko PMK RI.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-6 text-center text-xs text-slate-400">
        Pusat Data dan Informasi (Pusdatin) Kemenko PMK RI
      </footer>
    </div>
  );
}
