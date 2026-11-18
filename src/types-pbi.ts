export interface EppSource {
  code: string;
  name: string;
  city: string;
  total: number;
  tx: number;
  cats: Record<string, number>;
}

export interface ProgramSource {
  name: string;
  total: number;
  tx: number;
  qty: number;
  cats: Record<string, number>;
}

export interface PartnerData {
  code: string;
  name: string;
  city: string;
  tier: string;
  am: string;
  target_fy: number;
  target_original: number;
  target_original_h1: number;
  target_original_h2: number;
  target_original_q1: number;
  target_original_q2: number;
  target_original_q3: number;
  target_original_q4: number;
  target_original_monthly: number[];
  target_h1: number;
  target_h2: number;
  actual_fy: number;
  actual_h1: number;
  actual_h2: number;
  actual_q1: number;
  actual_q2: number;
  actual_q3: number;
  actual_q4: number;
  mid_hi: number;
  low_end: number;
  tx_count: number;
  qty_total: number;
  cat_totals: {
    Consumer: number;
    Scanner: number;
    Consumables: number;
    Dotmatrix: number;
  };
  monthly_total: number[];
  monthly_by_cat: {
    Consumer: number[];
    Scanner: number[];
    Consumables: number[];
    Dotmatrix: number[];
  };
  epp_sources: EppSource[];
  program_sources: ProgramSource[];
}

export interface ProgramPartner {
  code: string;
  name: string;
  city: string;
  am: string;
  package_type: string;
  tier: string;
  low_end_target?: number;
  low_end_actual?: number;
  mid_hi_target?: number;
  mid_hi_actual?: number;
  ink_target?: number;
  ink_actual?: number;
  others_target?: number;
  others_actual?: number;
  reward?: number;
  status?: string;
  [key: string]: any;
}

export interface EppSummaryItem {
  code: string;
  name: string;
  city: string;
  total: number;
  tx_count: number;
  partner_count: number;
  cats: Record<string, number>;
}

export interface EprFullData {
  meta?: {
    last_updated?: string;
    focus_period?: string;
    total_partners?: number;
    [key: string]: any;
  };
  audit?: {
    verified_tx?: number;
    rejected_tx?: number;
    total_revenue?: number;
    [key: string]: any;
  };
  epp_summary?: EppSummaryItem[];
  program_items?: any[];
  program_partners?: ProgramPartner[];
  partners: PartnerData[];
}
