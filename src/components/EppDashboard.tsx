import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { EprStore, EppStore, SalesRecord } from '../types';
import { ChangePasswordModal } from './ChangePasswordModal';
import { 
  Building2, 
  MapPin, 
  Award, 
  Search, 
  Filter, 
  DollarSign, 
  TrendingUp, 
  LogOut, 
  KeyRound, 
  Eye, 
  X,
  Loader2,
  Briefcase
} from 'lucide-react';

const FISCAL_MONTHS = [
  { num: 1, label: 'Bulan 1 (Apr 2026)', quarter: 'Q1' },
  { num: 2, label: 'Bulan 2 (Mei 2026)', quarter: 'Q1' },
  { num: 3, label: 'Bulan 3 (Jun 2026)', quarter: 'Q1' },
  { num: 4, label: 'Bulan 4 (Jul 2026)', quarter: 'Q2' },
  { num: 5, label: 'Bulan 5 (Agu 2026)', quarter: 'Q2' },
  { num: 6, label: 'Bulan 6 (Sep 2026)', quarter: 'Q2' },
  { num: 7, label: 'Bulan 7 (Okt 2026)', quarter: 'Q3' },
  { num: 8, label: 'Bulan 8 (Nov 2026)', quarter: 'Q3' },
  { num: 9, label: 'Bulan 9 (Des 2026)', quarter: 'Q3' },
  { num: 10, label: 'Bulan 10 (Jan 2027)', quarter: 'Q4' },
  { num: 11, label: 'Bulan 11 (Feb 2027)', quarter: 'Q4' },
  { num: 12, label: 'Bulan 12 (Mar 2027)', quarter: 'Q4' },
];

interface Props {
  userEmail: string;
  onLogout: () => void;
}

