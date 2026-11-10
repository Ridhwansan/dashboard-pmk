'use client';

import React, { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/organisms/Navbar';
import { useAuth } from '@/lib/useAuth';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const view = searchParams.get('view');

  // Dedicated full-page layout for CMS with back-office sidebar
  const isCms = pathname.startsWith('/dashboard/cms');

  // Guard: Hanya proteksi CMS (wajib login Administrator)
  useEffect(() => {
    if (!authLoading && isCms && !isAuthenticated) {
      router.replace('/admin');
    }
  }, [authLoading, isAuthenticated, isCms, router]);

  if (isCms) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased">
        {children}
      </div>
    );
  }

  // Front / Landing page is active when on /dashboard/eksekutif without ?view parameter (or ?view=landing)
  const isFrontPage =
    (pathname === '/dashboard/eksekutif' || pathname === '/dashboard') &&
    (!view || view === 'landing');

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        isFrontPage ? 'relative bg-slate-950 text-white' : 'bg-slate-50/60 text-slate-900'
      }`}
    >
      {/* Background Image for Front Page (Building Photo with Adjusted Brightness Overlay) */}
      {isFrontPage && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
            style={{ backgroundImage: `url('/kemenko-pmk-building.jpg')` }}
          />
          {/* Adjusted Brightness & Elegance Overlay */}
          <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[1.5px]" />
          {/* Subtle gradient depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/70" />
        </div>
      )}

      {/* 1. Top Navbar (Hidden on Front / Landing Page) */}
      {!isFrontPage && <Navbar />}

      {/* 2. Main Dashboard Content Area */}
      <div
        className={`w-full flex-1 flex flex-col ${
          isFrontPage ? 'relative z-10 px-4' : 'px-4 lg:px-8'
        }`}
      >
        <main
          className={`flex-1 w-full max-w-[1600px] mx-auto ${
            isFrontPage ? 'flex flex-col justify-center py-10 sm:py-16' : 'pt-5 sm:pt-6 pb-10'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 font-semibold text-sm">
          Memuat Dashboard PMK...
        </div>
      }
    >
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
