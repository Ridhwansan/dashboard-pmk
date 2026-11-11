'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
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
  ExternalLink,
  Search,
  LogOut,
  Menu,
  X,
  Copy,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Hash,
  Type,
  Users,
  Percent,
  Calendar,
  AlertTriangle,
  FileText,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  User,
  UserPlus,
  FileDown,
  ToggleLeft,
  ToggleRight,
  CheckCheck,
} from 'lucide-react';
import { CmsCardItem } from '@/types/cms';
import { calculatePercentage, parseMetricNumber } from '@/lib/calcPercent';
import { useAuth } from '@/lib/useAuth';
import { setClientCardsCache } from '@/lib/useCmsCards';
import { KendalaDetailItem } from '@/data/programDetailData';
import { ExecutivePdfButton } from '@/components/molecules/ExecutivePdfButton';

export type PillarTab = 'all' | 'pendidikan' | 'kesehatan' | 'bencana' | 'kemiskinan';
export type CategoryFilter = 'all' | 'PKPN' | 'Isu Strategis' | 'RPJMN';
export type CmsViewMode = 'list' | 'create' | 'edit' | 'metadata' | 'users' | 'pdf-settings';
export type MetricType = 'number' | 'percent' | 'text';

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

export interface CmsUserItem {
  id: string;
  username: string;
  name: string;
  email: string | null;
  role: 'ADMIN' | 'MENKO' | 'ESELON_1' | 'ESELON_2' | 'USER';
  createdAt: string;
  updatedAt?: string;
}