export const EppDashboard: React.FC<Props> = ({ userEmail, onLogout }) => {
  const [eppProfile, setEppProfile] = useState<EppStore | null>(null);
  const [eprStores, setEprStores] = useState<EprStore[]>([]);
  const [allSales, setAllSales] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [detailModalStore, setDetailModalStore] = useState<EprStore | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    fetchEppData();
  }, []);

  const fetchEppData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const extractedUsername = user?.email?.split('@')[0]?.toLowerCase();

      // 1. Ambil profil EPP yang login
      const { data: eppData } = await supabase
        .from('epp_stores')
        .select('*')
        .or(`user_id.eq.${user?.id},username.eq.${extractedUsername}`)
        .maybeSingle();

      if (eppData) {
        setEppProfile(eppData);
      }

      // 2. Ambil seluruh data EPR untuk dimonitor
      const { data: storesData } = await supabase
        .from('epr_stores')
        .select('*')
        .order('target_inc_tax', { ascending: false });

      setEprStores(storesData || []);

      // 3. Ambil data pencapaian / pembelian EPR
      const { data: salesData } = await supabase
        .from('sales_records')
        .select('*');

      setAllSales(salesData || []);
    } catch (err) {
      console.error('Error fetching EPP data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat?.toUpperCase()) {
      case 'SUN':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'STAR':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'MOON':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'EARTH':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  // Get total actual sales for an EPR store
  const getStoreActualSales = (storeId: string) => {
    return allSales
      .filter((s) => s.store_id === storeId)
      .reduce((acc, curr) => acc + (curr.achievement_amount || 0), 0);
  };

  // Unique cities from EPR stores for filter dropdown
  const uniqueCities = Array.from(new Set(eprStores.map((s) => s.city).filter(Boolean)));

  // Filter EPR stores
  const filteredStores = eprStores.filter((s) => {
    const matchSearch =
      s.epr_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.epr_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      selectedCategory === 'ALL' || s.category?.toUpperCase() === selectedCategory;
    const matchCity =
      selectedCity === 'ALL' || s.city?.toUpperCase() === selectedCity.toUpperCase();
    return matchSearch && matchCategory && matchCity;
  });

  const totalTargetAllEpr = eprStores.reduce((acc, curr) => acc + (Number(curr.target_inc_tax) || 0), 0);
  const totalActualAllEpr = allSales.reduce((acc, curr) => acc + (Number(curr.achievement_amount) || 0), 0);
  const overallPercent = totalTargetAllEpr > 0 ? Math.round((totalActualAllEpr / totalTargetAllEpr) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-base tracking-tight">
                    Portal Partner Premier (EPP)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-2xs font-bold border border-teal-200 uppercase tracking-wide">
                    EPP PARTNER
                  </span>
                </div>
                <span className="text-xs text-slate-500 hidden sm:block">
                  Monitoring Performa Pembelian EPR
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              >
                <KeyRound className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Ganti Password</span>
              </button>

              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* EPP Welcome Profile Card */}
        {eppProfile && (
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded bg-teal-50 text-teal-800 font-mono text-xs font-bold border border-teal-200">
                    {eppProfile.epp_code}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {eppProfile.territory} • {eppProfile.city}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">{eppProfile.epp_name}</h1>
                <p className="text-xs text-slate-500 mt-0.5">{eppProfile.company_name}</p>
              </div>
              <div className="bg-teal-50/60 border border-teal-100 rounded-2xl p-4 text-xs text-teal-900 max-w-sm">
                <p className="font-semibold mb-1">Informasi Akses EPP:</p>
                <p className="text-teal-700 leading-relaxed">
                  Dashboard ini menampilkan performa target dan pembelian EPR secara agregat tanpa menampilkan identitas EPP pemasok.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Aggregated EPR Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Target EPR</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {formatRupiah(totalTargetAllEpr)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Total Target FY26 (Include Tax 11%)</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Pembelian EPR Terdata</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {formatRupiah(totalActualAllEpr)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Pencapaian: <strong>{overallPercent}%</strong></p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">EPR Terpantau</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {eprStores.length} EPR
            </div>
            <p className="text-xs text-slate-500 mt-1">Wilayah Jawa Tengah (AM: ARIS)</p>
          </div>
        </div>

        {/* Table of EPR Stores */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Monitoring Performa EPR</h3>
              <p className="text-xs text-slate-500">
                Data pembelian disajikan secara konsolidasi tanpa memuat informasi EPP pemasok
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari EPR / kode / kota..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-2 px-3 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="SUN">SUN</option>
                <option value="STAR">STAR</option>
                <option value="MOON">MOON</option>
                <option value="EARTH">EARTH</option>
                <option value="CRESCENT">CRESCENT</option>
              </select>

              {/* City Filter */}
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="py-2 px-3 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none"
              >
                <option value="ALL">Semua Kota</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              <p className="text-xs">Memuat data performa EPR...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-2xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-6">No</th>
                    <th className="py-3.5 px-6">Kode EPR</th>
                    <th className="py-3.5 px-6">Nama EPR</th>
                    <th className="py-3.5 px-6">Kota</th>
                    <th className="py-3.5 px-6">Kategori</th>
                    <th className="py-3.5 px-6">Target FY26 (Inc Tax)</th>
                    <th className="py-3.5 px-6">Total Pembelian</th>
                    <th className="py-3.5 px-6">% Pencapaian</th>
                    <th className="py-3.5 px-6 text-right">Rincian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStores.map((st, idx) => {
                    const actualSales = getStoreActualSales(st.id);
                    const target = st.target_inc_tax || 1;
                    const percent = Math.round((actualSales / target) * 100);

                    return (
                      <tr key={st.id || st.epr_code} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-6 text-xs text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3.5 px-6 font-mono text-xs font-semibold text-teal-700">
                          {st.epr_code}
                        </td>
                        <td className="py-3.5 px-6 font-semibold text-slate-900">
                          {st.epr_name}
                        </td>
                        <td className="py-3.5 px-6 text-xs text-slate-500">
                          {st.city}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className={`px-2.5 py-0.5 rounded text-2xs font-semibold border ${getCategoryBadge(st.category)}`}>
                            {st.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 font-medium text-slate-800">
                          {formatRupiah(st.target_inc_tax)}
                        </td>
                        <td className="py-3.5 px-6 font-semibold text-slate-900">
                          {actualSales > 0 ? formatRupiah(actualSales) : <span className="text-slate-400 font-normal">Rp 0</span>}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className={`text-xs font-bold ${percent >= 100 ? 'text-emerald-600' : percent > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                            {percent}%
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <button
                            onClick={() => setDetailModalStore(st)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Detail EPR */}
      {detailModalStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 relative border border-slate-100">
            <button
              onClick={() => setDetailModalStore(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200">
                {detailModalStore.epr_code}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">
                {detailModalStore.epr_name}
              </h3>
              <p className="text-xs text-slate-500">
                Kota: {detailModalStore.city} • Kategori: {detailModalStore.category} • AM: {detailModalStore.am}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-2xs uppercase font-bold text-slate-400 block mb-1">Target FY26 (Inc Tax)</span>
                <span className="text-base font-bold text-slate-900">{formatRupiah(detailModalStore.target_inc_tax)}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-2xs uppercase font-bold text-slate-400 block mb-1">Target Bulanan</span>
                <span className="text-base font-bold text-slate-900">{formatRupiah(detailModalStore.target_monthly)}</span>
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Pencapaian Pembelian Bulanan (Konsolidasi Netral)
            </div>
            <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl divide-y text-xs">
              {FISCAL_MONTHS.map((item) => {
                const m = item.num;
                const rec = allSales.find((s) => s.store_id === detailModalStore.id && s.month === m);
                const val = rec?.achievement_amount || 0;
                return (
                  <div key={m} className="p-3 flex justify-between items-center hover:bg-slate-50">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className={val > 0 ? 'font-bold text-slate-900' : 'text-slate-400'}>
                      {val > 0 ? formatRupiah(val) : 'Belum ada pembelian terdata'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setDetailModalStore(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ganti Password */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};
