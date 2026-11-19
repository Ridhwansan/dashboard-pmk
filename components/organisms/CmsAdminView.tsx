'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
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
  Sliders,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Users,
  Percent,
  FileText,
  CheckCircle2,
  UserPlus,
  FileDown,
  CheckCheck,
  UploadCloud,
  Download,
  GripVertical,
} from 'lucide-react';
import {
  CmsCardItem,
  CmsPillarItem,
  SupersetEmbedConfig,
  CustomExcelTableData,
  CustomExcelColumn,
} from '@/types/cms';
import { PillarId } from '@/types/dashboard';
import {
  downloadFile,
  parseDelimitedText,
  generateCustomTableCsv,
  formatIndonesianDateTime,
} from '@/lib/excelParser';
import { calculatePercentage } from '@/lib/calcPercent';
import { useAuth } from '@/lib/useAuth';
import { setClientCardsCache } from '@/lib/useCmsCards';
import { KendalaDetailItem } from '@/data/programDetailData';
import { ExecutivePdfButton } from '@/components/molecules/ExecutivePdfButton';

export type PillarTab = 'all' | string;
export type CategoryFilter = 'all' | 'PKPN' | 'Isu Strategis' | 'RPJMN';
export type CmsViewMode = 'list' | 'create' | 'edit' | 'metadata' | 'users' | 'pdf-settings' | 'pillars';
export type MetricType = 'number' | 'percent' | 'text';

