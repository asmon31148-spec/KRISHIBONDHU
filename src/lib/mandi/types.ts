export interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  price_per_kg: number;
  price_per_50kg: number;
  trend: 'up' | 'down' | 'stable';
  is_today: boolean;
}

// Standard Bengal commodities mapping
export const BENGAL_COMMODITIES = [
  { id: 'all', name_en: 'All Commodities', name_bn: 'সকল ফসল', name_hi: 'सभी फसलें' },
  { id: 'Paddy(Dhan)', name_en: 'Paddy (Dhan)', name_bn: 'ধান (আমন/বোরো)', name_hi: 'धान (चावल)' },
  { id: 'Potato', name_en: 'Potato', name_bn: 'আলু (জ্যোতি/পোখরাজ)', name_hi: 'आलू' },
  { id: 'Jute', name_en: 'Raw Jute', name_bn: 'কাঁচা পাট (তোষা)', name_hi: 'कच्चा जूट' },
  { id: 'Mustard', name_en: 'Mustard', name_bn: 'সরিষা', name_hi: 'सरसों' },
  { id: 'Brinjal', name_en: 'Brinjal (Eggplant)', name_bn: 'বেগুন', name_hi: 'बैंगन' },
  { id: 'Tomato', name_en: 'Tomato', name_bn: 'টমেটো', name_hi: 'टमाटर' },
  { id: 'Onion', name_en: 'Onion', name_bn: 'পেঁয়াজ', name_hi: 'प्याज' },
  { id: 'Chilli', name_en: 'Green Chilli', name_bn: 'কাঁচা লঙ্কা', name_hi: 'हरी मिर्च' },
];

export const BENGAL_DISTRICTS = [
  'All Districts',
  'Burdwan',
  'Hooghly',
  'Nadia',
  'Bankura',
  'Murshidabad',
  'South 24 Parganas',
  'North 24 Parganas',
  'Malda',
  'Birbhum',
  'Purba Medinipur',
  'Paschim Medinipur',
  'Jalpaiguri',
  'Coochbehar',
  'Uttar Dinajpur',
  'Dakshin Dinajpur',
];
