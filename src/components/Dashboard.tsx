import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { EprStore, SalesRecord } from '../types';
import { ChangePasswordModal } from './ChangePasswordModal';
import { 
  Building2, 
  MapPin, 
  Award, 
  UserCheck, 
  KeyRound, 
  LogOut, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  PlusCircle,
  Save,
  Loader2,
  PieChart,
  DollarSign
} from 'lucide-react';

interface Props {
  userEmail: string;
  onLogout: () => void;
}

export const Dashboard: React.FC<Props> = ({ userEmail, onLogout }) => {
  const [store, setStore] = useState<EprStore | null>(null);
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingMonth, setEditingMonth] = useState<number | null>(null);
  const [inputAchievement, setInputAchievement] = useState<string>('');
  const [savingSales, setSavingSales] = useState(false);

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    setLoading(true);
    try {
      // 1. Ambil data Toko berdasarkan user yang login (difilter RLS)
      const { data: storeData, error: storeError } = await supabase
        .from('epr_stores')
        .select('*')
        .single();

      if (storeError) throw storeError;
      setStore(storeData);

      // 2. Ambil catatan penjualan jika ada
      if (storeData) {
        const { data: salesData } = await supabase
          .from('sales_records')
          .select('*')
          .eq('store_id', storeData.id)
          .order('month', { ascending: true });

        setSales(salesData || []);
      }
    } catch (err: any) {
      console.error('Error fetching store data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAchievement = async (month: number) => {
    if (!store) return;
    setSavingSales(true);
    const amount = parseFloat(inputAchievement) || 0;

    try {
      const { error } = await supabase.from('sales_records').upsert({
        store_id: store.id,
        month,
        year: 2026,
        achievement_amount: amount,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'store_id,month,year' });

      if (!error) {
        setEditingMonth(null);
        setInputAchievement('');
        // Refresh sales
        const { data: salesData } = await supabase
          .from('sales_records')
          .select('*')
          .eq('store_id', store.id)
          .order('month', { ascending: true });
        setSales(salesData || []);
      }
    } catch (err) {
      console.error('Failed to save sales:', err);
    } finally {
      setSavingSales(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getCategoryTheme = (cat: string) => {
    switch (cat?.toUpperCase()) {
      case 'SUN':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          gradient: 'from-amber-500 to-orange-600',
        };
      case 'STAR':
        return {
          badge: 'bg-purple-100 text-purple-800 border-purple-300',
          gradient: 'from-purple-500 to-indigo-600',
        };
      case 'MOON':
        return {
          badge: 'bg-sky-100 text-sky-800 border-sky-300',
          gradient: 'from-sky-500 to-blue-600',
        };
      case 'EARTH':
        return {
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          gradient: 'from-emerald-500 to-teal-600',
        };
      default:
        return {
          badge: 'bg-slate-100 text-slate-800 border-slate-300',
          gradient: 'from-slate-600 to-slate-800',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm">Memuat data dashboard toko...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-800 mb-2">Toko Belum Ditautkan</h2>
          <p className="text-sm text-slate-600 mb-6">
            Akun ini ({userEmail}) belum terhubung dengan data toko EPR. Silakan hubungi Account Manager Anda.
          </p>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition"
          >
            Keluar
          </button>
        </div>
      </div>
    );
  }

  const categoryTheme = getCategoryTheme(store.category);

  // Perhitungan total sales terdata
  const totalActualSales = sales.reduce((acc, curr) => acc + (curr.achievement_amount || 0), 0);
  const totalTarget = store.target_inc_tax || 1;
  const overallPercentage = Math.min(100, Math.round((totalActualSales / totalTarget) * 100));

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                EPR
              </div>
              <div>
                <span className="font-bold text-slate-900 text-base tracking-tight block">
                  Partner Portal FY26
                </span>
                <span className="text-xs text-slate-500 hidden sm:block">
                  Sistem Informasi & Target Penjualan
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

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Store Banner Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-mono text-xs font-semibold tracking-wider border border-blue-100">
                  {store.epr_code}
                </span>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${categoryTheme.badge}`}>
                  TIER: {store.category}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {store.epr_name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{store.city}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span>Account Manager: <strong className="text-slate-700">{store.am}</strong></span>
                </div>
              </div>
            </div>

            {/* Overall Progress Widget */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 min-w-[260px]">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-2">
                <span>Progress Pencapaian FY26</span>
                <span className="text-blue-600 font-bold">{overallPercentage}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
              <div className="mt-3 flex justify-between text-xs text-slate-500">
                <span>Realisasi: <strong className="text-slate-800">{formatRupiah(totalActualSales)}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Primary Target Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Target Include Tax */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Target Utama (Inc. PPN)</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {formatRupiah(store.target_inc_tax)}
            </div>
            <p className="text-xs text-slate-500 mt-1">PPN 11% Included</p>
          </div>

          {/* Card 2: Original Target */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Original Target</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {formatRupiah(store.original_target)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Target dasar sebelum pajak</p>
          </div>

          {/* Card 3: Target Bulanan */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Target Per Bulan</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {formatRupiah(store.target_monthly)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Acuan ritme bulanan (11 bulan)</p>
          </div>

          {/* Card 4: Category Target */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Category Target</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {formatRupiah(store.category_target)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Target spesifik kategori {store.category}</p>
          </div>
        </div>

        {/* Semester Breakdown (H1 vs H2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* H1 */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <h3 className="font-bold text-slate-800 text-base">Target Semester 1 (H1)</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
                Bobot: 52%
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mb-1">
              {formatRupiah(store.target_h1)}
            </div>
            <p className="text-xs text-slate-500">
              Target pencapaian semester pertama FY26 (Include Tax)
            </p>
          </div>

          {/* H2 */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                <h3 className="font-bold text-slate-800 text-base">Target Semester 2 (H2)</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md">
                Bobot: 48%
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mb-1">
              {formatRupiah(store.target_h2)}
            </div>
            <p className="text-xs text-slate-500">
              Target pencapaian semester kedua FY26 (Include Tax)
            </p>
          </div>
        </div>

        {/* Monthly Achievement Tracker */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Tracking Realisasi Penjualan Bulanan</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Input dan pantau pencapaian aktual toko Anda setiap bulan
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Bulan</th>
                  <th className="py-3.5 px-6">Target Bulanan</th>
                  <th className="py-3.5 px-6">Realisasi Aktual</th>
                  <th className="py-3.5 px-6">% Pencapaian</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.from({ length: 11 }, (_, i) => i + 1).map((monthNum) => {
                  const record = sales.find((s) => s.month === monthNum);
                  const actual = record?.achievement_amount || 0;
                  const monthlyTarget = store.target_monthly || 1;
                  const percent = Math.round((actual / monthlyTarget) * 100);

                  const isEditing = editingMonth === monthNum;

                  return (
                    <tr key={monthNum} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6 font-medium text-slate-900">
                        Bulan {monthNum}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {formatRupiah(store.target_monthly)}
                      </td>
                      <td className="py-4 px-6">
                        {isEditing ? (
                          <div className="flex items-center gap-2 max-w-[200px]">
                            <input
                              type="number"
                              value={inputAchievement}
                              onChange={(e) => setInputAchievement(e.target.value)}
                              placeholder="Nominal Rp"
                              className="w-full px-2.5 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span className={actual > 0 ? 'font-semibold text-slate-900' : 'text-slate-400'}>
                            {actual > 0 ? formatRupiah(actual) : 'Belum diisi'}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${percent >= 100 ? 'text-emerald-600' : percent > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                            {percent}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingMonth(null)}
                              className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => handleSaveAchievement(monthNum)}
                              disabled={savingSales}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
                            >
                              {savingSales ? '...' : 'Simpan'}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingMonth(monthNum);
                              setInputAchievement(actual ? actual.toString() : '');
                            }}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                          >
                            {actual > 0 ? 'Edit' : '+ Input'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Ganti Password */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};
