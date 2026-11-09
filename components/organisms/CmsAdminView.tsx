'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  HeartPulse,
  ShieldAlert,
  TrendingDown,
  Layers,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  RotateCcw,
  ArrowLeft,
  Check,
  Loader2,
  Calculator,
  ExternalLink,
  Search,
  LogOut,
  Menu,
  X,
  Copy,
  Sliders,
  ChevronRight,
  Hash,
  Type,
} from 'lucide-react';
import { CmsCardItem } from '@/types/cms';
import { calculatePercentage, parseMetricNumber } from '@/lib/calcPercent';
import { useAuth } from '@/lib/useAuth';
import { setClientCardsCache } from '@/lib/useCmsCards';

type PillarTab = 'all' | 'pendidikan' | 'kesehatan' | 'bencana' | 'kemiskinan';
type CategoryFilter = 'all' | 'PKPN' | 'Isu Strategis';
type CmsViewMode = 'list' | 'create' | 'edit' | 'metadata';

interface PillarNavConfig {
  id: PillarTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PILLAR_NAV_CONFIGS: PillarNavConfig[] = [
  { id: 'all', label: 'Semua Pilar', icon: Layers },
  { id: 'pendidikan', label: 'Pendidikan', icon: GraduationCap },
  { id: 'kesehatan', label: 'Kesehatan', icon: HeartPulse },
  { id: 'bencana', label: 'Kebencanaan', icon: ShieldAlert },
  { id: 'kemiskinan', label: 'Penurunan Kemiskinan', icon: TrendingDown },
];

export const CmsAdminView: React.FC = () => {
  const { user, logout } = useAuth();

  const [cards, setCards] = useState<CmsCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPillar, setSelectedPillar] = useState<PillarTab>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // View mode navigation (Replaces modals completely)
  const [viewMode, setViewMode] = useState<CmsViewMode>('list');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Dashboard Metadata state
  const [metadata, setMetadata] = useState({
    title: 'Pusat Pemantauan Program Kerja Prioritas Nasional',
    subtitle: 'Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan',
    cutoffDate: '14 Oktober 2026',
    ministerTitle: 'Menteri Koordinator Bidang Pembangunan Manusia dan Kebudayaan',
  });
  const [isSavingMeta, setIsSavingMeta] = useState(false);

  // Form state for Create / Edit
  const [formData, setFormData] = useState<{
    id?: string;
    slug?: string;
    pillarId: CmsCardItem['pillarId'];
    category: CmsCardItem['category'];
    title: string;
    value: string;
    unit: string;
    status: string;
    target: string;
    subtext: string;
    description: string;
    picKementerian: string;
    isActive: boolean;
  }>({
    pillarId: 'pendidikan',
    category: 'PKPN',
    title: '',
    value: '',
    unit: '',
    status: 'Realisasi 2026',
    target: '',
    subtext: '',
    description: '',
    picKementerian: '',
    isActive: true,
  });

  // Data format state: 'number' (angka/numerik) vs 'text' (tulisan/kualitatif)
  const [valueFormat, setValueFormat] = useState<'number' | 'text'>('number');
  const [targetFormat, setTargetFormat] = useState<'number' | 'text'>('number');

  // Detect whether a metric string is numeric or qualitative text
  const detectMetricFormat = (
    val: string | null | undefined,
    defaultForEmpty: 'number' | 'text' = 'number'
  ): 'number' | 'text' => {
    if (!val || val.trim() === '') return defaultForEmpty;
    const trimmed = val.trim();
    if (trimmed === '—' || trimmed === '-') return 'text';
    if (
      /belum ditetapkan|tahap|harmonisasi|berproses|menunggu|inventarisasi|terhenti|nihil|persiapan/i.test(
        trimmed
      )
    ) {
      return 'text';
    }
    const parsed = parseMetricNumber(trimmed);
    return parsed !== null ? 'number' : 'text';
  };

  const handleValueFormatChange = (newFormat: 'number' | 'text') => {
    setValueFormat(newFormat);
    if (newFormat === 'text') {
      if (!formData.value || formData.value === '0') {
        setFormData((prev) => ({ ...prev, value: '—' }));
      }
    } else {
      if (formData.value === '—' || parseMetricNumber(formData.value) === null) {
        setFormData((prev) => ({ ...prev, value: '' }));
      }
    }
  };

