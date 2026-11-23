import { MandiRecord } from './types';

// In-memory or session price memory for modal trend calculations
const modalPriceMemory: Record<string, { lastModal: number; date: string }> = {};

export function parseAndFilterMandiRecords(
  rawRecords: Record<string, any>[],
  districtParam: string = 'All Districts',
  commodityParam: string = 'all'
): {
  records: MandiRecord[];
  latestDateFound: string | null;
  totalRaw: number;
} {
  let latestDateFound: string | null = null;

  // Find latest trade date
  for (const r of rawRecords) {
    const arr = String(r.arrival_date || r.Arrival_Date || '');
    if (arr && (!latestDateFound || arr > latestDateFound)) {
      latestDateFound = arr;
    }
  }

  // Today's formatted date string (DD/MM/YYYY)
  const todayStr = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  // Filter raw records by commodity and district with smart regional matching
  const filteredRaw = rawRecords.filter((r) => {
    // Commodity filter
    if (commodityParam && commodityParam !== 'all') {
      const commLower = String(r.commodity || '').toLowerCase();
      const target = commodityParam.toLowerCase();

      if (target === 'jute') {
        if (!commLower.includes('jute')) return false;
      } else if (target === 'mustard') {
        if (!commLower.includes('mustard')) return false;
      } else if (target.includes('paddy') || target.includes('dhan')) {
        if (!commLower.includes('paddy') && !commLower.includes('rice')) return false;
      } else if (target === 'chilli') {
        if (!commLower.includes('chilli')) return false;
      } else if (target === 'potato') {
        if (!commLower.includes('potato')) return false;
      } else if (target === 'brinjal') {
        if (!commLower.includes('brinjal')) return false;
      } else if (target === 'tomato') {
        if (!commLower.includes('tomato')) return false;
      } else if (target === 'onion') {
        if (!commLower.includes('onion')) return false;
      } else {
        if (!commLower.includes(target) && !target.includes(commLower)) return false;
      }
    }

    // District filter
    if (districtParam && districtParam !== 'All Districts') {
      const distLower = String(r.district || '').toLowerCase();
      const targetDist = districtParam.toLowerCase();

      if (targetDist.includes('burdwan') || targetDist.includes('bardhaman')) {
        if (!distLower.includes('bardhaman') && !distLower.includes('burdwan')) return false;
      } else if (targetDist.includes('south 24 parganas')) {
        const is24Pgs = distLower.includes('24 parganas') || distLower.includes('24-pgs');
        const isSouth = distLower.includes('south') || distLower.includes('sounth');
        if (!is24Pgs || !isSouth) return false;
      } else if (targetDist.includes('north 24 parganas')) {
        const is24Pgs = distLower.includes('24 parganas') || distLower.includes('24-pgs');
        const isNorth = distLower.includes('north');
        if (!is24Pgs || !isNorth) return false;
      } else if (targetDist.includes('purba medinipur')) {
        if (!distLower.includes('medinipur(e)') && !distLower.includes('purba medinipur'))
          return false;
      } else if (targetDist.includes('paschim medinipur')) {
        if (!distLower.includes('medinipur(w)') && !distLower.includes('paschim medinipur'))
          return false;
      } else {
        if (!distLower.includes(targetDist)) return false;
      }
    }

    return true;
  });

  // Transform and calculate farmer units & trends
  const parsedRecords: MandiRecord[] = filteredRaw.map((r: Record<string, any>) => {
    const rawModal = r.modal_price ?? r.Modal_Price ?? 0;
    const rawMin = r.min_price ?? r.Min_Price ?? rawModal;
    const rawMax = r.max_price ?? r.Max_Price ?? rawModal;

    const modal = typeof rawModal === 'number' ? rawModal : parseFloat(String(rawModal)) || 0;
    const min = typeof rawMin === 'number' ? rawMin : parseFloat(String(rawMin)) || modal;
    const max = typeof rawMax === 'number' ? rawMax : parseFloat(String(rawMax)) || modal;
    const arrival = String(r.arrival_date || r.Arrival_Date || '');

    const commodityKey = `${r.district || ''}_${r.market || ''}_${r.commodity || ''}_${r.variety || ''}`.toLowerCase();

    // Calculate trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    const prevRecord = modalPriceMemory[commodityKey];

    if (prevRecord && prevRecord.lastModal > 0) {
      const delta = modal - prevRecord.lastModal;
      if (delta >= 30) {
        trend = 'up';
      } else if (delta <= -30) {
        trend = 'down';
      } else {
        trend = 'stable';
      }
    } else {
      const midPoint = (min + max) / 2;
      if (modal > midPoint + 30) {
        trend = 'up';
      } else if (modal < midPoint - 30) {
        trend = 'down';
      } else {
        trend = 'stable';
      }
    }

    if (modal > 0) {
      modalPriceMemory[commodityKey] = { lastModal: modal, date: arrival };
    }

    return {
      state: String(r.state || 'West Bengal'),
      district: String(r.district || ''),
      market: String(r.market || ''),
      commodity: String(r.commodity || ''),
      variety: String(r.variety || 'Standard'),
      arrival_date: arrival,
      min_price: Math.round(min),
      max_price: Math.round(max),
      modal_price: Math.round(modal),
      price_per_kg: Math.round((modal / 100) * 10) / 10,
      price_per_50kg: Math.round(modal / 2),
      trend,
      is_today: arrival.trim() === todayStr.trim(),
    };
  });

  return {
    records: parsedRecords,
    latestDateFound,
    totalRaw: rawRecords.length,
  };
}
