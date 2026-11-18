/**
 * epr_engine.ts
 * Adopsi penuh mesin verifikasi & deduplikasi dari ariswidodo/EPR
 * Mendukung template:
 * - V1: Sheet1 (Gross price, dibagi 1,11 exclude PPN 11%)
 * - V2: Partner Hub (Gross price, dibagi 1,11 exclude PPN 11%)
 * - V3: Report Retail Q1/Q2/Q3/Q4 (Net price, Product Rebate di kolom U, Total Price di kolom Z)
 * - RETAIL: Sheet ringkasan target & bulanan
 */

import * as XLSX from 'xlsx';
import { PartnerData, EprFullData, EppSource } from '../types-pbi';

// Master 24 Toko EPR Area ARIS (Jawa Tengah)
export const EPR_MASTER = [
  { code: 'EPR-0038', name: 'SINAR JAYA COMPUTER / CV PINDITECH MAJU ABADI', city: 'KUDUS', category: 'MOON', am: 'ARIS', target_excl: 1500000000, target_original: 2149300000 },
  { code: 'EPR-0054', name: 'PT HETERO NIAGA GLOBAL', city: 'SEMARANG', category: 'SUN', am: 'ARIS', target_excl: 6000000000, target_original: 7164340000 },
  { code: 'EPR-0267', name: 'PT HARRISMA PRATAMAJAYA', city: 'SURAKARTA', category: 'SUN', am: 'ARIS', target_excl: 6000000000, target_original: 6447900000 },
  { code: 'EPR-0650', name: 'CV RAJA PRINT SOLUTION', city: 'SEMARANG', category: 'STAR', am: 'ARIS', target_excl: 4000000000, target_original: 4298600000 },
  { code: 'EPR-0733', name: 'MICRO PRINTER', city: 'SEMARANG', category: 'MOON', am: 'ARIS', target_excl: 1500000000, target_original: 1791080000 },
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
  outsideMasterCount: number;
  totalVerifiedAmount: number;
  templateVersion: string;
  sourceSheet: string;
  rejectedRows: Array<{
    rowNum: number;
    file: string;
    reason: 'KEMBAR DALAM INPUT' | 'SUDAH TERVERIFIKASI' | 'LUAR DATABASE EPR';
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
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;

  const s = String(val).trim();
  if (!s) return null;

  // Cek apakah serial Excel (angka 5 digit sekitar 45000-47000)
  if (/^\d{5}(\.0+)?$/.test(s)) {
    const serial = parseFloat(s);
    // Excel epoch: 1899-12-30
    const d = new Date(Math.round((serial - 25569) * 86400 * 1000));
    return isNaN(d.getTime()) ? null : d;
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

// Resolver Toko EPR dari kode & kota sesuai epr_build.py
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
  rowNum?: number
): string {
  if (invNo) {
    return [code, invNo.trim().toUpperCase(), (matCode || '').toUpperCase(), String(qty), String(price)].join('|');
  }
  if (uid) {
    return 'UID|' + uid.trim();
  }
  if (sn) {
    return ['SN', code, (matCode || '').toUpperCase(), sn.trim().toUpperCase()].join('|');
  }
  return ['V3', code, invDate || '', (matCode || '').toUpperCase(), String(qty), String(price), fileName || '', String(rowNum || 0)].join('|');
}

/**
 * Mesin Proses Upload Utama (Full Engine Parser)
 * Mendukung template V1, V2, V3 (Report Retail Q*), dan RETAIL
 */
export function processUploadedWorkbook(
  wb: XLSX.WorkBook,
  fileName: string,
  existingData: EprFullData | null
): { updatedData: EprFullData; stats: VerificationStats } {
  const sheetNames = wb.SheetNames;

  // 1. Cek apakah ini template V3: sheet diawali "Report Retail Q"
  const v3Sheets = sheetNames.filter(s => s.trim().startsWith('Report Retail Q'));
  // 2. Cek apakah template V2: sheet "Partner Hub"
  const isV2 = sheetNames.includes('Partner Hub');
  // 3. Cek apakah template V1: sheet "Sheet1"
  const isV1 = sheetNames.includes('Sheet1');
  // 4. Cek apakah sheet ringkasan "RETAIL"
  const isRetailSummary = sheetNames.some(s => s.toUpperCase().includes('RETAIL'));

  const stats: VerificationStats = {
    totalInputRows: 0,
    verifiedCount: 0,
    duplicateCount: 0,
    outsideMasterCount: 0,
    totalVerifiedAmount: 0,
    templateVersion: 'V3',
    sourceSheet: '',
    rejectedRows: []
  };

  // Buat copy partners dari master
  const partnersMap = new Map<string, PartnerData>();
  EPR_MASTER.forEach(m => {
    const existing = existingData?.partners?.find(p => p.code === m.code);
    const target_fy = m.target_original || m.target_excl;
    const target_h1 = Math.round(target_fy * 0.52);
    const target_h2 = Math.round(target_fy * 0.48);

    partnersMap.set(m.code, {
      code: m.code,
      name: m.name,
      city: m.city,
      tier: m.category,
      am: m.am,
      target_fy,
      target_original: target_fy,
      target_original_h1: target_h1,
      target_original_h2: target_h2,
      target_original_q1: Math.round(target_fy * 0.22),
      target_original_q2: Math.round(target_fy * 0.30),
      target_original_q3: Math.round(target_fy * 0.30),
      target_original_q4: Math.round(target_fy * 0.18),
      target_original_monthly: Array(12).fill(0).map((_, i) => {
        if (i < 3) return Math.round(target_fy * 0.22 / 3);
        if (i < 6) return Math.round(target_fy * 0.10);
        if (i < 9) return Math.round(target_fy * 0.10);
        return Math.round(target_fy * 0.06);
      }),
      target_h1,
      target_h2,
      actual_fy: 0,
      actual_h1: 0,
      actual_h2: 0,
      actual_q1: 0,
      actual_q2: 0,
      actual_q3: 0,
      actual_q4: 0,
      mid_hi: 0,
      low_end: 0,
      tx_count: 0,
      qty_total: 0,
      cat_totals: { Consumer: 0, Scanner: 0, Consumables: 0, Dotmatrix: 0 },
      monthly_total: Array(12).fill(0),
      monthly_by_cat: {
        Consumer: Array(12).fill(0),
        Scanner: Array(12).fill(0),
        Consumables: Array(12).fill(0),
        Dotmatrix: Array(12).fill(0),
      },
      epp_sources: existing?.epp_sources || [],
      program_sources: existing?.program_sources || [],
    });
  });

  // -------------------------------------------------------------
  // KASUS A: INPUT TRANSAKSI DETAIL (Template V1, V2, atau V3)
  // -------------------------------------------------------------
  if (v3Sheets.length > 0 || isV2 || isV1) {
    const targetSheets = v3Sheets.length > 0 ? v3Sheets : (isV2 ? ['Partner Hub'] : ['Sheet1']);
    const templateVer = v3Sheets.length > 0 ? 'V3 (Report Retail)' : (isV2 ? 'V2 (Partner Hub)' : 'V1 (Sheet1)');
    stats.templateVersion = templateVer;
    stats.sourceSheet = targetSheets.join(', ');

    const seenDedupKeys = new Set<string>();

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
      const cTotalPrice = getCol(['Actual Total Amount', 'Total Price', 'Total', 'Amount']);
      const cCategory = getCol(['Rebate product category', 'Product Rebate', 'Category', 'Kat']);
      const cUID = getCol(['UID']);
      const cSN = getCol(['SN', 'Serial Number']);
      const cEppName = getCol(['Dealer Name', 'EPP Name', 'Distributor']);
      const cEppCode = getCol(['T2 Partner code', 'EPP Code']);

      for (let r = headerRowIdx + 1; r < aoa.length; r++) {
        const row = aoa[r];
        if (!row || row.length === 0) continue;

        const rawMat = String(cMatCode !== -1 ? row[cMatCode] || '' : '').trim();
        const rawDate = cInvDate !== -1 ? row[cInvDate] : '';
        if (!rawMat && !rawDate) continue;

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

        const invNo = String(cInvNo !== -1 ? row[cInvNo] || '' : '').trim();
        const qty = parseFloat(String(cQty !== -1 ? row[cQty] || 0 : 0).replace(/,/g, '')) || 0;
        let unitPrice = parseFloat(String(cUnitPrice !== -1 ? row[cUnitPrice] || 0 : 0).replace(/,/g, '')) || 0;
        let totalPrice = parseFloat(String(cTotalPrice !== -1 ? row[cTotalPrice] || 0 : 0).replace(/,/g, '')) || (qty * unitPrice);

        // Jika Template V1 atau V2: nilai masih gross -> dibagi 1,11 exclude PPN 11%
        if (templateVer.startsWith('V1') || templateVer.startsWith('V2')) {
          totalPrice = totalPrice / 1.11;
          unitPrice = unitPrice / 1.11;
        }

        const uid = cUID !== -1 ? String(row[cUID] || '') : '';
        const sn = cSN !== -1 ? String(row[cSN] || '') : '';

        // 2. Filter data double / kembar (Deduplikasi make_key)
        const dedupKey = makeDeduplicationKey(resolvedCode, invNo, rawMat, qty, unitPrice, uid, sn, dDate.toISOString().slice(0, 10), fileName, r + 1);

        if (seenDedupKeys.has(dedupKey)) {
          stats.duplicateCount++;
          stats.rejectedRows.push({
            rowNum: r + 1,
            file: fileName,
            reason: 'KEMBAR DALAM INPUT',
            code: resolvedCode,
            name: rawName,
            rawText: `Inv: ${invNo || '-'} | Material: ${rawMat} | Qty: ${qty}`
          });
          continue;
        }
        seenDedupKeys.add(dedupKey);

        // 3. Lolos verifikasi
        stats.verifiedCount++;
        stats.totalVerifiedAmount += totalPrice;

        const p = partnersMap.get(resolvedCode);
        if (!p) continue;

        const mIdx = getFiscalMonthIndex(dDate); // 0..11
        if (mIdx < 0 || mIdx > 11) continue;

        const rawCat = cCategory !== -1 ? String(row[cCategory] || '') : '';
        let cat = parseKategori(rawCat) || 'Consumer';

        // Update nilai akumulasi partner
        p.monthly_total[mIdx] = (p.monthly_total[mIdx] || 0) + totalPrice;
        p.monthly_by_cat[cat][mIdx] = (p.monthly_by_cat[cat][mIdx] || 0) + totalPrice;
        p.cat_totals[cat] = (p.cat_totals[cat] || 0) + totalPrice;
        p.actual_fy += totalPrice;
        p.tx_count += 1;
        p.qty_total += qty;

        // Distribusi kuartal
        if (mIdx < 3) p.actual_q1 += totalPrice;
        else if (mIdx < 6) p.actual_q2 += totalPrice;
        else if (mIdx < 9) p.actual_q3 += totalPrice;
        else p.actual_q4 += totalPrice;

        p.actual_h1 = p.actual_q1 + p.actual_q2;
        p.actual_h2 = p.actual_q3 + p.actual_q4;

        // Catat EPP Supplier
        const eppName = String(cEppName !== -1 ? row[cEppName] || '' : '').trim();
        const eppCode = String(cEppCode !== -1 ? row[cEppCode] || '' : '').trim();
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
      }
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

    const starts = { Consumer: 13, Scanner: 26, Consumables: 39, Dotmatrix: 52 };
    const CATS: Array<'Consumer' | 'Scanner' | 'Consumables' | 'Dotmatrix'> = ['Consumer', 'Scanner', 'Consumables', 'Dotmatrix'];

    for (let r = 16; r < aoa.length; r++) {
      const row = aoa[r];
      if (!row || !row[1]) continue;

      const code = String(row[1]).trim().toUpperCase();
      if (!code.startsWith('EPR-')) continue;

      stats.totalInputRows++;

      if (seenCodes.has(code)) {
        stats.duplicateCount++;
        stats.rejectedRows.push({
          rowNum: r + 1,
          file: fileName,
          reason: 'KEMBAR DALAM INPUT',
          code,
          name: String(row[2] || ''),
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
          name: String(row[2] || ''),
          rawText: 'Kode tidak terdaftar di 24 toko master ARIS'
        });
        continue;
      }

      stats.verifiedCount++;

      const target_fy = Number(row[10] || p.target_fy);
      p.target_fy = target_fy;
      p.target_original = target_fy;
      p.target_h1 = Math.round(target_fy * 0.52);
      p.target_h2 = Math.round(target_fy * 0.48);

      CATS.forEach(c => {
        const f0 = starts[c];
        const arr: number[] = [];
        for (let m = 0; m < 12; m++) {
          arr.push(Number(row[f0 + m] || 0));
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
      p.mid_hi = Number(row[71] || 0);
      p.low_end = Math.max(0, p.actual_fy - p.mid_hi);

      stats.totalVerifiedAmount += p.actual_fy;
    }
  } else {
    throw new Error('Format file Excel tidak dikenali. Pastikan file menggunakan template V1 (Sheet1), V2 (Partner Hub), V3 (Report Retail Q*), atau RETAIL.');
  }

  const updatedPartners = Array.from(partnersMap.values());

  const updatedData: EprFullData = {
    ...(existingData || ({} as any)),
    partners: updatedPartners,
    meta: {
      ...(existingData?.meta || ({} as any)),
      last_updated: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
      last_source_file: fileName,
    }
  };

  return { updatedData, stats };
}
