import React, { useEffect, useState, useMemo } from 'react';
import { PartnerData, EprFullData, ProgramPartner, EppSource } from '../types-pbi';
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
  Briefcase,
  CheckCircle,
  AlertTriangle,
  FileDown,
  Printer,
  Sun,
  Moon,
  BarChart2,
  Layers,
  FileText
} from 'lucide-react';

interface Props {
  userEmail: string;
  userRole: 'admin' | 'epp' | 'epr';
  userEprCode?: string; // e.g. "EPR-0038" – from user_metadata, used for exact EPR store isolation
  onLogout: () => void;
}

export const ModernEprDashboard: React.FC<Props> = ({ userEmail, userRole, userEprCode = '', onLogout }) => {
  const [data, setData] = useState<EprFullData | null>(null);
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

  // Theme: 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Load Data on Mount
  useEffect(() => {
    const savedTheme = (localStorage.getItem('epr_theme') as 'light' | 'dark') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`/data/epr_data.json?t=${Date.now()}`);
      if (!resp.ok) {
        throw new Error(`Gagal memuat data (HTTP ${resp.status})`);
      }
      const json: EprFullData = await resp.json();
      setData(json);
    } catch (err: any) {
      console.error('Fetch epr_data error:', err);
      setError(err.message || 'Gagal memuat data pembelian.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
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

  // For EPR users: resolve the exact partner record for subtitle / scoped views.
  // Uses userEprCode (from user_metadata) with alias-table fallback.
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
        // Primary: exact match via epr_code from user_metadata (most reliable)
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

  // Aggregate Overview KPIs
  const kpiSummary = useMemo(() => {
    let totalRevenue = 0;
    let totalTarget = 0;
    let totalLowEnd = 0;
    let totalMidHi = 0;
    let achievedCount = 0;

    filteredPartners.forEach((p) => {
      const { target, actual, ach } = getPartnerPeriodMetrics(p);
      totalRevenue += actual;
      totalTarget += target;
      totalLowEnd += p.low_end || 0;
      totalMidHi += p.mid_hi || 0;
      if (ach >= 1.0) achievedCount++;
    });

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
      catConsumer,
      catScanner,
      catConsumables,
      catDotmatrix,
      totalCat
    };
  }, [filteredPartners, period]);

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

    const headers = ['Kode EPR', 'Nama Toko', 'Kota', 'Tier', 'Target Period', 'Actual Period', 'Ach %'];
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
              {isEppUser && <span className="badge badge-sky">EPP: {cleanUsername.toUpperCase()}</span>}
              {isEprUser && <span className="badge badge-amber">TOKO: {cleanUsername.toUpperCase()}</span>}
            </div>
            <p className="subtitle" id="metaSubtitle">
              {isEprUser 
                ? `Dashboard Toko Retail ${ownPartner?.name || cleanUsername.toUpperCase()} (Strict Read-Only)`
                : `Monitoring Pencapaian 24 Toko Retail (Excl. PPN) · AM: ARIS`}
            </p>
          </div>
        </div>

        <div className="topbar-actions">
          <button 
            onClick={() => window.print()}
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

          <button 
            onClick={() => setIsPasswordModalOpen(true)}
            className="btn btn-secondary" 
            title="Ganti Password Akun"
          >
            <KeyRound className="w-4 h-4" />
            <span>Ganti Password</span>
          </button>

          <button 
            onClick={toggleTheme}
            className="btn btn-icon" 
            title="Ganti Tema Terang / Gelap"
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

        <button 
          type="button" 
          onClick={() => setActivePage('program')}
          className={`pbi-nav-btn ${activePage === 'program' ? 'active' : ''}`}
        >
          <Layers className="w-4 h-4" />
          <span>Paketan Berjalan (Booster Up)</span>
        </button>

        {(!isEprUser || isAdmin) && (
          <button 
            type="button" 
            onClick={() => setActivePage('audit')}
            className={`pbi-nav-btn ${activePage === 'audit' ? 'active' : ''}`}
          >
            <FileText className="w-4 h-4" />
            <span>Kontribusi EPP &amp; Audit</span>
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

          {isEprUser && (
            <div className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--border)] text-xs text-[var(--text-3)] leading-relaxed">
              <strong className="text-[var(--text)] block mb-1">Mode Toko Retail</strong>
              Dashboard dikunci khusus untuk toko Anda (Read-Only). Semua data target & realisasi terverifikasi secara resmi dari sistem Epson FY26.
            </div>
          )}
        </aside>

        {/* Right Canvas */}
        <main className="pbi-canvas">
          {/* ======================================================== */}
          {/* PAGE 1: OVERVIEW & TARGET H2 */}
          {/* ======================================================== */}
          {activePage === 'overview' && (
            <div className="space-y-6">
              {/* 4 KPI Cards */}
              <section className="kpi-grid">
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
                    Realisasi terhadap Target Bobot {period.toUpperCase()}
                  </div>
                </article>

                <article className="kpi-card">
                  <div className="kpi-head">
                    <span className="kpi-label">Partisipasi Toko Retail</span>
                    <span className="kpi-icon emerald">EPR</span>
                  </div>
                  <div className="kpi-value mono">
                    {kpiSummary.achievedCount} / {kpiSummary.totalPartners}
                  </div>
                  <div className="kpi-foot">
                    Toko mencapai Target &ge; 100% pada periode ini
                  </div>
                </article>

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
              </section>

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
                          {fmtCompact(filteredPartners.reduce((acc, curr) => acc + (curr.monthly_total[6] || 0), 0))}
                        </span>
                        <span className="q-month-target mono">Target 10%</span>
                      </div>
                      <div className="q-month-card">
                        <span className="q-month-name">Nov 2026</span>
                        <span className="q-month-ach mono">
                          {fmtCompact(filteredPartners.reduce((acc, curr) => acc + (curr.monthly_total[7] || 0), 0))}
                        </span>
                        <span className="q-month-target mono">Target 10%</span>
                      </div>
                      <div className="q-month-card">
                        <span className="q-month-name">Des 2026</span>
                        <span className="q-month-ach mono">
                          {fmtCompact(filteredPartners.reduce((acc, curr) => acc + (curr.monthly_total[8] || 0), 0))}
                        </span>
                        <span className="q-month-target mono">Target 10%</span>
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
                          {fmtCompact(filteredPartners.reduce((acc, curr) => acc + (curr.monthly_total[9] || 0), 0))}
                        </span>
                        <span className="q-month-target mono">Target 6%</span>
                      </div>
                      <div className="q-month-card">
                        <span className="q-month-name">Feb 2027</span>
                        <span className="q-month-ach mono">
                          {fmtCompact(filteredPartners.reduce((acc, curr) => acc + (curr.monthly_total[10] || 0), 0))}
                        </span>
                        <span className="q-month-target mono">Target 6%</span>
                      </div>
                      <div className="q-month-card">
                        <span className="q-month-name">Mar 2027</span>
                        <span className="q-month-ach mono">
                          {fmtCompact(filteredPartners.reduce((acc, curr) => acc + (curr.monthly_total[11] || 0), 0))}
                        </span>
                        <span className="q-month-target mono">Target 6%</span>
                      </div>
                    </div>
                  </article>
                </div>
              </section>

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

              {/* Interactive Partner Table */}
              <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="card-head" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <h2 style={{ fontSize: '15px' }}>Rincian Pencapaian per Toko Retail (EPR)</h2>
                    <p className="card-sub">
                      Menampilkan {filteredPartners.length} toko retail · Klik baris toko untuk melihat rincian drawer
                    </p>
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

                <div className="overflow-x-auto">
                  <table className="partner-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Kode EPR</th>
                        <th>Nama Toko</th>
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
                            <td className="text-xs text-slate-500">{p.city}</td>
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
          {/* PAGE 2: PAKETAN BERJALAN (BOOSTER UP) */}
          {/* ======================================================== */}
          {activePage === 'program' && (
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

              {/* Participants Table */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="card-head" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <h3 style={{ fontSize: '15px' }}>Daftar Toko Retail Peserta Paket Booster</h3>
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

                  if (isEprUser && progList.length === 0) {
                    return (
                      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
                        <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                          Toko Anda Tidak Terdaftar sebagai Peserta Paket Booster Up
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
                          Program Booster Up Q3 FY26 diikuti oleh toko retail di area AM HERDIAN &amp; SIGIT.
                          Hubungi AM Anda (ARIS) untuk informasi program selanjutnya.
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
                            <th>Kode EPR</th>
                            <th>Nama Toko</th>
                            <th>Kota</th>
                            <th>Paket</th>
                            <th>Tier</th>
                            <th>AM</th>
                            <th className="num">Reward</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {progList.map((prog, idx) => (
                            <tr key={prog.code || idx}>
                              <td className="mono text-slate-400 text-xs">{idx + 1}</td>
                              <td><span className="badge badge-indigo mono">{prog.code}</span></td>
                              <td className="font-bold text-slate-900">{prog.name}</td>
                              <td className="text-xs text-slate-500">{prog.city}</td>
                              <td><span className="badge badge-sky">{prog.package_type || 'Consumer'}</span></td>
                              <td><span className={`badge tier-${prog.tier?.toLowerCase()}`}>{prog.tier}</span></td>
                              <td className="text-xs">{prog.am}</td>
                              <td className="num mono font-bold text-emerald-600">
                                {prog.reward ? fmtRp(prog.reward) : 'Rp 3.900.000'}
                              </td>
                              <td>
                                <span className="badge badge-emerald">Aktif Berjalan</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 3: KONTRIBUSI EPP & AUDIT */}
          {/* ======================================================== */}
          {activePage === 'audit' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-head">
                  <div>
                    <h2>Kontribusi Partner Premier (EPP) &amp; Status Audit</h2>
                    <p className="card-sub">
                      {isAdmin
                        ? 'Rekapitulasi distribusi supply EPP ke seluruh toko retail EPR FY26'
                        : 'Ringkasan kontribusi supply Anda ke toko retail EPR FY26 · Identitas EPP lain dirahasiakan'}
                    </p>
                  </div>
                  {!isAdmin && (
                    <span className="badge badge-amber" style={{ alignSelf: 'flex-start' }}>
                      🔒 Confidential — Identitas EPP lain tersembunyi
                    </span>
                  )}
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
                        <th className="num">Toko Terlayani</th>
                        <th className="num">Total Omset Pembelian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const list = data.epp_summary || [];
                        // Admin: tampilkan semua lengkap
                        if (isAdmin) {
                          return list.map((epp, idx) => (
                            <tr key={epp.code || idx}>
                              <td className="mono text-slate-400 text-xs">{idx + 1}</td>
                              <td><span className="badge badge-emerald mono">{epp.code}</span></td>
                              <td className="font-bold text-slate-900">{epp.name}</td>
                              <td className="text-xs text-slate-500">{epp.city}</td>
                              <td className="num mono">{epp.tx_count ?? epp.tx ?? '-'}</td>
                              <td className="num mono font-bold text-indigo-600">{epp.partner_count ?? '-'}</td>
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
                                <td className="text-xs text-slate-500">{epp.city}</td>
                                <td className="num mono">{epp.tx_count ?? epp.tx ?? '-'}</td>
                                <td className="num mono font-bold text-indigo-600">{epp.partner_count ?? '-'}</td>
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

              {/* Audit Summary Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card p-4">
                  <span className="text-2xs uppercase font-bold text-slate-400 block mb-1">Transaksi Terverifikasi</span>
                  <strong className="text-xl font-bold mono text-emerald-600">
                    {data.audit?.verified_tx?.toLocaleString('id-ID') || '4.180'}
                  </strong>
                  <span className="text-2xs text-slate-500 mt-1 block">Tercatat valid di database FY26</span>
                </div>

                <div className="card p-4">
                  <span className="text-2xs uppercase font-bold text-slate-400 block mb-1">Transaksi Ditolak</span>
                  <strong className="text-xl font-bold mono text-rose-600">
                    {data.audit?.rejected_tx?.toLocaleString('id-ID') || '0'}
                  </strong>
                  <span className="text-2xs text-slate-500 mt-1 block">Kembar / Di Luar Aturan Resmi</span>
                </div>

                <div className="card p-4">
                  <span className="text-2xs uppercase font-bold text-slate-400 block mb-1">Data Source File</span>
                  <strong className="text-sm font-bold text-slate-900 block truncate">
                    EPR FY26 Verified Database
                  </strong>
                  <span className="text-2xs text-slate-500 mt-1 block">Update Terakhir: {data.meta?.last_updated || 'November 2026'}</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Slide-Out Drawer Detail Partner */}
      {selectedPartner && (
        <>
          <div 
            className="drawer-backdrop show" 
            onClick={() => setSelectedPartner(null)} 
          />
          <aside className="drawer show" aria-label="Detail Partner Drawer">
            <div className="drawer-head">
              <div>
                <span className="badge badge-indigo mono">{selectedPartner.code}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedPartner.name}</h3>
                <p className="text-xs text-slate-500">
                  Kota: {selectedPartner.city} • Tier: {selectedPartner.tier} • AM: {selectedPartner.am}
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
                  Realisasi Pembelian 12 Bulan (Terverifikasi)
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

              {/* EPP Sources: Only shown to Admin; neutralized for EPP/EPR */}
              {isAdmin && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Distribusi Pemasok EPP (Khusus Admin)
                  </h4>
                  <div className="border border-[var(--border)] rounded-xl divide-y divide-[var(--border)] text-xs">
                    {(selectedPartner.epp_sources || []).map((epp, idx) => (
                      <div key={idx} className="p-2.5 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-900 block">{epp.name}</span>
                          <span className="text-2xs text-slate-400">{epp.code} · {epp.city} ({epp.tx} transaksi)</span>
                        </div>
                        <span className="mono font-bold text-slate-900">{fmtRp(epp.total)}</span>
                      </div>
                    ))}
                  </div>
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
    </div>
  );
};
