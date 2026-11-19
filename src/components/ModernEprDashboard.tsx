import React, { useEffect, useState, useMemo } from 'react';
import { PartnerData, EprFullData, ProgramPartner, EppSource } from '../types-pbi';
import { ChangePasswordModal } from './ChangePasswordModal';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import { processUploadedWorkbook, VerificationStats } from '../lib/epr_engine';
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
  Briefcase,
  CheckCircle,
  AlertTriangle,
  FileDown,
  Printer,
  Sun,
  Moon,
  BarChart2,
  FileText,
  Upload,
  Database,
  RefreshCw
} from 'lucide-react';

interface Props {
  userEmail: string;
  userRole: 'admin' | 'epp' | 'epr';
  userEprCode?: string; // e.g. "EPR-0038" – from app_metadata, used for exact EPR store isolation
  onLogout: () => void;
}

const CUSTOM_DATA_KEY = 'epr_custom_data_v2';
const TRANSACTION_LEDGER_KEY = 'epr_verified_transaction_keys_v3';
// One-time purge marker: remove browser-local purchase aggregates after an
// explicit admin reset, while allowing future uploads to be stored normally.
const PURCHASE_DATA_PURGE_VERSION = '2026-11-18-purchase-reset-2';

const getSystemTheme = (): 'light' | 'dark' => (
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
);

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('epr_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
  }
  return getSystemTheme();
};