  const handleTargetFormatChange = (newFormat: 'number' | 'text') => {
    setTargetFormat(newFormat);
    if (newFormat === 'text') {
      if (!formData.target) {
        setFormData((prev) => ({ ...prev, target: 'Target: Belum Ditetapkan' }));
      }
    } else {
      if (
        formData.target === 'Target: Belum Ditetapkan' ||
        formData.target === '—' ||
        parseMetricNumber(formData.target) === null
      ) {
        setFormData((prev) => ({ ...prev, target: '' }));
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch cards from API
  const fetchAllCards = async () => {
    try {
      const res = await fetch('/api/cards', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setCards(json.data);
          setClientCardsCache(json.data);
        }
      }
    } catch {
      // offline/fallback
    } finally {
      setLoading(false);
    }
  };

  // Fetch metadata
  const fetchMetadata = async () => {
    try {
      const res = await fetch('/api/meta', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setMetadata(json.data);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const [cardsRes, metaRes] = await Promise.all([
          fetch('/api/cards', { cache: 'no-store' }),
          fetch('/api/meta', { cache: 'no-store' }),
        ]);
        if (cardsRes.ok && active) {
          const cardsJson = await cardsRes.json();
          if (cardsJson.data && Array.isArray(cardsJson.data)) {
            setCards(cardsJson.data);
            setClientCardsCache(cardsJson.data);
          }
        }
        if (metaRes.ok && active) {
          const metaJson = await metaRes.json();
          if (metaJson.data) {
            setMetadata(metaJson.data);
          }
        }
      } catch {
        // fallback
      } finally {
        if (active) setLoading(false);
      }
    };
    init();
    return () => {
      active = false;
    };
  }, []);

  // Save metadata
  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMeta(true);
    try {
      const res = await fetch('/api/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      });
      if (res.ok) {
        showToast('Metadata dashboard berhasil diperbarui');
        setViewMode('list');
      } else {
        alert('Gagal menyimpan metadata');
      }
    } catch {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setIsSavingMeta(false);
    }
  };

  // Toggle card visibility
  const handleToggleActive = async (card: CmsCardItem) => {
    const updatedStatus = !card.isActive;
    const newCards = cards.map((c) => (c.id === card.id ? { ...c, isActive: updatedStatus } : c));
    setCards(newCards);
    setClientCardsCache(newCards);

    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updatedStatus }),
      });
      if (res.ok) {
        showToast(`Indikator "${card.title}" ${updatedStatus ? 'ditampilkan' : 'disembunyikan'}`);
      } else {
        fetchAllCards();
      }
    } catch {
      fetchAllCards();
    }
  };

  // Delete card
  const handleDeleteCard = async (card: CmsCardItem) => {
    if (!confirm(`Hapus indikator "${card.title}" dari database?`)) return;

    const previousCards = [...cards];
    const newCards = cards.filter((c) => c.id !== card.id);
    setCards(newCards);
    setClientCardsCache(newCards);

    try {
      const res = await fetch(`/api/cards/${card.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Indikator "${card.title}" telah dihapus`);
      } else {
        setCards(previousCards);
        setClientCardsCache(previousCards);
        alert('Gagal menghapus indikator');
      }
    } catch {
      setCards(previousCards);
      setClientCardsCache(previousCards);
      alert('Terjadi gangguan jaringan');
    }
  };

  // Reset to default seed
  const handleResetDefault = async () => {
    if (!confirm('Sinkronisasi ulang seluruh 28 kartu resmi ke database? Perubahan kustom akan ditimpa.')) return;
    try {
      setLoading(true);
      const res = await fetch('/api/cards/reset', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setCards(json.data);
        setClientCardsCache(json.data);
        showToast('28 data master resmi berhasil disinkronisasi');
      }
    } catch {
      alert('Gagal mereset data');
    } finally {
      setLoading(false);
    }
  };

  // Open Create View
  const openCreateView = () => {
    const defaultPillar = selectedPillar !== 'all' ? selectedPillar : 'pendidikan';
    const defaultCategory = selectedCategory !== 'all' ? selectedCategory : 'PKPN';
    const isIsuStrategis = defaultCategory === 'Isu Strategis';

    setValueFormat(isIsuStrategis ? 'text' : 'number');
    setTargetFormat(isIsuStrategis ? 'text' : 'number');

    setFormData({
      pillarId: defaultPillar,
      category: defaultCategory,
      title: '',
      value: isIsuStrategis ? '—' : '',
      unit: '',
      status: isIsuStrategis ? 'Menunggu Data Realisasi' : 'Realisasi 2026',
      target: isIsuStrategis ? 'Target: Belum Ditetapkan' : '',
      subtext: '',
      description: '',
      picKementerian: '',
      isActive: true,
    });
    setEditingCardId(null);
    setViewMode('create');
  };

  // Open Edit View
  const openEditView = (card: CmsCardItem) => {
    setEditingCardId(card.id);
    setValueFormat(detectMetricFormat(card.value, 'text'));
    setTargetFormat(detectMetricFormat(card.target, 'text'));

    setFormData({
      id: card.id,
      slug: card.slug,
      pillarId: card.pillarId,
      category: card.category,
      title: card.title,
      value: card.value,
      unit: card.unit || '',
      status: card.status,
      target: card.target,
      subtext: card.subtext || '',
      description: card.description || '',
      picKementerian: card.picKementerian || '',
      isActive: card.isActive,
    });
    setViewMode('edit');
  };

  // Template pre-fill handler
  const handleSelectTemplate = (slugOrId: string) => {
    if (!slugOrId) return;
    const templateCard = cards.find((c) => c.slug === slugOrId || c.id === slugOrId);
    if (!templateCard) return;

    setValueFormat(detectMetricFormat(templateCard.value, 'text'));
    setTargetFormat(detectMetricFormat(templateCard.target, 'text'));

    setFormData((prev) => ({
      ...prev,
      pillarId: templateCard.pillarId,
      category: templateCard.category,
      title: `${templateCard.title} (Salinan)`,
      value: templateCard.value,
      unit: templateCard.unit || '',
      status: templateCard.status,
      target: templateCard.target,
      subtext: templateCard.subtext || '',
      description: templateCard.description || '',
      picKementerian: templateCard.picKementerian || '',
      isActive: templateCard.isActive,
    }));
    showToast(`Data disalin dari "${templateCard.title}"`);
  };

  // Save Form (Create or Update)
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Judul indikator / program wajib diisi');
      return;
    }

    const computedPercent =
      valueFormat === 'number' && targetFormat === 'number' ? formLivePercentage : null;

    const payload = {
      ...formData,
      percent: computedPercent,
    };

    setIsSaving(true);
    try {
      if (viewMode === 'edit' && editingCardId) {
        const res = await fetch(`/api/cards/${editingCardId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const json = await res.json();
          const updated = cards.map((c) => (c.id === editingCardId ? json.data : c));
          setCards(updated);
          setClientCardsCache(updated);
          showToast(`Indikator "${formData.title}" berhasil diperbarui`);
          setViewMode('list');
          setEditingCardId(null);
        } else {
          alert('Gagal menyimpan perubahan indikator');
        }
      } else if (viewMode === 'create') {
        const res = await fetch('/api/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const json = await res.json();
          const updated = [...cards, json.data];
          setCards(updated);
          setClientCardsCache(updated);
          showToast(`Indikator baru "${formData.title}" berhasil ditambahkan`);
          setViewMode('list');
        } else {
          alert('Gagal menambahkan indikator baru');
        }
      }
    } catch {
      alert('Terjadi kesalahan jaringan saat menyimpan data');
    } finally {
      setIsSaving(false);
    }
  };

  // Live percentage calculation in form
  const formLivePercentage =
    valueFormat === 'text' || targetFormat === 'text'
      ? null
      : calculatePercentage(formData.value, formData.target);

  // Filtered cards list
  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      if (selectedPillar !== 'all' && c.pillarId !== selectedPillar) return false;
      if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchValue = c.value.toLowerCase().includes(q);
        const matchTarget = c.target.toLowerCase().includes(q);
        const matchPic = (c.picKementerian || '').toLowerCase().includes(q);
        return matchTitle || matchValue || matchTarget || matchPic;
      }
      return true;
    });
  }, [cards, selectedPillar, selectedCategory, searchQuery]);

  // Pillar counts
  const pillarCounts = useMemo(() => {
    const counts: Record<PillarTab, number> = {
      all: cards.length,
      pendidikan: cards.filter((c) => c.pillarId === 'pendidikan').length,
      kesehatan: cards.filter((c) => c.pillarId === 'kesehatan').length,
      bencana: cards.filter((c) => c.pillarId === 'bencana').length,
      kemiskinan: cards.filter((c) => c.pillarId === 'kemiskinan').length,
    };
    return counts;
  }, [cards]);

  // Stats for the active view
  const stats = useMemo(() => {
    const total = filteredCards.length;
    const active = filteredCards.filter((c) => c.isActive).length;
    const hidden = total - active;
    return { total, active, hidden };
  }, [filteredCards]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-900 antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs font-semibold animate-in slide-in-from-bottom-2 duration-150">
          <Check className="h-4 w-4 text-[#4F83CC] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. SLATE CMS SIDEBAR (Sticky Navigation, Always Visible On Scroll) */}
      {/* =================================================================== */}
      <aside className="w-full md:w-72 bg-[#0f172a] text-slate-200 flex flex-col shrink-0 border-r border-slate-800/80 md:sticky md:top-0 md:h-screen md:max-h-screen z-40">
        {/* Sidebar Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4F83CC] flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
              PMK
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white leading-tight">
                CMS Kemenko PMK
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Panel Administrasi PKPN
              </div>
            </div>
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Admin Profile Box */}
        <div className="p-4 mx-4 my-4 bg-slate-800/50 rounded-xl border border-slate-700/60 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#4F83CC] text-white font-bold text-xs flex items-center justify-center shrink-0">
            AP
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">
              {user?.name || 'Administrator PMK'}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                ADMINISTRATOR
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <div className={`flex-1 px-4 space-y-6 overflow-y-auto min-h-0 ${mobileSidebarOpen ? 'block' : 'hidden md:block'}`}>
          {/* Group 1: Pilar Indikator */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Kelola Indikator Pilar
            </div>

            {PILLAR_NAV_CONFIGS.map((cfg) => {
              const Icon = cfg.icon;
              const isActive = selectedPillar === cfg.id && (viewMode === 'list' || viewMode === 'create');
              const count = pillarCounts[cfg.id];

              return (
                <button
                  key={cfg.id}
                  type="button"
                  onClick={() => {
                    setSelectedPillar(cfg.id);
                    setViewMode('list');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#4F83CC] text-white shadow-xs font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0 stroke-[1.75]" />
                    <span>{cfg.label}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      isActive ? 'bg-[#3b6eb3] text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Group 2: Pengaturan Sistem */}
          <div className="space-y-1 pt-4 border-t border-slate-800/80">
            <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Konfigurasi
            </div>

            <button
              type="button"
              onClick={() => {
                setViewMode('metadata');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'metadata'
                  ? 'bg-[#4F83CC] text-white shadow-xs font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Sliders className="h-4 w-4 shrink-0 stroke-[1.75]" />
              <span>Metadata Dashboard</span>
            </button>
          </div>

          {/* Group 3: Navigasi Luar */}
          <div className="space-y-1 pt-4 border-t border-slate-800/80">
            <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Navigasi
            </div>

            <Link
              href="/dashboard/eksekutif?view=ikhtisar"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 stroke-[1.75]" />
                <span>Lihat Dashboard Utama</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
            </Link>

            <button
              type="button"
              onClick={async () => {
                await logout();
                window.location.href = '/login';
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4 shrink-0 stroke-[1.75]" />
              <span>Keluar dari CMS</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 shrink-0">
          <div>CMS Kemenko PMK &bull; PostgreSQL</div>
        </div>
      </aside>

      {/* =================================================================== */}
      {/* 2. MAIN CMS CONTENT AREA (8pt Grid Rhythm & Exact Height Standards) */}
      {/* =================================================================== */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-100 min-h-screen">
        {/* TOP ADMINISTRATIVE HEADER BAR */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>CMS Administrator</span>
              <span>/</span>
              <span className="text-[#4F83CC] font-bold capitalize">
                {viewMode === 'metadata'
                  ? 'Metadata Dashboard'
                  : viewMode === 'create'
                  ? 'Tambah Indikator Baru'
                  : viewMode === 'edit'
                  ? 'Edit Indikator'
                  : selectedPillar === 'all'
                  ? 'Semua Pilar'
                  : `Pilar ${selectedPillar}`}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {viewMode === 'metadata'
                ? 'Pengaturan Metadata Dashboard'
                : viewMode === 'create'
                ? 'Tambah Indikator Program Baru'
                : viewMode === 'edit'
                ? `Edit: ${formData.title}`
                : `Manajemen Indikator (${stats.total} Program)`}
            </h1>
          </div>

          {/* Action Button Set (Strict 40px Height Standard for Primary Buttons) */}
          <div className="flex flex-wrap items-center gap-2">
            {viewMode === 'list' ? (
              <>
                <button
                  type="button"
                  onClick={handleResetDefault}
                  title="Sinkronisasi ulang jika data terhapus atau kosong"
                  className="h-10 px-4 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-2xs transition-colors"
                >
                  <RotateCcw className="h-4 w-4 text-slate-500 stroke-[1.75]" />
                  <span>Sinkronisasi Data Master</span>
                </button>

                <button
                  type="button"
                  onClick={openCreateView}
                  className="h-10 px-4 rounded-lg bg-[#4F83CC] hover:bg-[#3f72bb] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <Plus className="h-4 w-4 stroke-[2]" />
                  <span>Tambah Indikator Baru</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="h-10 px-4 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-2xs transition-colors"
              >
                <ArrowLeft className="h-4 w-4 stroke-[1.75]" />
                <span>Kembali ke Daftar</span>
              </button>
            )}
          </div>
        </header>

        {/* WORKSPACE CONTENT ROUTER */}
        <div className="flex-1 p-6 space-y-6">
          {/* =============================================================== */}
          {/* VIEW MODE A: LIST TABLE                                         */}
          {/* =============================================================== */}
          {viewMode === 'list' && (
            <div className="space-y-6">
              {/* Filter Tabs & Search Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Category Tabs (Clean & Solid) */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`h-8 px-3 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-[#4F83CC] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua ({cards.filter((c) => selectedPillar === 'all' || c.pillarId === selectedPillar).length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCategory('PKPN')}
                    className={`h-8 px-3 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      selectedCategory === 'PKPN'
                        ? 'bg-[#4F83CC] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    PKPN ({cards.filter((c) => (selectedPillar === 'all' || c.pillarId === selectedPillar) && c.category === 'PKPN').length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCategory('Isu Strategis')}
                    className={`h-8 px-3 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      selectedCategory === 'Isu Strategis'
                        ? 'bg-[#4F83CC] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Isu Strategis ({cards.filter((c) => (selectedPillar === 'all' || c.pillarId === selectedPillar) && c.category === 'Isu Strategis').length})
                  </button>
                </div>

                {/* Quick Search Input (40px Height) */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 stroke-[1.75]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari indikator, K/L, target..."
                    className="h-10 w-full pl-9 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    {/* Table Header: Lowered Contrast (Muted Medium Gray for Clear Data Hierarchy) */}
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4 w-12 text-center">No</th>
                        <th className="py-3 px-4 min-w-[220px]">Program / Indikator</th>
                        <th className="py-3 px-4 w-36">Pilar & Kategori</th>
                        <th className="py-3 px-4 w-36">Capaian Realisasi</th>
                        <th className="py-3 px-4 w-40">Target Kinerja</th>
                        <th className="py-3 px-4 w-24 text-center">Capaian %</th>
                        <th className="py-3 px-4 w-32 text-center">Visibilitas</th>
                        <th className="py-3 px-4 w-28 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-500">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#4F83CC] mb-2" />
                            <span>Memuat data indikator...</span>
                          </td>
                        </tr>
                      ) : filteredCards.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-500 space-y-3">
                            <p className="font-semibold">Tidak ada indikator yang sesuai kriteria pencarian.</p>
                            <button
                              type="button"
                              onClick={handleResetDefault}
                              className="h-10 px-4 rounded-lg bg-[#4F83CC] text-white font-bold text-xs hover:bg-[#3f72bb] cursor-pointer"
                            >
                              Muat Ulang 28 Data Master Resmi
                            </button>
                          </td>
                        </tr>
                      ) : (
                        filteredCards.map((card, idx) => {
                          const calculatedPct = calculatePercentage(card.value, card.target);
                          const displayPct = card.percent !== null && card.percent !== undefined ? card.percent : calculatedPct;

                          return (
                            <tr key={card.id} className="hover:bg-slate-50/80 transition-colors">
                              {/* Numbering */}
                              <td className="py-3 px-4 text-center text-slate-400 font-medium">
                                {idx + 1}
                              </td>

                              {/* Title & PIC (High Contrast Black Data) */}
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900 text-sm leading-snug">
                                  {card.title}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  PIC: <span className="text-slate-700 font-medium">{card.picKementerian || 'Kemenko PMK'}</span>
                                </div>
                              </td>

                              {/* Pilar & Category (Clean Typography - Redundant Chips Removed) */}
                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-900 capitalize text-xs">
                                  {card.pillarId}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {card.category}
                                </div>
                              </td>

                              {/* Realisasi (High Contrast Black Data) */}
                              <td className="py-3 px-4">
                                <div className="font-extrabold text-slate-900 text-sm">
                                  {card.value} {card.unit}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {card.status}
                                </div>
                              </td>

                              {/* Target */}
                              <td className="py-3 px-4">
                                <div className="text-xs font-medium text-slate-800 line-clamp-2" title={card.target}>
                                  {card.target}
                                </div>
                              </td>

                              {/* Percentage (Clean Text - Chunky Pill Removed) */}
                              <td className="py-3 px-4 text-center">
                                {displayPct !== null ? (
                                  <span className="font-bold text-slate-900 text-sm">
                                    {displayPct}%
                                  </span>
                                ) : (
                                  <span className="text-slate-300 font-medium">—</span>
                                )}
                              </td>

                              {/* Toggle Visibility (Strict 32px Height Inline Button) */}
                              <td className="py-3 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleActive(card)}
                                  title={card.isActive ? 'Klik untuk sembunyikan' : 'Klik untuk tampilkan'}
                                  className={`h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                                    card.isActive
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100/70'
                                      : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200/80'
                                  }`}
                                >
                                  {card.isActive ? (
                                    <>
                                      <Eye className="h-3.5 w-3.5 stroke-[1.75]" />
                                      <span>Tampil</span>
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="h-3.5 w-3.5 stroke-[1.75]" />
                                      <span>Sembunyi</span>
                                    </>
                                  )}
                                </button>
                              </td>

                              {/* Row Actions (Strict 32px Height Inline Buttons) */}
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => openEditView(card)}
                                    className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                    title="Edit Indikator"
                                  >
                                    <Pencil className="h-3.5 w-3.5 stroke-[1.75]" />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCard(card)}
                                    className="h-8 w-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 inline-flex items-center justify-center transition-colors cursor-pointer"
                                    title="Hapus Indikator"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 stroke-[1.75]" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer info (Concise - No Redundant Sentences) */}
                <div className="bg-slate-50/80 border-t border-slate-200 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 font-medium gap-2">
                  <div>
                    Total: <strong className="text-slate-800">{filteredCards.length}</strong> indikator
                  </div>
                  <div className="flex items-center gap-4">
                    <span>Tampil: <strong className="text-emerald-700">{stats.active}</strong></span>
                    <span>Sembunyi: <strong className="text-slate-600">{stats.hidden}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW MODE B: CREATE OR EDIT FORM (DEDICATED FULL-PAGE, NO POPUP)*/}
          {/* =============================================================== */}
          {(viewMode === 'create' || viewMode === 'edit') && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Back Button Banner */}
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="h-10 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 stroke-[1.75]" />
                  <span>Kembali ke Daftar</span>
                </button>

                <div className="text-xs font-semibold text-slate-500">
                  Mode: <span className="text-[#4F83CC] font-bold uppercase">{viewMode}</span>
                </div>
              </div>

              {/* Template Selector Box (Pre-fill with existing data) */}
              {viewMode === 'create' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <Copy className="h-4 w-4 text-[#4F83CC] stroke-[1.75]" />
                    <span>Salin dari Data yang Ada (Opsional):</span>
                  </div>
                  <select
                    onChange={(e) => handleSelectTemplate(e.target.value)}
                    className="h-10 w-full px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] cursor-pointer"
                  >
                    <option value="">-- Pilih Indikator untuk Salin Format --</option>
                    {cards.map((c) => (
                      <option key={c.id} value={c.slug || c.id}>
                        [{c.pillarId.toUpperCase()}] {c.title} — (Target: {c.target}, Realisasi: {c.value})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Main Form */}
              <form onSubmit={handleSaveForm} className="space-y-6">
                {/* Section 1: Identitas & Klasifikasi */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                    1. Identitas & Pilar Program
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Pilar Prioritas PMK <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={formData.pillarId}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            pillarId: e.target.value as CmsCardItem['pillarId'],
                          }))
                        }
                        className="h-10 w-full px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC]"
                      >
                        <option value="pendidikan">Pendidikan</option>
                        <option value="kesehatan">Kesehatan</option>
                        <option value="bencana">Kebencanaan</option>
                        <option value="kemiskinan">Penurunan Kemiskinan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Kategori Agenda <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            category: e.target.value as CmsCardItem['category'],
                          }))
                        }
                        className="h-10 w-full px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC]"
                      >
                        <option value="PKPN">PKPN (Program Kerja Prioritas Nasional)</option>
                        <option value="Isu Strategis">Isu Strategis Prioritas</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Judul Indikator / Program <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Contoh: Revitalisasi Satuan Pendidikan"
                      className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      K/L Penanggung Jawab (PIC)
                    </label>
                    <input
                      type="text"
                      value={formData.picKementerian}
                      onChange={(e) => setFormData((prev) => ({ ...prev, picKementerian: e.target.value }))}
                      placeholder="Contoh: Kemendikdasmen, Kemenkes, BNPB, Kemensos"
                      className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                    />
                  </div>
                </div>

                {/* Section 2: Target, Realisasi & Kalkulasi Otomatis */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      2. Target, Capaian & Kalkulasi Persentase
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Pilih format angka numerik atau tulisan deskriptif
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Kolom Capaian Realisasi */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">
                          Capaian Realisasi <span className="text-rose-600">*</span>
                        </label>
                        {/* Segmented Button: Angka vs Tulisan */}
                        <div className="inline-flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => handleValueFormatChange('number')}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                              valueFormat === 'number'
                                ? 'bg-white text-[#4F83CC] shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Hash className="h-3 w-3 stroke-[2.2]" />
                            <span>Angka</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleValueFormatChange('text')}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                              valueFormat === 'text'
                                ? 'bg-white text-[#4F83CC] shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Type className="h-3 w-3 stroke-[2.2]" />
                            <span>Tulisan</span>
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        required
                        value={formData.value}
                        onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                        placeholder={
                          valueFormat === 'number'
                            ? 'Contoh: 36.669 atau 105,98'
                            : 'Contoh: — atau Dalam Proses Harmonisasi'
                        }
                        className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                      />

                      {/* Pintasan cepat jika format Tulisan */}
                      {valueFormat === 'text' ? (
                        <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
                          <span className="text-[11px] text-slate-400 font-medium mr-0.5">Pintasan:</span>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, value: '—' }))}
                            className="px-2 py-0.5 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded transition-colors cursor-pointer"
                          >
                            — (Belum Ada)
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, value: 'Dalam Proses' }))}
                            className="px-2 py-0.5 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded transition-colors cursor-pointer"
                          >
                            Dalam Proses
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, value: 'Terlaksana' }))}
                            className="px-2 py-0.5 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded transition-colors cursor-pointer"
                          >
                            Terlaksana
                          </button>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 font-normal">
                          Mendukung angka desimal koma (105,98) atau ribuan titik (36.669)
                        </p>
                      )}
                    </div>

                    {/* Kolom Target Kinerja */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">
                          Target Kinerja <span className="text-rose-600">*</span>
                        </label>
                        {/* Segmented Button: Angka vs Tulisan */}
                        <div className="inline-flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => handleTargetFormatChange('number')}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                              targetFormat === 'number'
                                ? 'bg-white text-[#4F83CC] shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Hash className="h-3 w-3 stroke-[2.2]" />
                            <span>Angka</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTargetFormatChange('text')}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                              targetFormat === 'text'
                                ? 'bg-white text-[#4F83CC] shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Type className="h-3 w-3 stroke-[2.2]" />
                            <span>Tulisan</span>
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        required
                        value={formData.target}
                        onChange={(e) => setFormData((prev) => ({ ...prev, target: e.target.value }))}
                        placeholder={
                          targetFormat === 'number'
                            ? 'Contoh: 80.282 atau 100'
                            : 'Contoh: Target: Belum Ditetapkan atau Tahap Harmonisasi'
                        }
                        className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                      />

                      {/* Pintasan cepat jika format Tulisan */}
                      {targetFormat === 'text' ? (
                        <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
                          <span className="text-[11px] text-slate-400 font-medium mr-0.5">Pintasan:</span>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, target: 'Target: Belum Ditetapkan' }))}
                            className="px-2 py-0.5 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded transition-colors cursor-pointer"
                          >
                            Target: Belum Ditetapkan
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, target: '—' }))}
                            className="px-2 py-0.5 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded transition-colors cursor-pointer"
                          >
                            —
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, target: 'Tahap Penyiapan 2026' }))}
                            className="px-2 py-0.5 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded transition-colors cursor-pointer"
                          >
                            Tahap Penyiapan 2026
                          </button>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 font-normal">
                          Target kuantitatif numerik untuk kalkulasi rasio persentase
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Real-Time Percentage Calculator Box (Adaptive to Number vs Text) */}
                  <div className="p-4 bg-[#0f172a] text-white rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#4F83CC] text-white rounded-lg">
                        <Calculator className="h-5 w-5 stroke-[1.75]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {valueFormat === 'number' && targetFormat === 'number'
                            ? 'Perhitungan Persentase Otomatis:'
                            : 'Status Metrik Persentase:'}
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5">
                          {valueFormat === 'number' && targetFormat === 'number' ? (
                            formLivePercentage !== null ? (
                              <span>
                                (Capaian: <strong className="text-white">{formData.value}</strong> / Target:{' '}
                                <strong className="text-white">{formData.target}</strong>) ={' '}
                                <span className="text-emerald-400 font-bold">{formLivePercentage}%</span>
                              </span>
                            ) : (
                              'Masukkan angka capaian dan target untuk kalkulasi otomatis'
                            )
                          ) : (
                            'Format Tulisan (Kualitatif) aktif — persentase metrik dinonaktifkan secara otomatis (—)'
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`px-3.5 py-1.5 font-extrabold text-base rounded-lg shrink-0 ${
                        formLivePercentage !== null
                          ? 'bg-[#4F83CC] text-white'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {formLivePercentage !== null ? `${formLivePercentage}%` : '—'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Satuan Unit
                      </label>
                      <input
                        type="text"
                        value={formData.unit}
                        onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                        placeholder="Contoh: Satuan Pendidikan, KPM, Jiwa"
                        className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Status Realisasi Label
                      </label>
                      <input
                        type="text"
                        value={formData.status}
                        onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                        placeholder="Contoh: Realisasi 2026"
                        className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Keterangan & Deskripsi */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                    3. Keterangan & Deskripsi Kebijakan
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Keterangan Ringkas (Subtext pada Kartu)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.subtext}
                      onChange={(e) => setFormData((prev) => ({ ...prev, subtext: e.target.value }))}
                      placeholder="Keterangan singkat indikator..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Deskripsi Lengkap Kebijakan / Program
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Uraian rinci dasar pelaksanaan dan kebijakan pengawalan Kemenko PMK..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                    />
                  </div>

                  {/* Toggle Aktif */}
                  <div className="pt-2 flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Tampilkan di Dashboard Utama
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Aktifkan agar indikator ini muncul di pemantauan publik dashboard eksekutif.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                      className="h-5 w-5 accent-[#4F83CC] rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Solid Action Buttons (Strict 40px Height Standard) */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className="h-10 px-5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="h-10 px-6 rounded-lg bg-[#4F83CC] hover:bg-[#3f72bb] active:bg-[#33609f] disabled:bg-slate-300 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Menyimpan ke Database...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 stroke-[2]" />
                        <span>Simpan Indikator ke Database</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW MODE C: METADATA SETTINGS                                  */}
          {/* =============================================================== */}
          {viewMode === 'metadata' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="h-10 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 stroke-[1.75]" />
                  <span>Kembali ke Daftar</span>
                </button>

                <div className="text-xs font-semibold text-slate-500">
                  Konfigurasi: <span className="text-[#4F83CC] font-bold uppercase">Metadata Dashboard</span>
                </div>
              </div>

              <form onSubmit={handleSaveMetadata} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    Konfigurasi Judul & Cutoff Dashboard
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data ini ditampilkan pada header laporan dan ringkasan eksekutif PMK.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Judul Utama Dashboard
                  </label>
                  <input
                    type="text"
                    required
                    value={metadata.title}
                    onChange={(e) => setMetadata((prev) => ({ ...prev, title: e.target.value }))}
                    className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Subjudul / Lembaga
                  </label>
                  <input
                    type="text"
                    required
                    value={metadata.subtitle}
                    onChange={(e) => setMetadata((prev) => ({ ...prev, subtitle: e.target.value }))}
                    className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Tanggal Cutoff Data
                    </label>
                    <input
                      type="text"
                      required
                      value={metadata.cutoffDate}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, cutoffDate: e.target.value }))}
                      placeholder="Contoh: 14 Oktober 2026"
                      className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Jabatan Pimpinan
                    </label>
                    <input
                      type="text"
                      required
                      value={metadata.ministerTitle}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, ministerTitle: e.target.value }))}
                      placeholder="Contoh: Menteri Koordinator PMK"
                      className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className="h-10 px-5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingMeta}
                    className="h-10 px-6 rounded-lg bg-[#4F83CC] hover:bg-[#3f72bb] text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    {isSavingMeta ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 stroke-[2]" />
                        <span>Simpan Metadata</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