const ROLE_OPTIONS = [
  { value: 'MENKO', label: 'Menteri Koordinator (Menko PMK)', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'ESELON_1', label: 'Pejabat Eselon I / Deputi', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { value: 'ESELON_2', label: 'Pejabat Eselon II / Asisten Deputi', badge: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  { value: 'ADMIN', label: 'Administrator PMK', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'USER', label: 'Pengguna Eksekutif / Staf', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
];

/**
 * Formats integer/decimal strings with Indonesian thousands dots.
 * e.g. "36669" -> "36.669"
 * e.g. "1000000" -> "1.000.000"
 */
export function formatIndonesianNumber(input: string): string {
  if (!input) return '';
  const hasComma = input.includes(',');
  const parts = input.split(',');
  const intDigits = parts[0].replace(/\D/g, '');
  if (!intDigits) return hasComma ? '0,' + (parts[1]?.replace(/\D/g, '') || '') : '';
  try {
    const formattedInt = new Intl.NumberFormat('id-ID').format(BigInt(intDigits));
    if (hasComma) {
      const decDigits = parts.slice(1).join('').replace(/\D/g, '');
      return `${formattedInt},${decDigits}`;
    }
    return formattedInt;
  } catch {
    return input;
  }
}

/**
 * Strips formatting dots to get clean numeric string for calculation
 */
export function unformatIndonesianNumber(input: string): string {
  if (!input) return '';
  return input.replace(/\./g, '').replace(',', '.');
}

export const CmsAdminView: React.FC = () => {
  const { user, logout } = useAuth();

  const [cards, setCards] = useState<CmsCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPillar, setSelectedPillar] = useState<PillarTab>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // View mode navigation
  const [viewMode, setViewMode] = useState<CmsViewMode>('list');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Pagination for Indicator Table (10 items / page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPillar, selectedCategory, searchQuery]);

  // Dashboard Metadata state (Informasi Tampilan Depan)
  const [metadata, setMetadata] = useState({
    title: 'Pusat Pemantauan Program Kerja Prioritas Nasional',
    subtitle: 'Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan',
    cutoffDate: '14 Oktober 2026',
    ministerTitle: 'Menteri Koordinator Bidang Pembangunan Manusia dan Kebudayaan',
  });
  const [isSavingMeta, setIsSavingMeta] = useState(false);

  // PDF Settings state (Pengaturan Unduh Ringkasan)
  const [pdfPillarFilter, setPdfPillarFilter] = useState<PillarTab>('all');
  const [pdfSearchQuery, setPdfSearchQuery] = useState('');
  const [isBulkUpdatingPdf, setIsBulkUpdatingPdf] = useState(false);
  const [isApplyingPdfSettings, setIsApplyingPdfSettings] = useState(false);
  const [isPdfDirty, setIsPdfDirty] = useState(false);

  // Metric Type: 'number' (angka satuan) | 'percent' (%) | 'text' (kualitatif milestone)
  const [metricType, setMetricType] = useState<MetricType>('number');
  const [targetYear, setTargetYear] = useState('2026');

  // Strict Separate Inputs per Unit
  const [numberCapaian, setNumberCapaian] = useState('');
  const [numberTarget, setNumberTarget] = useState('');
  const [percentCapaian, setPercentCapaian] = useState('');
  const [percentTarget, setPercentTarget] = useState('100');
  const [textCapaian, setTextCapaian] = useState('—');
  const [textTarget, setTextTarget] = useState('');

  // Form general state
  const [formData, setFormData] = useState<{
    id?: string;
    slug?: string;
    pillarId: CmsCardItem['pillarId'];
    category: CmsCardItem['category'];
    title: string;
    unit: string;
    status: string;
    subtext: string;
    description: string;
    picKementerian: string;
    isActive: boolean;
  }>({
    pillarId: 'pendidikan',
    category: 'PKPN',
    title: '',
    unit: '',
    status: 'Realisasi 2026',
    subtext: '',
    description: '',
    picKementerian: '',
    isActive: true,
  });

  // Annual Targets (2025–2029) directly connected to program detail
  const [annualRows, setAnnualRows] = useState<Record<number, { target: string; capaian: string }>>({
    2025: { target: '', capaian: '' },
    2026: { target: '', capaian: '' },
    2027: { target: '', capaian: '' },
    2028: { target: '', capaian: '' },
    2029: { target: '', capaian: '' },
  });

  // Kendala & Catatan Pelaksanaan (Isu Strategis) directly connected to program detail
  const [kendalaList, setKendalaList] = useState<KendalaDetailItem[]>([]);

  // Users Management State
  const [usersList, setUsersList] = useState<CmsUserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CmsUserItem | null>(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    role: 'USER' as CmsUserItem['role'],
  });
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch cards from API
  const fetchAllCards = async () => {
    try {
      const res = await fetch('/api/cards?all=true', { cache: 'no-store' });
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

  // Fetch users from API
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setUsersList(json.data);
        }
      }
    } catch {
      // fallback
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const [cardsRes, metaRes] = await Promise.all([
          fetch('/api/cards?all=true', { cache: 'no-store' }),
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

  useEffect(() => {
    if (viewMode === 'users') {
      fetchUsers();
    }
  }, [viewMode]);

  // Save metadata (Informasi Tampilan Depan)
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
        showToast('Informasi tampilan depan berhasil diperbarui');
        setViewMode('list');
      } else {
        const errJson = await res.json().catch(() => null);
        alert(errJson?.error || 'Gagal menyimpan informasi tampilan depan');
      }
    } catch {
      alert('Terjadi kesalahan jaringan saat menyimpan informasi tampilan depan');
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

  // Toggle card inclusion in Executive Summary PDF
  const handleToggleIncludePdf = (card: CmsCardItem) => {
    const nextStatus = card.includeInPdf === false ? true : false;
    const newCards = cards.map((c) => (c.id === card.id ? { ...c, includeInPdf: nextStatus } : c));
    setCards(newCards);
    setClientCardsCache(newCards);
    setIsPdfDirty(true);

    if (typeof window !== 'undefined') {
      try {
        const prev = localStorage.getItem('pmk_pdf_settings');
        const map = prev ? JSON.parse(prev) : {};
        map[card.id] = nextStatus;
        if (card.slug) map[card.slug] = nextStatus;
        localStorage.setItem('pmk_pdf_settings', JSON.stringify(map));
      } catch {}
    }

    showToast(`"${card.title}" diubah menjadi ${nextStatus ? 'Masuk PDF' : 'Dikecualikan'}. Klik "Terapkan" untuk menyimpan.`);
  };

  // Bulk toggle cards inclusion in Executive Summary PDF
  const handleBulkTogglePdf = (enable: boolean) => {
    const targetCards = pdfFilteredCards.filter((c) => (c.includeInPdf !== false) !== enable);
    if (targetCards.length === 0) {
      showToast(
        enable
          ? 'Semua indikator pada filter saat ini sudah aktif masuk Ringkasan PDF.'
          : 'Semua indikator pada filter saat ini sudah dinonaktifkan dari Ringkasan PDF.'
      );
      return;
    }

    const targetIds = new Set(targetCards.map((c) => c.id));
    const newCards = cards.map((c) => (targetIds.has(c.id) ? { ...c, includeInPdf: enable } : c));
    setCards(newCards);
    setClientCardsCache(newCards);
    setIsPdfDirty(true);

    if (typeof window !== 'undefined') {
      try {
        const prev = localStorage.getItem('pmk_pdf_settings');
        const map = prev ? JSON.parse(prev) : {};
        targetCards.forEach((c) => {
          map[c.id] = enable;
          if (c.slug) map[c.slug] = enable;
        });
        localStorage.setItem('pmk_pdf_settings', JSON.stringify(map));
      } catch {}
    }

    showToast(`${targetCards.length} indikator diubah. Klik "Terapkan" untuk menyimpan permanen.`);
  };

  // Apply PDF settings directly to database via batch endpoint
  const handleApplyPdfSettings = async () => {
    setIsApplyingPdfSettings(true);
    try {
      const settings: Record<string, boolean> = {};
      cards.forEach((c) => {
        const val = c.includeInPdf !== false;
        settings[c.id] = val;
        if (c.slug) settings[c.slug] = val;
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('pmk_pdf_settings', JSON.stringify(settings));
      }

      const res = await fetch('/api/cards/pdf-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (!res.ok) {
        throw new Error('Gagal menerapkan pengaturan ke server');
      }

      const activeCount = cards.filter((c) => c.includeInPdf !== false).length;
      showToast(`Pengaturan berhasil diterapkan! ${activeCount} dari ${cards.length} indikator aktif di Ringkasan PDF.`);
      setIsPdfDirty(false);
      setClientCardsCache([...cards]);
    } catch (err) {
      console.error('Apply PDF settings error:', err);
      const activeCount = cards.filter((c) => c.includeInPdf !== false).length;
      showToast(`Pengaturan diterapkan ke sesi aktif! (${activeCount} indikator aktif)`);
      setIsPdfDirty(false);
    } finally {
      setIsApplyingPdfSettings(false);
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

  // Number input handlers with automatic thousands dots
  const handleCapaianNumberChange = (raw: string) => {
    const formatted = formatIndonesianNumber(raw);
    setNumberCapaian(formatted);
    // Automatically mirror into 2026 annual row
    setAnnualRows((prev) => ({
      ...prev,
      2026: { ...prev[2026], capaian: formatted },
    }));
  };

  const handleTargetNumberChange = (raw: string) => {
    const formatted = formatIndonesianNumber(raw);
    setNumberTarget(formatted);
    // Automatically mirror into 2026 annual row
    setAnnualRows((prev) => ({
      ...prev,
      2026: { ...prev[2026], target: formatted },
    }));
  };

  // Live percentage calculation based on metric type
  const formLivePercentage = useMemo<number | null>(() => {
    if (metricType === 'number') {
      const c = parseFloat(unformatIndonesianNumber(numberCapaian));
      const t = parseFloat(unformatIndonesianNumber(numberTarget));
      if (!isNaN(c) && !isNaN(t) && t > 0) {
        return Number(((c / t) * 100).toFixed(1));
      }
      return null;
    }
    if (metricType === 'percent') {
      const c = parseFloat(percentCapaian.replace(',', '.'));
      if (!isNaN(c)) return c;
      return null;
    }
    return null;
  }, [metricType, numberCapaian, numberTarget, percentCapaian]);

  // Open Create View
  const openCreateView = () => {
    const defaultPillar = selectedPillar !== 'all' ? selectedPillar : 'pendidikan';
    const defaultCategory = selectedCategory !== 'all' ? selectedCategory : 'PKPN';
    const isIsuStrategis = defaultCategory === 'Isu Strategis';

    setMetricType(isIsuStrategis ? 'text' : 'number');
    setTargetYear('2026');
    setNumberCapaian('');
    setNumberTarget('');
    setPercentCapaian('');
    setPercentTarget('100');
    setTextCapaian(isIsuStrategis ? '—' : '');
    setTextTarget(isIsuStrategis ? 'Target: Belum Ditetapkan' : '');

    setFormData({
      pillarId: defaultPillar,
      category: defaultCategory,
      title: '',
      unit: '',
      status: isIsuStrategis ? 'Menunggu Data Realisasi' : 'Realisasi 2026',
      subtext: '',
      description: '',
      picKementerian: '',
      isActive: true,
    });

    setAnnualRows({
      2025: { target: '', capaian: '' },
      2026: { target: '', capaian: '' },
      2027: { target: '', capaian: '' },
      2028: { target: '', capaian: '' },
      2029: { target: '', capaian: '' },
    });

    setKendalaList([]);
    setEditingCardId(null);
    setViewMode('create');
  };

  // Open Edit View
  const openEditView = (card: CmsCardItem) => {
    setEditingCardId(card.id);

    // Detect metric type
    const isPercent = card.unit === '%' || card.value.includes('%');
    const isMilestone = card.isMilestone || card.value === '—' || !/\d/.test(card.value);

    let detectedType: MetricType = 'number';
    if (isPercent) {
      detectedType = 'percent';
    } else if (isMilestone) {
      detectedType = 'text';
    }

    setMetricType(detectedType);

    // Extract numbers or text
    if (detectedType === 'number') {
      const cleanVal = formatIndonesianNumber(card.value);
      setNumberCapaian(cleanVal);

      // Extract target number from string like "Target 2026: 80.282 Satuan Pendidikan"
      const tDigits = card.target.replace(/[^0-9.]/g, '').split('.')[0] ? card.target.match(/[\d.]+/)?.[0] || '' : '';
      setNumberTarget(tDigits ? formatIndonesianNumber(tDigits) : '');
    } else if (detectedType === 'percent') {
      const cleanVal = card.value.replace('%', '').trim();
      setPercentCapaian(cleanVal);
      const cleanTgt = card.target.replace(/[^0-9,.]/g, '').trim() || '100';
      setPercentTarget(cleanTgt);
    } else {
      setTextCapaian(card.value);
      setTextTarget(card.target);
    }

    setFormData({
      id: card.id,
      slug: card.slug,
      pillarId: card.pillarId,
      category: card.category,
      title: card.title,
      unit: card.unit || '',
      status: card.status,
      subtext: card.subtext || '',
      description: card.description || '',
      picKementerian: card.picKementerian || '',
      isActive: card.isActive,
    });

    // Extract annual targets if available
    const rawAnnual = (card.annualTargets as Record<string, { target: string; capaian: string }>) || {};
    setAnnualRows({
      2025: rawAnnual[2025] || { target: '', capaian: '' },
      2026: rawAnnual[2026] || {
        target: detectedType === 'number' ? formatIndonesianNumber(card.target) : card.target,
        capaian: detectedType === 'number' ? formatIndonesianNumber(card.value) : card.value,
      },
      2027: rawAnnual[2027] || { target: '', capaian: '' },
      2028: rawAnnual[2028] || { target: '', capaian: '' },
      2029: rawAnnual[2029] || { target: '', capaian: '' },
    });

    // Extract kendala list
    const rawKendala = (card.kendalaList as KendalaDetailItem[]) || [];
    setKendalaList(rawKendala);

    setViewMode('edit');
  };

  // Add / Remove Kendala Item
  const handleAddKendala = () => {
    setKendalaList((prev) => [
      ...prev,
      {
        id: `knd_${Date.now()}`,
        title: '',
        kendala: '',
        tindakLanjut: '',
        klTerkait: formData.picKementerian || '',
        urgensi: 'Tinggi',
      },
    ]);
  };

  const handleUpdateKendala = (index: number, field: keyof KendalaDetailItem, val: string) => {
    setKendalaList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleRemoveKendala = (index: number) => {
    setKendalaList((prev) => prev.filter((_, i) => i !== index));
  };

  // Save Form (Create or Update Card & Connected Details)
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Judul indikator / program wajib diisi');
      return;
    }

    let finalValue = '';
    let finalTarget = '';
    let finalUnit = formData.unit.trim();
    let finalIsMilestone = false;
    let finalMilestoneContent: string | null = null;
    let finalPercent: number | null = null;

    if (metricType === 'number') {
      finalValue = numberCapaian.trim() || '0';
      const cleanTargetNum = numberTarget.trim();
      finalTarget = cleanTargetNum
        ? `Target ${targetYear}: ${cleanTargetNum}${finalUnit ? ` ${finalUnit}` : ''}`
        : `Target ${targetYear}: Belum Ditetapkan`;
      finalPercent = formLivePercentage;
    } else if (metricType === 'percent') {
      finalUnit = '%';
      finalValue = percentCapaian.includes('%') ? percentCapaian.trim() : `${percentCapaian.trim()}%`;
      finalTarget = `Target ${targetYear}: ${percentTarget.includes('%') ? percentTarget.trim() : `${percentTarget.trim()}%`}`;
      finalPercent = formLivePercentage;
    } else {
      finalValue = textCapaian.trim() || '—';
      finalTarget = textTarget.trim() || 'Target: Belum Ditetapkan';
      finalIsMilestone = true;
      finalMilestoneContent = textTarget.trim();
      finalPercent = null;
    }

    const payload = {
      ...formData,
      value: finalValue,
      target: finalTarget,
      unit: finalUnit,
      percent: finalPercent,
      isMilestone: finalIsMilestone,
      milestoneContent: finalMilestoneContent,
      kendalaList: kendalaList,
      annualTargets: annualRows,
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
          setCards((prev) => prev.map((c) => (c.id === editingCardId ? json.data : c)));
          showToast(`Indikator "${formData.title}" dan rincian detail berhasil diperbarui`);
          setViewMode('list');
        } else {
          const errJson = await res.json().catch(() => null);
          alert(errJson?.error || 'Gagal memperbarui indikator');
        }
      } else {
        const res = await fetch('/api/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const json = await res.json();
          setCards((prev) => [json.data, ...prev]);
          showToast(`Indikator "${formData.title}" dan rincian detail berhasil ditambahkan`);
          setViewMode('list');
        } else {
          const errJson = await res.json().catch(() => null);
          alert(errJson?.error || 'Gagal membuat indikator baru');
        }
      }
    } catch {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setIsSaving(false);
    }
  };

  // User Management actions
  const openCreateUserModal = () => {
    setEditingUser(null);
    setUserFormData({
      username: '',
      name: '',
      email: '',
      password: '',
      role: 'USER',
    });
    setUserError(null);
    setUserModalOpen(true);
  };

  const openEditUserModal = (u: CmsUserItem) => {
    setEditingUser(u);
    setUserFormData({
      username: u.username,
      name: u.name,
      email: u.email || '',
      password: '',
      role: u.role,
    });
    setUserError(null);
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);

    if (!userFormData.name.trim()) {
      setUserError('Nama lengkap wajib diisi.');
      return;
    }

    if (!editingUser && !userFormData.username.trim()) {
      setUserError('Username wajib diisi.');
      return;
    }

    if (!editingUser && (!userFormData.password || userFormData.password.length < 6)) {
      setUserError('Password wajib diisi minimal 6 karakter.');
      return;
    }

    setIsSavingUser(true);
    try {
      if (editingUser) {
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userFormData.name.trim(),
            email: userFormData.email.trim() || null,
            role: userFormData.role,
            ...(userFormData.password ? { password: userFormData.password } : {}),
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Gagal mengubah data pengguna');

        setUsersList((prev) => prev.map((u) => (u.id === editingUser.id ? json.data : u)));
        showToast(`Akun pengguna @${editingUser.username} berhasil diperbarui`);
        setUserModalOpen(false);
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: userFormData.username.trim().toLowerCase(),
            name: userFormData.name.trim(),
            email: userFormData.email.trim() || null,
            password: userFormData.password,
            role: userFormData.role,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Gagal membuat pengguna baru');

        setUsersList((prev) => [...prev, json.data]);
        showToast(`Akun pengguna @${json.data.username} berhasil dibuat`);
        setUserModalOpen(false);
      }
    } catch (err: unknown) {
      setUserError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleDeleteUser = async (u: CmsUserItem) => {
    if (!confirm(`Hapus akun pengguna "${u.name}" (@${u.username})?`)) return;

    try {
      const res = await fetch(`/api/users/${u.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Gagal menghapus pengguna');
        return;
      }
      setUsersList((prev) => prev.filter((item) => item.id !== u.id));
      showToast(`Akun @${u.username} berhasil dihapus`);
    } catch {
      alert('Terjadi kesalahan jaringan saat menghapus pengguna');
    }
  };

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (selectedPillar !== 'all' && card.pillarId !== selectedPillar) return false;
      if (selectedCategory !== 'all' && card.category !== selectedCategory) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = card.title.toLowerCase().includes(q);
        const matchesPIC = (card.picKementerian || '').toLowerCase().includes(q);
        const matchesTarget = (card.target || '').toLowerCase().includes(q);
        const matchesUnit = (card.unit || '').toLowerCase().includes(q);
        return matchesTitle || matchesPIC || matchesTarget || matchesUnit;
      }
      return true;
    });
  }, [cards, selectedPillar, selectedCategory, searchQuery]);

  // Paginated Cards (10 items / page)
  const totalPages = Math.max(1, Math.ceil(filteredCards.length / itemsPerPage));
  const paginatedCards = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCards.slice(start, start + itemsPerPage);
  }, [filteredCards, currentPage, itemsPerPage]);

  // Filtered Cards for PDF Settings
  const pdfFilteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (pdfPillarFilter !== 'all' && card.pillarId !== pdfPillarFilter) return false;
      if (pdfSearchQuery.trim() !== '') {
        const q = pdfSearchQuery.toLowerCase();
        const matchesTitle = card.title.toLowerCase().includes(q);
        const matchesSubtext = (card.subtext || '').toLowerCase().includes(q);
        const matchesPIC = (card.picKementerian || '').toLowerCase().includes(q);
        const matchesTarget = (card.target || '').toLowerCase().includes(q);
        return matchesTitle || matchesSubtext || matchesPIC || matchesTarget;
      }
      return true;
    });
  }, [cards, pdfPillarFilter, pdfSearchQuery]);

  const totalPdfCards = cards.length;
  const includedPdfCount = cards.filter((c) => c.includeInPdf !== false).length;
  const excludedPdfCount = totalPdfCards - includedPdfCount;

  // Pillar counts
  const pillarCounts = useMemo(() => {
    const counts: Record<PillarTab, number> = {
      all: cards.length,
      pendidikan: 0,
      kesehatan: 0,
      bencana: 0,
      kemiskinan: 0,
    };
    cards.forEach((c) => {
      if (counts[c.pillarId] !== undefined) {
        counts[c.pillarId]++;
      }
    });
    return counts;
  }, [cards]);

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
      {/* 1. CMS SIDEBAR (Clean, Official Logo, No Administrator PMK box)      */}
      {/* =================================================================== */}
      <aside className="w-full md:w-72 bg-[#0f172a] text-slate-200 flex flex-col shrink-0 border-r border-slate-800/80 md:sticky md:top-0 md:h-screen md:max-h-screen z-40">
        {/* Sidebar Brand Header with Official Emblem */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 p-0.5 flex items-center justify-center shrink-0 border border-white/10 shadow-xs overflow-hidden">
              <Image
                src="/images/logo-pmk-garuda.png"
                alt="Logo Kemenko PMK"
                width={38}
                height={38}
                className="w-full h-full object-contain"
              />
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

        {/* Sidebar Navigation Items */}
        <div className={`flex-1 px-4 py-5 space-y-6 overflow-y-auto min-h-0 ${mobileSidebarOpen ? 'block' : 'hidden md:block'}`}>
          {/* Group 1: Kelola Indikator Pilar */}
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
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
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
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                      isActive ? 'bg-[#3b6eb3] text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Group 2: Konfigurasi */}
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
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'metadata'
                  ? 'bg-[#4F83CC] text-white shadow-xs font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Sliders className="h-4 w-4 shrink-0 stroke-[1.75]" />
              <span>Informasi Tampilan Depan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode('pdf-settings');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'pdf-settings'
                  ? 'bg-[#4F83CC] text-white shadow-xs font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <FileDown className="h-4 w-4 shrink-0 stroke-[1.75]" />
              <span>Pengaturan Unduh Ringkasan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode('users');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'users'
                  ? 'bg-[#4F83CC] text-white shadow-xs font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4 shrink-0 stroke-[1.75]" />
              <span>Manajemen Pengguna</span>
            </button>
          </div>

          {/* Group 3: Navigasi Luar */}
          <div className="space-y-1 pt-4 border-t border-slate-800/80">
            <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Navigasi
            </div>

            <Link
              href="/dashboard/eksekutif?view=ikhtisar"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer"
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
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors cursor-pointer"
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
      {/* 2. MAIN CMS CONTENT AREA                                            */}
      {/* =================================================================== */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-100 min-h-screen">
        {/* TOP ADMINISTRATIVE HEADER BAR */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>CMS Administrator</span>
              <span>/</span>
              <span className="text-[#4F83CC] font-bold">
                {viewMode === 'metadata'
                  ? 'Informasi Tampilan Depan'
                  : viewMode === 'pdf-settings'
                  ? 'Pengaturan Unduh Ringkasan'
                  : viewMode === 'users'
                  ? 'Manajemen Pengguna'
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
                ? 'Pengaturan Informasi Halaman Depan'
                : viewMode === 'pdf-settings'
                ? 'Pengaturan Indikator Ringkasan Eksekutif (PDF)'
                : viewMode === 'users'
                ? 'Kelola Akun & Hak Akses Pengguna'
                : viewMode === 'create'
                ? 'Tambah Indikator Program Baru'
                : viewMode === 'edit'
                ? `Edit: ${formData.title}`
                : `Manajemen Indikator (${filteredCards.length} Program)`}
            </h1>
          </div>

          {/* Action Button Set */}
          <div className="flex flex-wrap items-center gap-2">
            {viewMode === 'list' && (
              <>
                <button
                  type="button"
                  onClick={handleResetDefault}
                  title="Sinkronisasi ulang jika data terhapus atau kosong"
                  className="h-10 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-2xs transition-colors"
                >
                  <RotateCcw className="h-4 w-4 text-slate-500 stroke-[1.75]" />
                  <span>Sinkronisasi Data Master</span>
                </button>

                <button
                  type="button"
                  onClick={openCreateView}
                  className="h-10 px-4 rounded-xl bg-[#4F83CC] hover:bg-[#3f72bb] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <Plus className="h-4 w-4 stroke-[2]" />
                  <span>Tambah Indikator Baru</span>
                </button>
              </>
            )}

            {viewMode === 'pdf-settings' && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isApplyingPdfSettings}
                  onClick={handleApplyPdfSettings}
                  className={`h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all ${
                    isPdfDirty
                      ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-400 ring-offset-2 animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  } disabled:opacity-50`}
                  title="Terapkan dan simpan semua perubahan ke database & dokumen unduhan PDF"
                >
                  {isApplyingPdfSettings ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menerapkan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCheck className="h-4 w-4 stroke-[2.5]" />
                      <span>{isPdfDirty ? 'Terapkan Perubahan' : 'Terapkan Pengaturan Unduhan'}</span>
                    </>
                  )}
                </button>

                <ExecutivePdfButton
                  cards={cards}
                  currentPillar={pdfPillarFilter !== 'all' ? pdfPillarFilter : undefined}
                />

                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="h-10 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-2xs transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 stroke-[1.75]" />
                  <span>Kembali ke Daftar</span>
                </button>
              </div>
            )}

            {viewMode === 'users' && (
              <button
                type="button"
                onClick={openCreateUserModal}
                className="h-10 px-4 rounded-xl bg-[#4F83CC] hover:bg-[#3f72bb] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span>Tambah Pengguna Baru</span>
              </button>
            )}

            {(viewMode === 'create' || viewMode === 'edit' || viewMode === 'metadata') && (
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="h-10 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-2xs transition-colors"
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
          {/* VIEW MODE A: LIST TABLE (De-nested, 10 Items / Page Pagination) */}
          {/* =============================================================== */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              {/* Unified Table Header with Filters & Search (No extra card-in-card) */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Category Filter Chips */}
                <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`h-8 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCategory('PKPN')}
                    className={`h-8 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === 'PKPN'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    PKPN
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCategory('Isu Strategis')}
                    className={`h-8 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === 'Isu Strategis'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Isu Strategis
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCategory('RPJMN')}
                    className={`h-8 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === 'RPJMN'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    RPJMN
                  </button>
                </div>

                {/* Quick Search Bar */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 stroke-[1.75]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari indikator, K/L, target..."
                    className="h-10 w-full pl-10 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4 w-12 text-center">No</th>
                      <th className="py-3 px-4 min-w-[220px]">Program / Indikator</th>
                      <th className="py-3 px-4 w-36">Pilar</th>
                      <th className="py-3 px-4 w-36">Realisasi</th>
                      <th className="py-3 px-4 w-40">Target</th>
                      <th className="py-3 px-4 w-24 text-center">Progres</th>
                      <th className="py-3 px-4 w-28 text-center">Status</th>
                      <th className="py-3 px-4 w-24 text-right">Aksi</th>
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
                        <td colSpan={8} className="py-14 text-center space-y-3 bg-slate-50/50">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center mx-auto text-slate-400">
                            <FileText className="h-6 w-6 stroke-[1.75]" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900 text-sm">
                              {selectedCategory === 'all'
                                ? 'Tidak ada indikator yang sesuai kriteria pencarian.'
                                : `Belum ada indikator terdaftar untuk kategori ${selectedCategory}.`}
                            </p>
                            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                              {selectedCategory === 'all'
                                ? 'Periksa kembali kata kunci pencarian Anda atau atur ulang pilihan filter pilar.'
                                : `Informasi belum tersedia untuk kategori ini. Anda dapat membuat indikator baru dengan menekan tombol "Tambah Indikator" di pojok kanan atas.`}
                            </p>
                          </div>
                          {selectedCategory === 'all' && (
                            <button
                              type="button"
                              onClick={handleResetDefault}
                              className="h-9 px-4 rounded-xl bg-[#4F83CC] text-white font-bold text-xs hover:bg-[#3f72bb] cursor-pointer transition-colors shadow-2xs"
                            >
                              Muat Ulang 28 Data Master Resmi
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      paginatedCards.map((card, idx) => {
                        const calculatedPct = calculatePercentage(card.value, card.target);
                        const displayPct = card.percent !== null && card.percent !== undefined ? card.percent : calculatedPct;
                        const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;

                        return (
                          <tr key={card.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Numbering */}
                            <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                              {rowNumber}
                            </td>

                            {/* Title & PIC */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 leading-snug">
                                {card.title}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span className="font-semibold text-slate-600">{card.picKementerian || 'Kemenko PMK'}</span>
                                <span>&bull;</span>
                                <span className="text-slate-400 font-mono text-[10px]">{card.slug}</span>
                              </div>
                            </td>

                            {/* Pillar */}
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 capitalize border border-slate-200">
                                {card.pillarId}
                              </span>
                            </td>

                            {/* Value / Realisasi */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 tabular-nums">
                                {card.value} {card.unit && !card.value.includes(card.unit) ? card.unit : ''}
                              </div>
                            </td>

                            {/* Target */}
                            <td className="py-3.5 px-4 text-slate-700">
                              <div className="line-clamp-2 leading-relaxed">
                                {card.target}
                              </div>
                            </td>

                            {/* Percentage / Progress */}
                            <td className="py-3.5 px-4 text-center">
                              {displayPct !== null ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                                  {displayPct}%
                                </span>
                              ) : (
                                <span className="text-slate-400 font-bold">—</span>
                              )}
                            </td>

                            {/* Status Toggle */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleActive(card)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                                  card.isActive
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                }`}
                              >
                                {card.isActive ? (
                                  <>
                                    <Eye className="h-3 w-3" />
                                    <span>Aktif</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="h-3 w-3" />
                                    <span>Nonaktif</span>
                                  </>
                                )}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditView(card)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                  title="Edit Indikator & Rincian Detail"
                                >
                                  <Pencil className="h-3.5 w-3.5 stroke-[2]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCard(card)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Hapus Indikator"
                                >
                                  <Trash2 className="h-3.5 w-3.5 stroke-[2]" />
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

              {/* Pagination Footer (Exactly 10 Items / Page) */}
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 font-medium">
                <div>
                  Menampilkan{' '}
                  <span className="font-bold text-slate-900">
                    {filteredCards.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
                  </span>
                  –
                  <span className="font-bold text-slate-900">
                    {Math.min(currentPage * itemsPerPage, filteredCards.length)}
                  </span>{' '}
                  dari <span className="font-bold text-slate-900">{filteredCards.length}</span> indikator
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="h-8 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Sebelumnya</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
                    const isCurrent = pg === currentPage;
                    return (
                      <button
                        key={pg}
                        type="button"
                        onClick={() => setCurrentPage(pg)}
                        className={`h-8 w-8 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-[#4F83CC] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="h-8 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Berikutnya</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW MODE B: CREATE / EDIT INDICATOR WITH FULL CONNECTED DETAIL */}
          {/* =============================================================== */}
          {(viewMode === 'create' || viewMode === 'edit') && (
            <div className="max-w-4xl mx-auto space-y-6">
              <form onSubmit={handleSaveForm} className="space-y-6">
                {/* Section 1: Identitas & Klasifikasi */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                    <span>1. Identitas Program & Pilar Strategis</span>
                    <span className="text-[11px] text-slate-400 font-medium">Langkah 1 dari 4</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Pilar Kemenko PMK <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={formData.pillarId}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            pillarId: e.target.value as CmsCardItem['pillarId'],
                          }))
                        }
                        className="h-10 w-full px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC]"
                      >
                        <option value="pendidikan">Pilar Pendidikan</option>
                        <option value="kesehatan">Pilar Kesehatan</option>
                        <option value="bencana">Pilar Kebencanaan</option>
                        <option value="kemiskinan">Pilar Penurunan Kemiskinan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Kategori Program <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            category: e.target.value as CmsCardItem['category'],
                          }))
                        }
                        className="h-10 w-full px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC]"
                      >
                        <option value="PKPN">PKPN (Program Kerja Prioritas Nasional)</option>
                        <option value="Isu Strategis">Isu Strategis Prioritas</option>
                        <option value="RPJMN">RPJMN (Rencana Pembangunan Jangka Menengah Nasional)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Judul Indikator / Program <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Contoh: Revitalisasi Satuan Pendidikan"
                      className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      K/L Penanggung Jawab (PIC Pelaksana)
                    </label>
                    <input
                      type="text"
                      value={formData.picKementerian}
                      onChange={(e) => setFormData((prev) => ({ ...prev, picKementerian: e.target.value }))}
                      placeholder="Contoh: Kemendikdasmen, Kemenkes, BNPB, Kemensos"
                      className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                    />
                  </div>
                </div>

                {/* Section 2: Target, Capaian & Kalkulasi Sesuai Satuan */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        2. Target, Capaian & Kalkulasi Persentase Sesuai Satuan
                      </h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Input dipisahkan spesifik sesuai satuannya. Nilai ribuan otomatis diformat dengan tanda titik.
                      </p>
                    </div>

                    {/* Metric Type Selector */}
                    <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setMetricType('number')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          metricType === 'number'
                            ? 'bg-white text-[#4F83CC] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Hash className="h-3.5 w-3.5" />
                        <span>Angka / Jumlah</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMetricType('percent')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          metricType === 'percent'
                            ? 'bg-white text-[#4F83CC] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Percent className="h-3.5 w-3.5" />
                        <span>Persen (%)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMetricType('text')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          metricType === 'text'
                            ? 'bg-white text-[#4F83CC] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Type className="h-3.5 w-3.5" />
                        <span>Kualitatif</span>
                      </button>
                    </div>
                  </div>

                  {/* FORM FIELDS PER METRIC TYPE */}
                  {metricType === 'number' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Satuan Unit <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.unit}
                            onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                            placeholder="Contoh: Satuan Pendidikan, Sekolah, Jiwa"
                            className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Tahun Target
                          </label>
                          <select
                            value={targetYear}
                            onChange={(e) => setTargetYear(e.target.value)}
                            className="h-10 w-full px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC]"
                          >
                            <option value="2025">Tahun 2025</option>
                            <option value="2026">Tahun 2026</option>
                            <option value="2027">Tahun 2027</option>
                            <option value="2028">Tahun 2028</option>
                            <option value="2029">Tahun 2029</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Status Realisasi
                          </label>
                          <input
                            type="text"
                            value={formData.status}
                            onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                            placeholder="Contoh: Realisasi 2026"
                            className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Capaian Realisasi (Hanya Angka) <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            required
                            value={numberCapaian}
                            onChange={(e) => handleCapaianNumberChange(e.target.value)}
                            placeholder="Contoh: 36.669"
                            className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 tabular-nums focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                          />
                          <p className="text-[11px] text-slate-400 mt-1">
                            Ketik angka, tanda titik otomatis ditambahkan saat mencapai ribuan.
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-slate-700">
                              Target Kinerja (Hanya Angka) <span className="text-rose-600">*</span>
                            </label>
                            {formLivePercentage !== null && (
                              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                {formLivePercentage}% Tercapai
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            inputMode="numeric"
                            required
                            value={numberTarget}
                            onChange={(e) => handleTargetNumberChange(e.target.value)}
                            placeholder="Contoh: 80.282"
                            className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 tabular-nums focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                          />
                          <p className="text-[11px] text-slate-400 mt-1">
                            Ketik angka target, format titik otomatis.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {metricType === 'percent' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Capaian Persentase (%) <span className="text-rose-600">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={percentCapaian}
                              onChange={(e) => setPercentCapaian(e.target.value.replace(/[^0-9,.]/g, ''))}
                              placeholder="Contoh: 45,7 atau 75"
                              className="h-10 w-full pl-3.5 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 tabular-nums focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                              %
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Target Persentase (%) <span className="text-rose-600">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={percentTarget}
                              onChange={(e) => setPercentTarget(e.target.value.replace(/[^0-9,.]/g, ''))}
                              placeholder="Contoh: 100"
                              className="h-10 w-full pl-3.5 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 tabular-nums focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {metricType === 'text' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Status / Realisasi Berjalan <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={textCapaian}
                            onChange={(e) => setTextCapaian(e.target.value)}
                            placeholder="Contoh: — atau Dalam Proses Penyiapan"
                            className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Target Milestone / Jadwal <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={textTarget}
                            onChange={(e) => setTextTarget(e.target.value)}
                            placeholder="Contoh: Peluncuran 1 Studio Pusat pada Nov 2026"
                            className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Rincian Target & Realisasi Tahunan (2025–2029) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        3. Rincian Target & Capaian Tahunan (2025–2029)
                      </h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Tabel ini langsung tampil pada halaman detail indikator program.
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">Langkah 3 dari 4</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4 w-28">Tahun</th>
                          <th className="py-2.5 px-4">Target (T)</th>
                          <th className="py-2.5 px-4">Capaian Realisasi (C)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {[2025, 2026, 2027, 2028, 2029].map((yr) => (
                          <tr key={yr} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-4 font-bold text-slate-900">
                              Tahun {yr} {yr === 2026 && <span className="text-[10px] text-blue-600 font-semibold">(Berjalan)</span>}
                            </td>
                            <td className="py-2.5 px-4">
                              <input
                                type="text"
                                value={annualRows[yr]?.target || ''}
                                onChange={(e) => {
                                  const val = metricType === 'number' ? formatIndonesianNumber(e.target.value) : e.target.value;
                                  setAnnualRows((prev) => ({
                                    ...prev,
                                    [yr]: { ...prev[yr], target: val },
                                  }));
                                }}
                                placeholder={yr === 2026 ? numberTarget || 'Target tahun 2026' : 'Target tahunan'}
                                className="h-9 w-full px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC]"
                              />
                            </td>
                            <td className="py-2.5 px-4">
                              <input
                                type="text"
                                value={annualRows[yr]?.capaian || ''}
                                onChange={(e) => {
                                  const val = metricType === 'number' ? formatIndonesianNumber(e.target.value) : e.target.value;
                                  setAnnualRows((prev) => ({
                                    ...prev,
                                    [yr]: { ...prev[yr], capaian: val },
                                  }));
                                }}
                                placeholder={yr === 2026 ? numberCapaian || 'Realisasi tahun 2026' : '—'}
                                className="h-9 w-full px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC]"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section 4: Kendala & Catatan Pelaksanaan (Isu Strategis) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        4. Kendala & Catatan Pelaksanaan (Isu Strategis)
                      </h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Daftar kendala ini otomatis muncul pada popover kartu dan halaman detail program.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddKendala}
                      className="h-8 px-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah Kendala</span>
                    </button>
                  </div>

                  {kendalaList.length === 0 ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                      Belum ada kendala yang dicatat. Klik tombol <strong>+ Tambah Kendala</strong> jika terdapat isu pelaksanaan program.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {kendalaList.map((k, idx) => (
                        <div
                          key={k.id || idx}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 relative group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              <span>Kendala #{idx + 1}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveKendala(idx)}
                              className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                            >
                              Hapus Kendala
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Ringkasan / Judul Kendala <span className="text-rose-600">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={k.title}
                                onChange={(e) => handleUpdateKendala(idx, 'title', e.target.value)}
                                placeholder="Contoh: Usulan Anggaran Belanja Tambahan (ABT)"
                                className="h-9 w-full px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#4F83CC]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                K/L Terkait
                              </label>
                              <input
                                type="text"
                                value={k.klTerkait || ''}
                                onChange={(e) => handleUpdateKendala(idx, 'klTerkait', e.target.value)}
                                placeholder="Contoh: Kemenkeu, Kemenag"
                                className="h-9 w-full px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#4F83CC]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Uraian Lengkap Kendala <span className="text-rose-600">*</span>
                            </label>
                            <textarea
                              rows={2}
                              required
                              value={k.kendala}
                              onChange={(e) => handleUpdateKendala(idx, 'kendala', e.target.value)}
                              placeholder="Jelaskan kendala operasional, administratif, atau regulasi yang dihadapi..."
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#4F83CC]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Tindak Lanjut / Rekomendasi Orkestrasi PMK
                            </label>
                            <textarea
                              rows={2}
                              value={k.tindakLanjut}
                              onChange={(e) => handleUpdateKendala(idx, 'tindakLanjut', e.target.value)}
                              placeholder="Langkah koordinasi dan tindak lanjut penyelesaian..."
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#4F83CC]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 5: Keterangan & Deskripsi Lengkap Kebijakan */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                    5. Keterangan & Deskripsi Lengkap Kebijakan
                  </h2>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Keterangan Ringkas (Subtext pada Kartu)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.subtext}
                      onChange={(e) => setFormData((prev) => ({ ...prev, subtext: e.target.value }))}
                      placeholder="Keterangan singkat indikator..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Deskripsi Lengkap Kebijakan / Program
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Uraian rinci dasar pelaksanaan dan kebijakan pengawalan Kemenko PMK..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] transition-all"
                    />
                  </div>

                  {/* Toggle Aktif */}
                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <label htmlFor="card-is-active" className="text-xs font-bold text-slate-900 block cursor-pointer">
                        Tampilkan di Dashboard Utama
                      </label>
                      <span className="text-[11px] text-slate-500">
                        Indikator akan langsung ditampilkan pada ikhtisar dan detail dashboard eksekutif.
                      </span>
                    </div>
                    <input
                      id="card-is-active"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                      className="h-5 w-5 accent-[#4F83CC] rounded-md cursor-pointer"
                    />
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className="h-10 px-5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="h-10 px-6 rounded-xl bg-[#4F83CC] hover:bg-[#3f72bb] active:bg-[#33609f] disabled:bg-slate-300 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Menyimpan ke Database...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 stroke-[2]" />
                        <span>Simpan Indikator & Detail Program</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW MODE C: INFORMASI TAMPILAN DEPAN (METADATA SETTINGS)        */}
          {/* =============================================================== */}
          {viewMode === 'metadata' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 stroke-[1.75]" />
                  <span>Kembali ke Daftar</span>
                </button>

                <div className="text-xs font-semibold text-slate-500">
                  Konfigurasi: <span className="text-[#4F83CC] font-bold">Informasi Tampilan Depan</span>
                </div>
              </div>

              <form onSubmit={handleSaveMetadata} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900">
                    Pengaturan Informasi Tampilan Halaman Depan
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Informasi ini ditampilkan pada judul utama, subjudul, dan tanggal cutoff laporan eksekutif.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Judul Utama Dashboard
                  </label>
                  <input
                    type="text"
                    required
                    value={metadata.title}
                    onChange={(e) => setMetadata((prev) => ({ ...prev, title: e.target.value }))}
                    className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Subjudul / Instansi
                  </label>
                  <input
                    type="text"
                    required
                    value={metadata.subtitle}
                    onChange={(e) => setMetadata((prev) => ({ ...prev, subtitle: e.target.value }))}
                    className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tanggal Cutoff Data
                    </label>
                    <input
                      type="text"
                      required
                      value={metadata.cutoffDate}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, cutoffDate: e.target.value }))}
                      className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Sebutan Jabatan Menteri
                    </label>
                    <input
                      type="text"
                      required
                      value={metadata.ministerTitle}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, ministerTitle: e.target.value }))}
                      className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC] transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingMeta}
                    className="h-10 px-6 rounded-xl bg-[#4F83CC] hover:bg-[#3f72bb] text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    {isSavingMeta ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Simpan Pengaturan Tampilan Depan</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW MODE D: MANAJEMEN PENGGUNA (USER MANAGEMENT)                */}
          {/* =============================================================== */}
          {viewMode === 'users' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Daftar Akun Pengguna Terdaftar</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kelola identitas, kata sandi, dan hak akses pengguna sistem eksekutif Kemenko PMK.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openCreateUserModal}
                    className="h-9 px-4 rounded-xl bg-[#4F83CC] hover:bg-[#3f72bb] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors self-start sm:self-auto"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Pengguna</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4 w-12 text-center">No</th>
                        <th className="py-3 px-4 min-w-[180px]">Nama Lengkap</th>
                        <th className="py-3 px-4 min-w-[140px]">Username</th>
                        <th className="py-3 px-4 min-w-[180px]">Email Kedinasan</th>
                        <th className="py-3 px-4 min-w-[160px]">Peran / Role</th>
                        <th className="py-3 px-4 w-28 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {loadingUsers ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#4F83CC] mb-2" />
                            <span>Memuat data pengguna...</span>
                          </td>
                        </tr>
                      ) : usersList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500">
                            Belum ada data pengguna yang tersimpan di database.
                          </td>
                        </tr>
                      ) : (
                        usersList.map((u, idx) => {
                          const roleMeta = ROLE_OPTIONS.find((r) => r.value === u.role) || {
                            label: u.role,
                            badge: 'bg-slate-100 text-slate-800 border-slate-200',
                          };

                          return (
                            <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                                {idx + 1}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-slate-900">
                                {u.name}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-slate-700">
                                @{u.username}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600">
                                {u.email || '—'}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleMeta.badge}`}>
                                  {roleMeta.label}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => openEditUserModal(u)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                    title="Edit Akun Pengguna"
                                  >
                                    <Pencil className="h-3.5 w-3.5 stroke-[2]" />
                                  </button>
                                  {u.username !== 'admin' && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteUser(u)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                      title="Hapus Akun Pengguna"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 stroke-[2]" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: PENGATURAN UNDUH RINGKASAN (PDF SETTINGS) */}
          {viewMode === 'pdf-settings' && (
            <div className="space-y-6">
              {/* Executive Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Indikator</span>
                    <Layers className="h-4 w-4 text-slate-400 stroke-[1.75]" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{totalPdfCards}</div>
                  <p className="text-[11px] text-slate-500 mt-1">Seluruh indikator program pada 4 pilar</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
                  <div className="flex items-center justify-between text-emerald-700 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Masuk Ringkasan (ON)</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 stroke-[2]" />
                  </div>
                  <div className="text-2xl font-black text-emerald-700">{includedPdfCount}</div>
                  <p className="text-[11px] text-emerald-600 mt-1">Indikator disertakan saat unduh PDF</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Dikecualikan (OFF)</span>
                    <EyeOff className="h-4 w-4 text-slate-400 stroke-[1.75]" />
                  </div>
                  <div className="text-2xl font-black text-slate-600">{excludedPdfCount}</div>
                  <p className="text-[11px] text-slate-500 mt-1">Tidak dicantumkan dalam lembar ringkasan</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-2xs bg-blue-50/20">
                  <div className="flex items-center justify-between text-blue-700 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Cakupan Ringkasan</span>
                    <Percent className="h-4 w-4 text-blue-600 stroke-[2]" />
                  </div>
                  <div className="text-2xl font-black text-blue-700">
                    {totalPdfCards > 0 ? Math.round((includedPdfCount / totalPdfCards) * 100) : 0}%
                  </div>
                  <p className="text-[11px] text-blue-600 mt-1">Proporsi indikator terpilih dalam dokumen</p>
                </div>
              </div>

              {/* Unsaved Changes Banner */}
              {isPdfDirty && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                    </span>
                    <span className="font-semibold">
                      Anda telah mengubah pilihan indikator ringkasan. Klik tombol <strong>Terapkan Pengaturan Unduhan</strong> untuk mengunci perubahan ini ke dokumen PDF.
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={isApplyingPdfSettings}
                    onClick={handleApplyPdfSettings}
                    className="h-8 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isApplyingPdfSettings ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCheck className="h-3.5 w-3.5 stroke-[2.5]" />
                    )}
                    <span>Terapkan Sekarang</span>
                  </button>
                </div>
              )}

              {/* Main Table Container */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                {/* Header & Filter Controls */}
                <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <FileDown className="h-4 w-4 text-[#4F83CC]" />
                        <span>Daftar Indikator Ringkasan Eksekutif</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Gunakan tombol toggle pada setiap indikator untuk menentukan data apa saja yang masuk ke dalam ringkasan PDF yang diunduh.
                      </p>
                    </div>

                    {/* Bulk Actions & Tombol Terapkan */}
                    <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleBulkTogglePdf(true)}
                        className="h-8 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Aktifkan seluruh indikator pada filter saat ini"
                      >
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>Aktifkan Semua (ON)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBulkTogglePdf(false)}
                        className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Nonaktifkan seluruh indikator pada filter saat ini"
                      >
                        <X className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>Nonaktifkan Semua (OFF)</span>
                      </button>

                      {/* Tombol Terapkan di Header Tabel */}
                      <button
                        type="button"
                        disabled={isApplyingPdfSettings}
                        onClick={handleApplyPdfSettings}
                        className={`h-8 px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                          isPdfDirty
                            ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-400 ring-offset-1 font-extrabold'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        } disabled:opacity-50`}
                        title="Simpan dan terapkan pengaturan indikator ke dokumen ringkasan PDF"
                      >
                        {isApplyingPdfSettings ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCheck className="h-3.5 w-3.5 stroke-[2.5]" />
                        )}
                        <span>{isApplyingPdfSettings ? 'Menerapkan...' : 'Terapkan Pengaturan Unduhan'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter Pills & Search */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    {/* Pillar Filters */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {PILLAR_NAV_CONFIGS.map((p) => {
                        const isSelected = pdfPillarFilter === p.id;
                        const count =
                          p.id === 'all'
                            ? cards.length
                            : cards.filter((c) => c.pillarId === p.id).length;
                        const included =
                          p.id === 'all'
                            ? cards.filter((c) => c.includeInPdf !== false).length
                            : cards.filter((c) => c.pillarId === p.id && c.includeInPdf !== false).length;

                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setPdfPillarFilter(p.id)}
                            className={`h-8 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{p.label}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                                isSelected
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-white text-slate-600 border border-slate-200'
                              }`}
                            >
                              {included}/{count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Search Input */}
                    <div className="relative min-w-[220px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={pdfSearchQuery}
                        onChange={(e) => setPdfSearchQuery(e.target.value)}
                        placeholder="Cari program / PIC..."
                        className="h-8 w-full pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-blue-500 transition-colors"
                      />
                      {pdfSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setPdfSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Table of Indicators */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4 w-12 text-center">No</th>
                        <th className="py-3 px-4 min-w-[260px]">Indikator Program Prioritas</th>
                        <th className="py-3 px-4 w-36">Pilar</th>
                        <th className="py-3 px-4 w-44">Target & Realisasi 2026</th>
                        <th className="py-3 px-4 w-56 text-center">Status di Ringkasan PDF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {pdfFilteredCards.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-500">
                            Tidak ada indikator yang sesuai dengan filter pencarian.
                          </td>
                        </tr>
                      ) : (
                        pdfFilteredCards.map((card, idx) => {
                          const isIncluded = card.includeInPdf !== false;
                          const pilarBadge =
                            card.pillarId === 'pendidikan'
                              ? { label: 'Pendidikan', badge: 'bg-blue-50 text-blue-700 border-blue-200' }
                              : card.pillarId === 'kesehatan'
                              ? { label: 'Kesehatan', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
                              : card.pillarId === 'bencana'
                              ? { label: 'Kebencanaan', badge: 'bg-amber-50 text-amber-800 border-amber-200' }
                              : { label: 'Kemiskinan', badge: 'bg-rose-50 text-rose-700 border-rose-200' };

                          return (
                            <tr
                              key={card.id}
                              className={`transition-colors ${
                                isIncluded ? 'hover:bg-slate-50/80' : 'bg-slate-50/40 opacity-75 hover:opacity-100 hover:bg-slate-50'
                              }`}
                            >
                              <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                                {idx + 1}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="space-y-0.5">
                                  <div className="font-bold text-slate-900 leading-snug">
                                    {card.title}
                                  </div>
                                  {card.subtext && (
                                    <div className="text-[11px] text-slate-500 line-clamp-1">
                                      {card.subtext}
                                    </div>
                                  )}
                                  {card.picKementerian && (
                                    <div className="text-[10px] text-slate-400 font-medium">
                                      PIC: {card.picKementerian}
                                    </div>
                                  )}
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${pilarBadge.badge}`}
                                >
                                  {pilarBadge.label}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-slate-700">
                                <div className="space-y-0.5 text-xs">
                                  <div className="font-bold text-slate-900">
                                    {card.value} <span className="text-[11px] font-normal text-slate-500">{card.unit}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    {card.target.replace(/^Target(\s*2026)?:\s*/i, 'Target: ')}
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex items-center justify-center gap-3">
                                  {/* Toggle Switch */}
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isIncluded}
                                    onClick={() => handleToggleIncludePdf(card)}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                      isIncluded ? 'bg-blue-600' : 'bg-slate-300'
                                    }`}
                                    title={isIncluded ? 'Klik untuk mengeluarkan dari PDF' : 'Klik untuk memasukkan ke PDF'}
                                  >
                                    <span
                                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                        isIncluded ? 'translate-x-5' : 'translate-x-0'
                                      }`}
                                    />
                                  </button>

                                  {/* Status Label Badge */}
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors select-none ${
                                      isIncluded
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                    }`}
                                  >
                                    {isIncluded ? (
                                      <>
                                        <Check className="h-3 w-3 text-emerald-600 stroke-[3]" />
                                        <span>Masuk PDF</span>
                                      </>
                                    ) : (
                                      <>
                                        <X className="h-3 w-3 text-slate-400 stroke-[2.5]" />
                                        <span>Dikecualikan</span>
                                      </>
                                    )}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Stats */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                  <div>
                    Menampilkan <span className="font-bold text-slate-800">{pdfFilteredCards.length}</span> indikator (dari total {cards.length} indikator)
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>Masuk Ringkasan: <strong className="text-slate-800">{pdfFilteredCards.filter((c) => c.includeInPdf !== false).length}</strong></span>
                    <span className="mx-1">·</span>
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                    <span>Dikecualikan: <strong className="text-slate-800">{pdfFilteredCards.filter((c) => c.includeInPdf === false).length}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* USER MANAGEMENT MODAL (CREATE / EDIT USER) */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingUser ? `Edit Akun: @${editingUser.username}` : 'Tambah Pengguna Baru'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tentukan identitas dan hak akses akun.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUserModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              {userError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800">
                  {userError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Lengkap & Gelar <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={userFormData.name}
                  onChange={(e) => setUserFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: Dr. H. Ahmad Fauzi, S.E., M.Si."
                  className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC]"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Username Akun <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userFormData.username}
                    onChange={(e) => setUserFormData((prev) => ({ ...prev, username: e.target.value }))}
                    placeholder="Contoh: eselon1_deputi"
                    className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Kedinasan
                </label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Contoh: deputi@kemenkopmk.go.id"
                  className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Peran / Hak Akses Sistem <span className="text-rose-600">*</span>
                </label>
                <select
                  value={userFormData.role}
                  onChange={(e) =>
                    setUserFormData((prev) => ({
                      ...prev,
                      role: e.target.value as CmsUserItem['role'],
                    }))
                  }
                  className="h-10 w-full px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#4F83CC]"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {editingUser ? 'Reset Password (Kosongkan bila tidak diubah)' : 'Kata Sandi (Password) *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  placeholder={editingUser ? 'Masukkan password baru bila ingin mereset' : 'Minimal 6 karakter'}
                  value={userFormData.password}
                  onChange={(e) => setUserFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="h-10 px-5 rounded-xl bg-[#4F83CC] hover:bg-[#3f72bb] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:bg-slate-300"
                >
                  {isSavingUser ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>{editingUser ? 'Simpan Perubahan' : 'Buat Akun'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