const readTransactionLedger = (): string[] => {
  try {
    const raw = localStorage.getItem(TRANSACTION_LEDGER_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((key): key is string => typeof key === 'string') : [];
  } catch {
    return [];
  }
};

export const ModernEprDashboard: React.FC<Props> = ({ userEmail, userRole, userEprCode = '', onLogout }) => {
  const [data, setData] = useState<EprFullData | null>(null);
  const [productCategoryMap, setProductCategoryMap] = useState<Record<string, { categoryProduct: string; productRebate: string; description: string }>>({});
  const [eppCityMap, setEppCityMap] = useState<Record<string, string>>({});
  const [eprCityMap, setEprCityMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Navigation: 'overview' | 'program' | 'audit'
  const [activePage, setActivePage] = useState<'overview' | 'program' | 'audit'>('overview');

  // Slicer States
  const [period, setPeriod] = useState<'h2' | 'q3' | 'q4' | 'fy' | 'h1'>('h2');
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [programFilter, setProgramFilter] = useState('ALL');

  // Table View Mode: 'category' | 'quarter'
  const [tableView, setTableView] = useState<'category' | 'quarter'>('category');

  // Drawer Selected Partner
  const [selectedPartner, setSelectedPartner] = useState<PartnerData | null>(null);
  const [selectedEppContribution, setSelectedEppContribution] = useState<any | null>(null);
  const [selectedEppMonth, setSelectedEppMonth] = useState<any | null>(null);
  const [selectedEppEpr, setSelectedEppEpr] = useState<any | null>(null);
  const [selectedEppMonthLabel, setSelectedEppMonthLabel] = useState('Okt 2026');
  const [selectedEppStartMonthIndex, setSelectedEppStartMonthIndex] = useState(6);
  const [selectedEppEndMonthIndex, setSelectedEppEndMonthIndex] = useState(8);
  const [pdfReportType, setPdfReportType] = useState<'overview' | 'epp-upload'>('overview');

  // Theme: 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  // Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Upload Modal State (Khusus Admin)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [sharedSyncLoading, setSharedSyncLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });
  const [lastStats, setLastStats] = useState<VerificationStats | null>(null);

  // Load Data on Mount
  useEffect(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    const applySystemTheme = (isDark: boolean) => {
      const nextTheme: 'light' | 'dark' = isDark ? 'dark' : 'light';
      setTheme(nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
    };
    const savedTheme = localStorage.getItem('epr_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      applySystemTheme(systemTheme.matches);
    }
    const handleSystemThemeChange = (event: MediaQueryListEvent) => applySystemTheme(event.matches);
    const handleThemeChange = (event: MediaQueryListEvent) => {
      if (!localStorage.getItem('epr_theme')) handleSystemThemeChange(event);
    };
    systemTheme.addEventListener?.('change', handleThemeChange);

    fetchData();

    return () => systemTheme.removeEventListener?.('change', handleThemeChange);
  }, []);

  const loadSharedDashboardData = async (baseData: EprFullData): Promise<EprFullData> => {
    try {
      const [storesResult, salesResult, contributionResult, programResult] = await Promise.all([
        supabase.from('epr_stores').select('id,epr_code'),
        supabase.from('sales_records').select('store_id,month,year,achievement_amount,category_totals,tx_count,qty_total'),
        supabase.from('epp_contributions').select('*'),
        supabase.from('program_transaction_items').select('*'),
      ]);

      if (storesResult.error) console.warn('Data master EPR bersama belum tersedia:', storesResult.error.message);
      if (salesResult.error) console.warn('Data pembelian bersama belum tersedia:', salesResult.error.message);
      if (contributionResult.error) console.warn('Data kontribusi EPP bersama belum tersedia:', contributionResult.error.message);
      if (programResult.error) console.warn('Data program bersama belum tersedia:', programResult.error.message);

      const codeByStoreId = new Map<string, string>();
      (storesResult.data || []).forEach((store: any) => {
        if (store.id && store.epr_code) codeByStoreId.set(store.id, String(store.epr_code).toUpperCase());
      });

      const sharedByEpr = new Map<string, {
        monthly: number[];
        monthlyByCat: Record<'Consumer' | 'Scanner' | 'Consumables' | 'Dotmatrix', number[]>;
        txCount: number;
        qtyTotal: number;
      }>();
      (salesResult.data || []).forEach((row: any) => {
        const code = codeByStoreId.get(row.store_id);
        const monthIndex = Number(row.month) - 1;
        if (!code || monthIndex < 0 || monthIndex > 11) return;
        const current = sharedByEpr.get(code) || {
          monthly: Array(12).fill(0),
          monthlyByCat: {
            Consumer: Array(12).fill(0),
            Scanner: Array(12).fill(0),
            Consumables: Array(12).fill(0),
            Dotmatrix: Array(12).fill(0),
          },
          txCount: 0,
          qtyTotal: 0,
        };
        current.monthly[monthIndex] = Number(row.achievement_amount || 0);
        const cats = row.category_totals || {};
        (['Consumer', 'Scanner', 'Consumables', 'Dotmatrix'] as const).forEach((category) => {
          current.monthlyByCat[category][monthIndex] = Number(cats[category] || 0);
        });
        current.txCount += Number(row.tx_count || 0);
        current.qtyTotal += Number(row.qty_total || 0);
        sharedByEpr.set(code, current);
      });

      const sharedContributions = Array.isArray(contributionResult.data) ? contributionResult.data : [];
      const sharedProgramItems = (Array.isArray(programResult.data) ? programResult.data : []).map((row: any) => ({
        epr: row.epr_code,
        prog: row.program_name,
        date: row.invoice_date,
        model: row.material_code || '',
        desc: row.description || '',
        kat: row.category || '',
        epp: row.epp_code || '',
        epp_name: row.epp_name || '',
        eim: row.epp_name || '',
        qty: Number(row.qty || 0),
        net: Number(row.net_amount || 0),
        tx: 1,
        counted: row.counted !== false,
        upload_status: row.upload_status || (row.counted === false ? 'Tidak dihitung' : 'Terhitung'),
        reject_reason: row.reject_reason || '',
      }));

      const partners = baseData.partners.map((partner) => {
        const shared = sharedByEpr.get(partner.code);
        const contributionSources = sharedContributions
          .filter((row: any) => row.epr_code === partner.code)
          .map((row: any) => ({
            code: row.epp_code || 'EPP-0000',
            name: row.epp_name || 'EPP Lokal',
            city: row.epp_city || '-',
            total: Number(row.total || 0),
            tx: Number(row.tx_count || 0),
            cats: row.categories || { Consumer: 0, Scanner: 0, Consumables: 0, Dotmatrix: 0 },
          }));
        if (!shared && contributionSources.length === 0) return partner;

        const monthlyTotal = shared?.monthly || [...partner.monthly_total];
        const monthlyByCat = shared?.monthlyByCat || partner.monthly_by_cat;
        const actualQ1 = monthlyTotal.slice(0, 3).reduce((sum, value) => sum + value, 0);
        const actualQ2 = monthlyTotal.slice(3, 6).reduce((sum, value) => sum + value, 0);
        const actualQ3 = monthlyTotal.slice(6, 9).reduce((sum, value) => sum + value, 0);
        const actualQ4 = monthlyTotal.slice(9, 12).reduce((sum, value) => sum + value, 0);
        const catTotals = (['Consumer', 'Scanner', 'Consumables', 'Dotmatrix'] as const).reduce((result, category) => {
          result[category] = monthlyByCat[category].reduce((sum, value) => sum + value, 0);
          return result;
        }, { Consumer: 0, Scanner: 0, Consumables: 0, Dotmatrix: 0 });

        return {
          ...partner,
          monthly_total: monthlyTotal,
          monthly_by_cat: monthlyByCat,
          cat_totals: catTotals,
          actual_q1: actualQ1,
          actual_q2: actualQ2,
          actual_q3: actualQ3,
          actual_q4: actualQ4,
          actual_h1: actualQ1 + actualQ2,
          actual_h2: actualQ3 + actualQ4,
          actual_fy: actualQ1 + actualQ2 + actualQ3 + actualQ4,
          tx_count: shared?.txCount ?? partner.tx_count,
          qty_total: shared?.qtyTotal ?? partner.qty_total,
          epp_sources: contributionSources.length > 0 ? contributionSources : partner.epp_sources,
        };
      });

      return {
        ...baseData,
        partners,
        program_items: sharedProgramItems.length > 0 ? sharedProgramItems : baseData.program_items,
      };
    } catch (sharedErr) {
      console.warn('Gagal membaca data dashboard bersama:', sharedErr);
      return baseData;
    }
  };

  const syncSharedDashboardData = async (updatedData: EprFullData) => {
    const { data: stores, error: storesError } = await supabase
      .from('epr_stores')
      .select('id,epr_code');
    if (storesError) throw storesError;

    const storeIdByCode = new Map<string, string>();
    (stores || []).forEach((store: any) => {
      if (store.id && store.epr_code) storeIdByCode.set(String(store.epr_code).toUpperCase(), store.id);
    });

    const salesRows = updatedData.partners.flatMap((partner) => {
      const storeId = storeIdByCode.get(partner.code.toUpperCase());
      if (!storeId) return [];
      return Array.from({ length: 12 }, (_, monthIndex) => ({
        store_id: storeId,
        month: monthIndex + 1,
        year: monthIndex < 9 ? 2026 : 2027,
        achievement_amount: Number(partner.monthly_total[monthIndex] || 0),
        category_totals: {
          Consumer: Number(partner.monthly_by_cat.Consumer?.[monthIndex] || 0),
          Scanner: Number(partner.monthly_by_cat.Scanner?.[monthIndex] || 0),
          Consumables: Number(partner.monthly_by_cat.Consumables?.[monthIndex] || 0),
          Dotmatrix: Number(partner.monthly_by_cat.Dotmatrix?.[monthIndex] || 0),
        },
        tx_count: 0,
        qty_total: 0,
        notes: 'Verified upload aggregate',
      }));
    });
    const { error: salesError } = await supabase
      .from('sales_records')
      .upsert(salesRows, { onConflict: 'store_id,month,year' });
    if (salesError) throw salesError;

    const contributionRows = updatedData.partners.flatMap((partner) =>
      (partner.epp_sources || []).map((source) => ({
        epp_code: source.code || 'EPP-0000',
        epp_name: source.name || 'EPP Lokal',
        epp_city: source.city || '-',
        epr_code: partner.code,
        epr_name: partner.name,
        epr_city: partner.city,
        total: Number(source.total || 0),
        tx_count: Number(source.tx || 0),
        categories: source.cats || {},
      }))
    );
    const { error: deleteContributionError } = await supabase
      .from('epp_contributions')
      .delete()
      .neq('epp_code', '');
    if (deleteContributionError) throw deleteContributionError;
    if (contributionRows.length > 0) {
      const { error: contributionError } = await supabase
        .from('epp_contributions')
        .insert(contributionRows);
      if (contributionError) throw contributionError;
    }

    const programRows = (updatedData.program_items || []).map((item: any, index: number) => ({
      // Nomor baris menjaga transaksi yang kebetulan memiliki seluruh field
      // sama tetap dapat disimpan sebagai dua transaksi berbeda.
      item_key: [index, item.epr, item.prog, item.date, item.model, item.epp, item.qty, item.net].map((value) => String(value || '')).join('|'),
      epr_code: item.epr,
      program_name: item.prog || 'Reguler (Tanpa Program)',
      invoice_date: String(item.date).slice(0, 10),
      material_code: item.model || '',
      description: item.desc || '',
      category: item.kat || '',
      epp_code: item.epp || '',
      epp_name: item.epp_name || item.eim || '',
      qty: Number(item.qty || 0),
      net_amount: Number(item.net || 0),
      counted: item.counted !== false,
      upload_status: item.upload_status || (item.counted === false ? 'Tidak dihitung' : 'Terhitung'),
      reject_reason: item.reject_reason || '',
    }));
    const { error: deleteProgramError } = await supabase
      .from('program_transaction_items')
      .delete()
      .neq('item_key', '');
    if (deleteProgramError) throw deleteProgramError;
    if (programRows.length > 0) {
      const { error: programError } = await supabase
        .from('program_transaction_items')
        .insert(programRows);
      if (programError) throw programError;
    }
  };

  const clearSharedDashboardData = async () => {
    const operations = [
      await supabase.from('sales_records').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      await supabase.from('epp_contributions').delete().neq('epp_code', ''),
      await supabase.from('program_transaction_items').delete().neq('item_key', ''),
    ];
    const failed = operations.find((result) => result.error);
    if (failed?.error) throw failed.error;

    const checks = [
      await supabase.from('sales_records').select('id', { count: 'exact', head: true }),
      await supabase.from('epp_contributions').select('epp_code', { count: 'exact', head: true }),
      await supabase.from('program_transaction_items').select('item_key', { count: 'exact', head: true }),
    ];
    const failedCheck = checks.find((result) => result.error);
    if (failedCheck?.error) throw failedCheck.error;
    if (checks.some((result) => Number(result.count || 0) > 0)) {
      throw new Error('Data pembelian bersama masih tersisa di Supabase. Periksa izin DELETE/RLS tabel shared_dashboard_data.');
    }
  };

  const handleSyncExistingData = async () => {
    if (!data || sharedSyncLoading) return;
    setSharedSyncLoading(true);
    setUploadStatus({ type: 'idle', message: 'Menyinkronkan data yang sudah tersimpan...' });
    try {
      await syncSharedDashboardData(data);
      setLastStats(null);
      setUploadStatus({
        type: 'success',
        message: 'Data existing berhasil disinkronkan ke dashboard EPP/EPR. Tidak perlu upload ulang file yang sama.',
      });
    } catch (syncError: any) {
      console.error('Gagal sinkronisasi data existing:', syncError);
      setUploadStatus({
        type: 'error',
        message: `${syncError?.message || 'Sinkronisasi data existing gagal.'} Jalankan isi file shared_dashboard_data.sql di Supabase terlebih dahulu.`,
      });
    } finally {
      setSharedSyncLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Invalidate the previous browser-local purchase override after the purge.
      localStorage.removeItem('epr_custom_data');
      if (localStorage.getItem('epr_purchase_data_purge_version') !== PURCHASE_DATA_PURGE_VERSION) {
        localStorage.removeItem(CUSTOM_DATA_KEY);
        localStorage.removeItem(TRANSACTION_LEDGER_KEY);
        localStorage.setItem('epr_purchase_data_purge_version', PURCHASE_DATA_PURGE_VERSION);
      }

      // Master SKU dipakai untuk membedakan Low End, Mid High, dan kategori
      // rebate produk ketika menghitung rincian Program Booster Up.
      try {
        const skuResp = await fetch(`/data/sku.xlsx?t=${Date.now()}`);
        if (skuResp.ok) {
          const skuWb = XLSX.read(new Uint8Array(await skuResp.arrayBuffer()), { type: 'array' });
          const skuSheet = skuWb.Sheets[skuWb.SheetNames[0]];
          const skuRows = XLSX.utils.sheet_to_json<Record<string, any>>(skuSheet, { defval: '' });
          const skuMap: Record<string, { categoryProduct: string; productRebate: string; description: string }> = {};
          skuRows.forEach((row) => {
            const model = String(row['Model'] || '').trim().toUpperCase();
            if (!model) return;
            skuMap[model] = {
              categoryProduct: String(row['Category Product'] || '').trim(),
              productRebate: String(row['Product Rebate'] || '').trim(),
              description: String(row['Desc'] || '').trim(),
            };
          });
          setProductCategoryMap(skuMap);
        }
      } catch (skuErr) {
        console.warn('Gagal memuat master kategori SKU untuk Program Berjalan', skuErr);
      }

      try {
        const eppResp = await fetch(`/data/epp_master.csv?t=${Date.now()}`);
        if (eppResp.ok) {
          const eppWb = XLSX.read(await eppResp.text(), { type: 'string' });
          const eppRows = XLSX.utils.sheet_to_json<Record<string, any>>(eppWb.Sheets[eppWb.SheetNames[0]], { defval: '' });
          const cityMap: Record<string, string> = {};
          eppRows.forEach((row) => {
            const code = String(row['EPP CODE'] || '').trim().toUpperCase();
            const city = String(row['CITY'] || '').trim();
            if (code && city) cityMap[code] = city;
          });
          setEppCityMap(cityMap);
        }
      } catch (eppErr) {
        console.warn('Gagal memuat master kota EPP', eppErr);
      }

      try {
        const eprResp = await fetch(`/data/epr_master.csv?t=${Date.now()}`);
        if (eprResp.ok) {
          const eprWb = XLSX.read(await eprResp.text(), { type: 'string' });
          const eprRows = XLSX.utils.sheet_to_json<Record<string, any>>(eprWb.Sheets[eprWb.SheetNames[0]], { defval: '' });
          const cityMap: Record<string, string> = {};
          eprRows.forEach((row) => {
            const code = String(row['EPR CODE'] || '').trim().toUpperCase();
            const city = String(row['CITY'] || '').trim();
            if (code && city) cityMap[code] = city;
          });
          setEprCityMap(cityMap);
        }
      } catch (eprErr) {
        console.warn('Gagal memuat master kota EPR', eprErr);
      }

      // 1. Cek apakah ada data terbaru yang disimpan Admin di localStorage (Live Override)
      const localDataRaw = localStorage.getItem(CUSTOM_DATA_KEY);
      if (localDataRaw) {
        try {
          const parsed = JSON.parse(localDataRaw);
          if (parsed && parsed.partners && parsed.partners.length) {
            const storedLedger = readTransactionLedger();
            if (!Array.isArray(parsed.verified_transaction_keys) && storedLedger.length > 0) {
              parsed.verified_transaction_keys = storedLedger;
            }
            const hasCurrentLedger = parsed.meta?.verification_ledger_version === 3
              && Array.isArray(parsed.verified_transaction_keys);
            const isLegacyUpload = Boolean(parsed.meta?.last_source_file) && !hasCurrentLedger;
            if (!isLegacyUpload) {
              if (!parsed.program_rules) {
                try {
                  const rulesResp = await fetch(`/data/program_rules.json?t=${Date.now()}`);
                  if (rulesResp.ok) parsed.program_rules = await rulesResp.json();
                } catch (rulesErr) {
                  console.warn('Gagal memuat program_rules.json untuk data upload', rulesErr);
                }
              }
              if (!parsed.program_current) {
                try {
                  const programResp = await fetch(`/data/program_participants_current.json?t=${Date.now()}`);
                  if (programResp.ok) parsed.program_current = await programResp.json();
                } catch (programErr) {
                  console.warn('Gagal memuat program_participants_current.json untuk data upload', programErr);
                }
              }
              const synchronizedData = await loadSharedDashboardData(parsed);
              setData(synchronizedData);
              setLoading(false);
              return;
            }
            // Aggregate lama tidak dapat dipercaya untuk ditampilkan karena
            // belum memiliki ledger transaksi. Muat ulang baseline bawaan.
            localStorage.removeItem(CUSTOM_DATA_KEY);
          }
        } catch (e) {
          console.warn('Gagal membaca epr_custom_data dari localStorage:', e);
        }
      }

      // 2. Fetch data utama EPR (target, pembelian, 24 EPR) dari file statis
      const resp = await fetch(`/data/epr_data.json?t=${Date.now()}`);
      if (!resp.ok) throw new Error(`Gagal memuat data (HTTP ${resp.status})`);
      const json: EprFullData = await resp.json();

      try {
        const rulesResp = await fetch(`/data/program_rules.json?t=${Date.now()}`);
        if (rulesResp.ok) json.program_rules = await rulesResp.json();
      } catch (rulesErr) {
        console.warn('Gagal memuat program_rules.json', rulesErr);
      }
      try {
        const programResp = await fetch(`/data/program_participants_current.json?t=${Date.now()}`);
        if (programResp.ok) json.program_current = await programResp.json();
      } catch (programErr) {
        console.warn('Gagal memuat program_participants_current.json', programErr);
      }

      const sharedData = await loadSharedDashboardData(json);
      setData(sharedData);
    } catch (err: any) {
      console.error('Fetch epr_data error:', err);
      setError(err.message || 'Gagal memuat data pembelian.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const nextTheme: 'light' | 'dark' = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('epr_theme', nextTheme);
  };

  // Formatters
  const fmtRp = (v: number) => {
    return 'Rp ' + Math.round(v || 0).toLocaleString('id-ID');
  };

  const fmtCompact = (v: number) => {
    const n = Number(v || 0);
    if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(2).replace('.', ',')} M`;
    if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(1).replace('.', ',')} Jt`;
    if (n >= 1e3) return `Rp ${(n / 1e3).toFixed(0)} Rb`;
    return `Rp ${Math.round(n)}`;
  };

  const fmtPct = (v: number | null | undefined) => {
    if (v == null || !isFinite(v)) return '-';
    return `${(v * 100).toFixed(1)}%`;
  };

  // Helper to extract clean username
  const cleanUsername = useMemo(() => {
    return userEmail.split('@')[0].toLowerCase();
  }, [userEmail]);

  // Isolate partner if logged in as EPR
  const isEprUser = userRole === 'epr';
  const isEppUser = userRole === 'epp';
  const isAdmin = userRole === 'admin';

  const eppAliasMap: Record<string, string> = {
    computa: 'EPP-0050',
    topdistribusi: 'EPP-0055',
    compumart: 'EPP-0056',
    rakaperkasa: 'EPP-0245',
  };
  const ownEppCode = eppAliasMap[cleanUsername] || '';
  const ownEppNameTokens = useMemo(() => {
    const aliases: Record<string, string[]> = {
      computa: ['computa', 'cv computa'],
      topdistribusi: ['top distribusi', 'cv top distribusi'],
      compumart: ['compumart', 'pt computek', 'pt computek infomart indonesia'],
      rakaperkasa: ['raka perkasa', 'pt raka perkasa teknologi'],
    };
    return new Set((aliases[cleanUsername] || [cleanUsername]).map((value) => value.replace(/[^a-z0-9]/g, '')));
  }, [cleanUsername]);

  // For EPR users: resolve the exact partner record for subtitle / scoped views.
  // Uses userEprCode (from app_metadata) with alias-table fallback.
  const ownPartner = useMemo(() => {
    if (!isEprUser || !data?.partners) return null;
    if (userEprCode) return data.partners.find(p => p.code === userEprCode) || null;
    // Fallback: alias table (same as filteredPartners fallback)
    const u = cleanUsername;
    const aliasMap: Record<string, string> = {
      sinarjaya: 'EPR-0038', hetero: 'EPR-0054', heteroniaga: 'EPR-0054',
      harrisma: 'EPR-0267', rajaink: 'EPR-0650', rajaprint: 'EPR-0650',
      micro: 'EPR-0733', microprinter: 'EPR-0733', pixel: 'EPR-0881',
      albumi: 'EPR-1002', kodoescom: 'EPR-1005', pribumijaya: 'EPR-1005',
      yestoya: 'EPR-1197', primakom: 'EPR-1409', primakomputer: 'EPR-1409',
      safrindo: 'EPR-1410', ipk: 'EPR-1413', infokom: 'EPR-1413',
      sedardigital: 'EPR-1570', mitrapratama: 'EPR-1570', artadinata: 'EPR-1628',
      khm: 'EPR-1768', karyahidupmulya: 'EPR-1768', putramandiri: 'EPR-1770',
      ungu: 'EPR-1816', salamjaya: 'EPR-1816', bumiraya: 'EPR-1845',
      ellite: 'EPR-1906', haiga: 'EPR-1907', afa: 'EPR-1966',
      mitrasarana: 'EPR-1966', diamondindo: 'EPR-1967', nafiri: 'EPR-1999',
      jayamakmur: 'EPR-2013',
    };
    const code = aliasMap[u];
    return code ? (data.partners.find(p => p.code === code) || null) : null;
  }, [isEprUser, data, userEprCode, cleanUsername]);

  // Filter partners based on role and slicers
  const filteredPartners = useMemo(() => {
    if (!data?.partners) return [];

    return data.partners.filter((p) => {
      // If user is EPR, strictly show only their own store via epr_code from metadata
      if (isEprUser) {
        // Primary: exact match via epr_code from app_metadata (most reliable)
        if (userEprCode) return p.code === userEprCode;
        // Fallback: alias table (for local dev / no metadata)
        const u = cleanUsername;
        if (p.code === 'EPR-0038') return u === 'sinarjaya';
        if (p.code === 'EPR-0054') return u === 'hetero' || u === 'heteroniaga';
        if (p.code === 'EPR-0267') return u === 'harrisma';
        if (p.code === 'EPR-0650') return u === 'rajaink' || u === 'rajaprint';
        if (p.code === 'EPR-0733') return u === 'micro' || u === 'microprinter';
        if (p.code === 'EPR-0881') return u === 'pixel';
        if (p.code === 'EPR-1002') return u === 'albumi';
        if (p.code === 'EPR-1005') return u === 'kodoescom' || u === 'pribumijaya';
        if (p.code === 'EPR-1197') return u === 'yestoya';
        if (p.code === 'EPR-1409') return u === 'primakom' || u === 'primakomputer';
        if (p.code === 'EPR-1410') return u === 'safrindo';
        if (p.code === 'EPR-1413') return u === 'ipk' || u === 'infokom';
        if (p.code === 'EPR-1570') return u === 'sedardigital' || u === 'mitrapratama';
        if (p.code === 'EPR-1628') return u === 'artadinata';
        if (p.code === 'EPR-1768') return u === 'khm' || u === 'karyahidupmulya';
        if (p.code === 'EPR-1770') return u === 'putramandiri';
        if (p.code === 'EPR-1816') return u === 'ungu' || u === 'salamjaya';
        if (p.code === 'EPR-1845') return u === 'bumiraya';
        if (p.code === 'EPR-1906') return u === 'ellite';
        if (p.code === 'EPR-1907') return u === 'haiga';
        if (p.code === 'EPR-1966') return u === 'afa' || u === 'mitrasarana';
        if (p.code === 'EPR-1967') return u === 'diamondindo';
        if (p.code === 'EPR-1999') return u === 'nafiri';
        if (p.code === 'EPR-2013') return u === 'jayamakmur';
        return false;
      }

      // Slicers for Admin and EPP
      if (tierFilter !== 'ALL' && p.tier !== tierFilter) return false;
      if (cityFilter !== 'ALL' && p.city !== cityFilter) return false;

      // Status Filter
      if (statusFilter !== 'ALL') {
        const ach = getPartnerPeriodAch(p);
        if (statusFilter === 'achieved' && ach < 1.0) return false;
        if (statusFilter === 'ontrack' && (ach < 0.75 || ach >= 1.0)) return false;
        if (statusFilter === 'behind' && ach >= 0.75) return false;
      }

      // Search Query
      if (search.trim()) {
        const q = search.toLowerCase();
        const match = p.name.toLowerCase().includes(q) ||
                      p.code.toLowerCase().includes(q) ||
                      p.city.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [data, isEprUser, userEprCode, cleanUsername, tierFilter, cityFilter, statusFilter, search, period]);

  // Fallback program list built from uploaded V1/V2 transaction data when the
  // separate Booster Up participant master is empty.
  const uploadedProgramRows = useMemo(() => {
    if (!data?.partners) return [];

    return data.partners.flatMap((partner) => {
      if (isEprUser && ownPartner?.code !== partner.code) return [];

      return (partner.program_sources || [])
        .filter((source) => source.name && !/^reguler\b/i.test(source.name) && (source.tx > 0 || source.qty > 0))
        .map((source) => ({
          code: partner.code,
          name: partner.name,
          city: partner.city,
          am: partner.am,
          program: source.name,
          tx: source.tx || 0,
          qty: source.qty || 0,
          total: source.total || 0,
        }));
    });
  }, [data, isEprUser, ownPartner]);

  const uploadedProgramSummaries = useMemo(() => {
    const items = Array.isArray(data?.program_items) ? data.program_items.filter((item: any) => item?.counted !== false) : [];
    const rules = data?.program_rules || {};
    const ruleEntries = Object.entries(rules);
    const normalizeProgram = (value: any) => String(value || '').trim().toLowerCase();
    const findRule = (program: string) => {
      const normalized = normalizeProgram(program);
      return ruleEntries.find(([name]) => normalizeProgram(name) === normalized)
        || ruleEntries.find(([name]) => normalized.includes(normalizeProgram(name)) || normalizeProgram(name).includes(normalized));
    };
    const inPeriod = (date: string, rule: any) => {
      if (!rule?.start || !rule?.end || !date) return true;
      return date >= rule.start && date <= rule.end;
    };
    const grouped = new Map<string, any>();

    items.forEach((item: any) => {
      const program = String(item?.prog || '').trim();
      if (!program || /^reguler\b/i.test(program)) return;
      if (isEprUser && ownPartner?.code !== item?.epr) return;

      const ruleEntry = findRule(program);
      const rule = ruleEntry?.[1];
      if (!inPeriod(String(item?.date || ''), rule)) return;

      const key = ruleEntry?.[0] || program;
      const current = grouped.get(key) || {
        name: key,
        rule,
        eligibleParticipants: rule?.participants ? Object.keys(rule.participants).length : 0,
        activeParticipants: new Set<string>(),
        totalQty: 0,
        totalValue: 0,
        transactions: 0,
        requirements: [],
      };
      current.activeParticipants.add(String(item?.epr || '').trim());
      current.totalQty += Number(item?.qty || 0);
      current.totalValue += Number(item?.net || 0);
      current.transactions += Number(item?.tx || 1);
      grouped.set(key, current);
    });

    return Array.from(grouped.values()).map((summary) => {
      const requirements = Object.values(summary.rule?.schemes || {}).flatMap((scheme: any) =>
        Object.entries(scheme?.packages || {}).map(([tier, pkg]: [string, any]) => {
          const targets = Object.entries(pkg?.targets || {})
            .map(([label, value]) => `${label}: ${Number(value).toLocaleString('id-ID')}`)
            .join(' · ');
          return `${tier}${targets ? ` — ${targets}` : ''}`;
        })
      );
      return {
        ...summary,
        activeParticipantCount: summary.activeParticipants.size,
        period: summary.rule?.start && summary.rule?.end
          ? `${summary.rule.start} s/d ${summary.rule.end}`
          : 'Periode belum tersedia di master program',
        requirements: requirements.length > 0 ? requirements : ['Ketentuan belum tersedia di master program'],
      };
    });
  }, [data, isEprUser, ownPartner]);

  const programAchievementRows = useMemo(() => {
    const current = data?.program_current;
    if (!current?.participants?.length) return [];

    const rule = data?.program_rules?.[current.program_name] || data?.program_rules?.['Q3 Booster Up'] || {};
    const items = Array.isArray(data?.program_items) ? data.program_items.filter((item: any) => item?.counted !== false) : [];
    const start = current.start;
    const end = current.end;
    const normalize = (value: any) => String(value || '').trim().toLowerCase();
    const normalizeCode = (value: any) => String(value || '').trim().toUpperCase();
    const normalizeName = (value: any) => normalize(value).replace(/[^a-z0-9]/g, '');
    const allowedLocalEppCodes = new Set(
      (Array.isArray(rule?.local_epps) ? rule.local_epps : [])
        .map((code: any) => normalizeCode(code))
        .filter(Boolean)
    );
    const allowedLocalEppNames = new Set([
      ...(Array.isArray(rule?.local_epp_names) ? rule.local_epp_names : []),
      'Compumart',
      'PT Computek',
      'PT Computek Infomart Indonesia',
      'Top Distribusi',
      'CV Top Distribusi',
      'Raka Perkasa',
      'PT Raka Perkasa Teknologi',
      'Computa',
      'CV Computa',
    ].map(normalizeName).filter(Boolean));
    const consumablesProductCodes = new Set([
      ...(Array.isArray(rule?.ink_bottle_skus) ? rule.ink_bottle_skus : []),
      ...(Array.isArray(rule?.other_ink_skus) ? rule.other_ink_skus : []),
    ].map(normalizeCode).filter(Boolean));
    const ink664003Codes = new Set(
      (Array.isArray(rule?.ink_bottle_skus) ? rule.ink_bottle_skus : [])
        .map((code: any) => normalizeCode(code))
        .filter(Boolean)
    );
    const consumablesOtherCodes = new Set(
      (Array.isArray(rule?.other_ink_skus) ? rule.other_ink_skus : [])
        .map((code: any) => normalizeCode(code))
        .filter(Boolean)
    );
    const consumerProductConfig = rule?.consumer_products || {
      low_end_models: ['L121', 'L3211', 'L3251'],
      mid_high_models: ['L5290', 'L4360', 'L6370', 'L6390', 'L6440', 'L6490', 'L11050', 'L14150', 'L15150', 'L8050', 'L8100', 'L18050', 'All M Series'],
      ink_bottle_families: ['664', '671', '001', '003', '008', '057'],
    };
    const lowEndModels = (Array.isArray(consumerProductConfig.low_end_models) ? consumerProductConfig.low_end_models : [])
      .map((model: any) => normalizeCode(model));
    const midHighModels = (Array.isArray(consumerProductConfig.mid_high_models) ? consumerProductConfig.mid_high_models : [])
      .map((model: any) => normalizeCode(model));
    const inkBottleFamilies = (Array.isArray(consumerProductConfig.ink_bottle_families) ? consumerProductConfig.ink_bottle_families : [])
      .map((family: any) => normalizeCode(family));
    const classifyConsumerProduct = (item: any): 'low_end' | 'mid_high' | 'ink_bottle' | '' => {
      const itemCode = normalizeCode(item?.model);
      const skuInfo = productCategoryMap[itemCode];
      const productText = `${itemCode} ${String(item?.desc || '')} ${String(skuInfo?.description || '')}`
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, ' ');
      const tokens = new Set(productText.split(/\s+/).filter(Boolean));
      const familyPrefixes: Record<string, string[]> = {
        '664': ['C13T664'],
        '671': ['C13T671'],
        '001': ['C13T03Y'],
        '003': ['C13T00V'],
        '008': ['C13T06G'],
        '057': ['C13T09D'],
      };
      const isInkBottle = inkBottleFamilies.some((family) =>
        tokens.has(family) || (familyPrefixes[family] || []).some((prefix) => itemCode.includes(prefix))
      );
      if (isInkBottle) return 'ink_bottle';
      const hasModel = (model: string) => {
        if (model === 'ALL M SERIES') return Array.from(tokens).some((token) => /^M\d+$/.test(token));
        return tokens.has(model);
      };
      if (lowEndModels.some(hasModel)) return 'low_end';
      if (midHighModels.some(hasModel)) return 'mid_high';
      return '';
    };

    return current.participants
      .filter((participant) => !isEprUser || ownPartner?.code === participant.code)
      .map((participant) => {
        const isConsumables = /consumables/i.test(participant.pack_name || '');
        const schemeName = isConsumables ? 'consumables' : 'unit_ink';
        const tier = String(participant.pack_name || '').split(/\s+/)[0].toUpperCase();
        const packageRule = rule?.schemes?.[schemeName]?.packages?.[tier] || {};
        const targets = packageRule.targets || {};
        const targetQty = Number(packageRule.total_qty || Object.values(targets).reduce((sum: number, value: any) => sum + Number(value || 0), 0));
        const lowEndTargetQty = schemeName === 'unit_ink' ? Number(targets.low_end || 0) : 0;
        const midHighTargetQty = schemeName === 'unit_ink' ? Number(targets.mid_high || 0) : 0;
        const unitTargetQty = lowEndTargetQty + midHighTargetQty;
        const inkBottleTargetQty = schemeName === 'unit_ink' ? Number(targets.ink_bottle || 0) : 0;
        const ink664003TargetQty = schemeName === 'consumables' ? Number(targets.ink_664_003 || 0) : 0;
        const consumablesOtherTargetQty = schemeName === 'consumables' ? Number(targets.cons_other || 0) : 0;
        const participantItems = items.filter((item: any) => {
          const itemDate = String(item?.date || '').slice(0, 10);
          const itemProgram = normalize(item?.prog);
          const programMatch = itemProgram.includes(normalize(current.program_name))
            || itemProgram.includes('booster up');
          const itemProductCode = String(item?.model || '').trim().toUpperCase();
          const consumerProductGroup = classifyConsumerProduct(item);
          // Consumer = unit Consumer + ink bottle. Consumables tetap dibatasi
          // pada daftar SKU Consumables yang sudah disetujui program.
          const productMatch = isConsumables
            ? (consumablesProductCodes.size > 0 && consumablesProductCodes.has(itemProductCode))
            : Boolean(consumerProductGroup);
          const itemEppCode = normalizeCode(item?.epp || item?.epp_code);
          const itemEppName = normalizeName(item?.epp_name || item?.eim);
          const localEppMatch = (allowedLocalEppCodes.size > 0 || allowedLocalEppNames.size > 0)
            && (allowedLocalEppCodes.has(itemEppCode) || allowedLocalEppNames.has(itemEppName));
          return item?.epr === participant.code
            && itemDate >= start
            && itemDate <= end
            && programMatch
            && productMatch
            && localEppMatch;
        });
        const monthQty = (month: string) => participantItems
          .filter((item: any) => String(item?.date || '').slice(0, 7) === month)
          .reduce((sum: number, item: any) => sum + Number(item?.qty || 0), 0);
        const actualQty = participantItems.reduce((sum: number, item: any) => sum + Number(item?.qty || 0), 0);
        const actualValue = participantItems.reduce((sum: number, item: any) => sum + Number(item?.net || 0), 0);
        const actualInkBottleQty = participantItems
          .filter((item: any) => classifyConsumerProduct(item) === 'ink_bottle')
          .reduce((sum: number, item: any) => sum + Number(item?.qty || 0), 0);
        const actualLowEndQty = schemeName === 'unit_ink'
          ? participantItems
            .filter((item: any) => classifyConsumerProduct(item) === 'low_end')
            .reduce((sum: number, item: any) => sum + Number(item?.qty || 0), 0)
          : 0;
        const actualMidHighQty = schemeName === 'unit_ink'
          ? participantItems
            .filter((item: any) => classifyConsumerProduct(item) === 'mid_high')
            .reduce((sum: number, item: any) => sum + Number(item?.qty || 0), 0)
          : 0;
        const actualUnitQty = Math.max(0, actualQty - actualInkBottleQty);
        const actualUnclassifiedUnitQty = Math.max(0, actualUnitQty - actualLowEndQty - actualMidHighQty);
        const actualInk664003Qty = schemeName === 'consumables'
          ? participantItems
            .filter((item: any) => ink664003Codes.has(normalizeCode(item?.model)))
            .reduce((sum: number, item: any) => sum + Number(item?.qty || 0), 0)
          : 0;
        const actualConsumablesOtherQty = schemeName === 'consumables'
          ? participantItems
            .filter((item: any) => consumablesOtherCodes.has(normalizeCode(item?.model)))
            .reduce((sum: number, item: any) => sum + Number(item?.qty || 0), 0)
          : 0;
        // Paket hanya dianggap tercapai jika setiap subkategori memenuhi
        // targetnya. Qty kategori yang berlebih tidak boleh menutup kategori
        // lain yang masih kurang.
        const achievementParts = schemeName === 'unit_ink'
          ? [
              [actualLowEndQty, lowEndTargetQty],
              [actualMidHighQty, midHighTargetQty],
              [actualInkBottleQty, inkBottleTargetQty],
            ]
          : [
              [actualInk664003Qty, ink664003TargetQty],
              [actualConsumablesOtherQty, consumablesOtherTargetQty],
            ];
        const achievementRatios = achievementParts
          .filter(([, target]) => Number(target) > 0)
          .map(([actual, target]) => Number(actual) / Number(target));
        const achievement = achievementRatios.length > 0 ? Math.min(...achievementRatios) : 0;

        return {
          ...participant,
          scheme: schemeName,
          tier,
          targetQty,
          lowEndTargetQty,
          midHighTargetQty,
          unitTargetQty,
          inkBottleTargetQty,
          ink664003TargetQty,
          consumablesOtherTargetQty,
          targets,
          actualQty,
          actualLowEndQty,
          actualMidHighQty,
          actualUnitQty,
          actualUnclassifiedUnitQty,
          actualInkBottleQty,
          actualInk664003Qty,
          actualConsumablesOtherQty,
          actualValue,
          txCount: participantItems.length,
          octQty: monthQty('2026-10'),
          novQty: monthQty('2026-11'),
          decQty: monthQty('2026-12'),
          gap: Math.max(0, targetQty - actualQty),
          achievement,
        };
      });
  }, [data, productCategoryMap, isEprUser, ownPartner]);

  // Compute period metrics for a partner
  function getPartnerPeriodMetrics(p: PartnerData) {
    const origFy = p.target_original || p.target_fy || 0;
    let target = origFy;
    let actual = p.actual_fy || 0;

    if (period === 'h1') {
      target = p.target_original_h1 ?? Math.round(origFy * 0.52);
      actual = p.actual_h1;
    } else if (period === 'h2') {
      target = p.target_original_h2 ?? Math.round(origFy * 0.48);
      actual = p.actual_h2;
    } else if (period === 'q3') {
      target = p.target_original_q3 ?? Math.round(origFy * 0.30);
      actual = p.actual_q3;
    } else if (period === 'q4') {
      target = p.target_original_q4 ?? Math.round(origFy * 0.18);
      actual = p.actual_q4;
    }

    const ach = target > 0 ? actual / target : 0;
    const gap = Math.max(0, target - actual);

    return { target, actual, ach, gap };
  }

  function getPartnerPeriodAch(p: PartnerData) {
    return getPartnerPeriodMetrics(p).ach;
  }

  function getPartnerPeriodCategoryTotals(p: PartnerData) {
    // Validasi EPP harus bisa dibandingkan dengan rekap Admin yang mencakup
    // seluruh FY, bukan hanya slicer H2/Q3/Q4 yang sedang aktif.
    const monthIndexes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    return (['Consumer', 'Consumables', 'Scanner', 'Dotmatrix'] as const).reduce((totals, category) => {
      totals[category] = monthIndexes.reduce(
        (sum, monthIndex) => sum + Number(p.monthly_by_cat?.[category]?.[monthIndex] || 0),
        0,
      );
      return totals;
    }, { Consumer: 0, Consumables: 0, Scanner: 0, Dotmatrix: 0 });
  }

  const classifyMixItem = (item: any): 'low_end' | 'mid_high' | '' => {
    const model = String(item?.model || '').trim().toUpperCase();
    const skuInfo = productCategoryMap[model];
    const categoryProduct = String(skuInfo?.categoryProduct || '').trim().toLowerCase();
    if (categoryProduct === 'low end') return 'low_end';
    if (categoryProduct === 'mid high') return 'mid_high';

    const productText = `${model} ${String(item?.desc || '')} ${String(skuInfo?.description || '')}`
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, ' ');
    const tokens = new Set(productText.split(/\s+/).filter(Boolean));
    if (['L121', 'L3211', 'L3251'].some((code) => tokens.has(code))) return 'low_end';
    if (['L5290', 'L4360', 'L6370', 'L6390', 'L6440', 'L6490', 'L11050', 'L14150', 'L15150', 'L8050', 'L8100', 'L18050'].some((code) => tokens.has(code))) {
      return 'mid_high';
    }
    if (Array.from(tokens).some((token) => /^M\d+$/.test(token))) return 'mid_high';
    return '';
  };

  const isItemInSelectedPeriod = (dateValue: any) => {
    const date = String(dateValue || '').slice(0, 10);
    if (!date) return false;
    const bounds = period === 'h1'
      ? ['2026-04-01', '2026-09-30']
      : period === 'h2'
        ? ['2026-10-01', '2027-03-31']
        : period === 'q3'
          ? ['2026-10-01', '2026-12-31']
          : period === 'q4'
            ? ['2027-01-01', '2027-03-31']
            : ['2026-04-01', '2027-03-31'];
    return date >= bounds[0] && date <= bounds[1];
  };

  // Aggregate Overview KPIs
  const kpiSummary = useMemo(() => {
    let totalRevenue = 0;
    let totalTarget = 0;
    let totalLowEnd = 0;
    let totalMidHi = 0;
    let achievedCount = 0;

    const programItems = Array.isArray(data?.program_items) ? data.program_items.filter((item: any) => item?.counted !== false) : [];
    let classifiedMixItems = 0;
    filteredPartners.forEach((p) => {
      const { target, actual, ach } = getPartnerPeriodMetrics(p);
      totalRevenue += actual;
      totalTarget += target;
      const partnerMixItems = programItems.filter((item: any) =>
        String(item?.epr || '').trim().toUpperCase() === p.code.toUpperCase()
        && isItemInSelectedPeriod(item?.date)
      );
      partnerMixItems.forEach((item: any) => {
        const bucket = classifyMixItem(item);
        if (!bucket) return;
        classifiedMixItems += 1;
        if (bucket === 'low_end') totalLowEnd += Number(item?.net || 0);
        if (bucket === 'mid_high') totalMidHi += Number(item?.net || 0);
      });
      if (ach >= 1.0) achievedCount++;
    });

    // Fallback untuk data lama yang belum memiliki rincian transaksi program.
    if (classifiedMixItems === 0) {
      totalLowEnd = filteredPartners.reduce((sum, partner) => sum + Number(partner.low_end || 0), 0);
      totalMidHi = filteredPartners.reduce((sum, partner) => sum + Number(partner.mid_hi || 0), 0);
    }

    const achOverall = totalTarget > 0 ? totalRevenue / totalTarget : 0;
    const totalMix = totalLowEnd + totalMidHi;
    const midHiShare = totalMix > 0 ? (totalMidHi / totalMix) * 100 : 0;

    // Q3 & Q4 Focus Overall
    let q3Target = 0;
    let q3Actual = 0;
    let q4Target = 0;
    let q4Actual = 0;

    filteredPartners.forEach((p) => {
      const origFy = p.target_original || p.target_fy || 0;
      q3Target += p.target_original_q3 ?? Math.round(origFy * 0.30);
      q3Actual += p.actual_q3 || 0;
      q4Target += p.target_original_q4 ?? Math.round(origFy * 0.18);
      q4Actual += p.actual_q4 || 0;
    });

    const q3Ach = q3Target > 0 ? q3Actual / q3Target : 0;
    const q3Gap = Math.max(0, q3Target - q3Actual);

    const q4Ach = q4Target > 0 ? q4Actual / q4Target : 0;
    const q4Gap = Math.max(0, q4Target - q4Actual);

    const monthlyMetrics = [6, 7, 8, 9, 10, 11].map((monthIndex) => {
      const actual = filteredPartners.reduce((sum, partner) => sum + (partner.monthly_total[monthIndex] || 0), 0);
      const target = filteredPartners.reduce((sum, partner) => {
        const originalFy = partner.target_original || partner.target_fy || 0;
        const fallbackWeight = monthIndex <= 8 ? 0.10 : 0.06;
        return sum + (partner.target_original_monthly?.[monthIndex] ?? Math.round(originalFy * fallbackWeight));
      }, 0);
      return {
        actual,
        target,
        achievement: target > 0 ? actual / target : 0,
        gap: Math.max(0, target - actual),
      };
    });

    // Category Totals
    let catConsumer = 0;
    let catScanner = 0;
    let catConsumables = 0;
    let catDotmatrix = 0;

    filteredPartners.forEach((p) => {
      catConsumer += p.cat_totals?.Consumer || 0;
      catScanner += p.cat_totals?.Scanner || 0;
      catConsumables += p.cat_totals?.Consumables || 0;
      catDotmatrix += p.cat_totals?.Dotmatrix || 0;
    });

    const totalCat = catConsumer + catScanner + catConsumables + catDotmatrix || 1;

    return {
      totalRevenue,
      totalTarget,
      achOverall,
      achievedCount,
      totalPartners: filteredPartners.length,
      midHiShare,
      totalLowEnd,
      totalMidHi,
      q3Target,
      q3Actual,
      q3Ach,
      q3Gap,
      q4Target,
      q4Actual,
      q4Ach,
      q4Gap,
      monthlyMetrics,
      catConsumer,
      catScanner,
      catConsumables,
      catDotmatrix,
      totalCat
    };
  }, [data, filteredPartners, period, productCategoryMap]);

  // Unique cities for Slicer
  const uniqueCities = useMemo(() => {
    if (!data?.partners) return [];
    return Array.from(new Set(data.partners.map((p) => p.city).filter(Boolean))).sort();
  }, [data]);

  // Unique tiers for Slicer
  const uniqueTiers = useMemo(() => {
    if (!data?.partners) return [];
    return Array.from(new Set(data.partners.map((p) => p.tier).filter(Boolean)));
  }, [data]);

  // Rekap seluruh EPP yang benar-benar memiliki pembelian ke EPR master.
  // Sumber utama berasal dari epp_sources pada setiap partner agar ikut
  // berubah setelah upload transaksi baru.
  const eppContributionRows = useMemo(() => {
    if (!data?.partners) return data?.epp_summary || [];

    // Utamakan ledger transaksi terbaru agar snapshot epp_sources lama tidak
    // membuat Admin menampilkan EPR yang tidak ada pada akun EPP.
    const transactionItems = Array.isArray(data.program_items)
      ? data.program_items.filter((item: any) => item?.counted !== false)
      : [];
    if (transactionItems.length > 0) {
      const transactionGrouped = new Map<string, any>();
      transactionItems.forEach((item: any) => {
        const eppCode = String(item?.epp || item?.epp_code || '').trim().toUpperCase() || 'EPP-0000';
        const eppName = String(item?.epp_name || item?.eim || '').trim() || 'EPP Lokal';
        const eprCode = String(item?.epr || item?.epr_code || '').trim().toUpperCase();
        const partner = data.partners.find((candidate) => candidate.code === eprCode);
        const key = `${eppCode}|${eppName}`;
        const current = transactionGrouped.get(key) || {
          code: eppCode,
          name: eppName,
          city: eppCityMap[eppCode] || '-',
          total: 0,
          tx_count: 0,
          partner_codes: new Set<string>(),
          partner_details: [],
          cats: { Consumer: 0, Scanner: 0, Consumables: 0, Dotmatrix: 0 },
        };
        const amount = Number(item?.net || 0);
        const category = String(item?.kat || 'Consumer').trim() || 'Consumer';
        current.total += amount;
        current.tx_count += Number(item?.tx || 1);
        current.cats[category] = (current.cats[category] || 0) + amount;
        if (eprCode) {
          current.partner_codes.add(eprCode);
          const existingPartner = current.partner_details.find((detail: any) => detail.code === eprCode);
          if (existingPartner) {
            existingPartner.total += amount;
          } else {
            current.partner_details.push({
              code: eprCode,
              name: partner?.name || eprCode,
              city: eprCityMap[eprCode] || partner?.city || '-',
              total: amount,
            });
          }
        }
        transactionGrouped.set(key, current);
      });

      return Array.from(transactionGrouped.values())
        .map((row) => ({ ...row, partner_count: row.partner_codes.size }))
        .sort((a, b) => b.total - a.total);
    }

    const grouped = new Map<string, any>();
    data.partners.forEach((partner) => {
      (partner.epp_sources || []).forEach((source) => {
        const key = source.code || source.name || 'EPP-0000';
        const current = grouped.get(key) || {
          code: source.code || 'EPP-0000',
          name: source.name || 'EPP Lokal',
          city: eppCityMap[String(source.code || '').trim().toUpperCase()] || source.city || '-',
          total: 0,
          tx_count: 0,
          partner_codes: new Set<string>(),
          partner_details: [],
          cats: { Consumer: 0, Scanner: 0, Consumables: 0, Dotmatrix: 0 },
        };
        current.total += Number(source.total || 0);
        current.tx_count += Number(source.tx || 0);
        current.partner_codes.add(partner.code);
        if (!current.partner_details.some((item: any) => item.code === partner.code)) {
          current.partner_details.push({
            code: partner.code,
            name: partner.name,
            city: eprCityMap[partner.code] || partner.city,
            total: Number(source.total || 0),
          });
        } else {
          const partnerDetail = current.partner_details.find((item: any) => item.code === partner.code);
          if (partnerDetail) partnerDetail.total += Number(source.total || 0);
        }
        Object.entries(source.cats || {}).forEach(([category, amount]) => {
          current.cats[category] = (current.cats[category] || 0) + Number(amount || 0);
        });
        grouped.set(key, current);
      });
    });

    if (grouped.size === 0) return data.epp_summary || [];
    return Array.from(grouped.values())
      .map((row) => ({
        ...row,
        partner_count: row.partner_codes.size,
      }))
      .sort((a, b) => b.total - a.total);
  }, [data, eppCityMap, eprCityMap]);

  const eppUploadAudit = useMemo(() => {
    // Data Upload Epson Hub memakai rentang bulan manual, sehingga pilihan
    // bulan tidak dibatasi oleh slicer Overview.
    const monthIndexes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const monthLabels = ['Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des', 'Jan', 'Feb', 'Mar'];
    const monthBounds = [
      ['2026-04-01', '2026-04-30'], ['2026-05-01', '2026-05-31'], ['2026-06-01', '2026-06-30'],
      ['2026-07-01', '2026-07-31'], ['2026-08-01', '2026-08-31'], ['2026-09-01', '2026-09-30'],
      ['2026-10-01', '2026-10-31'], ['2026-11-01', '2026-11-30'], ['2026-12-01', '2026-12-31'],
      ['2027-01-01', '2027-01-31'], ['2027-02-01', '2027-02-28'], ['2027-03-01', '2027-03-31'],
    ];
    const categories = ['Consumer', 'Consumables', 'Scanner', 'Dotmatrix'] as const;
    const items = Array.isArray(data?.program_items) ? data.program_items : [];
    const normalizeEppCode = (value: any) => String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const ownEppCodes = new Set([normalizeEppCode(ownEppCode)].filter(Boolean));
    const ownEppNames = new Set(ownEppNameTokens);
    (data?.partners || []).forEach((partner) => {
      (partner.epp_sources || []).forEach((source) => {
        const sourceCode = normalizeEppCode(source.code);
        const sourceName = String(source.name || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const isOwnSource = (sourceCode && ownEppCodes.has(sourceCode))
          || (sourceName && Array.from(ownEppNames).some((name) => name && (sourceName.includes(name) || name.includes(sourceName))));
        if (isOwnSource) {
          if (sourceCode) ownEppCodes.add(sourceCode);
          if (sourceName) ownEppNames.add(sourceName);
        }
      });
    });
    const ownUploadItems = items.filter((item: any) => {
      const itemCode = normalizeEppCode(item?.epp || item?.epp_code);
      const itemName = String(item?.epp_name || item?.eim || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      return (itemCode && ownEppCodes.has(itemCode))
        || (itemName && Array.from(ownEppNames).some((name) => name && (itemName.includes(name) || name.includes(itemName))));
    });
    const ownItems = ownUploadItems.filter((item: any) => item?.counted !== false);
    const rows = monthIndexes.map((monthIndex) => {
      const [start, end] = monthBounds[monthIndex];
      const monthItems = ownItems.filter((item: any) => {
        const date = String(item?.date || '').slice(0, 10);
        return date >= start && date <= end;
      });
      const totals = categories.reduce((result, category) => {
        result[category] = monthItems
          .filter((item: any) => String(item?.kat || '').trim().toLowerCase() === category.toLowerCase())
          .reduce((sum: number, item: any) => sum + Number(item?.net || 0), 0);
        return result;
      }, { Consumer: 0, Consumables: 0, Scanner: 0, Dotmatrix: 0 });
      const byEpr = new Map<string, any>();
      monthItems.forEach((item: any) => {
        const eprCode = String(item?.epr || '').trim().toUpperCase() || 'EPR-UNKNOWN';
        const partner = data?.partners?.find((candidate) => candidate.code === eprCode);
        const current = byEpr.get(eprCode) || {
          code: eprCode,
          name: partner?.name || eprCode,
          city: partner?.city || '-',
          qty: 0,
          total: 0,
          categories: {},
          categoryTotals: { Consumer: 0, Consumables: 0, Scanner: 0, Dotmatrix: 0 },
          products: {},
        };
        const category = String(item?.kat || 'Lainnya').trim() || 'Lainnya';
        const model = String(item?.model || item?.desc || 'SKU Tidak Diketahui').trim() || 'SKU Tidak Diketahui';
        const invoiceDate = String(item?.date || '').slice(0, 10);
        current.qty += Number(item?.qty || 0);
        current.total += Number(item?.net || 0);
        current.categories[category] = (current.categories[category] || 0) + Number(item?.qty || 0);
        current.categoryTotals[category] = (current.categoryTotals[category] || 0) + Number(item?.net || 0);
        current.products[category] = current.products[category] || {};
        const productDetail = current.products[category][model] || { qty: 0, dates: [], total: 0 };
        productDetail.qty += Number(item?.qty || 0);
        productDetail.total += Number(item?.net || 0);
        if (invoiceDate && !productDetail.dates.includes(invoiceDate)) productDetail.dates.push(invoiceDate);
        current.products[category][model] = productDetail;
        byEpr.set(eprCode, current);
      });
      return {
        monthIndex,
        label: `${monthLabels[monthIndex]} ${monthIndex < 9 ? '2026' : '2027'}`,
        ...totals,
        total: categories.reduce((sum, category) => sum + totals[category], 0),
        eprDetails: Array.from(byEpr.values()).sort((a, b) => b.total - a.total),
      };
    });
    const detailTotal = ownItems.reduce((sum: number, item: any) => sum + Number(item?.net || 0), 0);
    const dashboardTotal = Number(eppContributionRows.find((row: any) => row.code === ownEppCode)?.total || 0);
    const difference = Math.abs(detailTotal - dashboardTotal);
    return {
      rows,
      items: ownUploadItems,
      detailTotal,
      dashboardTotal,
      difference,
      hasDetails: ownItems.length > 0,
      status: ownItems.length === 0 ? 'empty' : difference <= 1 ? 'match' : 'mismatch',
    };
  }, [data, eppContributionRows, ownEppCode, ownEppNameTokens, period]);

  const selectedEppRangeRows = useMemo(() => {
    const start = Math.min(selectedEppStartMonthIndex, selectedEppEndMonthIndex);
    const end = Math.max(selectedEppStartMonthIndex, selectedEppEndMonthIndex);
    return eppUploadAudit.rows.filter((row: any) => row.monthIndex >= start && row.monthIndex <= end);
  }, [eppUploadAudit, selectedEppStartMonthIndex, selectedEppEndMonthIndex]);

  const selectedEppRangeLabel = selectedEppRangeRows.length > 1
    ? `${selectedEppRangeRows[0].label} – ${selectedEppRangeRows[selectedEppRangeRows.length - 1].label}`
    : selectedEppRangeRows[0]?.label || 'Belum ada periode';

  const eppUploadPdfRows = useMemo(() => selectedEppRangeRows.flatMap((month: any) =>
    (month.eprDetails || []).flatMap((detail: any) =>
      Object.entries(detail.products || {}).flatMap(([category, products]) =>
        Object.entries(products as Record<string, { qty: number; dates: string[]; total?: number }>).map(([model, product]) => {
          const invoiceDates = (product.dates || []).map((date) => new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })).join(', ');
          return {
            month: month.label,
            eprCode: detail.code,
            eprName: detail.name,
            category,
            model,
            description: productCategoryMap[model.trim().toUpperCase()]?.description || model,
            qty: Number(product.qty || 0),
            invoiceDates,
            total: Number(product.total || 0),
          };
        }),
      ),
    ),
  ), [selectedEppRangeRows, productCategoryMap]);

  const selectedEppDetailItems = useMemo(() => {
    const start = Math.min(selectedEppStartMonthIndex, selectedEppEndMonthIndex);
    const end = Math.max(selectedEppStartMonthIndex, selectedEppEndMonthIndex);
    return (eppUploadAudit.items || []).filter((item: any) => {
      const date = String(item?.date || '').slice(0, 10);
      const parts = date.split('-').map(Number);
      if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return false;
      const month = parts[1];
      const fiscalMonthIndex = month >= 4 ? month - 4 : month + 8;
      return fiscalMonthIndex >= start && fiscalMonthIndex <= end;
    });
  }, [eppUploadAudit, selectedEppStartMonthIndex, selectedEppEndMonthIndex]);

  // Reset Filters
  const handleResetFilters = () => {
    setPeriod('h2');
    setSearch('');
    setTierFilter('ALL');
    setCityFilter('ALL');
    setStatusFilter('ALL');
    setProgramFilter('ALL');
  };

  // Export CSV
  const handleExportCsv = () => {
    if (!filteredPartners.length) return;

    const headers = ['Kode EPR', 'Nama EPR', 'Kota', 'Tier', 'Target Period', 'Actual Period', 'Ach %'];
    const rows = filteredPartners.map((p) => {
      const { target, actual, ach } = getPartnerPeriodMetrics(p);
      return [
        `"${p.code}"`,
        `"${p.name}"`,
        `"${p.city}"`,
        `"${p.tier}"`,
        target,
        actual,
        `"${(ach * 100).toFixed(1)}%"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EPR_Achievement_${period.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = (reportType: 'overview' | 'epp-upload') => {
    setPdfReportType(reportType);
    // Beri React waktu untuk merender laporan yang dipilih sebelum dialog cetak dibuka.
    window.setTimeout(() => window.print(), 50);
  };

  const handleDownloadEppExcel = () => {
    const summaryRows = selectedEppRangeRows.flatMap((month: any) =>
      (month.eprDetails || []).map((detail: any) => ({
        Bulan: month.label,
        'Kode EPR': detail.code,
        'Nama EPR': detail.name,
        Consumer: Number(detail.categoryTotals?.Consumer || 0),
        Consumables: Number(detail.categoryTotals?.Consumables || 0),
        Scanner: Number(detail.categoryTotals?.Scanner || 0),
        Dotmatrix: Number(detail.categoryTotals?.Dotmatrix || 0),
        'Total Penjualan': Number(detail.total || 0),
      })),
    );
    const monthNames = ['Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des', 'Jan', 'Feb', 'Mar'];
    const detailRows = selectedEppDetailItems.map((item: any) => {
      const date = String(item?.date || '').slice(0, 10);
      const parts = date.split('-').map(Number);
      const fiscalMonthIndex = parts[1] >= 4 ? parts[1] - 4 : parts[1] + 8;
      const partner = data?.partners?.find((candidate) => candidate.code === item?.epr);
      return {
        Bulan: `${monthNames[fiscalMonthIndex] || '-'} ${fiscalMonthIndex < 9 ? '2026' : '2027'}`,
        'Tanggal Invoice': date,
        'Kode EPR': item?.epr || '-',
        'Nama EPR': partner?.name || item?.epr || '-',
        Program: item?.prog || 'Reguler (Tanpa Program)',
        'Status Upload': item?.upload_status || (item?.counted === false ? 'Tidak dihitung' : 'Terhitung'),
        Alasan: item?.reject_reason || '-',
        Category: item?.kat || '-',
        'Material Code': item?.model || '-',
        'Tipe Produk': productCategoryMap[String(item?.model || '').trim().toUpperCase()]?.description || item?.desc || item?.model || '-',
        Qty: Number(item?.qty || 0),
        'Total Penjualan': Number(item?.net || 0),
      };
    });

    const workbook = XLSX.utils.book_new();
    const summarySheet = XLSX.utils.json_to_sheet(summaryRows.length ? summaryRows : [{ Keterangan: 'Tidak ada data penjualan pada periode yang dipilih.' }]);
    const detailSheet = XLSX.utils.json_to_sheet(detailRows.length ? detailRows : [{ Keterangan: 'Tidak ada detail transaksi pada periode yang dipilih.' }]);
    summarySheet['!cols'] = [
      { wch: 14 }, { wch: 14 }, { wch: 34 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 18 },
    ];
    detailSheet['!cols'] = [
      { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 34 }, { wch: 30 }, { wch: 24 }, { wch: 28 }, { wch: 16 }, { wch: 18 }, { wch: 34 }, { wch: 10 }, { wch: 18 },
    ];
    if (summaryRows.length) summarySheet['!autofilter'] = { ref: `A1:H${summaryRows.length + 1}` };
    if (detailRows.length) detailSheet['!autofilter'] = { ref: `A1:L${detailRows.length + 1}` };
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');
    XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detail Penjualan');
    const fileName = `Penjualan_${(ownEppCode || cleanUsername).replace(/[^A-Z0-9-]/gi, '_')}_${selectedEppRangeLabel.replace(/[^A-Z0-9-]+/gi, '_')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Upload Excel Handler (Khusus Admin)
  // Upload Excel Handler (Khusus Admin - Adopsi Penuh Mesin Verifikasi ariswidodo/EPR)
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setUploadStatus({ type: 'idle', message: 'Membaca dan memverifikasi data transaksi...' });
    setLastStats(null);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const buffer = ev.target?.result;
        if (!buffer) throw new Error('File tidak dapat dibaca.');

        const wb = XLSX.read(new Uint8Array(buffer as ArrayBuffer), { type: 'array' });

        // Data hasil upload versi lama hanya menyimpan agregat per EPR, tanpa
        // identitas transaksi. Saat ditemukan, mulai ulang dari data bawaan
        // agar upload sekarang tidak menggandakan agregat lama. Ledger baru
        // akan dibuat oleh processUploadedWorkbook dari baris V1/V2/V3.
        const storedLedger = readTransactionLedger();
        let uploadBaseline = data
          ? {
              ...data,
              verified_transaction_keys: Array.from(new Set([
                ...(data.verified_transaction_keys || []),
                ...storedLedger,
              ])),
            }
          : data;
        const hasCurrentLedger = data?.meta?.verification_ledger_version === 3
          && Array.isArray(data.verified_transaction_keys);
        if (data?.meta?.last_source_file && !hasCurrentLedger) {
          const defaultResponse = await fetch(`/data/epr_data.json?t=${Date.now()}`);
          if (!defaultResponse.ok) {
            throw new Error(`Gagal memuat data bawaan sebagai baseline (HTTP ${defaultResponse.status}).`);
          }
          const defaultData = await defaultResponse.json() as EprFullData;
          uploadBaseline = {
            ...defaultData,
            program_rules: data?.program_rules || defaultData.program_rules,
            program_current: data?.program_current || defaultData.program_current,
          };
          localStorage.removeItem(CUSTOM_DATA_KEY);
        }
        
        let priceDatabase: Record<string, number> = {};
        try {
          const priceResponse = await fetch(`/data/sku_price_database.json?t=${Date.now()}`);
          if (priceResponse.ok) priceDatabase = await priceResponse.json();
        } catch (priceError) {
          console.warn('Database harga SKU tidak dapat dimuat; harga upload dipakai apa adanya:', priceError);
        }

        let skuDatabase: Record<string, { categoryProduct: string; productRebate: string; description: string }> = productCategoryMap;
        if (Object.keys(skuDatabase).length === 0) {
          try {
            const skuResponse = await fetch(`/data/sku.xlsx?t=${Date.now()}`);
            if (skuResponse.ok) {
              const skuWorkbook = XLSX.read(new Uint8Array(await skuResponse.arrayBuffer()), { type: 'array' });
              const skuSheet = skuWorkbook.Sheets[skuWorkbook.SheetNames[0]];
              const skuRows = XLSX.utils.sheet_to_json<Record<string, any>>(skuSheet, { defval: '' });
              skuDatabase = {};
              skuRows.forEach((row) => {
                const model = String(row['Model'] || '').trim().toUpperCase();
                if (!model) return;
                skuDatabase[model] = {
                  categoryProduct: String(row['Category Product'] || '').trim(),
                  productRebate: String(row['Product Rebate'] || '').trim(),
                  description: String(row['Desc'] || '').trim(),
                };
              });
            }
          } catch (skuError) {
            console.warn('Master SKU tidak dapat dimuat; upload dibatalkan demi menjaga validasi SKU:', skuError);
          }
        }
        if (Object.keys(skuDatabase).length === 0) {
          throw new Error('Master SKU tidak tersedia. Upload dibatalkan agar SKU di luar database tidak masuk pencapaian.');
        }

        // Jalankan mesin verifikasi & deduplikasi penuh (mendukung V1, V2, V3 Report Retail, & RETAIL)
        const { updatedData, stats } = processUploadedWorkbook(wb, file.name, uploadBaseline, priceDatabase, skuDatabase);

        // Simpan ke localStorage agar bertahan di sesi browser Admin
        localStorage.setItem(CUSTOM_DATA_KEY, JSON.stringify(updatedData));
        localStorage.setItem(TRANSACTION_LEDGER_KEY, JSON.stringify(updatedData.verified_transaction_keys || []));
        setData(updatedData);
        setLastStats(stats);

        // Jika upload berhasil, pastikan view period dialihkan ke FY atau periode yang relevan
        // agar user langsung melihat angka pencapaian dan tidak mengira data kosong/hilang
        if (period === 'h2' && stats.totalVerifiedAmount > 0) {
          // Bila di H2 masih sedikit/kosong sedangkan data baru bertambah, alihkan ke 'fy'
          const h2Sum = updatedData.partners.reduce((s, p) => s + (p.actual_h2 || 0), 0);
          if (h2Sum === 0) {
            setPeriod('fy');
          }
        }

        let sharedSyncMessage = '';
        try {
          await syncSharedDashboardData(updatedData);
          sharedSyncMessage = ' | Sinkron EPP/EPR: berhasil';
        } catch (sharedSyncError: any) {
          console.warn('Sinkronisasi dashboard bersama gagal:', sharedSyncError);
          sharedSyncMessage = ' | Sinkron EPP/EPR: jalankan shared_dashboard_data.sql';
        }
        const summaryMsg = `Template: ${stats.templateVersion} | Terverifikasi: ${stats.verifiedCount.toLocaleString('id-ID')} baris | Sudah terverifikasi: ${stats.alreadyVerifiedCount.toLocaleString('id-ID')} | Kembar input: ${stats.duplicateInInputCount.toLocaleString('id-ID')} | Luar EPR: ${stats.outsideMasterCount.toLocaleString('id-ID')} | Luar SKU: ${stats.outsideSkuCount.toLocaleString('id-ID')} | Kategori tidak dihitung: ${stats.excludedCategoryCount.toLocaleString('id-ID')}${sharedSyncMessage}`;
        
        setUploadStatus({
          type: 'success',
          message: summaryMsg
        });
      } catch (err: any) {
        console.error('Error parsing Excel:', err);
        setUploadStatus({
          type: 'error',
          message: err.message || 'Terjadi kesalahan saat memproses file Excel.'
        });
      } finally {
        setUploadLoading(false);
      }
    };

    reader.onerror = () => {
      setUploadLoading(false);
      setUploadStatus({ type: 'error', message: 'Gagal membaca file dari disk.' });
    };

    reader.readAsArrayBuffer(file);
  };

  const handleResetToDefaultData = async () => {
    if (!confirm('Apakah Anda yakin ingin mereset data dashboard kembali ke data bawaan sistem?')) return;
    localStorage.removeItem(CUSTOM_DATA_KEY);
    localStorage.removeItem(TRANSACTION_LEDGER_KEY);
    try {
      await clearSharedDashboardData();
      await fetchData();
      setIsUploadModalOpen(false);
      alert('Data dashboard berhasil dikembalikan ke data default.');
    } catch (sharedError: any) {
      console.error('Data lokal berhasil direset, tetapi data bersama belum dapat dihapus:', sharedError);
      setUploadStatus({
        type: 'error',
        message: `${sharedError?.message || 'Data bersama belum dapat dihapus.'} Pastikan SQL shared_dashboard_data.sql terbaru sudah dijalankan dan role Admin memiliki izin DELETE.`,
      });
      await fetchData();
      return;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--indigo)] mb-3" />
        <h2 className="text-base font-bold text-[var(--text)]">Memuat Data EPR Dashboard...</h2>
        <p className="text-xs text-[var(--text-3)] mt-1">Mengambil data pencapaian terverifikasi...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4">
        <div className="p-6 max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-lg text-center">
          <AlertTriangle className="w-12 h-12 text-[var(--rose)] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[var(--text)]">Gagal Memuat Data</h2>
          <p className="text-xs text-[var(--text-3)] mt-2 leading-relaxed">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-[var(--indigo)] hover:opacity-90 text-white text-xs font-semibold rounded-xl"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="app-shell min-h-screen">
      {/* Top Navigation Bar */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand-mark" aria-hidden="true">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="title-row">
              <h1>EPR Achievement Dashboard</h1>
              <span className="badge badge-indigo" id="fyBadge">FY26 · Focus H2</span>
              {isAdmin && <span className="badge badge-emerald">ADMIN</span>}
            </div>
            <p className="subtitle" id="metaSubtitle">
              {isEprUser
                ? `Dashboard ${ownPartner?.name || cleanUsername.toUpperCase()}`
                : 'Monitoring Pencapaian EPR'}
            </p>
          </div>
        </div>

        <div className="topbar-actions">
          {/* Tombol Upload Data Pembelian Khusus Admin */}
          {isAdmin && (
            <button 
              onClick={() => {
                setUploadStatus({ type: 'idle', message: '' });
                setIsUploadModalOpen(true);
              }}
              className="btn btn-secondary border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40" 
              title="Upload file Excel data pembelian EPR terbaru"
            >
              <Upload className="w-4 h-4 text-emerald-500" />
              <span>Upload Data EPR</span>
            </button>
          )}

          {!isEprUser && (
            <>
              <button
                onClick={() => handlePrintReport('overview')}
                className="btn btn-secondary"
                title="Cetak / Share Result ke PDF"
              >
                <Printer className="w-4 h-4" />
                <span>Share PDF</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="btn btn-secondary"
                title="Unduh ringkasan CSV"
              >
                <FileDown className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </>
          )}

          <button 
            onClick={() => setIsPasswordModalOpen(true)}
            className="btn btn-secondary" 
            title="Ganti Password Akun"
          >
            <KeyRound className="w-4 h-4" />
            <span>Ganti Password</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-icon"
            title="Ubah tema manual Light / Dark"
            aria-label="Ubah tema manual Light / Dark"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button 
            onClick={onLogout}
            className="btn btn-secondary text-rose-600 hover:bg-rose-50 hover:text-rose-700" 
            title="Keluar dari Portal"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {(isEppUser || isEprUser) && (
        <aside className="disclaimer-ticker" aria-label="Disclaimer portal">
          <div className="disclaimer-ticker-icon" aria-hidden="true">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="disclaimer-ticker-viewport">
            <div className="disclaimer-ticker-track">
              <span>Disclaimer: Angka dan perhitungan di Portal ini bersifat estimasi awal dan bukan merupakan perhitungan resmi.</span>
              <span aria-hidden="true">Disclaimer: Angka dan perhitungan di Portal ini bersifat estimasi awal dan bukan merupakan perhitungan resmi.</span>
            </div>
          </div>
          <span className="disclaimer-ticker-status" aria-hidden="true" />
        </aside>
      )}

      {/* Power BI Page Navigation */}
      <nav className="pbi-nav" role="tablist" aria-label="Halaman Dashboard">
        <button 
          type="button" 
          onClick={() => setActivePage('overview')}
          className={`pbi-nav-btn ${activePage === 'overview' ? 'active' : ''}`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Overview &amp; Target H2</span>
        </button>

        {data.program_current && (
          <button
            type="button"
            onClick={() => setActivePage('program')}
            className={`pbi-nav-btn ${activePage === 'program' ? 'active' : ''}`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Program Berjalan</span>
          </button>
        )}

        {isAdmin && (
          <button 
            type="button" 
            onClick={() => setActivePage('audit')}
            className={`pbi-nav-btn ${activePage === 'audit' ? 'active' : ''}`}
          >
            <FileText className="w-4 h-4" />
            <span>Kontribusi EPP</span>
          </button>
        )}
      </nav>

      {/* Power BI Workspace: Left Slicers + Right Canvas */}
      <div className="pbi-workspace">
        {/* Left Slicer Sidebar */}
        <aside className="pbi-sidebar" aria-label="Panel Filter Slicer">
          <div className="pbi-slicer-head">
            <h3>Filter / Slicer</h3>
            <button 
              type="button" 
              onClick={handleResetFilters}
              className="btn btn-secondary" 
              style={{ height: '24px', padding: '0 8px', fontSize: '11px' }}
            >
              Reset
            </button>
          </div>

          <div className="pbi-slicer-group">
            <span className="pbi-slicer-label">Periode Fokus</span>
            <div className="segmented" role="group" aria-label="Periode">
              <button 
                onClick={() => setPeriod('q3')}
                className={`seg-btn ${period === 'q3' ? 'active' : ''}`}
              >
                Q3 (Okt–Des)
              </button>
              <button 
                onClick={() => setPeriod('q4')}
                className={`seg-btn ${period === 'q4' ? 'active' : ''}`}
              >
                Q4 (Jan–Mar)
              </button>
              <button 
                onClick={() => setPeriod('h2')}
                className={`seg-btn ${period === 'h2' ? 'active' : ''}`}
              >
                H2 (Okt–Mar)
              </button>
              <button 
                onClick={() => setPeriod('fy')}
                className={`seg-btn ${period === 'fy' ? 'active' : ''}`}
              >
                FY26 Full
              </button>
              <button 
                onClick={() => setPeriod('h1')}
                className={`seg-btn ${period === 'h1' ? 'active' : ''}`}
              >
                H1 (Closed)
              </button>
            </div>
          </div>

          {!isEprUser && (
            <>
              <div className="pbi-slicer-group">
                <span className="pbi-slicer-label">Cari EPR</span>
                <div className="search-box">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nama / Kode / Kota..." 
                  />
                </div>
              </div>

              <div className="pbi-slicer-group">
                <span className="pbi-slicer-label">Tier Category</span>
                <select 
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  aria-label="Filter Tier"
                >
                  <option value="ALL">Semua Tier ({uniqueTiers.length})</option>
                  {uniqueTiers.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="pbi-slicer-group">
                <span className="pbi-slicer-label">Kota</span>
                <select 
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  aria-label="Filter Kota"
                >
                  <option value="ALL">Semua Kota ({uniqueCities.length})</option>
                  {uniqueCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="pbi-slicer-group">
                <span className="pbi-slicer-label">Status Pencapaian</span>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter Status"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="achieved">Achieved (&ge; 100%)</option>
                  <option value="ontrack">On Track (75–99%)</option>
                  <option value="behind">Perlu Perhatian (&lt; 75%)</option>
                </select>
              </div>
            </>
          )}

        </aside>

        {/* Right Canvas */}
        <main className="pbi-canvas">
          {/* ======================================================== */}
          {/* PAGE 1: OVERVIEW & TARGET H2 */}
          {/* ======================================================== */}
          {activePage === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              {!isEppUser && <section className="kpi-grid">
                <article className="kpi-card">
                  <div className="kpi-head">
                    <span className="kpi-label">Total Net Revenue (Excl. PPN)</span>
                    <span className="kpi-icon indigo">Rp</span>
                  </div>
                  <div className="kpi-value mono">{fmtCompact(kpiSummary.totalRevenue)}</div>
                  <div className="kpi-foot">
                    Target {period.toUpperCase()}: <span className="mono">{fmtCompact(kpiSummary.totalTarget)}</span>
                  </div>
                </article>

                <article className="kpi-card">
                  <div className="kpi-head">
                    <span className="kpi-label">Overall Achievement</span>
                    <span className={`kpi-pill ${kpiSummary.achOverall >= 1 ? 'achieved' : kpiSummary.achOverall >= 0.75 ? 'ontrack' : 'behind'}`}>
                      {kpiSummary.achOverall >= 1 ? 'Achieved' : kpiSummary.achOverall >= 0.75 ? 'On Track' : 'Behind'}
                    </span>
                  </div>
                  <div className="kpi-value mono">{fmtPct(kpiSummary.achOverall)}</div>
                  <div className="progress-track">
                    <div 
                      className={`progress-fill ${kpiSummary.achOverall >= 1 ? 'emerald' : 'indigo'}`} 
                      style={{ width: `${Math.min(100, kpiSummary.achOverall * 100)}%` }}
                    />
                  </div>
                  <div className="kpi-foot">
                    Pembelian terhadap Target Bobot {period.toUpperCase()}
                  </div>
                </article>

                {!isEprUser && (
                  <article className="kpi-card">
                    <div className="kpi-head">
                      <span className="kpi-label">Total EPR</span>
                      <span className="kpi-icon emerald">EPR</span>
                    </div>
                    <div className="kpi-value mono">
                      {kpiSummary.achievedCount} / {kpiSummary.totalPartners}
                    </div>
                    <div className="kpi-foot">
                      EPR mencapai Target &ge; 100% pada periode ini
                    </div>
                  </article>
                )}

                <article className="kpi-card">
                  <div className="kpi-head">
                    <span className="kpi-label">Mid High vs Low End</span>
                    <span className="kpi-icon amber">MIX</span>
                  </div>
                  <div className="kpi-value mono">
                    {kpiSummary.midHiShare.toFixed(1)}% <small style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-3)' }}>Mid-Hi</small>
                  </div>
                  <div className="progress-track split">
                    <div 
                      className="progress-fill indigo" 
                      style={{ width: `${kpiSummary.midHiShare}%` }} 
                    />
                  </div>
                  <div className="kpi-foot">
                    Mid-Hi: <span className="mono">{fmtCompact(kpiSummary.totalMidHi)}</span> · Low: <span className="mono">{fmtCompact(kpiSummary.totalLowEnd)}</span>
                  </div>
                </article>
              </section>}

              {isEppUser && (
                <section className="card">
                  <div className="card-head">
                    <div>
                      <h2>Data Upload Epson Hub</h2>
                      <p className="card-sub">Rincian penjualan EPP ke EPR berdasarkan data upload Epson Hub</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadEppExcel}
                        className="btn btn-secondary px-2.5 py-1.5 text-xs"
                        title="Download rincian penjualan EPP ke EPR dalam Excel"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Download Excel</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 mb-3">
                    <label htmlFor="epp-audit-start-month" className="text-xs font-semibold text-[var(--text-2)]">Dari Bulan</label>
                    <select
                      id="epp-audit-start-month"
                      value={selectedEppStartMonthIndex}
                      onChange={(event) => {
                        const next = Number(event.target.value);
                        setSelectedEppStartMonthIndex(next);
                        if (next > selectedEppEndMonthIndex) setSelectedEppEndMonthIndex(next);
                      }}
                      className="text-xs font-semibold bg-[var(--surface)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--text)]"
                    >
                      {eppUploadAudit.rows.map((row: any) => (
                        <option key={`start-${row.monthIndex}`} value={row.monthIndex}>{row.label}</option>
                      ))}
                    </select>
                    <label htmlFor="epp-audit-end-month" className="text-xs font-semibold text-[var(--text-2)]">Sampai Bulan</label>
                    <select
                      id="epp-audit-end-month"
                      value={selectedEppEndMonthIndex}
                      onChange={(event) => {
                        const next = Number(event.target.value);
                        setSelectedEppEndMonthIndex(next);
                        if (next < selectedEppStartMonthIndex) setSelectedEppStartMonthIndex(next);
                      }}
                      className="text-xs font-semibold bg-[var(--surface)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--text)]"
                    >
                      {eppUploadAudit.rows.map((row: any) => (
                        <option key={`end-${row.monthIndex}`} value={row.monthIndex}>{row.label}</option>
                      ))}
                    </select>
                    <span className="text-xs text-[var(--text-3)]">{selectedEppRangeLabel}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="partner-table">
                      <thead>
                        <tr>
                          <th>Bulan</th>
                          <th className="num">Consumer</th>
                          <th className="num">Consumables</th>
                          <th className="num">Scanner</th>
                          <th className="num">Dotmatrix</th>
                          <th className="num">Total Penjualan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEppRangeRows.map((row: any) => (
                          <tr
                            key={row.label}
                            onClick={() => {
                              setSelectedEppMonthLabel(row.label);
                              setSelectedEppMonth(row);
                            }}
                            style={{ cursor: 'pointer' }}
                            title="Klik untuk melihat penjualan ke EPR"
                          >
                            <td className="font-semibold">{row.label}</td>
                            <td className="num mono">{fmtRp(row.Consumer)}</td>
                            <td className="num mono">{fmtRp(row.Consumables)}</td>
                            <td className="num mono">{fmtRp(row.Scanner)}</td>
                            <td className="num mono">{fmtRp(row.Dotmatrix)}</td>
                            <td className="num mono font-bold">{fmtRp(row.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </section>
              )}

              {!isEppUser && (
                <>
                  {/* Q3 & Q4 Target Monitoring Section (Target Original) */}
                  <section className="card q-monitoring-card">
                <div className="card-head">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h2>Target Original per Kuartal (Q3 &amp; Q4 Focus H2)</h2>
                      <span className="badge badge-indigo">Focus H2</span>
                    </div>
                    <p className="card-sub">
                      Monitoring pencapaian Target Original FY26: Q3 (30% · Okt–Des) &amp; Q4 (18% · Jan–Mar)
                    </p>
                  </div>
                  <div className="q-summary-badge mono">
                    Akumulasi Target: {fmtCompact(kpiSummary.q3Target + kpiSummary.q4Target)}
                  </div>
                </div>

                <div className="q-cards-grid">
                  {/* Q3 Card */}
                  <article className="q-quarter-card">
                    <div className="q-quarter-head">
                      <div className="q-quarter-title">
                        <span className="badge badge-indigo">KUARTAL 3</span>
                        <h3>Q3 (Okt – Des 2026)</h3>
                        <span className="q-quarter-weight mono">Bobot 30% dari Target Original FY</span>
                      </div>
                      <div className="q-quarter-ach">
                        <strong className="mono">{fmtPct(kpiSummary.q3Ach)}</strong>
                        <span className={`kpi-pill ${kpiSummary.q3Ach >= 1 ? 'achieved' : kpiSummary.q3Ach >= 0.75 ? 'ontrack' : 'behind'}`}>
                          {kpiSummary.q3Ach >= 1 ? 'Achieved' : kpiSummary.q3Ach >= 0.75 ? 'On Track' : 'Behind'}
                        </span>
                      </div>
                    </div>

                    <div className="q-quarter-metrics">
                      <div className="q-metric-item">
                        <span>Target Q3</span>
                        <strong className="mono">{fmtCompact(kpiSummary.q3Target)}</strong>
                      </div>
                      <div className="q-metric-item">
                        <span>Total Pembelian</span>
                        <strong className="mono">{fmtCompact(kpiSummary.q3Actual)}</strong>
                      </div>
                      <div className="q-metric-item">
                        <span>Sisa / Gap</span>
                        <strong className="mono text-rose-600">{fmtCompact(kpiSummary.q3Gap)}</strong>
                      </div>
                    </div>

                    <div className="progress-track" style={{ margin: '12px 0 16px' }}>
                      <div 
                        className={`progress-fill ${kpiSummary.q3Ach >= 1 ? 'emerald' : 'indigo'}`} 
                        style={{ width: `${Math.min(100, kpiSummary.q3Ach * 100)}%` }}
                      />
                    </div>

                    {/* Monthly Sub cards for Q3 */}
                    <div className="q-months-grid">
                      <div className="q-month-card">
                        <span className="q-month-name">Okt 2026</span>
                        <span className="q-month-ach mono">
                          {fmtCompact(kpiSummary.monthlyMetrics[0].actual)}
                        </span>
                        <span className="q-month-label">Pembelian</span>
                        <span className="q-month-target mono">Achievement {fmtPct(kpiSummary.monthlyMetrics[0].achievement)}</span>
                        <span className="q-month-target mono text-rose-600">Kurang {fmtCompact(kpiSummary.monthlyMetrics[0].gap)}</span>
                      </div>
                      <div className="q-month-card">
                        <span className="q-month-name">Nov 2026</span>
                        <span className="q-month-ach mono">
                          {fmtCompact(kpiSummary.monthlyMetrics[1].actual)}
                        </span>
                        <span className="q-month-label">Pembelian</span>
                        <span className="q-month-target mono">Achievement {fmtPct(kpiSummary.monthlyMetrics[1].achievement)}</span>
                        <span className="q-month-target mono text-rose-600">Kurang {fmtCompact(kpiSummary.monthlyMetrics[1].gap)}</span>
                      </div>
                      <div className="q-month-card">
                        <span className="q-month-name">Des 2026</span>
                        <span className="q-month-ach mono">
                          {fmtCompact(kpiSummary.monthlyMetrics[2].actual)}
                        </span>
                        <span className="q-month-label">Pembelian</span>
                        <span className="q-month-target mono">Achievement {fmtPct(kpiSummary.monthlyMetrics[2].achievement)}</span>
                        <span className="q-month-target mono text-rose-600">Kurang {fmtCompact(kpiSummary.monthlyMetrics[2].gap)}</span>
                      </div>
                    </div>
                  </article>

                  {/* Q4 Card */}
                  <article className="q-quarter-card">
                    <div className="q-quarter-head">
                      <div className="q-quarter-title">
                        <span className="badge badge-indigo">KUARTAL 4</span>
                        <h3>Q4 (Jan – Mar 2027)</h3>
                        <span className="q-quarter-weight mono">Bobot 18% dari Target Original FY</span>
                      </div>
                      <div className="q-quarter-ach">
                        <strong className="mono">{fmtPct(kpiSummary.q4Ach)}</strong>
                        <span className={`kpi-pill ${kpiSummary.q4Ach >= 1 ? 'achieved' : kpiSummary.q4Ach >= 0.75 ? 'ontrack' : 'behind'}`}>
                          {kpiSummary.q4Ach >= 1 ? 'Achieved' : kpiSummary.q4Ach >= 0.75 ? 'On Track' : 'Behind'}
                        </span>
                      </div>
                    </div>

                    <div className="q-quarter-metrics">
                      <div className="q-metric-item">
                        <span>Target Q4</span>
                        <strong className="mono">{fmtCompact(kpiSummary.q4Target)}</strong>
                      </div>
                      <div className="q-metric-item">
                        <span>Total Pembelian</span>
                        <strong className="mono">{fmtCompact(kpiSummary.q4Actual)}</strong>
                      </div>
                      <div className="q-metric-item">
                        <span>Sisa / Gap</span>
                        <strong className="mono text-rose-600">{fmtCompact(kpiSummary.q4Gap)}</strong>
                      </div>
                    </div>

                    <div className="progress-track" style={{ margin: '12px 0 16px' }}>
                      <div 
                        className={`progress-fill ${kpiSummary.q4Ach >= 1 ? 'emerald' : 'indigo'}`} 
                        style={{ width: `${Math.min(100, kpiSummary.q4Ach * 100)}%` }}
                      />
                    </div>

                    {/* Monthly Sub cards for Q4 */}
                    <div className="q-months-grid">
                      <div className="q-month-card">
                        <span className="q-month-name">Jan 2027</span>
                        <span className="q-month-ach mono">
                          {fmtCompact(kpiSummary.monthlyMetrics[3].actual)}
                        </span>
                        <span className="q-month-label">Pembelian</span>
                        <span className="q-month-target mono">Achievement {fmtPct(kpiSummary.monthlyMetrics[3].achievement)}</span>
                        <span className="q-month-target mono text-rose-600">Kurang {fmtCompact(kpiSummary.monthlyMetrics[3].gap)}</span>
                      </div>
                      <div className="q-month-card">
                        <span className="q-month-name">Feb 2027</span>
                        <span className="q-month-ach mono">
                          {fmtCompact(kpiSummary.monthlyMetrics[4].actual)}
                        </span>
                        <span className="q-month-label">Pembelian</span>
                        <span className="q-month-target mono">Achievement {fmtPct(kpiSummary.monthlyMetrics[4].achievement)}</span>
                        <span className="q-month-target mono text-rose-600">Kurang {fmtCompact(kpiSummary.monthlyMetrics[4].gap)}</span>
                      </div>
                      <div className="q-month-card">
                        <span className="q-month-name">Mar 2027</span>
                        <span className="q-month-ach mono">
                          {fmtCompact(kpiSummary.monthlyMetrics[5].actual)}
                        </span>
                        <span className="q-month-label">Pembelian</span>
                        <span className="q-month-target mono">Achievement {fmtPct(kpiSummary.monthlyMetrics[5].achievement)}</span>
                        <span className="q-month-target mono text-rose-600">Kurang {fmtCompact(kpiSummary.monthlyMetrics[5].gap)}</span>
                      </div>
                    </div>
                  </article>
                </div>
                  </section>
                </>
              )}

              {!isEppUser && (
                <>
                  {/* Product Category Breakdown Cards */}
                  <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="card p-4">
                  <span className="text-2xs uppercase font-bold text-slate-400 block mb-1">Consumer</span>
                  <strong className="text-base font-extrabold mono block text-indigo-600">
                    {fmtCompact(kpiSummary.catConsumer)}
                  </strong>
                  <div className="progress-track mt-2">
                    <div className="progress-fill indigo" style={{ width: `${(kpiSummary.catConsumer / kpiSummary.totalCat) * 100}%` }} />
                  </div>
                  <span className="text-2xs text-slate-400 mt-1 block">
                    {((kpiSummary.catConsumer / kpiSummary.totalCat) * 100).toFixed(1)}% dari Total
                  </span>
                </div>

                <div className="card p-4">
                  <span className="text-2xs uppercase font-bold text-slate-400 block mb-1">Consumables</span>
                  <strong className="text-base font-extrabold mono block text-emerald-600">
                    {fmtCompact(kpiSummary.catConsumables)}
                  </strong>
                  <div className="progress-track mt-2">
                    <div className="progress-fill emerald" style={{ width: `${(kpiSummary.catConsumables / kpiSummary.totalCat) * 100}%` }} />
                  </div>
                  <span className="text-2xs text-slate-400 mt-1 block">
                    {((kpiSummary.catConsumables / kpiSummary.totalCat) * 100).toFixed(1)}% dari Total
                  </span>
                </div>

                <div className="card p-4">
                  <span className="text-2xs uppercase font-bold text-slate-400 block mb-1">Scanner</span>
                  <strong className="text-base font-extrabold mono block text-sky-600">
                    {fmtCompact(kpiSummary.catScanner)}
                  </strong>
                  <div className="progress-track mt-2">
                    <div className="progress-fill" style={{ background: 'var(--sky)', width: `${(kpiSummary.catScanner / kpiSummary.totalCat) * 100}%` }} />
                  </div>
                  <span className="text-2xs text-slate-400 mt-1 block">
                    {((kpiSummary.catScanner / kpiSummary.totalCat) * 100).toFixed(1)}% dari Total
                  </span>
                </div>

                <div className="card p-4">
                  <span className="text-2xs uppercase font-bold text-slate-400 block mb-1">Dotmatrix</span>
                  <strong className="text-base font-extrabold mono block text-amber-600">
                    {fmtCompact(kpiSummary.catDotmatrix)}
                  </strong>
                  <div className="progress-track mt-2">
                    <div className="progress-fill amber" style={{ width: `${(kpiSummary.catDotmatrix / kpiSummary.totalCat) * 100}%` }} />
                  </div>
                  <span className="text-2xs text-slate-400 mt-1 block">
                    {((kpiSummary.catDotmatrix / kpiSummary.totalCat) * 100).toFixed(1)}% dari Total
                  </span>
                </div>
                  </section>
                </>
              )}

              {/* Interactive Partner Table */}
              <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="card-head" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <h2 style={{ fontSize: '15px' }}>Rincian Pencapaian</h2>
                  </div>

                  {/* Switcher: Kategori vs Q3/Q4 Breakdown */}
                  <div className="segmented">
                    <button 
                      onClick={() => setTableView('category')}
                      className={`seg-btn ${tableView === 'category' ? 'active' : ''}`}
                    >
                      Kategori Produk
                    </button>
                    <button 
                      onClick={() => setTableView('quarter')}
                      className={`seg-btn ${tableView === 'quarter' ? 'active' : ''}`}
                    >
                      Breakdown Q3 &amp; Q4
                    </button>
                  </div>
                </div>

                <div className="rincian-scroll max-h-[60vh] overflow-auto">
                  <table className="partner-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Kode EPR</th>
                        <th>Nama EPR</th>
                        <th>Kota</th>
                        <th>Tier</th>
                        <th className="num">Target ({period.toUpperCase()})</th>
                        <th className="num">Total Pembelian</th>
                        <th>% Capaian</th>
                        {tableView === 'category' ? (
                          <>
                            <th className="num">Consumer</th>
                            <th className="num">Consumables</th>
                            <th className="num">Scanner</th>
                            <th className="num">Dotmatrix</th>
                          </>
                        ) : (
                          <>
                            <th className="num">Q3 Target</th>
                            <th className="num">Q3 Actual</th>
                            <th className="num">Q4 Target</th>
                            <th className="num">Q4 Actual</th>
                          </>
                        )}
                        <th className="num">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPartners.map((p, idx) => {
                        const { target, actual, ach } = getPartnerPeriodMetrics(p);
                        return (
                          <tr 
                            key={p.code} 
                            onClick={() => setSelectedPartner(p)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td className="mono text-slate-400 text-xs">{idx + 1}</td>
                            <td>
                              <span className="badge badge-indigo mono">{p.code}</span>
                            </td>
                            <td>
                              <span className="partner-name font-bold text-slate-900">{p.name}</span>
                            </td>
                            <td className="text-xs text-slate-500">{eprCityMap[p.code] || p.city}</td>
                            <td>
                              <span className={`badge tier-${p.tier.toLowerCase()}`}>{p.tier}</span>
                            </td>
                            <td className="num mono font-medium">{fmtCompact(target)}</td>
                            <td className="num mono font-bold text-slate-900">{fmtCompact(actual)}</td>
                            <td style={{ minWidth: '130px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className={`mono font-bold text-xs ${ach >= 1 ? 'text-emerald-600' : ach >= 0.75 ? 'text-indigo-600' : 'text-rose-600'}`}>
                                  {fmtPct(ach)}
                                </span>
                                <div className="progress-track" style={{ flex: 1, height: '6px' }}>
                                  <div 
                                    className={`progress-fill ${ach >= 1 ? 'emerald' : ach >= 0.75 ? 'indigo' : 'rose'}`} 
                                    style={{ width: `${Math.min(100, ach * 100)}%` }} 
                                  />
                                </div>
                              </div>
                            </td>

                            {tableView === 'category' ? (
                              <>
                                <td className="num mono text-xs">{fmtCompact(p.cat_totals?.Consumer || 0)}</td>
                                <td className="num mono text-xs">{fmtCompact(p.cat_totals?.Consumables || 0)}</td>
                                <td className="num mono text-xs">{fmtCompact(p.cat_totals?.Scanner || 0)}</td>
                                <td className="num mono text-xs">{fmtCompact(p.cat_totals?.Dotmatrix || 0)}</td>
                              </>
                            ) : (
                              <>
                                <td className="num mono text-xs text-slate-500">{fmtCompact(p.target_original_q3 || 0)}</td>
                                <td className="num mono text-xs font-semibold">{fmtCompact(p.actual_q3 || 0)}</td>
                                <td className="num mono text-xs text-slate-500">{fmtCompact(p.target_original_q4 || 0)}</td>
                                <td className="num mono text-xs font-semibold">{fmtCompact(p.actual_q4 || 0)}</td>
                              </>
                            )}

                            <td className="num">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPartner(p);
                                }}
                                className="btn btn-secondary"
                                style={{ height: '26px', padding: '0 8px', fontSize: '11px' }}
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 2: PROGRAM BERJALAN */}
          {/* ======================================================== */}
          {activePage === 'program' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-head">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-emerald">PROGRAM AKTIF</span>
                      <h2>{data.program_current?.program_name || 'Program Berjalan'}</h2>
                    </div>
                    <p className="card-sub">
                      Periode: {data.program_current?.start} s/d {data.program_current?.end} · Peserta: {data.program_current?.participants.length || 0} EPR
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Pencapaian dihitung dari transaksi pembelian yang sudah lolos verifikasi dan berada di dalam periode program.
                </p>
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="card-head" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <h3 style={{ fontSize: '15px' }}>Pencapaian per EPR</h3>
                    <p className="card-sub">Target paket mengikuti ketentuan program; Pembelian yang di hitung dari MD Lokal: Compumart, Top Distribusi, Raka Perkasa, dan Computa. - Pembelian MD L3251 harus dari PIN</p>
                  </div>
                </div>
                {programAchievementRows.length === 0 ? (
                  <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>📊</div>
                    <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Belum ada pembelian program
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto' }}>
                      Upload data pembelian V1/V2 yang berisi nama program pada kolom AD/AL untuk menghitung pencapaian.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="partner-table">
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>EPR</th>
                          <th>Paket</th>
                          <th className="num">Target per Kategori</th>
                          <th className="num">Okt</th>
                          <th className="num">Nov</th>
                          <th className="num">Des</th>
                          <th className="num">Pembelian per Kategori</th>
                          <th className="num">Kurang per Kategori</th>
                          <th className="num">Pencapaian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {programAchievementRows.map((row: any, index: number) => {
                          const details = row.scheme === 'unit_ink'
                            ? [
                                { label: 'Low End', actual: row.actualLowEndQty, target: row.lowEndTargetQty },
                                { label: 'Mid High', actual: row.actualMidHighQty, target: row.midHighTargetQty },
                                { label: 'Ink Bottle', actual: row.actualInkBottleQty, target: row.inkBottleTargetQty },
                              ]
                            : [
                                { label: '664/003', actual: row.actualInk664003Qty, target: row.ink664003TargetQty },
                                { label: 'Lainnya', actual: row.actualConsumablesOtherQty, target: row.consumablesOtherTargetQty },
                              ];
                          return (
                            <tr key={row.code}>
                              <td className="mono text-slate-400 text-xs">{index + 1}</td>
                              <td>
                                <div className="font-bold text-slate-900">{row.name}</div>
                                <div className="text-2xs text-slate-500 mono">{row.code} · {eprCityMap[row.code] || row.city || '-'}</div>
                              </td>
                              <td>
                                <span className="badge badge-sky">{row.pack_name || '-'}</span>
                                <div className="text-2xs text-slate-500 mt-1">
                                  {row.scheme === 'unit_ink' ? 'Unit + Ink Bottle' : '664/003 + Consumables Lainnya'}
                                </div>
                              </td>
                              <td className="num mono" style={{ minWidth: '145px' }}>
                                <div className="font-bold">Total {row.targetQty.toLocaleString('id-ID')}</div>
                                {details.map((detail) => (
                                  <div key={detail.label} className="text-2xs text-slate-500">{detail.label}: {detail.target.toLocaleString('id-ID')}</div>
                                ))}
                              </td>
                              <td className="num mono">{row.octQty.toLocaleString('id-ID')}</td>
                              <td className="num mono">{row.novQty.toLocaleString('id-ID')}</td>
                              <td className="num mono">{row.decQty.toLocaleString('id-ID')}</td>
                              <td className="num mono" style={{ minWidth: '145px' }}>
                                <div className="font-bold">Total {row.actualQty.toLocaleString('id-ID')}</div>
                                {details.map((detail) => (
                                  <div key={detail.label} className="text-2xs text-slate-500">{detail.label}: {detail.actual.toLocaleString('id-ID')}</div>
                                ))}
                                {row.actualUnclassifiedUnitQty > 0 && <div className="text-2xs text-amber-600">Belum terklasifikasi: {row.actualUnclassifiedUnitQty.toLocaleString('id-ID')}</div>}
                              </td>
                              <td className="num mono text-rose-600" style={{ minWidth: '145px' }}>
                                <div className="font-bold">Total {row.gap.toLocaleString('id-ID')}</div>
                                {details.map((detail) => (
                                  <div key={detail.label} className="text-2xs">{detail.label}: {Math.max(0, detail.target - detail.actual).toLocaleString('id-ID')}</div>
                                ))}
                              </td>
                              <td className="num">
                                <span className={`badge ${row.achievement >= 1 ? 'badge-emerald' : 'badge-amber'}`}>
                                  {fmtPct(row.achievement)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Legacy Booster Up layout kept unreachable for data compatibility. */}
          {false && activePage === 'program' && (
            <div className="space-y-6">
              {/* Program Header */}
              <div className="card">
                <div className="card-head">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-emerald">PROGRAM AKTIF</span>
                      <h2>Q3 Booster Up FY26</h2>
                    </div>
                    <p className="card-sub">
                      Periode Program: 1 Oktober – 31 Desember 2026 · Sumber Pembelian: 4 EPP Lokal
                    </p>
                  </div>
                </div>

                <div className="prog-scheme-grid">
                  <div className="prog-scheme-card">
                    <h4>Paket Consumer (Unit + Tinta) <span className="badge badge-indigo">75 EPR Peserta</span></h4>
                    <table className="prog-scheme-table">
                      <thead>
                        <tr><th>Tier</th><th className="num">Low End</th><th className="num">Mid-Hi</th><th className="num">Ink Bottle</th><th className="num">Reward</th></tr>
                      </thead>
                      <tbody>
                        <tr><td><strong>SUN</strong></td><td className="num mono">500</td><td className="num mono">40</td><td className="num mono">4.200</td><td className="num mono font-bold text-emerald-600">Rp 20 Jt</td></tr>
                        <tr><td><strong>STAR</strong></td><td className="num mono">250</td><td className="num mono">25</td><td className="num mono">2.000</td><td className="num mono font-bold text-emerald-600">Rp 10 Jt</td></tr>
                        <tr><td><strong>MOON</strong></td><td className="num mono">120</td><td className="num mono">10</td><td className="num mono">450</td><td className="num mono font-bold text-emerald-600">Rp 3,9 Jt</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="prog-scheme-card">
                    <h4>Paket Consumables (Tinta Botol) <span className="badge badge-emerald">7 EPR Peserta</span></h4>
                    <table className="prog-scheme-table">
                      <thead>
                        <tr><th>Tier</th><th className="num">664 / 003</th><th className="num">Lainnya</th><th className="num">Reward</th></tr>
                      </thead>
                      <tbody>
                        <tr><td><strong>SUN</strong></td><td className="num mono">18.200</td><td className="num mono">300</td><td className="num mono font-bold text-emerald-600">Rp 20 Jt</td></tr>
                        <tr><td><strong>STAR</strong></td><td className="num mono">9.000</td><td className="num mono">200</td><td className="num mono font-bold text-emerald-600">Rp 10 Jt</td></tr>
                        <tr><td><strong>MOON</strong></td><td className="num mono">4.000</td><td className="num mono">100</td><td className="num mono font-bold text-emerald-600">Rp 3,9 Jt</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {uploadedProgramSummaries.length > 0 && (
                <div className="card">
                  <div className="card-head">
                    <div>
                      <h3 style={{ fontSize: '15px' }}>Program Berjalan dari Data Upload</h3>
                      <p className="card-sub">Pembelian terverifikasi; master periode, peserta, dan ketentuan tetap read-only.</p>
                    </div>
                  </div>
                  <div className="q-cards-grid">
                    {uploadedProgramSummaries.map((summary: any) => (
                      <div className="q-quarter-card" key={summary.name}>
                        <div className="q-quarter-head">
                          <div className="q-quarter-title">
                            <span className="badge badge-emerald">PROGRAM AKTIF</span>
                            <h3>{summary.name}</h3>
                            <span className="q-quarter-weight">Periode: {summary.period}</span>
                          </div>
                          <div className="q-quarter-ach">
                            <strong>{summary.activeParticipantCount.toLocaleString('id-ID')}</strong>
                            <span className="q-quarter-weight">peserta aktif</span>
                          </div>
                        </div>
                        <div className="q-quarter-metrics">
                          <div className="q-metric-item"><span>Peserta master</span><strong>{summary.eligibleParticipants ? summary.eligibleParticipants.toLocaleString('id-ID') : '-'}</strong></div>
                          <div className="q-metric-item"><span>Transaksi</span><strong>{summary.transactions.toLocaleString('id-ID')}</strong></div>
                          <div className="q-metric-item"><span>Qty</span><strong>{summary.totalQty.toLocaleString('id-ID')}</strong></div>
                          <div className="q-metric-item"><span>Nilai</span><strong>{fmtRp(summary.totalValue)}</strong></div>
                        </div>
                        <div className="text-2xs text-slate-500 mt-3">
                          <strong className="text-slate-700">Ketentuan:</strong>
                          <ul className="list-disc pl-4 mt-1 space-y-0.5">
                            {summary.requirements.map((requirement: string) => <li key={requirement}>{requirement}</li>)}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Participants Table */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="card-head" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <h3 style={{ fontSize: '15px' }}>Daftar EPR Peserta Paket Booster</h3>
                    <p className="card-sub">Monitoring pencapaian unit &amp; botol tinta terverifikasi</p>
                  </div>
                </div>

                {(() => {
                  // For EPR users: only show their own store if they're in the booster program
                  const progList = isEprUser
                    ? (data.program_partners || []).filter(p =>
                        userEprCode
                          ? p.code === userEprCode
                          : p.code === ownPartner?.code
                      )
                    : (data.program_partners || []);

                  // Jika master peserta Booster Up kosong, tampilkan program
                  // berjalan yang berasal langsung dari upload V1/V2.
                  if (progList.length === 0 && uploadedProgramRows.length > 0) {
                    return (
                      <div className="overflow-x-auto">
                        <table className="partner-table">
                          <thead>
                            <tr>
                              <th>No</th>
                              <th>EPR</th>
                              <th>Program Berjalan</th>
                              <th className="num">Transaksi</th>
                              <th className="num">Qty</th>
                              <th className="num">Nilai</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {uploadedProgramRows.map((row, idx) => (
                              <tr key={`${row.code}-${row.program}`}>
                                <td className="mono text-slate-400 text-xs">{idx + 1}</td>
                                <td>
                                  <div className="font-bold text-slate-900">{row.name}</div>
                                  <div className="text-2xs text-slate-500 mono">{row.code} · {eprCityMap[row.code] || row.city || '-'} · AE: {row.am || '-'}</div>
                                </td>
                                <td><span className="badge badge-sky">{row.program}</span></td>
                                <td className="num mono">{row.tx.toLocaleString('id-ID')}</td>
                                <td className="num mono">{row.qty.toLocaleString('id-ID')}</td>
                                <td className="num mono">{fmtRp(row.total)}</td>
                                <td><span className="badge badge-amber">Berjalan</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }

                  if (isEprUser && progList.length === 0) {
                    return (
                      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
                        <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                          EPR Anda Tidak Terdaftar sebagai Peserta Paket Booster Up Q3 FY26
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
                          Hubungi AM Anda untuk informasi program berikutnya.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto">
                      <table className="partner-table">
                        <thead>
                          <tr>
                            <th>No</th>
                            <th>EPR</th>
                            <th>Paket &amp; Target</th>
                            <th className="num">Okt 2026</th>
                            <th className="num">Nov 2026</th>
                            <th className="num">Des 2026</th>
                            <th className="num">Sudah Beli</th>
                            <th className="num">Kurang (Gap)</th>
                            <th>Status &amp; Reward</th>
                          </tr>
                        </thead>
                        <tbody>
                          {progList.map((prog: any, idx) => {
                            const sm = prog.summary || {};
                            const lines = sm.lines || [];
                            const monthly = prog.monthly || {};
                            const mOct = monthly['2026-10']?.qty || 0;
                            const mNov = monthly['2026-11']?.qty || 0;
                            const mDes = monthly['2026-12']?.qty || 0;
                            const isAch = sm.achieved;
                            const unitLbl = prog.scheme === 'consumables' ? 'pcs' : 'unit/pcs';

                            return (
                              <tr key={prog.code || idx}>
                                <td className="mono text-slate-400 text-xs">{idx + 1}</td>
                                <td>
                                  <div>
                                    <div className="font-bold text-slate-900">{prog.name}</div>
                                    <div className="text-2xs text-slate-500 mono">
                                      {prog.code} · {prog.city || '-'} · AE: {prog.am}
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div>
                                    <span className="badge badge-sky text-2xs mb-1 inline-block">
                                      {prog.pack_name || prog.package_type}
                                    </span>
                                    <div className="text-2xs text-slate-500 font-mono">
                                      Target: <strong className="text-slate-800">{sm.total_target?.toLocaleString('id-ID') || '-'}</strong> {unitLbl}
                                    </div>
                                  </div>
                                </td>

                                {/* Bulan 1: Oktober 2026 */}
                                <td className="num mono">
                                  <span className={`font-semibold ${mOct > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    {mOct > 0 ? `${mOct.toLocaleString('id-ID')}` : '-'}
                                  </span>
                                </td>

                                {/* Bulan 2: November 2026 */}
                                <td className="num mono">
                                  <span className={`font-semibold ${mNov > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    {mNov > 0 ? `${mNov.toLocaleString('id-ID')}` : '-'}
                                  </span>
                                </td>

                                {/* Bulan 3: Desember 2026 */}
                                <td className="num mono">
                                  <span className={`font-semibold ${mDes > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    {mDes > 0 ? `${mDes.toLocaleString('id-ID')}` : '-'}
                                  </span>
                                </td>

                                {/* Total Sudah Beli */}
                                <td className="num mono">
                                  <div>
                                    <strong className="text-slate-900 text-sm">
                                      {(sm.total_actual || 0).toLocaleString('id-ID')}
                                    </strong>
                                    <span className="text-2xs text-slate-400 block">{unitLbl}</span>
                                    {lines.length > 0 && (
                                      <div className="text-2xs text-slate-500 mt-0.5 space-y-0.5 text-right">
                                        {lines.map((l: any) => (
                                          <div key={l.key} className="whitespace-nowrap">
                                            <span>{l.label}: </span>
                                            <b className="text-slate-700">{l.actual.toLocaleString('id-ID')}</b>
                                            <span className="text-slate-400">/{l.target.toLocaleString('id-ID')}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* Kurang Berapa (Gap) */}
                                <td className="num mono">
                                  {isAch ? (
                                    <span className="text-emerald-600 font-bold text-xs">
                                      ✓ Terpenuhi
                                    </span>
                                  ) : (
                                    <div>
                                      <strong className="text-rose-600 text-sm">
                                        Kurang {(sm.total_gap || 0).toLocaleString('id-ID')}
                                      </strong>
                                      <span className="text-2xs text-slate-400 block">{unitLbl}</span>
                                      {lines.length > 0 && (
                                        <div className="text-2xs mt-0.5 space-y-0.5 text-right">
                                          {lines.map((l: any) => (
                                            <div key={l.key} className="whitespace-nowrap">
                                              <span>{l.label}: </span>
                                              {l.gap === 0 ? (
                                                <span className="text-emerald-600 font-bold">✓ Ok</span>
                                              ) : (
                                                <span className="text-rose-500 font-medium">-{l.gap.toLocaleString('id-ID')}</span>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </td>

                                {/* Status & Reward */}
                                <td>
                                  <div>
                                    {isAch ? (
                                      <span className="badge badge-emerald">Achieved</span>
                                    ) : (
                                      <span className="badge badge-amber">Berjalan</span>
                                    )}
                                    <div className="text-xs font-bold text-emerald-600 mono mt-1">
                                      {fmtRp(prog.reward || 3900000)}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 3: KONTRIBUSI EPP (KHUSUS ADMIN) */}
          {/* ======================================================== */}
          {activePage === 'audit' && isAdmin && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-head">
                  <div>
                    <h2>Kontribusi EPP</h2>
                    <p className="card-sub">Rekapitulasi distribusi supply EPP ke seluruh EPR FY26</p>
                  </div>
                </div>

                <div className="overflow-x-auto mt-4">
                  <table className="partner-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Kode EPP</th>
                        <th>Nama EPP</th>
                        <th>Kota</th>
                        <th className="num">Total Transaksi</th>
                        <th className="num">EPR</th>
                        <th>Kategori Produk</th>
                        <th className="num">Total Penjualan ke EPR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const list = eppContributionRows;
                        if (list.length === 0) {
                          return (
                            <tr>
                              <td colSpan={8} className="text-center text-slate-400 py-8">
                                Belum ada data kontribusi EPP.
                              </td>
                            </tr>
                          );
                        }
                        // Admin: tampilkan semua lengkap
                        if (isAdmin) {
                          return list.map((epp, idx) => (
                            <tr key={epp.code || idx}>
                              <td className="mono text-slate-400 text-xs">{idx + 1}</td>
                              <td>
                                <button
                                  type="button"
                                  className="badge badge-emerald mono"
                                  onClick={() => setSelectedEppContribution(epp)}
                                  title="Lihat daftar EPR pembeli"
                                  style={{ cursor: 'pointer', border: 0 }}
                                >
                                  {epp.code}
                                </button>
                              </td>
                              <td className="font-bold text-slate-900">{epp.name}</td>
                              <td className="text-xs text-slate-500">{eppCityMap[String(epp.code || '').trim().toUpperCase()] || epp.city}</td>
                              <td className="num mono">{epp.tx_count ?? epp.tx ?? '-'}</td>
                              <td className="num mono font-bold text-indigo-600">{epp.partner_count ?? '-'}</td>
                              <td>
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(epp.cats || {})
                                    .filter(([, amount]) => Number(amount || 0) > 0)
                                    .map(([category, amount]) => (
                                      <span key={category} className="badge badge-sky" style={{ fontSize: '10px' }}>
                                        {category}: {fmtRp(Number(amount))}
                                      </span>
                                    ))}
                                </div>
                              </td>
                              <td className="num mono font-bold text-slate-900">{fmtRp(epp.total)}</td>
                            </tr>
                          ));
                        }

                        // EPP user: match baris milik sendiri (by username in email)
                        // username EPP: computa → EPP-0050, topdistribusi → EPP-0055,
                        //               compumart → EPP-0056 (PT COMPUTEK), rakaperkasa → EPP-0245
                        const eppAliasMap: Record<string, string> = {
                          computa:        'EPP-0050',
                          topdistribusi:  'EPP-0055',
                          compumart:      'EPP-0056',
                          rakaperkasa:    'EPP-0245',
                        };
                        const myEppCode = eppAliasMap[cleanUsername] || '';
                        let ownIdx = 1;
                        let anonCounter = 1;

                        return list.map((epp, idx) => {
                          const isOwn = myEppCode && epp.code === myEppCode;
                          if (isOwn) {
                            return (
                              <tr key={epp.code} style={{ background: 'var(--accent-soft, #eff6ff)' }}>
                                <td className="mono text-slate-400 text-xs">{idx + 1}</td>
                                <td><span className="badge badge-emerald mono">{epp.code}</span></td>
                                <td className="font-bold text-slate-900">
                                  {epp.name}
                                  <span className="badge badge-amber ml-2" style={{ fontSize: '10px' }}>Akun Anda</span>
                                </td>
                                <td className="text-xs text-slate-500">{eppCityMap[String(epp.code || '').trim().toUpperCase()] || epp.city}</td>
                                <td className="num mono">{epp.tx_count ?? epp.tx ?? '-'}</td>
                                <td className="num mono font-bold text-indigo-600">{epp.partner_count ?? '-'}</td>
                                <td>—</td>
                                <td className="num mono font-bold text-slate-900">{fmtRp(epp.total)}</td>
                              </tr>
                            );
                          } else {
                            // Anonymize kompetitor EPP
                            const anonN = anonCounter++;
                            return (
                              <tr key={epp.code || idx} style={{ opacity: 0.55 }}>
                                <td className="mono text-slate-400 text-xs">{idx + 1}</td>
                                <td><span className="badge badge-indigo mono" style={{ letterSpacing: 0 }}>EPP-****</span></td>
                                <td className="text-slate-400 italic text-sm">— EPP Lain #{anonN} —</td>
                                <td className="text-xs text-slate-400">—</td>
                                <td className="num mono text-slate-400">***</td>
                                <td className="num mono text-slate-400">***</td>
                                <td className="text-slate-400">—</td>
                                <td className="num mono text-slate-400">***</td>
                              </tr>
                            );
                          }
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>

      {/* Modal Daftar EPR Pembeli dari EPP */}
      {selectedEppContribution && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setSelectedEppContribution(null)}
        >
          <div
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-4 px-5 border-b border-[var(--border)] flex items-start justify-between gap-4">
              <div>
                <span className="badge badge-emerald mono">{selectedEppContribution.code}</span>
                <h3 className="text-base font-bold text-[var(--text)] mt-2">{selectedEppContribution.name}</h3>
                <p className="text-xs text-[var(--text-3)] mt-1">
                  {eppCityMap[String(selectedEppContribution.code || '').trim().toUpperCase()] || selectedEppContribution.city || '-'} · {selectedEppContribution.partner_details?.length || 0} EPR membeli dari EPP ini
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEppContribution(null)}
                className="btn btn-icon"
                title="Tutup daftar EPR"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 px-5 max-h-[60vh] overflow-y-auto">
              {selectedEppContribution.partner_details?.length ? (
                <table className="partner-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Kode EPR</th>
                      <th>Nama EPR</th>
                      <th>Kota</th>
                      <th className="num">Pembelian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...selectedEppContribution.partner_details]
                      .sort((a: any, b: any) => b.total - a.total)
                      .map((partner: any, index: number) => (
                        <tr key={partner.code}>
                          <td className="mono text-xs text-slate-400">{index + 1}</td>
                          <td><span className="badge badge-indigo mono">{partner.code}</span></td>
                          <td className="font-bold text-slate-900">{partner.name}</td>
                          <td className="text-xs text-slate-500">{eprCityMap[partner.code] || partner.city || '-'}</td>
                          <td className="num mono font-bold">{fmtRp(partner.total)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">Belum ada rincian EPR untuk EPP ini.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Penjualan EPP ke EPR per Bulan */}
      {isEppUser && selectedEppMonth && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setSelectedEppMonth(null)}
        >
          <div
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-4 px-5 border-b border-[var(--border)] flex items-start justify-between gap-4">
              <div>
                <span className="badge badge-emerald">{selectedEppMonth.label}</span>
                <h3 className="text-base font-bold text-[var(--text)] mt-2">
                  Penjualan {eppContributionRows.find((row: any) => row.code === ownEppCode)?.name || cleanUsername.toUpperCase()} ke EPR
                </h3>
                <p className="text-xs text-[var(--text-3)] mt-1">Daftar EPR, Qty, dan kategori produk pada bulan terpilih</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEppMonth(null)}
                className="btn btn-icon"
                title="Tutup rincian penjualan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 px-5 max-h-[65vh] overflow-y-auto">
              {selectedEppMonth.eprDetails?.length ? (
                <table className="partner-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Kode EPR</th>
                      <th>Nama EPR</th>
                      <th>Kategori Produk</th>
                      <th className="num">Qty</th>
                      <th className="num">Total Penjualan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEppMonth.eprDetails.map((detail: any, index: number) => (
                      <tr key={detail.code}>
                        <td className="mono text-xs text-slate-400">{index + 1}</td>
                        <td>
                          <button
                            type="button"
                            className="badge badge-indigo mono"
                            onClick={() => setSelectedEppEpr({ ...detail, month: selectedEppMonth.label })}
                            style={{ cursor: 'pointer', border: 0 }}
                            title="Lihat rincian SKU dan kategori produk"
                          >
                            {detail.code}
                          </button>
                        </td>
                        <td className="font-bold text-slate-900">{detail.name}</td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(detail.categories || {}).map(([category, qty]) => (
                              <span key={category} className="badge badge-sky text-2xs">
                                {category}: {Number(qty).toLocaleString('id-ID')}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="num mono font-bold">{Number(detail.qty || 0).toLocaleString('id-ID')}</td>
                        <td className="num mono font-bold">{fmtRp(detail.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">Belum ada penjualan ke EPR pada bulan ini.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Rincian Produk per EPR */}
      {isEppUser && selectedEppEpr && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setSelectedEppEpr(null)}
        >
          <div
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-4 px-5 border-b border-[var(--border)] flex items-start justify-between gap-4">
              <div>
                <span className="badge badge-indigo mono">{selectedEppEpr.code}</span>
                <h3 className="text-base font-bold text-[var(--text)] mt-2">{selectedEppEpr.name}</h3>
                <p className="text-xs text-[var(--text-3)] mt-1">Rincian kategori produk · {selectedEppEpr.month}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEppEpr(null)}
                className="btn btn-icon"
                title="Tutup rincian produk"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 px-5 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                {Object.entries(selectedEppEpr.products || {}).map(([category, products]) => (
                  <div key={category} className="border border-[var(--border)] rounded-xl overflow-hidden">
                    <div className="px-3 py-2 bg-[var(--surface-2)] text-xs font-bold text-[var(--text)]">{category}</div>
                    <div className="divide-y divide-[var(--border)]">
                      {Object.entries(products as Record<string, { qty: number; dates: string[] }>).map(([model, detail]) => {
                        const skuDescription = productCategoryMap[String(model).trim().toUpperCase()]?.description || model;
                        const invoiceDates = (detail.dates || []).map((date) => new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })).join(', ');
                        return (
                        <div key={model} className="px-3 py-2 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[var(--text-2)] block">{skuDescription}</span>
                            <span className="text-2xs text-[var(--text-3)] block mt-0.5">Invoice: {invoiceDates || '-'}</span>
                          </div>
                          <strong className="mono text-[var(--text)]">{Number(detail.qty || 0).toLocaleString('id-ID')} unit</strong>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-Out Drawer Detail Partner */}
      {selectedPartner && (
        <>
          <div 
            className="drawer-backdrop show" 
            onClick={() => setSelectedPartner(null)} 
          />
          <aside className="drawer open" aria-label="Detail Partner Drawer">
            <div className="drawer-head">
              <div>
                <span className="badge badge-indigo mono">{selectedPartner.code}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedPartner.name}</h3>
                <p className="text-xs text-slate-500">
                  Kota: {eprCityMap[selectedPartner.code] || selectedPartner.city} • Tier: {selectedPartner.tier} • AM: {selectedPartner.am}
                </p>
              </div>
              <button 
                onClick={() => setSelectedPartner(null)}
                className="btn btn-icon"
                title="Tutup Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="drawer-body space-y-6 p-4">
              {/* Target Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)]">
                  <span className="text-2xs uppercase font-bold text-slate-400 block mb-1">Target Original FY</span>
                  <strong className="text-sm font-bold mono text-slate-900">
                    {fmtRp(selectedPartner.target_original || selectedPartner.target_fy)}
                  </strong>
                </div>

                <div className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)]">
                  <span className="text-2xs uppercase font-bold text-slate-400 block mb-1">Target Category</span>
                  <strong className="text-sm font-bold mono text-indigo-600">
                    {fmtRp(selectedPartner.target_fy)}
                  </strong>
                </div>
              </div>

              {/* Kuartal Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Capaian per Kuartal (Target vs Aktual)
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-2xs text-slate-400 block">Q1</span>
                    <strong className="mono block text-slate-900 mt-1">{fmtCompact(selectedPartner.actual_q1 || 0)}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-2xs text-slate-400 block">Q2</span>
                    <strong className="mono block text-slate-900 mt-1">{fmtCompact(selectedPartner.actual_q2 || 0)}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] ring-1 ring-indigo-500/30">
                    <span className="text-2xs text-indigo-600 font-bold block">Q3 Focus</span>
                    <strong className="mono block text-indigo-600 mt-1">{fmtCompact(selectedPartner.actual_q3 || 0)}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-2xs text-slate-400 block">Q4</span>
                    <strong className="mono block text-slate-900 mt-1">{fmtCompact(selectedPartner.actual_q4 || 0)}</strong>
                  </div>
                </div>
              </div>

              {/* 12 Bulan Pembelian Terverifikasi */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Pembelian 12 Bulan (Terverifikasi)
                </h4>
                <div className="max-h-56 overflow-y-auto border border-[var(--border)] rounded-xl divide-y divide-[var(--border)] text-xs">
                  {[
                    'Apr 2026', 'Mei 2026', 'Jun 2026', 'Jul 2026', 'Agu 2026', 'Sep 2026',
                    'Okt 2026', 'Nov 2026', 'Des 2026', 'Jan 2027', 'Feb 2027', 'Mar 2027'
                  ].map((mLabel, idx) => {
                    const amt = selectedPartner.monthly_total[idx] || 0;
                    return (
                      <div key={idx} className="p-2.5 flex justify-between items-center hover:bg-[var(--surface-2)]">
                        <span className="font-medium text-[var(--text)]">Bulan {idx + 1} ({mLabel})</span>
                        <span className={`mono ${amt > 0 ? 'font-bold text-[var(--text)]' : 'text-slate-400'}`}>
                          {amt > 0 ? fmtRp(amt) : '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Komposisi Kategori Produk
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-[var(--surface-2)]">
                    <span className="text-slate-400 block">Consumer</span>
                    <strong className="mono text-indigo-600 font-bold">{fmtCompact(selectedPartner.cat_totals?.Consumer || 0)}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[var(--surface-2)]">
                    <span className="text-slate-400 block">Consumables</span>
                    <strong className="mono text-emerald-600 font-bold">{fmtCompact(selectedPartner.cat_totals?.Consumables || 0)}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[var(--surface-2)]">
                    <span className="text-slate-400 block">Scanner</span>
                    <strong className="mono text-sky-600 font-bold">{fmtCompact(selectedPartner.cat_totals?.Scanner || 0)}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[var(--surface-2)]">
                    <span className="text-slate-400 block">Dotmatrix</span>
                    <strong className="mono text-amber-600 font-bold">{fmtCompact(selectedPartner.cat_totals?.Dotmatrix || 0)}</strong>
                  </div>
                </div>
              </div>

              {/* EPP Sources and Product Categories: shown to Admin and the own EPR */}
              {(isAdmin || isEprUser) && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Pembelian dari EPP &amp; Kategori Produk
                  </h4>
                  {(selectedPartner.epp_sources || []).length === 0 ? (
                    <div className="border border-[var(--border)] rounded-xl p-3 text-xs text-slate-400">
                      Belum ada pembelian terverifikasi dari EPP.
                    </div>
                  ) : (
                    <div className="border border-[var(--border)] rounded-xl divide-y divide-[var(--border)] text-xs">
                      {(selectedPartner.epp_sources || []).map((epp, idx) => (
                        <div key={idx} className="p-3">
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <span className="font-bold text-slate-900 block">{epp.name}</span>
                              <span className="text-2xs text-slate-400">{epp.code} · {eppCityMap[String(epp.code || '').trim().toUpperCase()] || epp.city} · {epp.tx} transaksi</span>
                            </div>
                            <span className="mono font-bold text-slate-900 whitespace-nowrap">{fmtRp(epp.total)}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {Object.entries(epp.cats || {})
                              .filter(([, amount]) => Number(amount || 0) > 0)
                              .map(([category, amount]) => (
                                <span key={category} className="badge badge-sky" style={{ fontSize: '10px' }}>
                                  {category}: {fmtRp(Number(amount))}
                                </span>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </>
      )}

      {/* Modal Ganti Password */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {/* Modal Upload Data Pembelian EPR (Khusus Admin) */}
      {isAdmin && isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Header Modal */}
            <div className="p-4 px-5 border-b border-[var(--border)] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text)]">Upload Data Pembelian EPR</h3>
                  <p className="text-2xs text-[var(--text-3)]">Impor data sell-in Excel terverifikasi</p>
                </div>
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-lg text-[var(--text-3)] hover:bg-[var(--surface-2)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Isi Modal */}
            <div className="p-4 px-5 space-y-3.5 overflow-y-auto">
              <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-2xs text-[var(--text-2)] space-y-1.5">
                <div className="font-bold text-[var(--text)] flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-500" />
                  Format &amp; Template Didukung:
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
                  <li><strong>Template V3 (Report Retail Q*)</strong>: Rebate Category &amp; Total Price (Excl. PPN).</li>
                  <li><strong>Template V1 (Sheet1) &amp; V2 (Partner Hub)</strong>: MIN(Harga EPP, Harga Database) × Qty ÷ 1,11.</li>
                  <li><strong>Program Berjalan</strong>: V1 membaca AD (Remarks), V2 membaca AL (Program).</li>
                  <li><strong>Sheet RETAIL</strong>: Rekapitulasi bulanan 4 kategori.</li>
                  <li><strong>Deduplikasi Aktif</strong>: Invoice, tanggal, SKU, qty, harga, dan transaksi kembar otomatis ditolak.</li>
                </ul>
              </div>

              {/* Input Area */}
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-1.5">
                  Pilih File Excel
                </label>
                <div className="relative border-2 border-dashed border-[var(--border)] hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-[var(--surface)] group">
                  <input 
                    type="file" 
                    accept=".xlsx, .xls, .xlsm"
                    onChange={handleExcelUpload}
                    disabled={uploadLoading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <Upload className="w-6 h-6 text-emerald-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold text-[var(--text)]">
                    Klik atau seret file Excel ke sini
                  </p>
                  <p className="text-2xs text-[var(--text-3)]">
                    Format .xlsx, .xls, .xlsm
                  </p>
                </div>
              </div>

              {/* Status & Feedback */}
              {uploadLoading && (
                <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 font-medium p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memverifikasi data transaksi...</span>
                </div>
              )}

              {uploadStatus.type === 'success' && (
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs">
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                    <div>
                      <div className="font-bold text-2xs">Verifikasi Berhasil!</div>
                      <div className="text-2xs leading-relaxed font-mono mt-0.5">{uploadStatus.message}</div>
                    </div>
                  </div>

                  {/* Summary Stats Grid */}
                  {lastStats && (
                    <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                      <div className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                        <span className="text-2xs text-slate-400 block">Total Input</span>
                        <strong className="mono text-slate-800 text-xs font-bold">
                          {lastStats.totalInputRows.toLocaleString('id-ID')}
                        </strong>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20">
                        <span className="text-2xs text-emerald-600 block">Terverifikasi</span>
                        <strong className="mono text-emerald-600 text-xs font-bold">
                          {lastStats.verifiedCount.toLocaleString('id-ID')}
                        </strong>
                      </div>
                      <div className="p-2 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-500/20">
                        <span className="text-2xs text-rose-500 block">Ditolak / Kembar</span>
                        <strong className="mono text-rose-600 text-xs font-bold">
                          {(lastStats.duplicateCount + lastStats.outsideMasterCount + lastStats.outsideSkuCount + lastStats.excludedCategoryCount).toLocaleString('id-ID')}
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* Reject Preview */}
                  {lastStats && lastStats.rejectedRows.length > 0 && (
                    <div className="border border-[var(--border)] rounded-lg p-2.5 bg-[var(--surface-2)] max-h-28 overflow-y-auto text-2xs space-y-1">
                      <div className="font-bold text-slate-700 dark:text-slate-300 mb-1 flex justify-between">
                        <span>Baris Ditolak ({lastStats.rejectedRows.length})</span>
                        <span className="text-rose-500 font-normal">{lastStats.duplicateCount} Kembar · {lastStats.outsideMasterCount} Luar EPR · {lastStats.outsideSkuCount} Luar SKU · {lastStats.excludedCategoryCount} Kategori</span>
                      </div>
                      {lastStats.rejectedRows.slice(0, 8).map((rej, i) => (
                        <div key={i} className="flex justify-between items-center py-0.5 border-b border-[var(--border)]/40 last:border-none">
                          <span className="mono text-slate-400 truncate max-w-[200px]">R{rej.rowNum}: {rej.name || rej.code || '-'}</span>
                          <span className="badge badge-rose text-2xs px-1 py-0">{rej.reason}</span>
                        </div>
                      ))}
                      {lastStats.rejectedRows.length > 8 && (
                        <div className="text-center text-slate-400 pt-0.5">
                          ... dan {lastStats.rejectedRows.length - 8} baris lainnya
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {uploadStatus.type === 'error' && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <div>
                    <div className="font-bold text-2xs">Gagal Mengimpor</div>
                    <div className="text-2xs leading-relaxed mt-0.5">{uploadStatus.message}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-3 px-5 bg-[var(--surface-2)] border-t border-[var(--border)] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSyncExistingData}
                  disabled={sharedSyncLoading || uploadLoading}
                  className="text-2xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 flex items-center gap-1"
                  title="Kirim data existing ke dashboard EPP/EPR tanpa upload ulang"
                >
                  <RefreshCw className={`w-3 h-3 ${sharedSyncLoading ? 'animate-spin' : ''}`} />
                  <span>{sharedSyncLoading ? 'Sinkron...' : 'Sinkronkan Existing'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetToDefaultData}
                  disabled={sharedSyncLoading || uploadLoading}
                  className="text-2xs font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50 flex items-center gap-1"
                  title="Hapus data custom dan gunakan data bawaan sistem"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Data</span>
                </button>
              </div>

              <button 
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="btn btn-secondary px-3.5 py-1.5 text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Laporan khusus cetak / Share PDF. Tidak tampil pada layar dashboard. */}
    <div className={`pdf-report ${pdfReportType === 'overview' ? '' : 'pdf-report-inactive'}`}>
      <div className="pdf-head">
        <div>
          <h1>Pencapaian per EPR</h1>
          <div className="pdf-meta">Dashboard EPP &amp; EPR · Periode {period.toUpperCase()} · {new Date().toLocaleDateString('id-ID')}</div>
        </div>
        <div className="pdf-meta">Epson FY26</div>
      </div>

      <div className="pdf-sec">
        <h3>Pencapaian per EPR</h3>
        <table className="pdf-table">
          <thead>
            <tr>
              <th>Nama EPR</th>
              <th>Total Pembelian per Kategori</th>
              <th className="num">Kekurangan</th>
            </tr>
          </thead>
          <tbody>
            {filteredPartners.map((partner) => {
              const { gap } = getPartnerPeriodMetrics(partner);
              const categoryTotals = getPartnerPeriodCategoryTotals(partner);
              const categories = [
                ['Consumer', categoryTotals.Consumer],
                ['Consumables', categoryTotals.Consumables],
                ['Scanner', categoryTotals.Scanner],
                ['Dotmatrix', categoryTotals.Dotmatrix],
              ];
              return (
                <tr key={partner.code}>
                  <td>
                    <strong>{partner.name}</strong>
                    <div>{partner.code}</div>
                  </td>
                  <td>
                    <div className="pdf-category-list">
                      {categories.map(([category, amount]) => (
                        <span key={category as string}>
                          <strong>{category}:</strong> {fmtRp(Number(amount))}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className={`num ${gap > 0 ? 'pdf-gap-warn' : 'pdf-gap-ok'}`}>
                    {gap > 0 ? fmtRp(gap) : 'Achieved'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pdf-foot">
        <span>{filteredPartners.length} EPR</span>
        <span className="pdf-credit">EPR Achievement Dashboard</span>
        <span>Data pembelian terverifikasi</span>
      </div>
    </div>

    {/* Laporan khusus cetak Data Upload Epson Hub. */}
    <div className={`pdf-report ${pdfReportType === 'epp-upload' ? '' : 'pdf-report-inactive'}`}>
      <div className="pdf-head">
        <div>
          <h1>Penjualan EPP ke EPR</h1>
          <div className="pdf-meta">Data Upload Epson Hub · Periode {selectedEppRangeLabel} · {new Date().toLocaleDateString('id-ID')}</div>
        </div>
        <div className="pdf-meta">Epson FY26</div>
      </div>

      <div className="pdf-sec">
        <h3>Rincian Penjualan EPP ke EPR</h3>
        <table className="pdf-table">
          <thead>
            <tr>
              <th>Bulan</th>
              <th>Kode EPR</th>
              <th>Nama EPR</th>
              <th>Category</th>
              <th>Tipe Produk / Material Code</th>
              <th className="num">Qty</th>
              <th>Tanggal Invoice</th>
              <th className="num">Total Penjualan</th>
            </tr>
          </thead>
          <tbody>
            {eppUploadPdfRows.map((row: any, index: number) => (
              <tr key={`${row.month}-${row.eprCode}-${row.category}-${row.model}-${index}`}>
                <td>{row.month}</td>
                <td className="mono">{row.eprCode}</td>
                <td><strong>{row.eprName}</strong></td>
                <td>{row.category}</td>
                <td>
                  <strong>{row.description}</strong>
                  <div className="pdf-subtext mono">{row.model}</div>
                </td>
                <td className="num mono">{row.qty.toLocaleString('id-ID')}</td>
                <td>{row.invoiceDates || '-'}</td>
                <td className="num mono font-bold">{fmtRp(row.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!eppUploadPdfRows.length && (
          <p className="pdf-empty">Belum ada data penjualan EPP ke EPR pada periode ini.</p>
        )}
      </div>

      <div className="pdf-foot">
        <span>{eppUploadPdfRows.length} rincian produk</span>
        <span className="pdf-credit">EPR Achievement Dashboard</span>
        <span>Data penjualan terverifikasi</span>
      </div>
    </div>
    </>
  );
};
