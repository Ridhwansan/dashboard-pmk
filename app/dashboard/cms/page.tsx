'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { CmsAdminView } from '@/components/organisms/CmsAdminView';
import { ShieldAlert, ArrowLeft, Lock, Loader2 } from 'lucide-react';

export default function CmsPage() {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] text-slate-500 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold">Memverifikasi hak akses Administrator CMS...</p>
      </div>
    );
  }

  // Not logged in or not admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Akses CMS Khusus Administrator
            </h1>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              {!isAuthenticated
                ? 'Halaman ini khusus untuk Administrator PMK. Silakan akses portal login admin untuk mengelola indikator, visibilitas kartu, target, dan realisasi.'
                : `Akun Anda saat ini (${user?.name}) memiliki peran Pengguna biasa. Silakan login menggunakan akun Administrator.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard/eksekutif"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Pilihan Menu</span>
            </Link>

            <Link
              href="/admin"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-md hover:shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="h-4 w-4" />
              <span>Login ke Portal Admin</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated as Admin
  return <CmsAdminView />;
}
