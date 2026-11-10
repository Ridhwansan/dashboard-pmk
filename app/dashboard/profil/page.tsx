'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import {
  ArrowLeft,
  User,
  ShieldCheck,
  Mail,
  AtSign,
  KeyRound,
  Sliders,
  LogOut,
  CheckCircle2,
  Check,
  Loader2,
  AlertCircle,
  Building,
} from 'lucide-react';

const ROLE_DISPLAY_NAMES: Record<string, { label: string; badgeBg: string; textCol: string }> = {
  ADMIN: { label: 'Administrator PMK', badgeBg: 'bg-blue-100 border-blue-200', textCol: 'text-blue-800' },
  MENKO: { label: 'Menteri Koordinator (Menko PMK)', badgeBg: 'bg-amber-100 border-amber-200', textCol: 'text-amber-800' },
  ESELON_1: { label: 'Pejabat Eselon I / Deputi', badgeBg: 'bg-indigo-100 border-indigo-200', textCol: 'text-indigo-800' },
  ESELON_2: { label: 'Pejabat Eselon II / Asdep', badgeBg: 'bg-cyan-100 border-cyan-200', textCol: 'text-cyan-800' },
  USER: { label: 'Pengguna Eksekutif', badgeBg: 'bg-emerald-100 border-emerald-200', textCol: 'text-emerald-800' },
};

export default function ProfilPage() {
  const router = useRouter();
  const { user, isAdmin, logout, loading, refresh } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state once user is loaded
  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email || `${user.username}@kemenkopmk.go.id`);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (newPassword && newPassword.length < 6) {
      setErrorMessage('Password baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!user) return;
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          ...(newPassword ? { password: newPassword.trim() } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui profil.');
      }

      setSuccessMessage('Profil dan kredensial akun berhasil diperbarui.');
      setNewPassword('');
      setConfirmPassword('');
      await refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span>Memuat data profil akun...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Sesi Telah Berakhir</h2>
          <p className="text-xs text-slate-500">Silakan login kembali untuk mengakses profil Anda.</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center h-10 px-6 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
          >
            Menuju Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  const roleMeta = ROLE_DISPLAY_NAMES[user.role] || {
    label: user.role,
    badgeBg: 'bg-slate-100 border-slate-200',
    textCol: 'text-slate-800',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased pb-16">
      {/* Top Bar Header */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/eksekutif"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Dashboard</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-kemenko-pmk-baru.png"
              alt="Logo Kemenko PMK"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="text-xs font-extrabold text-slate-800 tracking-tight hidden sm:inline">
              Kemenko PMK
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 font-medium flex items-center gap-2">
          <Link href="/dashboard/eksekutif" className="hover:text-slate-800 transition-colors">
            Dashboard Eksekutif
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Profil Pengguna</span>
        </nav>

        {/* Hero Card: Identity Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-md shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                    {user.name}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleMeta.badgeBg} ${roleMeta.textCol}`}
                  >
                    {user.role === 'ADMIN' ? (
                      <ShieldCheck className="h-3.5 w-3.5" />
                    ) : (
                      <User className="h-3.5 w-3.5" />
                    )}
                    <span>{roleMeta.label}</span>
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                  <span className="font-mono">@{user.username}</span>
                  <span>&bull;</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Akun Aktif</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              {isAdmin && (
                <Link
                  href="/dashboard/cms"
                  className="h-10 px-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs inline-flex items-center gap-2 border border-blue-200/80 transition-colors"
                >
                  <Sliders className="h-4 w-4" />
                  <span>Panel CMS</span>
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="h-10 px-4 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs inline-flex items-center gap-2 border border-rose-200/80 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs font-semibold text-emerald-800 animate-in fade-in duration-200">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs font-semibold text-rose-800 animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Account Details Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Informasi Kedinasan
              </h2>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <AtSign className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">Username</span>
                  </div>
                  <span className="font-bold text-slate-900 font-mono">@{user.username}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <Building className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">Instansi</span>
                  </div>
                  <span className="font-semibold text-slate-900">Kemenko PMK</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">Email Kedinasan</span>
                  </div>
                  <span className="font-semibold text-slate-900 truncate max-w-[180px]">
                    {user.email || `${user.username}@kemenkopmk.go.id`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <KeyRound className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">Hak Otoritas</span>
                  </div>
                  <span className="font-semibold text-slate-900 text-right">
                    {user.role === 'ADMIN' ? 'Akses Penuh CMS' : 'Pemantauan Eksekutif'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Update Profile & Password Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Pengaturan Data Pribadi & Kredensial</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Perbarui nama lengkap, alamat email kedinasan, atau ganti kata sandi akun Anda.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nama Lengkap <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Kedinasan
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 mb-3">
                    Ubah Password (Kosongkan bila tidak ingin mengganti)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Password Baru
                      </label>
                      <input
                        type="password"
                        placeholder="Minimal 6 karakter"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Konfirmasi Password Baru
                      </label>
                      <input
                        type="password"
                        placeholder="Ulangi password baru"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-colors disabled:bg-slate-300"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Menyimpan Perubahan...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 stroke-[2]" />
                        <span>Simpan Perubahan Akun</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

