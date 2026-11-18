export interface EprStore {
  id: string;
  epr_code: string;
  epr_name: string;
  city: string;
  category: 'SUN' | 'STAR' | 'MOON' | 'EARTH' | 'CRESCENT' | string;
  username: string;
  original_target: number;
  target_inc_tax: number;
  category_target: number;
  target_h1: number;
  target_h2: number;
  target_monthly: number;
  am: string;
  user_id?: string;
  created_at?: string;
}

export interface EppStore {
  id: string;
  epp_code: string;
  epp_name: string;
  company_name: string;
  territory: string;
  area: string;
  city: string;
  area_type: string;
  username: string;
  user_id?: string;
  created_at?: string;
}

export interface SalesRecord {
  id: string;
  store_id: string;
  month: number;
  year: number;
  achievement_amount: number;
  notes?: string;
  updated_at?: string;
}