export const INITIAL_PILLARS: CmsPillarItem[] = [
  { id: 'pendidikan', name: 'Pendidikan', description: 'Pilar Pembangunan Manusia bidang Pendidikan dan Kebudayaan', order: 1 },
  { id: 'kesehatan', name: 'Kesehatan', description: 'Pilar Peningkatan Kualitas Kesehatan Masyarakat', order: 2 },
  { id: 'bencana', name: 'Kebencanaan', description: 'Pilar Penanggulangan dan Mitigasi Bencana', order: 3 },
  { id: 'kemiskinan', name: 'Penurunan Kemiskinan', description: 'Pilar Percepatan Penghapusan Kemiskinan Ekstrem dan Penurunan Kemiskinan', order: 4 },
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

/**
 * Returns the 3-column Z-grid position label for a given card order.
 * e.g. 1 -> "Baris 1 • Kiri", 2 -> "Baris 1 • Tengah", 3 -> "Baris 1 • Kanan",
 *      4 -> "Baris 2 • Kiri", 5 -> "Baris 2 • Tengah", 6 -> "Baris 2 • Kanan"
 */
export function getGridZPositionLabel(order: number): string {
  const safeOrder = Math.max(1, order || 1);
  const row = Math.floor((safeOrder - 1) / 3) + 1;
  const colIndex = (safeOrder - 1) % 3;
  const colLabel = colIndex === 0 ? 'Kiri' : colIndex === 1 ? 'Tengah' : 'Kanan';
  return `B${row} • ${colLabel}`;
}

export const CmsAdminView: React.FC = () => {
  const { logout } = useAuth();
  const router = useRouter();

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
  const [filterKey, setFilterKey] = useState<string>('all|all|');
  const itemsPerPage = 10;

  // Adjust page to 1 during render when filters change (React recommended pattern)
  const currentFilterKey = `${selectedPillar}|${selectedCategory}|${searchQuery}`;
  if (currentFilterKey !== filterKey) {
    setFilterKey(currentFilterKey);
    setCurrentPage(1);
  }

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
    order: number;
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
    order: 1,
  });

  // Annual Targets (2025–2029) directly connected to program detail
  const [annualRows, setAnnualRows] = useState<Record<number, { target: string; capaian: string }>>({
    2025: { target: '', capaian: '' },
    2026: { target: '', capaian: '' },
    2027: { target: '', capaian: '' },
    2028: { target: '', capaian: '' },
    2029: { target: '', capaian: '' },
  });

  // Pillars Management State
  const [pillars, setPillars] = useState<CmsPillarItem[]>(INITIAL_PILLARS);
  const [isPillarModalOpen, setIsPillarModalOpen] = useState(false);
  const [editingPillar, setEditingPillar] = useState<CmsPillarItem | null>(null);
  const [pillarFormData, setPillarFormData] = useState({
    id: '',
    name: '',
    description: '',
    order: 1,
  });
  const [isSavingPillar, setIsSavingPillar] = useState(false);
  const [pillarError, setPillarError] = useState<string | null>(null);

  // Kendala & Catatan Pelaksanaan (Isu Strategis) directly connected to program detail
  const [kendalaList, setKendalaList] = useState<KendalaDetailItem[]>([]);
  const [isKendalaModalOpen, setIsKendalaModalOpen] = useState(false);
  const [editingKendalaIndex, setEditingKendalaIndex] = useState<number | null>(null);
  const [kendalaFormData, setKendalaFormData] = useState<KendalaDetailItem>({
    id: '',
    title: '',
    klTerkait: '',
    kendala: '',
    tindakLanjut: '',
  });
  const [draggedKendalaIndex, setDraggedKendalaIndex] = useState<number | null>(null);
  const [dragOverKendalaIndex, setDragOverKendalaIndex] = useState<number | null>(null);

  const [formActiveTab, setFormActiveTab] = useState<'info' | 'superset' | 'excel' | 'kendala'>('info');

  // Cards Table Drag & Drop Reordering
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);

  // Apache Superset Embed State (Visualisasi Analitik Tunggal)
  const [supersetEmbed, setSupersetEmbed] = useState<SupersetEmbedConfig>({
    enabled: true,
    srcUrl: '',
    url: '',
    uuid: '',
    widthPercent: 100,
    heightPx: 450,
    iframeCode: '',
    title: '',
    updatedAt: '',
  });

  // Multiple Custom Excel Table Sections
  const [customExcelTables, setCustomExcelTables] = useState<CustomExcelTableData[]>([]);
  const [excelUploadFeedbackMap, setExcelUploadFeedbackMap] = useState<Record<number, string>>({});

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

  // Fetch pillars from API
  const fetchPillars = async () => {
    try {
      const res = await fetch('/api/pillars', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setPillars(json.data);
        }
      }
    } catch {
      // offline/fallback
    }
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const [cardsRes, metaRes, pillarsRes] = await Promise.all([
          fetch('/api/cards?all=true', { cache: 'no-store' }),
          fetch('/api/meta', { cache: 'no-store' }),
          fetch('/api/pillars', { cache: 'no-store' }),
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
        if (pillarsRes.ok && active) {
          const pillarsJson = await pillarsRes.json();
          if (pillarsJson.data && Array.isArray(pillarsJson.data)) {
            setPillars(pillarsJson.data);
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
    if (viewMode !== 'users') return;
    let isMounted = true;
    fetch('/api/users', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (isMounted && json?.data && Array.isArray(json.data)) {
          setUsersList(json.data);
          setLoadingUsers(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingUsers(false);
      });

    return () => {
      isMounted = false;
    };
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
    const currentFiltered = cards.filter((card) => {
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
    const targetCards = currentFiltered.filter((c) => (c.includeInPdf !== false) !== enable);
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
    if (!confirm('Sinkronisasi ulang seluruh 42 kartu master resmi ke database? Perubahan kustom akan ditimpa.')) return;
    try {
      setLoading(true);
      const res = await fetch('/api/cards/reset', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setCards(json.data);
        setClientCardsCache(json.data);
        showToast('Seluruh 42 data master resmi berhasil disinkronisasi');
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
      order: cards.length + 1,
    });

    setAnnualRows({
      2025: { target: '', capaian: '' },
      2026: { target: '', capaian: '' },
      2027: { target: '', capaian: '' },
      2028: { target: '', capaian: '' },
      2029: { target: '', capaian: '' },
    });

    const initialPillar = selectedPillar !== 'all' ? selectedPillar : (pillars[0]?.id || 'pendidikan');
    setFormData((prev) => ({
      ...prev,
      pillarId: initialPillar,
    }));

    setKendalaList([]);
    setSupersetEmbed({
      enabled: false,
      srcUrl: '',
      url: '',
      uuid: '',
      widthPercent: 100,
      heightPx: 450,
      iframeCode: '',
      title: '',
      updatedAt: '',
    });
    setCustomExcelTables([
      {
        id: `sec_${Date.now()}`,
        title: 'Matriks Rincian Komponen & Data Khusus',
        tableName: 'Matriks Rincian Komponen & Data Khusus',
        columns: [
          { id: 'col_1', key: 'no', name: 'No', label: 'No' },
          { id: 'col_2', key: 'program_atau_komponen', name: 'Program atau Komponen', label: 'Program atau Komponen' },
          { id: 'col_3', key: 'indikasi_data_khusus', name: 'Indikasi data khusus yang diperlukan', label: 'Indikasi data khusus yang diperlukan' },
        ],
        rows: [],
        rowCount: 0,
      },
    ]);
    setExcelUploadFeedbackMap({});
    setEditingCardId(null);
    setFormActiveTab('info');
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
      order: card.order ?? 1,
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

    // Extract superset embed (Visualisasi Analitik Tunggal)
    setSupersetEmbed(
      card.supersetEmbed || {
        enabled: false,
        srcUrl: '',
        url: '',
        uuid: '',
        widthPercent: 100,
        heightPx: 450,
        iframeCode: '',
        title: '',
        updatedAt: '',
      }
    );

    // Extract multiple custom excel tables
    if (card.customExcelTables && card.customExcelTables.length > 0) {
      setCustomExcelTables(card.customExcelTables);
    } else if (card.customExcelTable) {
      setCustomExcelTables([card.customExcelTable]);
    } else {
      setCustomExcelTables([
        {
          id: `sec_${Date.now()}`,
          title: card.title || 'Matriks Rincian Komponen & Data Khusus',
          tableName: card.title || 'Matriks Rincian Komponen & Data Khusus',
          columns: [
            { id: 'col_1', key: 'no', name: 'No', label: 'No' },
            { id: 'col_2', key: 'program_atau_komponen', name: 'Program atau Komponen', label: 'Program atau Komponen' },
            { id: 'col_3', key: 'indikasi_data_khusus', name: 'Indikasi data khusus yang diperlukan', label: 'Indikasi data khusus yang diperlukan' },
          ],
          rows: [],
          rowCount: 0,
        },
      ]);
    }
    setExcelUploadFeedbackMap({});

    setFormActiveTab('info');
    setViewMode('edit');
  };

  // ---------------------------------------------------------------------------
  // Kendala Modal & Drag-and-Drop Handlers
  // ---------------------------------------------------------------------------
  const openAddKendalaModal = () => {
    setEditingKendalaIndex(null);
    setKendalaFormData({
      id: `knd_${Date.now()}`,
      title: '',
      klTerkait: formData.picKementerian || '',
      kendala: '',
      tindakLanjut: '',
      urgensi: 'Tinggi',
    });
    setIsKendalaModalOpen(true);
  };

  const openEditKendalaModal = (index: number) => {
    setEditingKendalaIndex(index);
    setKendalaFormData({ ...kendalaList[index] });
    setIsKendalaModalOpen(true);
  };

  const handleSaveKendalaModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kendalaFormData.title.trim()) {
      alert('Judul kendala wajib diisi.');
      return;
    }
    if (!kendalaFormData.kendala.trim()) {
      alert('Uraian lengkap kendala wajib diisi.');
      return;
    }

    if (editingKendalaIndex !== null) {
      setKendalaList((prev) => {
        const next = [...prev];
        next[editingKendalaIndex] = { ...kendalaFormData };
        return next;
      });
    } else {
      setKendalaList((prev) => [...prev, { ...kendalaFormData }]);
    }
    setIsKendalaModalOpen(false);
  };

  const handleRemoveKendala = (index: number) => {
    if (!confirm('Hapus kendala ini?')) return;
    setKendalaList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKendalaDragStart = (e: React.DragEvent, index: number) => {
    setDraggedKendalaIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleKendalaDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverKendalaIndex !== index) {
      setDragOverKendalaIndex(index);
    }
  };

  const handleKendalaDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedKendalaIndex === null || draggedKendalaIndex === targetIndex) {
      setDraggedKendalaIndex(null);
      setDragOverKendalaIndex(null);
      return;
    }
    const nextList = [...kendalaList];
    const [moved] = nextList.splice(draggedKendalaIndex, 1);
    nextList.splice(targetIndex, 0, moved);
    setKendalaList(nextList);
    setDraggedKendalaIndex(null);
    setDragOverKendalaIndex(null);
  };

  const handleKendalaDragEnd = () => {
    setDraggedKendalaIndex(null);
    setDragOverKendalaIndex(null);
  };

  // ---------------------------------------------------------------------------
  // Pillar CRUD Handlers
  // ---------------------------------------------------------------------------
  const openCreatePillarModal = () => {
    setEditingPillar(null);
    setPillarFormData({
      id: '',
      name: '',
      description: '',
      order: pillars.length + 1,
    });
    setPillarError(null);
    setIsPillarModalOpen(true);
  };

  const openEditPillarModal = (p: CmsPillarItem) => {
    setEditingPillar(p);
    setPillarFormData({
      id: p.id,
      name: p.name,
      description: p.description || '',
      order: p.order || 1,
    });
    setPillarError(null);
    setIsPillarModalOpen(true);
  };

  const handleSavePillar = async (e: React.FormEvent) => {
    e.preventDefault();
    setPillarError(null);
    if (!pillarFormData.name.trim()) {
      setPillarError('Nama pilar wajib diisi.');
      return;
    }

    setIsSavingPillar(true);
    try {
      if (editingPillar) {
        const res = await fetch(`/api/pillars/${editingPillar.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: pillarFormData.name.trim(),
            description: pillarFormData.description.trim(),
            order: Number(pillarFormData.order) || 1,
          }),
        });
        const json = await res.json();
        if (res.ok && json.success) {
          showToast(`Pilar "${pillarFormData.name}" berhasil diperbarui.`);
          setIsPillarModalOpen(false);
          await fetchPillars();
        } else {
          setPillarError(json.error || 'Gagal memperbarui pilar.');
        }
      } else {
        const res = await fetch('/api/pillars', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: pillarFormData.id.trim() || undefined,
            name: pillarFormData.name.trim(),
            description: pillarFormData.description.trim(),
            order: Number(pillarFormData.order) || 1,
          }),
        });
        const json = await res.json();
        if (res.ok && json.success) {
          showToast(`Pilar "${pillarFormData.name}" berhasil ditambahkan.`);
          setIsPillarModalOpen(false);
          await fetchPillars();
        } else {
          setPillarError(json.error || 'Gagal menambahkan pilar baru.');
        }
      }
    } catch {
      setPillarError('Terjadi kesalahan jaringan.');
    } finally {
      setIsSavingPillar(false);
    }
  };

  const handleDeletePillar = async (p: CmsPillarItem) => {
    const count = cards.filter((c) => c.pillarId === p.id).length;
    if (count > 0) {
      alert(`Pilar "${p.name}" tidak dapat dihapus karena masih memuat ${count} program aktif. Silakan hapus atau pindahkan program tersebut terlebih dahulu.`);
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus pilar "${p.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/pillars/${p.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`Pilar "${p.name}" berhasil dihapus.`);
        await fetchPillars();
      } else {
        alert(json.error || 'Gagal menghapus pilar.');
      }
    } catch {
      alert('Terjadi kesalahan jaringan saat menghapus pilar.');
    }
  };

  // ---------------------------------------------------------------------------
  // Apache Superset Embed Handlers (Single Embed, Clean)
  // ---------------------------------------------------------------------------
  const handleSupersetEmbedCodeChange = (codeOrUrl: string) => {
    let srcUrl = codeOrUrl.trim();
    const srcMatch = codeOrUrl.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      srcUrl = srcMatch[1];
    }
    const uuidMatch = srcUrl.match(/\/p\/([a-zA-Z0-9_-]+)/i);
    const uuid = uuidMatch ? uuidMatch[1] : '';

    setSupersetEmbed({
      enabled: Boolean(srcUrl || uuid),
      iframeCode: codeOrUrl,
      srcUrl,
      url: srcUrl,
      uuid: uuid,
      widthPercent: 100,
      heightPx: 450,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleClearSupersetEmbed = () => {
    setSupersetEmbed({
      enabled: false,
      srcUrl: '',
      url: '',
      uuid: '',
      widthPercent: 100,
      heightPx: 450,
      iframeCode: '',
      title: '',
      updatedAt: new Date().toISOString(),
    });
    showToast('Embed Apache Superset dikosongkan.');
  };

  // ---------------------------------------------------------------------------
  // Multiple Custom Excel Table Section Handlers
  // ---------------------------------------------------------------------------
  const handleAddExcelTableSection = () => {
    const newIdx = customExcelTables.length + 1;
    const newSec: CustomExcelTableData = {
      id: `sec_${Date.now()}_${newIdx}`,
      title: `Matriks Data ${newIdx}`,
      tableName: `Matriks Data ${newIdx}`,
      description: '',
      columns: [
        { id: 'col_1', key: 'no', name: 'No', label: 'No' },
        { id: 'col_2', key: 'program_atau_komponen', name: 'Program atau Komponen', label: 'Program atau Komponen' },
        { id: 'col_3', key: 'indikasi_data_khusus', name: 'Indikasi data khusus yang diperlukan', label: 'Indikasi data khusus yang diperlukan' },
      ],
      rows: [],
      rowCount: 0,
    };
    setCustomExcelTables((prev) => [...prev, newSec]);
    showToast(`Section tabel "${newSec.title}" ditambahkan.`);
  };

  const handleRemoveExcelTableSection = (index: number) => {
    if (customExcelTables.length <= 1) {
      alert('Minimal harus ada 1 section tabel.');
      return;
    }
    if (!confirm('Apakah Anda yakin ingin menghapus section tabel ini?')) return;
    setCustomExcelTables((prev) => prev.filter((_, i) => i !== index));
    showToast('Section tabel berhasil dihapus.');
  };

  const handleUpdateSectionTitle = (index: number, title: string) => {
    setCustomExcelTables((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], title, tableName: title };
      return next;
    });
  };

  const handleUpdateSectionDesc = (index: number, description: string) => {
    setCustomExcelTables((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], description };
      return next;
    });
  };

  const handleUploadTemplateFile = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      let parsedCols: CustomExcelColumn[] | null = null;
      if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        try {
          const text = await file.text();
          const parsed = parseDelimitedText(text);
          if (parsed.headers.length > 0) {
            parsedCols = parsed.headers.map((h, i) => ({
              id: `col_${i + 1}`,
              name: h,
              label: h,
              key: h.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30) || `col_${i}`,
            }));
          }
        } catch {
          // ignore
        }
      }

      setCustomExcelTables((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          templateFileName: file.name,
          templateFileBase64: base64,
          ...(parsedCols ? { columns: parsedCols } : {}),
        };
        return next;
      });
      showToast(`Template file "${file.name}" berhasil diunggah.`);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadSectionTemplate = (index: number) => {
    const sec = customExcelTables[index];
    if (!sec) return;

    if (sec.templateFileBase64 && sec.templateFileName) {
      const a = document.createElement('a');
      a.href = sec.templateFileBase64;
      a.download = sec.templateFileName;
      a.click();
      showToast(`Template "${sec.templateFileName}" diunduh.`);
    } else {
      const cols = sec.columns && sec.columns.length > 0 ? sec.columns : [
        { id: 'col_1', key: 'no', name: 'No', label: 'No' },
        { id: 'col_2', key: 'program_atau_komponen', name: 'Program atau Komponen', label: 'Program atau Komponen' },
        { id: 'col_3', key: 'indikasi_data_khusus', name: 'Indikasi data khusus yang diperlukan', label: 'Indikasi data khusus yang diperlukan' },
      ];
      const csvContent = generateCustomTableCsv(cols, []);
      const filename = `Template_${(sec.title || formData.title || 'Indikator').replace(/\s+/g, '_')}.csv`;
      downloadFile(filename, csvContent);
      showToast(`Template "${filename}" diunduh.`);
    }
  };

  const handleUploadDataFile = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseDelimitedText(text);
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        setExcelUploadFeedbackMap((prev) => ({
          ...prev,
          [index]: 'File tidak memiliki baris data atau kosong.',
        }));
        return;
      }

      const newCols: CustomExcelColumn[] = parsed.headers.map((h, i) => ({
        id: `col_${i + 1}`,
        name: h,
        label: h,
        key: h.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30) || `col_${i}`,
      }));

      const normalizedRows: Record<string, string>[] = parsed.rows.map((r) => {
        const rowObj: Record<string, string> = {};
        parsed.headers.forEach((h, idx) => {
          const colKey = newCols[idx].key;
          rowObj[colKey] = r[h] || '';
          rowObj[h] = r[h] || '';
        });
        return rowObj;
      });

      const nowIso = new Date().toISOString();
      setCustomExcelTables((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          columns: newCols,
          rows: normalizedRows,
          fileName: file.name,
          rowCount: normalizedRows.length,
          uploadedAt: nowIso,
          lastUploadedAt: nowIso,
        };
        return next;
      });

      setExcelUploadFeedbackMap((prev) => ({
        ...prev,
        [index]: `Berhasil memuat ${normalizedRows.length} baris data dari "${file.name}".`,
      }));
      showToast(`Data Excel berhasil diunggah (${normalizedRows.length} baris)`);
    } catch (err) {
      console.error('Error parsing excel CSV:', err);
      setExcelUploadFeedbackMap((prev) => ({
        ...prev,
        [index]: 'Gagal membaca file. Pastikan format CSV valid.',
      }));
    }
  };

  const handleClearSectionData = (index: number) => {
    setCustomExcelTables((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        rows: [],
        rowCount: 0,
        fileName: undefined,
        uploadedAt: new Date().toISOString(),
      };
      return next;
    });
    setExcelUploadFeedbackMap((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
    showToast('Data tabel dikosongkan.');
  };

  // Save Form (Create or Update Card & Connected Details)
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Judul program / indikator wajib diisi.');
      return;
    }
    if (!formData.pillarId) {
      alert('Pilar program wajib dipilih.');
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
      status: `Realisasi ${targetYear}`,
      value: finalValue,
      target: finalTarget,
      unit: finalUnit,
      percent: finalPercent,
      isMilestone: finalIsMilestone,
      milestoneContent: finalMilestoneContent,
      kendalaList: kendalaList,
      annualTargets: annualRows,
      supersetEmbed: {
        ...supersetEmbed,
        widthPercent: 100,
        heightPx: 450,
      },
      customExcelTables: customExcelTables,
      customExcelTable: customExcelTables[0] || undefined,
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
          const nextCards = cards.map((c) => (c.id === editingCardId || c.slug === editingCardId ? json.data : c));
          setCards(nextCards);
          setClientCardsCache(nextCards);
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
          const nextCards = [json.data, ...cards];
          setCards(nextCards);
          setClientCardsCache(nextCards);
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

  // Filtered Cards sorted by order (Z-Pattern for Gambar 2)
  const filteredCards = useMemo(() => {
    const list = cards.filter((card) => {
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
    return [...list].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  }, [cards, selectedPillar, selectedCategory, searchQuery]);

  // Paginated Cards (10 items / page)
  const totalPages = Math.max(1, Math.ceil(filteredCards.length / itemsPerPage));
  const paginatedCards = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCards.slice(start, start + itemsPerPage);
  }, [filteredCards, currentPage, itemsPerPage]);

  // Card Drag & Drop Reordering
  const handleCardDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggedCardId(cardId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleCardDragOver = (e: React.DragEvent, cardId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCardId !== cardId) {
      setDragOverCardId(cardId);
    }
  };

  const handleCardDrop = async (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    const sourceId = draggedCardId;
    setDraggedCardId(null);
    setDragOverCardId(null);

    if (!sourceId || sourceId === targetCardId) return;

    const currentIdx = filteredCards.findIndex((c) => c.id === sourceId);
    const targetIdx = filteredCards.findIndex((c) => c.id === targetCardId);
    if (currentIdx === -1 || targetIdx === -1) return;

    const movedCard = filteredCards[currentIdx];
    const reordered = [...filteredCards];
    reordered.splice(currentIdx, 1);
    reordered.splice(targetIdx, 0, movedCard);

    // Assign clean 1-based order
    const orderUpdates: { id: string; order: number }[] = [];
    const updatedCards = cards.map((c) => {
      const foundIdx = reordered.findIndex((r) => r.id === c.id);
      if (foundIdx !== -1) {
        const newOrder = foundIdx + 1;
        if (c.order !== newOrder) {
          orderUpdates.push({ id: c.id, order: newOrder });
        }
        return { ...c, order: newOrder };
      }
      return c;
    });

    setCards(updatedCards);
    setClientCardsCache(updatedCards);

    try {
      const res = await fetch('/api/cards/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderUpdates.length > 0 ? orderUpdates : [
            { id: movedCard.id, order: targetIdx + 1 },
          ],
        }),
      });

      if (res.ok) {
        showToast(`Urutan "${movedCard.title}" berhasil diubah ke posisi #${targetIdx + 1}`);
      } else {
        fetchAllCards();
      }
    } catch (err) {
      console.error('Failed to reorder cards:', err);
      fetchAllCards();
    }
  };

  const handleCardDragEnd = () => {
    setDraggedCardId(null);
    setDragOverCardId(null);
  };

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
          {/* Group 1: Kelola Data */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Kelola Data
            </div>

            {/* Kelola Pilar */}
            <button
              type="button"
              onClick={() => {
                setViewMode('pillars');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'pillars'
                  ? 'bg-[#4F83CC] text-white shadow-xs font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="h-4 w-4 shrink-0 stroke-[1.75]" />
                <span>Kelola Pilar</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                  viewMode === 'pillars' ? 'bg-[#3b6eb3] text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {pillars.length}
              </span>
            </button>

            {/* Kelola Program */}
            <button
              type="button"
              onClick={() => {
                setViewMode('list');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'list' || viewMode === 'create' || viewMode === 'edit'
                  ? 'bg-[#4F83CC] text-white shadow-xs font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 shrink-0 stroke-[1.75]" />
                <span>Kelola Program</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                  viewMode === 'list' || viewMode === 'create' || viewMode === 'edit'
                    ? 'bg-[#3b6eb3] text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {cards.length}
              </span>
            </button>
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
                router.push('/login');
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
                : viewMode === 'pillars'
                ? 'Kelola Pilar Prioritas'
                : viewMode === 'users'
                ? 'Kelola Akun & Hak Akses Pengguna'
                : viewMode === 'create'
                ? 'Tambah Indikator Program Baru'
                : viewMode === 'edit'
                ? `Edit: ${formData.title}`
                : `Manajemen Indikator (${filteredCards.length} Program)`}
            </h1>
            {viewMode === 'pillars' && (
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Kelola pilar pembangunan manusia dan kebudayaan sebagai payung koordinasi program.
              </p>
            )}
            {viewMode === 'pillars' && (
              <button
                type="button"
                onClick={openCreatePillarModal}
                className="h-10 px-4 rounded-xl bg-[#4F83CC] hover:bg-[#3f72bb] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
              >
                <Plus className="h-4 w-4 stroke-[2]" />
                <span>Tambah Pilar Baru</span>
              </button>
            )}

            {viewMode === 'list' && (
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Tarik baris tabel (drag &amp; drop) untuk mengatur urutan tampilan kartu di dashboard.
              </p>
            )}
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
                  currentPillar={pdfPillarFilter !== 'all' ? (pdfPillarFilter as PillarId) : undefined}
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
          {/* VIEW MODE PILLARS: KELOLA PILAR PRIORITAS                       */}
          {/* =============================================================== */}
          {viewMode === 'pillars' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Daftar Pilar Kemenko PMK ({pillars.length} Pilar)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kelola pilar untuk pengelompokan program dan indikator strategis.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openCreatePillarModal}
                  className="h-9 px-4 rounded-xl bg-[#4F83CC] hover:bg-[#3f72bb] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors self-start sm:self-auto"
                >
                  <Plus className="h-4 w-4 stroke-[2]" />
                  <span>Tambah Pilar Baru</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4 w-12 text-center">No</th>
                      <th className="py-3 px-4 min-w-[200px]">Nama Pilar</th>
                      <th className="py-3 px-4 min-w-[140px]">ID / Slug</th>
                      <th className="py-3 px-4 min-w-[240px]">Deskripsi</th>
                      <th className="py-3 px-4 w-32 text-center">Jumlah Program</th>
                      <th className="py-3 px-4 w-28 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {pillars.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          Belum ada pilar yang tersimpan.
                        </td>
                      </tr>
                    ) : (
                      pillars.map((pillar, idx) => {
                        const programCount = cards.filter((c) => c.pillarId === pillar.id).length;
                        return (
                          <tr key={pillar.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                              {idx + 1}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              {pillar.name}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                              {pillar.id}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                              {pillar.description || '—'}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                {programCount} Program
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditPillarModal(pillar)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                  title="Edit Pilar"
                                >
                                  <Pencil className="h-3.5 w-3.5 stroke-[2]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePillar(pillar)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Hapus Pilar"
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
            </div>
          )}

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

                {/* Pillar Filter Dropdown */}
                <div className="relative min-w-[200px]">
                  <select
                    value={selectedPillar}
                    onChange={(e) => {
                      setSelectedPillar(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-10 w-full pl-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 hover:border-slate-300 focus:bg-white focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">Semua Pilar ({cards.length})</option>
                    {pillars.map((p) => {
                      const count = cards.filter((c) => c.pillarId === p.id).length;
                      return (
                        <option key={p.id} value={p.id}>
                          {p.name} ({count})
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
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
                      <th className="py-3 px-4 w-24 text-center">Urutan</th>
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
                        const cardOrder = card.order ?? rowNumber;

                        return (
                          <tr
                            key={card.id}
                            draggable
                            onDragStart={(e) => handleCardDragStart(e, card.id)}
                            onDragOver={(e) => handleCardDragOver(e, card.id)}
                            onDrop={(e) => handleCardDrop(e, card.id)}
                            onDragEnd={handleCardDragEnd}
                            className={`transition-colors cursor-grab active:cursor-grabbing ${
                              draggedCardId === card.id
                                ? 'opacity-40 bg-blue-50/60'
                                : dragOverCardId === card.id
                                ? 'bg-blue-50/80 border-t-2 border-blue-600'
                                : 'hover:bg-slate-50/80'
                            }`}
                          >
                            {/* Numbering & Drag Handle */}
                            <td className="py-3.5 px-4 text-center">
                              <div className="inline-flex items-center gap-2 select-none">
                                <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="font-extrabold text-slate-900 text-xs tabular-nums">
                                  #{cardOrder}
                                </span>
                              </div>
                            </td>

                            {/* Title & PIC */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 leading-snug">
                                {card.title}
                              </div>
                              <div className="text-xs text-slate-500 font-medium mt-0.5">
                                {card.picKementerian || 'Kemenko PMK'}
                              </div>
                            </td>

                            {/* Pillar */}
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 capitalize border border-slate-200">
                                {pillars.find((p) => p.id === card.pillarId)?.name || card.pillarId}
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
              {/* Form Navigation Tabs */}
              <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormActiveTab('info')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      formActiveTab === 'info'
                        ? 'bg-blue-50 text-blue-700 shadow-2xs border border-blue-200/80 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <span>1. Ringkasan &amp; Info</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormActiveTab('superset')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      formActiveTab === 'superset'
                        ? 'bg-blue-50 text-blue-700 shadow-2xs border border-blue-200/80 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <span>2. Tata Letak &amp; Superset</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormActiveTab('excel')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      formActiveTab === 'excel'
                        ? 'bg-blue-50 text-blue-700 shadow-2xs border border-blue-200/80 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <span>3. Template &amp; Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormActiveTab('kendala')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      formActiveTab === 'kendala'
                        ? 'bg-blue-50 text-blue-700 shadow-2xs border border-blue-200/80 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <span>4. Isu &amp; Kendala</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-6">
                {/* TAB 1: RINGKASAN & INFORMASI UTAMA */}
                {formActiveTab === 'info' && (
                  <div className="space-y-6">
                    {/* Identitas Program */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <div>
                          <h2 className="text-sm font-bold text-slate-900">Identitas Program &amp; Pilar</h2>
                          <p className="text-[11px] text-slate-500 mt-0.5">Klasifikasi program dalam arsitektur koordinasi Kemenko PMK</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Pilar Kemenko PMK <span className="text-rose-600">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={formData.pillarId}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  pillarId: e.target.value as CmsCardItem['pillarId'],
                                }))
                              }
                              className="h-10 w-full pl-3.5 pr-10 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 hover:border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all appearance-none cursor-pointer"
                            >
                              {pillars.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Kategori Program <span className="text-rose-600">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={formData.category}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  category: e.target.value as CmsCardItem['category'],
                                }))
                              }
                              className="h-10 w-full pl-3.5 pr-10 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 hover:border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all appearance-none cursor-pointer"
                            >
                              <option value="PKPN">PKPN (Program Kerja Prioritas Nasional)</option>
                              <option value="Isu Strategis">Isu Strategis Prioritas</option>
                              <option value="RPJMN">RPJMN (Rencana Pembangunan Jangka Menengah Nasional)</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>
                      </div>

                      {/* Nomor Urut Pola Z */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Nomor Urut Tampilan Dashboard (Grid 3 Kolom - Pola Huruf Z) <span className="text-rose-600">*</span>
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min={1}
                            required
                            value={formData.order}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                order: Math.max(1, parseInt(e.target.value, 10) || 1),
                              }))
                            }
                            className="h-10 w-28 px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 tabular-nums hover:border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                          />
                          <div className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-900 text-xs font-bold">
                            Posisi Grid: {getGridZPositionLabel(formData.order)}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Pola huruf Z: <strong>#1 Kiri</strong> &rarr; <strong>#2 Tengah</strong> &rarr; <strong>#3 Kanan</strong>, lalu baris berikutnya <strong>#4 Kiri Bawah</strong> &rarr; <strong>#5 Tengah</strong> &rarr; <strong>#6 Kanan</strong>.
                        </p>
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
                          className="h-10 w-full px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
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
                          placeholder="Contoh: Kemendikdasmen, Kemenag, Kementerian PUPR, Kemendagri"
                          className="h-10 w-full px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                        />
                      </div>
                    </div>

                    {/* Metrik & Capaian Dashboard Ringkasan */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                        <div>
                          <h2 className="text-sm font-bold text-slate-900">
                            Metrik Kartu Depan Dashboard
                          </h2>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Atur angka capaian realisasi, target sasaran, dan satuan unit yang tampil pada kartu ringkasan dashboard depan.
                          </p>
                        </div>

                        {/* Metric Type Selector */}
                        <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setMetricType('number')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              metricType === 'number'
                                ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Angka / Jumlah
                          </button>
                          <button
                            type="button"
                            onClick={() => setMetricType('percent')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              metricType === 'percent'
                                ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Persen (%)
                          </button>
                          <button
                            type="button"
                            onClick={() => setMetricType('text')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              metricType === 'text'
                                ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Kualitatif
                          </button>
                        </div>
                      </div>

                      {/* FORM FIELDS PER METRIC TYPE */}
                      {metricType === 'number' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                className="h-10 w-full px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Tahun Target
                              </label>
                              <div className="relative">
                                <select
                                  value={targetYear}
                                  onChange={(e) => setTargetYear(e.target.value)}
                                  className="h-10 w-full pl-3.5 pr-10 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 hover:border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all appearance-none cursor-pointer"
                                >
                                  <option value="2025">Tahun 2025</option>
                                  <option value="2026">Tahun 2026</option>
                                  <option value="2027">Tahun 2027</option>
                                  <option value="2028">Tahun 2028</option>
                                  <option value="2029">Tahun 2029</option>
                                </select>
                                <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                              </div>
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
                                className="h-10 w-full px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 tabular-nums placeholder:text-slate-400 hover:border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
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
                                className="h-10 w-full px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 tabular-nums placeholder:text-slate-400 hover:border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
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
                                  className="h-10 w-full pl-3.5 pr-8 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 tabular-nums placeholder:text-slate-400 hover:border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
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
                                  className="h-10 w-full pl-3.5 pr-8 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 tabular-nums placeholder:text-slate-400 hover:border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
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
                                className="h-10 w-full px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
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
                                className="h-10 w-full px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Judul & Deskripsi Program */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                      <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                        Judul &amp; Deskripsi Program
                      </h2>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Sub-judul / Ringkasan Program
                        </label>
                        <textarea
                          rows={2}
                          value={formData.subtext}
                          onChange={(e) => setFormData((prev) => ({ ...prev, subtext: e.target.value }))}
                          placeholder="Ringkasan singkat capaian dan fokus program..."
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Deskripsi Lengkap Program
                        </label>
                        <textarea
                          rows={3}
                          value={formData.description}
                          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Uraian rinci dasar pelaksanaan dan kebijakan pengawalan Kemenko PMK..."
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
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
                  </div>
                )}

                {/* TAB 2: EMBED APACHE SUPERSET */}
                {formActiveTab === 'superset' && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <h2 className="text-sm font-bold text-slate-900">
                            Embed Apache Superset
                          </h2>
                          <p className="text-[11px] text-slate-600 mt-1">
                            Salin kode iframe atau URL eksplorasi Superset analitik resmi Kemenko PMK untuk disematkan di halaman detail program.
                          </p>
                        </div>

                        {supersetEmbed.updatedAt && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
                            <span>
                              Terakhir dimutakhirkan: {formatIndonesianDateTime(supersetEmbed.updatedAt)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Input Iframe Code / URL / UUID */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">
                          Kode Tag &lt;iframe&gt; / Tautan Superset / UUID
                        </label>
                        <textarea
                          rows={4}
                          value={supersetEmbed.iframeCode || supersetEmbed.srcUrl || supersetEmbed.url || ''}
                          onChange={(e) => handleSupersetEmbedCodeChange(e.target.value)}
                          placeholder='<iframe width="600" height="400" seamless frameBorder="0" scrolling="no" src="https://superset.kemenkopmk.go.id/superset/explore/p/BQpgLPvgJMo/?standalone=1&height=400"></iframe> atau tempel URL langsung'
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:border-[#4F83CC] focus:bg-white transition-colors"
                        />
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 flex-wrap gap-2">
                          <span className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-700">URL Terdeteksi:</span>
                            <span className="text-blue-700 font-mono truncate max-w-md">
                              {supersetEmbed.srcUrl || supersetEmbed.url || 'Belum ada URL'}
                            </span>
                          </span>
                          {supersetEmbed.uuid && (
                            <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                              UUID: {supersetEmbed.uuid}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions toolbar */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          {(supersetEmbed.srcUrl || supersetEmbed.url) && (
                            <a
                              href={supersetEmbed.srcUrl || supersetEmbed.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-8 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Uji Tautan di Tab Baru</span>
                            </a>
                          )}
                        </div>

                        {(supersetEmbed.srcUrl || supersetEmbed.url || supersetEmbed.uuid) && (
                          <button
                            type="button"
                            onClick={handleClearSupersetEmbed}
                            className="h-8 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Kosongkan Embed</span>
                          </button>
                        )}
                      </div>

                      {/* Live Preview Box */}
                      <div className="pt-2 space-y-2">
                        <span className="text-xs font-bold text-slate-700 block">
                          Pratinjau Tampilan Embed Superset:
                        </span>
                        {supersetEmbed.srcUrl || supersetEmbed.url ? (
                          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
                            <iframe
                              src={supersetEmbed.srcUrl || supersetEmbed.url}
                              width="100%"
                              height={450}
                              seamless
                              frameBorder="0"
                              scrolling="no"
                              title="Pratinjau Superset"
                              className="w-full bg-white"
                            />
                          </div>
                        ) : (
                          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-1">
                            <p className="text-xs font-semibold text-slate-600">
                              Belum ada tautan Superset yang disematkan.
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Jika belum ada URL/kode embed, visualisasi Superset tidak akan ditampilkan pada halaman detail (tanpa ruang kosong).
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: TEMPLATE & DATA EXCEL */}
                {formActiveTab === 'excel' && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <h2 className="text-sm font-bold text-slate-900">
                            Template &amp; Data Matriks Excel
                          </h2>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            Kelola berbagai section tabel data indikator. Superadmin dapat mengunggah file template Excel, mengunduh template untuk diisi, dan mengunggah data hasil isian.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddExcelTableSection}
                          className="h-8 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Section Tabel Excel</span>
                        </button>
                      </div>

                      {/* Sections List */}
                      <div className="space-y-6 pt-2">
                        {customExcelTables.map((sec, secIdx) => (
                          <div
                            key={sec.id || secIdx}
                            className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-5"
                          >
                            {/* Section Header */}
                            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center">
                                  #{secIdx + 1}
                                </span>
                                <h3 className="text-xs font-bold text-slate-900">
                                  {sec.title || `Section Tabel #${secIdx + 1}`}
                                </h3>
                              </div>

                              {customExcelTables.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExcelTableSection(secIdx)}
                                  className="h-7 px-2.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Hapus Section</span>
                                </button>
                              )}
                            </div>

                            {/* Section Title & Description */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Judul Section / Tabel <span className="text-rose-600">*</span>
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={sec.title}
                                  onChange={(e) => handleUpdateSectionTitle(secIdx, e.target.value)}
                                  placeholder="Contoh: Matriks Revitalisasi Sekolah dan Madrasah"
                                  className="h-9 w-full px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#4F83CC]"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Keterangan / Deskripsi Tabel
                                </label>
                                <input
                                  type="text"
                                  value={sec.description || ''}
                                  onChange={(e) => handleUpdateSectionDesc(secIdx, e.target.value)}
                                  placeholder="Contoh: Rincian kebutuhan dan indikasi data khusus"
                                  className="h-9 w-full px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#4F83CC]"
                                />
                              </div>
                            </div>

                            {/* Template File & Download/Upload Controls */}
                            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                    <span>File Template Excel:</span>
                                    {sec.templateFileName ? (
                                      <span className="font-mono text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                                        {sec.templateFileName}
                                      </span>
                                    ) : (
                                      <span className="text-[11px] text-slate-500 font-medium">
                                        Template Standar Revitalisasi
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    Superadmin dapat mengunggah file template kustom (.xlsx / .csv) atau menggunakan template standar.
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                  {/* Download Template Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadSectionTemplate(secIdx)}
                                    className="h-8 px-3 rounded-lg bg-[#70ad47] hover:bg-[#5f933c] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Unduh Template</span>
                                  </button>

                                  {/* Upload Custom Template File */}
                                  <label className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200">
                                    <UploadCloud className="w-3.5 h-3.5" />
                                    <span>Unggah Template Baru</span>
                                    <input
                                      type="file"
                                      accept=".csv,.xlsx,.xls,.txt"
                                      onChange={(e) => handleUploadTemplateFile(secIdx, e)}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* Upload Data Hasil Isian Dropzone */}
                            <div className="space-y-3">
                              <label className="text-xs font-bold text-slate-800 block">
                                Unggah File Data Terisi (.csv / .xlsx):
                              </label>
                              <div className="relative border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl p-5 bg-emerald-50/20 text-center transition-colors cursor-pointer">
                                <input
                                  type="file"
                                  accept=".csv,.xlsx,.xls,.txt"
                                  onChange={(e) => handleUploadDataFile(secIdx, e)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                    <UploadCloud className="w-4 h-4" />
                                  </div>
                                  <div className="text-xs font-bold text-slate-800">
                                    Klik atau seret file CSV/Excel hasil isian template ke sini
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    Format didukung: CSV UTF-8 atau Excel (.xlsx)
                                  </div>
                                </div>
                              </div>

                              {excelUploadFeedbackMap[secIdx] && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800 flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>{excelUploadFeedbackMap[secIdx]}</span>
                                </div>
                              )}

                              {/* Data Preview */}
                              {sec.rows && sec.rows.length > 0 && (
                                <div className="space-y-2 pt-2">
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <span className="text-xs font-bold text-slate-800">
                                      Pratinjau Data ({sec.rows.length} baris):
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleClearSectionData(secIdx)}
                                      className="h-7 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>Kosongkan Data Tabel</span>
                                    </button>
                                  </div>

                                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="w-full text-left text-xs border-collapse">
                                      <thead>
                                        <tr className="bg-[#70ad47] text-white font-extrabold">
                                          {sec.columns?.map((c, i) => (
                                            <th key={c.id || i} className="py-2.5 px-3 border-r border-[#86bc61]/40 last:border-r-0">
                                              {c.label || c.name}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-200 bg-white">
                                        {sec.rows.slice(0, 5).map((row, rIdx) => (
                                          <tr key={rIdx} className={rIdx === 0 ? 'bg-[#f4f9f0]' : ''}>
                                            {sec.columns?.map((c, cIdx) => (
                                              <td key={c.id || cIdx} className="py-2 px-3 align-top whitespace-pre-line border-r border-slate-200/70 last:border-r-0 text-slate-800">
                                                {row[c.key] || (c.label ? row[c.label] : '') || '—'}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  {sec.rows.length > 5 && (
                                    <p className="text-[11px] text-slate-400 italic">
                                      Menampilkan 5 baris pertama dari total {sec.rows.length} baris data.
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add another section button at bottom */}
                      <div className="pt-2 flex justify-center">
                        <button
                          type="button"
                          onClick={handleAddExcelTableSection}
                          className="h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ Tambah Section Tabel Excel Baru</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: ISU & KENDALA LAPANGAN */}
                {formActiveTab === 'kendala' && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h2 className="text-sm font-bold text-slate-900">
                            Kendala &amp; Catatan Pelaksanaan (Isu Strategis)
                          </h2>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Daftar isu strategis dan kendala lapangan. Tarik dan geser (drag &amp; drop) untuk mengatur urutan prioritas kendala.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={openAddKendalaModal}
                          className="h-8 px-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Tambah Kendala</span>
                        </button>
                      </div>

                      {kendalaList.length === 0 ? (
                        <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 space-y-1">
                          <p className="font-bold text-slate-700">Belum ada kendala yang dicatat</p>
                          <p>Klik tombol <strong>+ Tambah Kendala</strong> untuk menambahkan isu pelaksanaan melalui popup dialog.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {kendalaList.map((k, idx) => (
                            <div
                              key={k.id || idx}
                              draggable
                              onDragStart={(e) => handleKendalaDragStart(e, idx)}
                              onDragOver={(e) => handleKendalaDragOver(e, idx)}
                              onDrop={(e) => handleKendalaDrop(e, idx)}
                              onDragEnd={handleKendalaDragEnd}
                              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-grab active:cursor-grabbing ${
                                draggedKendalaIndex === idx
                                  ? 'opacity-40 bg-blue-50/60'
                                  : dragOverKendalaIndex === idx
                                  ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-500'
                                  : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-3 select-none min-w-0">
                                <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-extrabold text-xs flex items-center justify-center shrink-0 tabular-nums">
                                  #{idx + 1}
                                </span>
                                <div className="min-w-0 space-y-0.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-slate-900 truncate">
                                      {k.title}
                                    </span>
                                    {k.klTerkait && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                        {k.klTerkait}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 line-clamp-1">
                                    {k.kendala}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => openEditKendalaModal(idx)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                  title="Edit Kendala"
                                >
                                  <Pencil className="h-3.5 w-3.5 stroke-[2]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveKendala(idx)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Hapus Kendala"
                                >
                                  <Trash2 className="h-3.5 w-3.5 stroke-[2]" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Form Action & Step Navigation Footer */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {formActiveTab === 'superset' && (
                      <button
                        type="button"
                        onClick={() => setFormActiveTab('info')}
                        className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                      >
                        ← Kembali ke Ringkasan
                      </button>
                    )}
                    {formActiveTab === 'excel' && (
                      <button
                        type="button"
                        onClick={() => setFormActiveTab('superset')}
                        className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                      >
                        ← Kembali ke Embed Superset
                      </button>
                    )}
                    {formActiveTab === 'kendala' && (
                      <button
                        type="button"
                        onClick={() => setFormActiveTab('excel')}
                        className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                      >
                        ← Kembali ke Data Excel &amp; Peta
                      </button>
                    )}
                    {formActiveTab === 'info' && (
                      <button
                        type="button"
                        onClick={() => setFormActiveTab('superset')}
                        className="h-10 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold cursor-pointer transition-colors"
                      >
                        Lanjut ke Embed Superset →
                      </button>
                    )}
                    {formActiveTab === 'superset' && (
                      <button
                        type="button"
                        onClick={() => setFormActiveTab('excel')}
                        className="h-10 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold cursor-pointer transition-colors"
                      >
                        Lanjut ke Template &amp; Data Excel →
                      </button>
                    )}
                    {formActiveTab === 'excel' && (
                      <button
                        type="button"
                        onClick={() => setFormActiveTab('kendala')}
                        className="h-10 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold cursor-pointer transition-colors"
                      >
                        Lanjut ke Isu &amp; Kendala →
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
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
                          <span>Simpan Indikator &amp; Detail Program</span>
                        </>
                      )}
                    </button>
                  </div>
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
                      {[{ id: 'all', label: 'Semua Pilar' }, ...pillars.map((p) => ({ id: p.id, label: p.name }))].map((p) => {
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

      {/* PILLAR MANAGEMENT MODAL (CREATE / EDIT PILLAR) */}
      {isPillarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingPillar ? `Edit Pilar: ${editingPillar.name}` : 'Tambah Pilar Baru'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tentukan nama pilar, ID unik, dan deskripsi pilar koordinasi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPillarModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSavePillar} className="p-6 space-y-4">
              {pillarError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800">
                  {pillarError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Pilar <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pillarFormData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setPillarFormData((prev) => ({
                      ...prev,
                      name,
                      id: editingPillar ? prev.id : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                    }));
                  }}
                  placeholder="Contoh: Pendidikan dan Kebudayaan"
                  className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ID / Slug Pilar <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingPillar}
                  value={pillarFormData.id}
                  onChange={(e) =>
                    setPillarFormData((prev) => ({
                      ...prev,
                      id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
                    }))
                  }
                  placeholder="Contoh: pendidikan"
                  className="h-10 w-full px-3.5 bg-slate-50 disabled:bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Digunakan sebagai kode identitas sistem unik (huruf kecil &amp; strip).
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Deskripsi Pilar
                </label>
                <textarea
                  rows={3}
                  value={pillarFormData.description}
                  onChange={(e) => setPillarFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Uraian ruang lingkup pilar..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPillarModalOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingPillar}
                  className="h-10 px-5 rounded-xl bg-[#4F83CC] hover:bg-[#3f72bb] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:bg-slate-300"
                >
                  {isSavingPillar ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>{editingPillar ? 'Simpan Perubahan' : 'Buat Pilar'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KENDALA MANAGEMENT MODAL (CREATE / EDIT KENDALA) */}
      {isKendalaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingKendalaIndex !== null ? 'Edit Kendala Pelaksanaan' : 'Tambah Kendala Baru'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Isi rincian kendala dan rekomendasi tindak lanjut orkestrasi PMK.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsKendalaModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveKendalaModal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ringkasan / Judul Kendala <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kendalaFormData.title}
                  onChange={(e) => setKendalaFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Contoh: Usulan Anggaran Belanja Tambahan (ABT)"
                  className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  K/L Terkait
                </label>
                <input
                  type="text"
                  value={kendalaFormData.klTerkait || ''}
                  onChange={(e) => setKendalaFormData((prev) => ({ ...prev, klTerkait: e.target.value }))}
                  placeholder="Contoh: Kemenkeu, Kemenag, Bappenas"
                  className="h-10 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Uraian Lengkap Kendala <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={kendalaFormData.kendala}
                  onChange={(e) => setKendalaFormData((prev) => ({ ...prev, kendala: e.target.value }))}
                  placeholder="Jelaskan hambatan atau permasalahan yang dihadapi..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tindak Lanjut / Rekomendasi Orkestrasi PMK
                </label>
                <textarea
                  rows={2}
                  value={kendalaFormData.tindakLanjut}
                  onChange={(e) => setKendalaFormData((prev) => ({ ...prev, tindakLanjut: e.target.value }))}
                  placeholder="Langkah penyelesaian atau arahan Menko PMK..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#4F83CC]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsKendalaModalOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#4F83CC] hover:bg-[#3f72bb] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Check className="h-4 w-4" />
                  <span>Simpan Kendala</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <div className="relative">
                  <select
                    value={userFormData.role}
                    onChange={(e) =>
                      setUserFormData((prev) => ({
                        ...prev,
                        role: e.target.value as CmsUserItem['role'],
                      }))
                    }
                    className="h-10 w-full pl-3.5 pr-10 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 hover:border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all appearance-none cursor-pointer"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
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