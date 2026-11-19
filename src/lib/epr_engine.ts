/**
 * epr_engine.ts
 * Adopsi penuh mesin verifikasi & deduplikasi dari ariswidodo/EPR
 * Mendukung template:
 * - V1: Sheet1 (Harga final = harga terendah EPP/database × Qty, dibagi 1,11)
 * - V2: Partner Hub (Struktur harga sama dengan V1)
 * - V3: Report Retail Q1/Q2/Q3/Q4 (Net price, Product Rebate di kolom U, Total Price di kolom Z)
 * - RETAIL: Sheet ringkasan target & bulanan
 */

import * as XLSX from 'xlsx';
import { PartnerData, EprFullData, EppSource } from '../types-pbi';

// Master 24 EPR Area ARIS (Jawa Tengah)
export const EPR_MASTER = [
  { code: 'EPR-0038', name: 'SINAR JAYA COMPUTER / CV PINDITECH MAJU ABADI', city: 'KUDUS', category: 'MOON', am: 'ARIS', target_excl: 1500000000, target_original: 2149300000 },
  { code: 'EPR-0054', name: 'PT HETERO NIAGA GLOBAL', city: 'SEMARANG', category: 'SUN', am: 'ARIS', target_excl: 6000000000, target_original: 7164340000 },
  { code: 'EPR-0267', name: 'PT HARRISMA PRATAMAJAYA', city: 'SURAKARTA', category: 'SUN', am: 'ARIS', target_excl: 6000000000, target_original: 6447900000 },
  { code: 'EPR-0650', name: 'CV RAJA PRINT SOLUTION', city: 'SEMARANG', category: 'STAR', am: 'ARIS', target_excl: 4000000000, target_original: 4298600000 },
  { code: 'EPR-0733', name: 'MICRO PRINTER', city: 'PATI', category: 'CRESCENT', am: 'ARIS', target_excl: 200000000, target_original: 928000000 },
  { code: 'EPR-0881', name: 'UD PIXEL', city: 'SEMARANG', category: 'MOON', am: 'ARIS', target_excl: 1500000000, target_original: 1791080000 },
  { code: 'EPR-1002', name: 'AL BUMI IT STORE', city: 'KENDAL', category: 'CRESCENT', am: 'ARIS', target_excl: 200000000, target_original: 429860000 },
  { code: 'EPR-1005', name: 'CV PRIBUMI JAYA KOMPUTAMA', city: 'KUDUS', category: 'MOON', am: 'ARIS', target_excl: 1500000000, target_original: 1791080000 },
  { code: 'EPR-1197', name: 'CV YESTOYA ABADI', city: 'SALATIGA', category: 'SUN', am: 'ARIS', target_excl: 6000000000, target_original: 6447900000 },
  { code: 'EPR-1409', name: 'PRIMA KOMPUTER', city: 'PURWODADI', category: 'CRESCENT', am: 'ARIS', target_excl: 200000000, target_original: 214930000 },
  { code: 'EPR-1410', name: 'CV SAFRINDO PERKASA', city: 'SEMARANG', category: 'MOON', am: 'ARIS', target_excl: 1500000000, target_original: 1791080000 },
  { code: 'EPR-1413', name: 'PT INFOKOM PUTRA KENCANA', city: 'SEMARANG', category: 'SUN', am: 'ARIS', target_excl: 6000000000, target_original: 6447900000 },
  { code: 'EPR-1570', name: 'CV MITRA PRATAMA KOMPUTINDO', city: 'SEMARANG', category: 'EARTH', am: 'ARIS', target_excl: 2500000000, target_original: 2865740000 },
  { code: 'EPR-1628', name: 'CV ARTADINATA PERKASA ABADI', city: 'SEMARANG', category: 'CRESCENT', am: 'ARIS', target_excl: 200000000, target_original: 214930000 },
  { code: 'EPR-1768', name: 'CV KARYA HIDUP MULYA', city: 'SEMARANG', category: 'SUN', am: 'ARIS', target_excl: 6000000000, target_original: 6447900000 },
  { code: 'EPR-1770', name: 'CV PUTRA MANDIRI', city: 'KUDUS', category: 'CRESCENT', am: 'ARIS', target_excl: 200000000, target_original: 286570000 },
  { code: 'EPR-1816', name: 'CV SALAM JAYA KOMPUTINDO', city: 'SEMARANG', category: 'STAR', am: 'ARIS', target_excl: 4000000000, target_original: 4298600000 },
  { code: 'EPR-1845', name: 'CV BUMI RAYA INDONESIA', city: 'SEMARANG', category: 'MOON', am: 'ARIS', target_excl: 1500000000, target_original: 1791080000 },
  { code: 'EPR-1906', name: 'ELLITE COMPUTER WELERI', city: 'KENDAL', category: 'CRESCENT', am: 'ARIS', target_excl: 200000000, target_original: 214930000 },
  { code: 'EPR-1907', name: 'PT HAIGA CITRA DIGITAL', city: 'SEMARANG', category: 'CRESCENT', am: 'ARIS', target_excl: 200000000, target_original: 214930000 },
  { code: 'EPR-1966', name: 'CV MITRA SARANA TEKNIK', city: 'SEMARANG', category: 'CRESCENT', am: 'ARIS', target_excl: 200000000, target_original: 214930000 },
  { code: 'EPR-1967', name: 'CV DIAMOND INDO', city: 'SEMARANG', category: 'CRESCENT', am: 'ARIS', target_excl: 200000000, target_original: 214930000 },
  { code: 'EPR-1999', name: 'CV NAFIRI', city: 'SEMARANG', category: 'CRESCENT', am: 'ARIS', target_excl: 200000000, target_original: 214930000 },
  { code: 'EPR-2013', name: 'CV JAYA MAKMUR STATIONARY', city: 'SEMARANG', category: 'CRESCENT', am: 'ARIS', target_excl: 200000000, target_original: 214930000 },
];

