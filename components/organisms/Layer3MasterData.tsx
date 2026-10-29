import React, { useState } from 'react';
import { DTSEN_RECORDS } from '@/data/dashboardData';
import { Badge } from '@/components/atoms/Badge';
import { Search, ArrowLeft, Download } from 'lucide-react';

interface Layer3MasterDataProps {
  onBackToHome: () => void;
}

export const Layer3MasterData: React.FC<Layer3MasterDataProps> = ({ onBackToHome }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categories = ['Semua', 'Lansia', 'Disabilitas', 'Stunting', 'TB', 'Pendidikan Gratis'];

  const filteredRecords = DTSEN_RECORDS.filter((item) => {
    const matchesSearch =
      item.wilayah.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.provinsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keterangan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'Semua' || item.kategoriSasaran === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleExportCsv = () => {
    const headers = [
      'No',
      'ID Sasaran',
      'Wilayah',
      'Provinsi',
      'Kategori Sasaran',
      'Desil',
      'Jumlah Sasaran',
      'Status MBG',
      'Uraian Tindak Lanjut Orkestrasi',
    ];
    const rows = filteredRecords.map((item, idx) => [
      idx + 1,
      `"${item.id}"`,
      `"${item.wilayah.replace(/"/g, '""')}"`,
      `"${item.provinsi.replace(/"/g, '""')}"`,
      `"${item.kategoriSasaran.replace(/"/g, '""')}"`,
      item.desil,
      item.jumlahSasaran,
      `"${item.statusMBG}"`,
      `"${item.keterangan.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DTSEN_Data_Sasaran_PMK_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-5 md:p-6 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              aria-label="Kembali ke Dashboard Eksekutif"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold border border-slate-200/80 transition-colors cursor-pointer"
              title="Kembali ke Dashboard Eksekutif"
            >
              <ArrowLeft className="h-4 w-4 text-slate-600" />
              <span>Kembali ke Dashboard</span>
            </button>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                Data Terpadu Sasaran (Data DTSEN)
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Master Data &amp; Analisis Sasaran Terpadu (Asisten Deputi)
              </p>
            </div>
          </div>
        </div>

        {/* 4 Quiet Key Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-700 block mb-1">
              Cakupan Lansia Desil 1–5
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 numeric tabular-nums">
                0,66%
              </span>
              <span className="text-xs text-slate-700 font-medium">(2025: 116.754 lansia)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-700 block mb-1">
              Cakupan Disabilitas Desil 1–5
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 numeric tabular-nums">
                0,41%
              </span>
              <span className="text-xs text-slate-700 font-medium">(2025: 36.000 jiwa)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-700 block mb-1">
              Status Permakanan 2026
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-rose-700">
                Terhenti
              </span>
              <span className="text-xs text-slate-700 font-medium">(Integrasi MBG)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-700 block mb-1">
              Prioritas Kantong Kemiskinan
            </span>
            <span className="text-sm font-bold text-slate-900">
              Stunting, TB, Lansia & Disabilitas
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              aria-label="Cari wilayah, provinsi, atau keterangan sasaran"
              placeholder="Cari wilayah, provinsi, atau keterangan sasaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs md:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DTSEN Data Table */}
      <div className="bg-white rounded-xl p-5 md:p-6 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Penelusuran Data Sasaran Wilayah (Kantong Kemiskinan)
            </h3>
            <span className="text-xs text-slate-700 font-semibold">
              {filteredRecords.length} Data Ditampilkan
            </span>
          </div>

          <button
            onClick={handleExportCsv}
            title="Unduh data sasaran sebagai file CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer border border-slate-200/80 shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            <span>Ekspor CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100 text-slate-900 font-bold">
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-3">Kode / Wilayah</th>
                <th className="py-3 px-3">Provinsi</th>
                <th className="py-3 px-3">Kategori Sasaran</th>
                <th className="py-3 px-3 text-center">Desil</th>
                <th className="py-3 px-3 text-right">Jumlah Sasaran</th>
                <th className="py-3 px-4 min-w-[300px]">Uraian Tindak Lanjut Orkestrasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredRecords.map((item, idx) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-3 text-center text-slate-600 font-bold">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">
                      {item.wilayah}
                    </span>
                    <span className="text-xs text-slate-600 font-mono font-medium">
                      {item.id}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-800 font-medium">
                    {item.provinsi}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {item.kategoriSasaran}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Badge variant="neutral" size="sm">
                      {item.desil}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right numeric tabular-nums font-bold text-slate-900">
                    {item.jumlahSasaran.toLocaleString('id-ID')} jiwa
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-800 leading-relaxed font-medium">
                    {item.keterangan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700 font-semibold">
          <span>Sumber: Data Terpadu Sasaran (DTSEN) Kemenko PMK</span>
          <span>Intervensi: BGN & Kemensos</span>
        </div>
      </div>
    </div>
  );
};
