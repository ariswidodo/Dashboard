import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { EprStore, EppStore } from '../types';
import { ChangePasswordModal } from './ChangePasswordModal';
import { Dashboard } from './Dashboard';
import { 
  Building2, 
  MapPin, 
  Search, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  LogOut, 
  KeyRound, 
  Eye, 
  ArrowLeft,
  Loader2,
  Briefcase
} from 'lucide-react';

interface Props {
  userEmail: string;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ userEmail, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'EPR' | 'EPP'>('EPR');
  const [eprStores, setEprStores] = useState<EprStore[]>([]);
  const [eppStores, setEppStores] = useState<EppStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStore, setSelectedStore] = useState<EprStore | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch EPR
      const { data: eprData } = await supabase
        .from('epr_stores')
        .select('*')
        .order('target_inc_tax', { ascending: false });
      setEprStores(eprData || []);

      // Fetch EPP
      const { data: eppData } = await supabase
        .from('epp_stores')
        .select('*')
        .order('epp_code', { ascending: true });
      setEppStores(eppData || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
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

  // Filter EPR
  const filteredEpr = eprStores.filter((s) => {
    const matchSearch =
      s.epr_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.epr_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      selectedCategory === 'ALL' || s.category?.toUpperCase() === selectedCategory;
    return matchSearch && matchCategory;
  });

  // Filter EPP
  const filteredEpp = eppStores.filter((s) => {
    return (
      s.epp_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.epp_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.territory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.company_name && s.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Calculate totals
  const totalTargetAll = eprStores.reduce((acc, curr) => acc + (Number(curr.target_inc_tax) || 0), 0);
  const totalMonthlyAll = eprStores.reduce((acc, curr) => acc + (Number(curr.target_monthly) || 0), 0);

  if (selectedStore) {
    return (
      <div className="relative">
        <div className="bg-slate-900 text-white px-6 py-2.5 flex items-center justify-between text-xs sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Mode Inspeksi Administrator — Melihat data EPR: <strong>{selectedStore.epr_name}</strong></span>
          </div>
          <button
            onClick={() => setSelectedStore(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Ringkasan Semua EPR</span>
          </button>
        </div>
        <Dashboard userEmail={userEmail} onLogout={onLogout} previewStore={selectedStore} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-base tracking-tight">
                    Portal Administrator EPR & EPP FY26
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-2xs font-bold border border-indigo-200 uppercase tracking-wide">
                    ADMIN
                  </span>
                </div>
                <span className="text-xs text-slate-500 hidden sm:block">
                  Monitoring Seluruh Partner Retail & Commercial
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Target EPR FY26</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {formatRupiah(totalTargetAll)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Akumulasi Target 24 EPR</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">EPR</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {eprStores.length} EPR
            </div>
            <p className="text-xs text-slate-500 mt-1">Wilayah Jawa Tengah (AM: ARIS)</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Master Partner Premier (EPP)</span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {eppStores.length} EPP
            </div>
            <p className="text-xs text-slate-500 mt-1">Cakupan Nasional (Central, South West, dll)</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
          <button
            onClick={() => { setActiveTab('EPR'); setSearchTerm(''); }}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'EPR'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>EPR ({eprStores.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('EPP'); setSearchTerm(''); }}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'EPP'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Partner Premier (EPP — {eppStores.length})</span>
          </button>
        </div>

        {/* TAB 1: EPR */}
        {activeTab === 'EPR' && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Daftar EPR FY26</h3>
                <p className="text-xs text-slate-500">Klik "Lihat Detail" untuk memeriksa rincian target EPR</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari EPR / kode / kota..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

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
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-xs">Memuat data 24 EPR...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-2xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-6">No</th>
                      <th className="py-3 px-6">Kode EPR</th>
                      <th className="py-3 px-6">Nama EPR</th>
                      <th className="py-3 px-6">Kota</th>
                      <th className="py-3 px-6">Kategori</th>
                      <th className="py-3 px-6">Target FY26 (Inc Tax)</th>
                      <th className="py-3 px-6">Target Bulanan</th>
                      <th className="py-3 px-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEpr.map((st, idx) => (
                      <tr key={st.id || st.epr_code} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-6 text-xs text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3.5 px-6 font-mono text-xs font-semibold text-indigo-600">
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
                        <td className="py-3.5 px-6 text-xs text-slate-600">
                          {formatRupiah(st.target_monthly)}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <button
                            onClick={() => setSelectedStore(st)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Detail</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EPP */}
        {activeTab === 'EPP' && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Master Data Partner Premier (EPP) FY26</h3>
                <p className="text-xs text-slate-500">Daftar lengkap 127 EPP seluruh Indonesia</p>
              </div>

              <div className="relative min-w-[280px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama EPP / PT / kota / territory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                <p className="text-xs">Memuat data 127 EPP...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-2xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-6">No</th>
                      <th className="py-3 px-6">Kode EPP</th>
                      <th className="py-3 px-6">Nama EPP</th>
                      <th className="py-3 px-6">Nama Perusahaan (PT/CV)</th>
                      <th className="py-3 px-6">Territory</th>
                      <th className="py-3 px-6">Kota</th>
                      <th className="py-3 px-6">Area</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEpp.map((ep, idx) => (
                      <tr key={ep.id || ep.epp_code} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-6 text-xs text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3.5 px-6 font-mono text-xs font-semibold text-teal-700">
                          {ep.epp_code}
                        </td>
                        <td className="py-3.5 px-6 font-semibold text-slate-900">
                          {ep.epp_name}
                        </td>
                        <td className="py-3.5 px-6 text-xs text-slate-600">
                          {ep.company_name}
                        </td>
                        <td className="py-3.5 px-6 text-xs font-medium text-slate-700">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-2xs">
                            {ep.territory}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-xs text-slate-600">
                          {ep.city}
                        </td>
                        <td className="py-3.5 px-6 text-xs text-slate-500">
                          {ep.area_type || ep.area}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};