export const EPR_ALIASES: Record<string, string> = {
  'sinar jaya computer': 'EPR-0038',
  'cv pinditech maju abadi': 'EPR-0038',
  'pinditech maju abadi': 'EPR-0038',
  'pinditech mau abadi': 'EPR-0038',
  'unmanaged pinditech maju abadi': 'EPR-0038',
  'unmanaged pinditech mau abadi': 'EPR-0038',
  'hetero niaga': 'EPR-0054',
  'pt hetero niaga global': 'EPR-0054',
  'pt harrisma pratamajaya': 'EPR-0267',
  'pt harrisma pratama jaya': 'EPR-0267',
  'harrisma': 'EPR-0267',
  'cv raja print solution': 'EPR-0650',
  'raja print': 'EPR-0650',
  'micro printer': 'EPR-0733',
  'ud pixel': 'EPR-0881',
  'pixel': 'EPR-0881',
  'al bumi it store': 'EPR-1002',
  'albumi': 'EPR-1002',
  'cv pribumi jaya komputama': 'EPR-1005',
  'pribumi jaya': 'EPR-1005',
  'cv yestoya abadi': 'EPR-1197',
  'yestoya': 'EPR-1197',
  'prima komputer': 'EPR-1409',
  'cv safrindo perkasa': 'EPR-1410',
  'pt infokom putra kencana': 'EPR-1413',
  'infokom': 'EPR-1413',
  'cv mitra pratama komputindo': 'EPR-1570',
  'cv artadinata perkasa abadi': 'EPR-1628',
  'cv karya hidup mulya': 'EPR-1768',
  'cv putra mandiri': 'EPR-1770',
  'cv salam jaya komputindo': 'EPR-1816',
  'cv bumi raya indonesia': 'EPR-1845',
  'ellite computer weleri': 'EPR-1906',
  'pt haiga citra digital': 'EPR-1907',
  'cv mitra sarana teknik': 'EPR-1966',
  'cv diamond indo': 'EPR-1967',
  'cv nafiri': 'EPR-1999',
  'cv jaya makmur stationary': 'EPR-2013',
};

export interface VerificationStats {
  totalInputRows: number;
  verifiedCount: number;
  duplicateCount: number;
  duplicateInInputCount: number;
  alreadyVerifiedCount: number;
  outsideMasterCount: number;
  outsideSkuCount: number;
  excludedCategoryCount: number;
  totalVerifiedAmount: number;
  templateVersion: string;
  sourceSheet: string;
  rejectedRows: Array<{
    rowNum: number;
    file: string;
    reason: 'KEMBAR DALAM INPUT' | 'SUDAH TERVERIFIKASI' | 'LUAR DATABASE EPR' | 'LUAR DATABASE SKU' | 'KATEGORI TIDAK DIHITUNG';
    code?: string;
    name?: string;
    rawText?: string;
  }>;
}

export function normText(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normCity(c: string): string {
  let s = (c || '').toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').trim();
  s = s.replace(/^(KOTA|KAB|KABUPATEN)\s+/, '').trim();
  return s.replace(/\s+/g, ' ');
}

export function isCityMatch(inCity: string, masterCity: string): boolean {
  const ic = normCity(inCity);
  const mc = normCity(masterCity);
  if (!ic || !mc) return true;
  return ic === mc || ic.includes(mc) || mc.includes(ic);
}

// Klasifikasi Kategori Produk Sesuai epr_build.py
export function parseKategori(cat: string): 'Consumer' | 'Scanner' | 'Consumables' | 'Dotmatrix' | '' {
  const t = (cat || '').trim().toUpperCase();
  if (!t) return '';
  if (t === 'CONSUMER' || t === 'CONSUMABLES' || t === 'SCANNER' || t === 'DOTMATRIX') {
    return (t.charAt(0) + t.slice(1).toLowerCase()) as any;
  }
  if (t.endsWith('CONS')) return 'Consumables';
  if (t.startsWith('SCN')) return 'Scanner';
  if (t.startsWith('SIDM')) return 'Dotmatrix';
  if (t.startsWith('CISS') || t.startsWith('SOHO')) return 'Consumer';
  return '';
}

// Parse Tanggal Transaksi: Mendukung dd-mm-yyyy, yyyy-mm-dd, maupun Excel serial number
export function parseInvoiceDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    // Simpan tanggal kalender lokal. Jangan biarkan konversi UTC mengubah
    // invoice 01-10 menjadi 30-09 pada zona waktu Asia.
    return new Date(val.getFullYear(), val.getMonth(), val.getDate());
  }

  const s = String(val).trim();
  if (!s) return null;

  // Cek apakah serial Excel (angka 5 digit sekitar 45000-47000)
  if (/^\d{5}(\.0+)?$/.test(s)) {
    const serial = parseFloat(s);
    // Excel epoch: 1899-12-30
    const utcDate = new Date(Math.round((serial - 25569) * 86400 * 1000));
    if (isNaN(utcDate.getTime())) return null;
    return new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
  }

  // Cek dd/mm/yyyy atau dd-mm-yyyy
  const m1 = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (m1) {
    const day = parseInt(m1[1], 10);
    const month = parseInt(m1[2], 10) - 1;
    const year = parseInt(m1[3], 10);
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? null : d;
  }

  // Cek yyyy-mm-dd
  const m2 = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (m2) {
    const year = parseInt(m2[1], 10);
    const month = parseInt(m2[2], 10) - 1;
    const day = parseInt(m2[3], 10);
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// Hitung index bulan fiskal FY26 (Bulan 1 = Apr 2026, ... Bulan 12 = Mar 2027)
export function getFiscalMonthIndex(d: Date): number {
  const m = d.getMonth() + 1; // 1-12
  // Apr (4) -> 0, Mei (5) -> 1 ... Des (12) -> 8, Jan (1) -> 9, Feb (2) -> 10, Mar (3) -> 11
  return (m >= 4 ? m - 4 : m + 8);
}

// Format tanggal berdasarkan kalender invoice, bukan UTC ISO string.
// `toISOString()` dapat menggeser tanggal 01-10-2026 menjadi 30-09-2026
// ketika aplikasi berjalan di zona waktu Asia.
export function formatInvoiceDate(d: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Resolver EPR dari kode & kota sesuai epr_build.py
export function resolveEprCode(rawCode: string, rawName: string, rawCity: string): string | null {
  const c = (rawCode || '').trim().toUpperCase();
  const byCode = EPR_MASTER.find(m => m.code === c);

  if (byCode) {
    return isCityMatch(rawCity, byCode.city) ? byCode.code : null;
  }

  // Jika sudah punya kode EPR-xxxx tapi tidak ada di master ARIS, tolak langsung
  if (c && c.startsWith('EPR-')) {
    return null;
  }

  // Cek lewat nama & alias
  const k = normText(rawName);
  if (!k) return null;

  if (EPR_ALIASES[k]) {
    const aliasCode = EPR_ALIASES[k];
    const m = EPR_MASTER.find(x => x.code === aliasCode);
    if (m && isCityMatch(rawCity, m.city)) return m.code;
  }

  // Cek partial name
  const match = EPR_MASTER.find(m => {
    const mk = normText(m.name);
    return (k === mk || k.includes(mk) || mk.includes(k)) && isCityMatch(rawCity, m.city);
  });

  return match ? match.code : null;
}

// Generator make_key deduplikasi sesuai engine epr_build.py
export function makeDeduplicationKey(
  code: string,
  invNo: string,
  matCode: string,
  qty: number,
  price: number,
  uid?: string,
  sn?: string,
  invDate?: string,
  fileName?: string,
  rowNum?: number,
  totalPrice?: number,
  eppCode?: string
): string {
  // Identitas transaksi harus bebas dari nama file dan nomor baris. Dengan
  // begitu, transaksi yang sama tetap dianggap duplikat walaupun dikirim ulang
  // melalui file berbeda atau berada di baris berbeda.
  const normalizeText = (value: string | undefined) =>
    String(value || '').trim().toUpperCase().replace(/\s+/g, ' ');
  const normalizeNumber = (value: number | undefined) =>
    Number.isFinite(value) ? Number(value).toFixed(6) : '0.000000';

  return [
    'TX',
    normalizeText(code),
    normalizeText(invNo),
    normalizeText(invDate),
    normalizeText(matCode),
    normalizeNumber(qty),
    normalizeNumber(price),
    normalizeNumber(totalPrice),
    normalizeText(uid),
    normalizeText(sn),
    normalizeText(eppCode),
  ].join('|');
}

/**
 * Mesin Proses Upload Utama (Full Engine Parser)
 * Mendukung template V1, V2, V3 (Report Retail Q*), dan RETAIL
 */
export function processUploadedWorkbook(
  wb: XLSX.WorkBook,
  fileName: string,
  existingData: EprFullData | null,
  priceDatabase: Record<string, number> = {},
  skuDatabase: Record<string, { categoryProduct?: string; productRebate?: string; description?: string }> = {}
): { updatedData: EprFullData; stats: VerificationStats } {
  const sheetNames = wb.SheetNames;

  // 1. Cek apakah ini template V3: sheet diawali "Report Retail" atau mengandung "Report Retail"
  const v3Sheets = sheetNames.filter(s => s.trim().toLowerCase().includes('report retail'));
  // 2. Cek apakah template V2: sheet mengandung "Partner Hub"
  const v2Sheets = sheetNames.filter(s => s.trim().toLowerCase().includes('partner hub'));
  const isV2 = v2Sheets.length > 0;
  // 3. Cek apakah template V1: sheet "Sheet1"
  const isV1 = sheetNames.some(s => s.trim().toLowerCase() === 'sheet1');
  // 4. Cek apakah sheet ringkasan "RETAIL"
  const isRetailSummary = sheetNames.some(s => s.toUpperCase().includes('RETAIL') && !s.toLowerCase().includes('report retail'));

  const stats: VerificationStats = {
    totalInputRows: 0,
    verifiedCount: 0,
    duplicateCount: 0,
    duplicateInInputCount: 0,
    alreadyVerifiedCount: 0,
    outsideMasterCount: 0,
    outsideSkuCount: 0,
    excludedCategoryCount: 0,
    totalVerifiedAmount: 0,
    templateVersion: 'V3',
    sourceSheet: '',
    rejectedRows: []
  };
  const acceptedTransactionKeysForData = new Set<string>();
  const acceptedProgramItems: any[] = [];
  const rejectedProgramItems: any[] = [];

  // Buat copy partners dari master & MERGE dengan data existing (baseline) agar data tidak hilang/terhapus!
  const partnersMap = new Map<string, PartnerData>();
  EPR_MASTER.forEach(m => {
    const existing = existingData?.partners?.find(p => p.code === m.code);
    const target_fy = existing?.target_fy || m.target_original || m.target_excl;
    const target_h1 = existing?.target_h1 || Math.round(target_fy * 0.52);
    const target_h2 = existing?.target_h2 || Math.round(target_fy * 0.48);

    // Kloning data bulanan dan kategori yang sudah ada sebelumnya
    const monthly_total = existing?.monthly_total 
      ? [...existing.monthly_total] 
      : Array(12).fill(0);
      
    const monthly_by_cat = {
      Consumer: existing?.monthly_by_cat?.Consumer ? [...existing.monthly_by_cat.Consumer] : Array(12).fill(0),
      Scanner: existing?.monthly_by_cat?.Scanner ? [...existing.monthly_by_cat.Scanner] : Array(12).fill(0),
      Consumables: existing?.monthly_by_cat?.Consumables ? [...existing.monthly_by_cat.Consumables] : Array(12).fill(0),
      Dotmatrix: existing?.monthly_by_cat?.Dotmatrix ? [...existing.monthly_by_cat.Dotmatrix] : Array(12).fill(0),
    };

    const cat_totals = existing?.cat_totals 
      ? { ...existing.cat_totals } 
      : { Consumer: 0, Scanner: 0, Consumables: 0, Dotmatrix: 0 };

    // Kloning epp_sources
    const epp_sources: EppSource[] = (existing?.epp_sources || []).map(src => ({
      ...src,
      cats: { ...src.cats }
    }));

    // Kloning program_sources
    const program_sources = (existing?.program_sources || []).map(ps => ({
      ...ps,
      cats: { ...ps.cats }
    }));

    partnersMap.set(m.code, {
      code: m.code,
      name: m.name,
      city: m.city,
      tier: m.category,
      am: m.am,
      target_fy,
      target_original: existing?.target_original || target_fy,
      target_original_h1: existing?.target_original_h1 || target_h1,
      target_original_h2: existing?.target_original_h2 || target_h2,
      target_original_q1: existing?.target_original_q1 || Math.round(target_fy * 0.22),
      target_original_q2: existing?.target_original_q2 || Math.round(target_fy * 0.30),
      target_original_q3: existing?.target_original_q3 || Math.round(target_fy * 0.30),
      target_original_q4: existing?.target_original_q4 || Math.round(target_fy * 0.18),
      target_original_monthly: existing?.target_original_monthly ? [...existing.target_original_monthly] : Array(12).fill(0).map((_, i) => {
        if (i < 3) return Math.round(target_fy * 0.22 / 3);
        if (i < 6) return Math.round(target_fy * 0.10);
        if (i < 9) return Math.round(target_fy * 0.10);
        return Math.round(target_fy * 0.06);
      }),
      target_h1,
      target_h2,
      actual_fy: existing?.actual_fy || 0,
      actual_h1: existing?.actual_h1 || 0,
      actual_h2: existing?.actual_h2 || 0,
      actual_q1: existing?.actual_q1 || 0,
      actual_q2: existing?.actual_q2 || 0,
      actual_q3: existing?.actual_q3 || 0,
      actual_q4: existing?.actual_q4 || 0,
      mid_hi: existing?.mid_hi || 0,
      low_end: existing?.low_end || 0,
      tx_count: existing?.tx_count || 0,
      qty_total: existing?.qty_total || 0,
      cat_totals,
      monthly_total,
      monthly_by_cat,
      epp_sources,
      program_sources,
    });
  });

  // -------------------------------------------------------------
  // KASUS A: INPUT TRANSAKSI DETAIL (Template V1, V2, atau V3)
  // -------------------------------------------------------------
  if (v3Sheets.length > 0 || isV2 || isV1) {
    const targetSheets = v3Sheets.length > 0 ? v3Sheets : (isV2 ? v2Sheets : ['Sheet1']);
    const templateVer = v3Sheets.length > 0 ? 'V3 (Report Retail)' : (isV2 ? 'V2 (Partner Hub)' : 'V1 (Sheet1)');
    stats.templateVersion = templateVer;
    stats.sourceSheet = targetSheets.join(', ');

    const seenDedupKeys = new Set<string>();
    const previouslyVerifiedKeys = new Set(
      existingData?.meta?.verification_ledger_version === 3
        ? (existingData.verified_transaction_keys || [])
        : []
    );
    let inputDataRows = 0;

    for (const shName of targetSheets) {
      const ws = wb.Sheets[shName];
      if (!ws) continue;
      const aoa: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });
      if (!aoa || aoa.length < 2) continue;

      // Cari header row
      let headerRowIdx = -1;
      let colMap: Record<string, number> = {};

      for (let r = 0; r < Math.min(25, aoa.length); r++) {
        const row = aoa[r] || [];
        const normRow = row.map(cell => String(cell || '').trim().toLowerCase());
        if (normRow.includes('material code') || normRow.includes('invoice date') || normRow.includes('invoice no')) {
          headerRowIdx = r;
          row.forEach((colName, cIdx) => {
            const h = String(colName || '').trim();
            if (h) colMap[h.toLowerCase()] = cIdx;
          });
          break;
        }
      }

      if (headerRowIdx === -1) continue;

      const getCol = (names: string[]): number => {
        for (const n of names) {
          const idx = colMap[n.toLowerCase()];
          if (idx !== undefined) return idx;
        }
        return -1;
      };

      const cInvDate = getCol(['Invoice Date', 'inv date', 'date']);
      const cInvNo = getCol(['Invoice No', 'inv no', 'invoice_no']);
      const cEprCode = getCol(['T3 Partner code', 'EPR Code', 'epr_code', 'Reseller Code']);
      const cEprName = getCol(['Reseller Name', 'EPR Name', 'Customer Name', 'Dealer Name']);
      const cCity = getCol(['City', 'Reseller City', 'Area']);
      const cMatCode = getCol(['Material Code', 'Material', 'SKU', 'Product Code']);
      const cProdDesc = getCol(['Product', 'Description', 'Material Description']);
      const cQty = getCol(['Quantity', 'Qty']);
      const cUnitPrice = getCol(['Actual Unit Price', 'Reseller Price (IDR)', 'Price', 'New Price (IDR)']);
      const cNewPrice = getCol(['New Price (IDR)', 'New Price']);
      const cResellerPrice = getCol(['Reseller Price (IDR)', 'Reseller Price']);
      const cRecommendedPrice = getCol(['Recommended Price from EIN (IDR)', 'Recommended Price from EIN']);
      const cTotalPrice = getCol(['Actual Total Amount', 'Total Price', 'Total', 'Amount']);
      const cCategory = getCol(['Rebate product category', 'Product Rebate', 'Category', 'Kat']);
      const cUID = getCol(['UID']);
      const cSN = getCol(['SN', 'Serial Number']);
      const cEppName = getCol(['Dealer Name', 'EPP Name', 'Distributor Name', 'Distributor']);
      const cEppCode = getCol(['T2 Partner code', 'T2 Partner Code', 'EPP Code', 'Dealer ID', 'Dealer Code']);
      const cRemarks = getCol(['Remarks', 'Remaks']);
      const cProgramColumn = getCol(['Program']);
      // V1 menyimpan program di AD (Remarks), V2 di AL (Program).
      // Header-based lookup tetap dipakai agar kolom tambahan tidak menggeser mapping.
      const cProgram = templateVer.startsWith('V1')
        ? cRemarks
        : (cProgramColumn !== -1 ? cProgramColumn : cRemarks);

      for (let r = headerRowIdx + 1; r < aoa.length; r++) {
        const row = aoa[r];
        if (!row || row.length === 0) continue;

        const rawMat = String(cMatCode !== -1 ? row[cMatCode] || '' : '').trim();
        const rawDate = cInvDate !== -1 ? row[cInvDate] : '';
        if (!rawMat && !rawDate) continue;

        inputDataRows++;
        stats.totalInputRows++;

        const dDate = parseInvoiceDate(rawDate);
        if (!dDate) continue;

        const rawCode = String(cEprCode !== -1 ? row[cEprCode] || '' : '').trim();
        const rawName = String(cEprName !== -1 ? row[cEprName] || '' : '').trim();
        const rawCity = String(cCity !== -1 ? row[cCity] || '' : '').trim();

        // 1. Verifikasi kode EPR terdaftar
        const resolvedCode = resolveEprCode(rawCode, rawName, rawCity);
        if (!resolvedCode) {
          stats.outsideMasterCount++;
          stats.rejectedRows.push({
            rowNum: r + 1,
            file: fileName,
            reason: 'LUAR DATABASE EPR',
            code: rawCode,
            name: rawName,
            rawText: `Kota: ${rawCity || '-'} | Material: ${rawMat}`
          });
          continue;
        }

        const normalizedMaterial = rawMat.toUpperCase();
        const hasSkuDatabase = Object.keys(skuDatabase).length > 0;
        const skuInfo = skuDatabase[normalizedMaterial];
        const rawEppCode = String(cEppCode !== -1 ? row[cEppCode] || '' : '').trim();
        const rawEppName = String(cEppName !== -1 ? row[cEppName] || '' : '').trim();
        const rawProgram = String(cProgram !== -1 ? row[cProgram] || '' : '').trim() || 'Reguler (Tanpa Program)';
        const rawQty = parseFloat(String(cQty !== -1 ? row[cQty] || 0 : 0).replace(/,/g, '')) || 0;
        const rawDesc = String(cProdDesc !== -1 ? row[cProdDesc] || '' : '').trim();
        const invoiceDateForUpload = formatInvoiceDate(dDate);
        const addRejectedProgramItem = (reason: string, category = '') => {
          rejectedProgramItems.push({
            epr: resolvedCode,
            prog: 'Tidak dihitung',
            source_prog: rawProgram,
            date: invoiceDateForUpload,
            model: rawMat,
            desc: rawDesc,
            kat: category || String(row[cCategory] || '').trim() || 'Tidak diketahui',
            epp: rawEppCode,
            epp_name: rawEppName,
            eim: rawEppName,
            qty: rawQty,
            net: 0,
            tx: 0,
            counted: false,
            upload_status: 'Tidak dihitung',
            reject_reason: reason,
          });
        };
        if (hasSkuDatabase && !skuInfo) {
          stats.outsideSkuCount++;
          addRejectedProgramItem('LUAR DATABASE SKU');
          stats.rejectedRows.push({
            rowNum: r + 1,
            file: fileName,
            reason: 'LUAR DATABASE SKU',
            code: resolvedCode,
            name: rawName,
            rawText: `Material: ${rawMat}`
          });
          continue;
        }

        const invNo = String(cInvNo !== -1 ? row[cInvNo] || '' : '').trim();
        const qty = parseFloat(String(cQty !== -1 ? row[cQty] || 0 : 0).replace(/,/g, '')) || 0;
        const parseAmount = (value: any): number | null => {
          const raw = String(value ?? '').trim();
          if (!raw) return null;
          const negative = /^\(.*\)$/.test(raw);
          const parsed = Number(raw.replace(/[(),]/g, ''));
          if (!Number.isFinite(parsed)) return null;
          return negative ? -parsed : parsed;
        };
        let unitPrice = parseAmount(cUnitPrice !== -1 ? row[cUnitPrice] : null) ?? 0;

        // Result per Q: Y (New Price) harus memakai harga termurah V/W.
        // Jika formula Y belum dihitung oleh Excel, hitung ulang dari V dan W.
        if (cNewPrice !== -1 || (cResellerPrice !== -1 && cRecommendedPrice !== -1)) {
          const newPrice = parseAmount(cNewPrice !== -1 ? row[cNewPrice] : null);
          const resellerPrice = parseAmount(cResellerPrice !== -1 ? row[cResellerPrice] : null);
          const recommendedPrice = parseAmount(cRecommendedPrice !== -1 ? row[cRecommendedPrice] : null);
          unitPrice = newPrice != null && newPrice > 0
            ? newPrice
            : Math.min(...[resellerPrice, recommendedPrice].filter((v): v is number => v != null));
          if (!Number.isFinite(unitPrice)) unitPrice = newPrice ?? resellerPrice ?? recommendedPrice ?? 0;
        }
        const databasePrice = Number(priceDatabase[rawMat.toUpperCase()] || 0);
        if (templateVer.startsWith('V1') || templateVer.startsWith('V2')) {
          const validUnitPrices = [unitPrice, databasePrice].filter((value) => Number.isFinite(value) && value > 0);
          if (validUnitPrices.length > 0) unitPrice = Math.min(...validUnitPrices);
        }
        let totalPrice = templateVer.startsWith('V1') || templateVer.startsWith('V2')
          ? qty * unitPrice
          : parseFloat(String(cTotalPrice !== -1 ? row[cTotalPrice] || 0 : 0).replace(/,/g, '')) || (qty * unitPrice);

        // Template V1 dan V2 memakai harga gross final lalu exclude PPN 11%.
        if (templateVer.startsWith('V1') || templateVer.startsWith('V2')) {
          totalPrice = totalPrice / 1.11;
          unitPrice = unitPrice / 1.11;
        }

        const rawCat = cCategory !== -1 ? String(row[cCategory] || '') : '';
        const rebateCategory = parseKategori(String(skuInfo?.productRebate || ''));
        const skuTier = String(skuInfo?.categoryProduct || '').trim().toLowerCase();
        const cat = parseKategori(rawCat)
          || rebateCategory
          || (skuTier === 'low end' || skuTier === 'mid high' ? 'Consumer' : '');
        if (!cat) {
          stats.excludedCategoryCount++;
          addRejectedProgramItem('KATEGORI TIDAK DIHITUNG', rawCat);
          stats.rejectedRows.push({
            rowNum: r + 1,
            file: fileName,
            reason: 'KATEGORI TIDAK DIHITUNG',
            code: resolvedCode,
            name: rawName,
            rawText: `Material: ${rawMat} | Tipe: ${skuInfo?.description || '-'} | Kategori: ${rawCat || '-'}`
          });
          continue;
        }

        const uid = cUID !== -1 ? String(row[cUID] || '') : '';
        const sn = cSN !== -1 ? String(row[cSN] || '') : '';

        // 2. Filter data double / kembar (Deduplikasi make_key)
        const invoiceDate = formatInvoiceDate(dDate);
        const eppCode = rawEppCode;
        const dedupKey = makeDeduplicationKey(
          resolvedCode,
          invNo,
          rawMat,
          qty,
          unitPrice,
          uid,
          sn,
          invoiceDate,
          fileName,
          r + 1,
          totalPrice,
          eppCode
        );

        // Bandingkan dengan seluruh transaksi yang pernah lolos pada upload
        // sebelumnya, bukan hanya dengan agregat total per EPR.
        if (previouslyVerifiedKeys.has(dedupKey)) {
          stats.duplicateCount++;
          stats.alreadyVerifiedCount++;
          stats.rejectedRows.push({
            rowNum: r + 1,
            file: fileName,
            reason: 'SUDAH TERVERIFIKASI',
            code: resolvedCode,
            name: rawName,
            rawText: `Inv: ${invNo || '-'} | Tanggal: ${invoiceDate} | Material: ${rawMat} | Qty: ${qty}`
          });
          addRejectedProgramItem('SUDAH TERVERIFIKASI', cat);
          continue;
        }

        if (seenDedupKeys.has(dedupKey)) {
          stats.duplicateCount++;
          stats.duplicateInInputCount++;
          stats.rejectedRows.push({
            rowNum: r + 1,
            file: fileName,
            reason: 'KEMBAR DALAM INPUT',
            code: resolvedCode,
            name: rawName,
            rawText: `Inv: ${invNo || '-'} | Material: ${rawMat} | Qty: ${qty}`
          });
          addRejectedProgramItem('KEMBAR DALAM INPUT', cat);
          continue;
        }
        seenDedupKeys.add(dedupKey);
        acceptedTransactionKeysForData.add(dedupKey);

        // 3. Lolos verifikasi
        stats.verifiedCount++;
        stats.totalVerifiedAmount += totalPrice;

        const p = partnersMap.get(resolvedCode);
        if (!p) continue;

        const mIdx = getFiscalMonthIndex(dDate); // 0..11
        if (mIdx < 0 || mIdx > 11) continue;

        const programName = rawProgram;

        // Update nilai akumulasi partner
        p.monthly_total[mIdx] = (p.monthly_total[mIdx] || 0) + totalPrice;
        p.monthly_by_cat[cat][mIdx] = (p.monthly_by_cat[cat][mIdx] || 0) + totalPrice;
        p.cat_totals[cat] = (p.cat_totals[cat] || 0) + totalPrice;
        p.tx_count += 1;
        p.qty_total += qty;

        // Hitung ulang kuartal, semester, dan FY dari akumulasi total bulanan
        p.actual_q1 = p.monthly_total.slice(0, 3).reduce((a, b) => a + b, 0);
        p.actual_q2 = p.monthly_total.slice(3, 6).reduce((a, b) => a + b, 0);
        p.actual_q3 = p.monthly_total.slice(6, 9).reduce((a, b) => a + b, 0);
        p.actual_q4 = p.monthly_total.slice(9, 12).reduce((a, b) => a + b, 0);
        p.actual_h1 = p.actual_q1 + p.actual_q2;
        p.actual_h2 = p.actual_q3 + p.actual_q4;
        p.actual_fy = p.actual_h1 + p.actual_h2;

        // Catat EPP Supplier
        const eppName = String(cEppName !== -1 ? row[cEppName] || '' : '').trim();
        if (eppName || eppCode) {
          let srcItem = p.epp_sources.find(s => s.code === eppCode || s.name === eppName);
          if (!srcItem) {
            srcItem = {
              code: eppCode || 'EPP-0000',
              name: eppName || 'EPP Lokal',
              city: 'JATENG',
              total: 0,
              tx: 0,
              cats: { Consumer: 0, Scanner: 0, Consumables: 0, Dotmatrix: 0 }
            };
            p.epp_sources.push(srcItem);
          }
          srcItem.total += totalPrice;
          srcItem.tx += 1;
          srcItem.cats[cat] = (srcItem.cats[cat] || 0) + totalPrice;
        }

        // Catat program berjalan dari kolom Remarks (V1/AD) atau Program
        // (V2/AL) pada transaksi yang sudah lolos verifikasi.
        let programSource = p.program_sources.find(src => src.name === programName);
        if (!programSource) {
          programSource = {
            name: programName,
            total: 0,
            tx: 0,
            qty: 0,
            cats: { Consumer: 0, Scanner: 0, Consumables: 0, Dotmatrix: 0 }
          };
          p.program_sources.push(programSource);
        }
        programSource.total += totalPrice;
        programSource.tx += 1;
        programSource.qty += qty;
        programSource.cats[cat] = (programSource.cats[cat] || 0) + totalPrice;

        acceptedProgramItems.push({
          epr: resolvedCode,
          prog: programName,
          date: invoiceDate,
          model: rawMat,
          desc: String(cProdDesc !== -1 ? row[cProdDesc] || '' : '').trim(),
          kat: cat,
          epp: eppCode,
          epp_name: eppName,
          eim: eppName,
          qty,
          net: totalPrice,
          tx: 1,
          counted: true,
          upload_status: 'Terhitung',
          reject_reason: '',
        });
      }
    }

    if (inputDataRows === 0) {
      throw new Error(`${templateVer} kosong: tidak ada baris data transaksi yang dapat diproses.`);
    }
  }
  // -------------------------------------------------------------
  // KASUS B: INPUT MATRIX RINGKASAN RETAIL
  // -------------------------------------------------------------
  else if (isRetailSummary) {
    const shName = sheetNames.find(s => s.toUpperCase().includes('RETAIL')) || sheetNames[0];
    stats.templateVersion = 'RETAIL (Summary Matrix)';
    stats.sourceSheet = shName;

    const ws = wb.Sheets[shName];
    const aoa: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });
    const seenCodes = new Set<string>();

    const CATS: Array<'Consumer' | 'Scanner' | 'Consumables' | 'Dotmatrix'> = ['Consumer', 'Scanner', 'Consumables', 'Dotmatrix'];

    // Posisi kolom berbeda antar versi template RETAIL. Baca berdasarkan header,
    // bukan angka kolom tetap, agar Result Template terbaru tetap kompatibel.
    const normCell = (value: any) => String(value ?? '').trim().toLowerCase();
    const parseMatrixNumber = (value: any): number => {
      const raw = String(value ?? '').trim();
      if (!raw || raw === '-' || raw === '—') return 0;
      const negative = /^\(.*\)$/.test(raw);
      const parsed = Number(raw.replace(/[(),]/g, ''));
      if (!Number.isFinite(parsed)) return 0;
      return negative ? -parsed : parsed;
    };
    const eprHeaderRow = aoa.findIndex(row => (row || []).some(cell => normCell(cell) === 'epr code'));
    const matrixHeaderRow = aoa.findIndex((row, index) =>
      index > eprHeaderRow && (row || []).some(cell => normCell(cell) === 'category')
    );
    const eprHeader = eprHeaderRow >= 0 ? aoa[eprHeaderRow] : [];
    const matrixHeader = matrixHeaderRow >= 0 ? aoa[matrixHeaderRow] : [];
    const codeCol = eprHeader.findIndex(cell => normCell(cell) === 'epr code');
    const nameCol = eprHeader.findIndex(cell => normCell(cell) === 'epr name');
    const categoryCol = matrixHeader.findIndex(cell => normCell(cell) === 'category');
    const targetCol = matrixHeader.findIndex(cell => normCell(cell) === 'y target');
    const revenueStart = categoryCol >= 0 ? categoryCol + 3 : 10;
    const firstTotalCol = matrixHeader.findIndex((cell, index) =>
      index >= revenueStart && normCell(cell) === 'total'
    );
    const blockWidth = firstTotalCol > revenueStart ? firstTotalCol - revenueStart + 1 : 13;
    const monthCount = Math.max(1, blockWidth - 1);
    const starts = CATS.map((_, index) => revenueStart + index * blockWidth);

    for (let r = Math.max(matrixHeaderRow + 1, eprHeaderRow + 2, 0); r < aoa.length; r++) {
      const row = aoa[r];
      if (!row || codeCol < 0 || !String(row[codeCol] ?? '').trim()) continue;

      const code = String(row[codeCol]).trim().toUpperCase();
      if (!code.startsWith('EPR-')) continue;

      stats.totalInputRows++;

      if (seenCodes.has(code)) {
        stats.duplicateCount++;
        stats.rejectedRows.push({
          rowNum: r + 1,
          file: fileName,
          reason: 'KEMBAR DALAM INPUT',
          code,
          name: String(nameCol >= 0 ? row[nameCol] || '' : ''),
          rawText: `Baris duplikat kode ${code}`
        });
        continue;
      }
      seenCodes.add(code);

      const p = partnersMap.get(code);
      if (!p) {
        stats.outsideMasterCount++;
        stats.rejectedRows.push({
          rowNum: r + 1,
          file: fileName,
          reason: 'LUAR DATABASE EPR',
          code,
          name: String(nameCol >= 0 ? row[nameCol] || '' : ''),
          rawText: 'Kode tidak terdaftar di 24 EPR master ARIS'
        });
        continue;
      }

      stats.verifiedCount++;

      const target_fy = parseMatrixNumber(targetCol >= 0 ? row[targetCol] : 0) || p.target_fy;
      p.target_fy = target_fy;
      p.target_original = target_fy;
      p.target_h1 = Math.round(target_fy * 0.52);
      p.target_h2 = Math.round(target_fy * 0.48);

      CATS.forEach(c => {
        const f0 = starts[c];
        const arr: number[] = [];
        for (let m = 0; m < 12; m++) {
          arr.push(m < monthCount ? parseMatrixNumber(row[f0 + m]) : 0);
        }
        p.monthly_by_cat[c] = arr;
        p.cat_totals[c] = arr.reduce((a, b) => a + b, 0);
      });

      p.monthly_total = Array.from({ length: 12 }, (_, m) =>
        CATS.reduce((s, c) => s + (p.monthly_by_cat[c]?.[m] || 0), 0)
      );

      p.actual_q1 = p.monthly_total.slice(0, 3).reduce((a, b) => a + b, 0);
      p.actual_q2 = p.monthly_total.slice(3, 6).reduce((a, b) => a + b, 0);
      p.actual_q3 = p.monthly_total.slice(6, 9).reduce((a, b) => a + b, 0);
      p.actual_q4 = p.monthly_total.slice(9, 12).reduce((a, b) => a + b, 0);
      p.actual_h1 = p.actual_q1 + p.actual_q2;
      p.actual_h2 = p.actual_q3 + p.actual_q4;
      p.actual_fy = p.actual_h1 + p.actual_h2;
      p.mid_hi = p.mid_hi || 0;
      p.low_end = Math.max(0, p.actual_fy - p.mid_hi);

      stats.totalVerifiedAmount += p.actual_fy;
    }

    if (stats.totalInputRows === 0) {
      throw new Error('Template RETAIL kosong: tidak ada baris EPR yang dapat diproses.');
    }
  } else {
    throw new Error('Format file Excel tidak dikenali. Pastikan file menggunakan template V1 (Sheet1), V2 (Partner Hub), V3 (Report Retail Q*), atau RETAIL.');
  }

  const updatedPartners = Array.from(partnersMap.values());

  const updatedData: EprFullData = {
    ...(existingData || ({} as any)),
    partners: updatedPartners,
    program_items: [
      ...(existingData?.program_items || []),
      ...acceptedProgramItems,
      ...rejectedProgramItems,
    ],
    verified_transaction_keys: Array.from(new Set([
      ...(existingData?.verified_transaction_keys || []),
      ...acceptedTransactionKeysForData,
    ])),
    meta: {
      ...(existingData?.meta || ({} as any)),
      verification_ledger_version: 3,
      last_updated: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
      last_source_file: fileName,
    }
  };

  return { updatedData, stats };
}
