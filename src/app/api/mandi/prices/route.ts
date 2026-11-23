import { NextRequest, NextResponse } from 'next/server';
import { MandiRecord } from '@/lib/mandi/types';

interface LiveRawCache {
  timestamp: number;
  records: Record<string, string>[];
  latestDate: string | null;
}

// In-memory server cache of all raw live records for West Bengal (1-hour TTL)
let stateCache: LiveRawCache | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Historical price memory for real inter-day or intra-auction trend tracking
const historicalModalPrices: Record<string, { lastModal: number; date: string }> = {};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const districtParam = searchParams.get('district') || 'All Districts';
  const commodityParam = searchParams.get('commodity') || 'all';

  const now = Date.now();
  let rawRecords: Record<string, string>[] = [];
  let latestDateFound: string | null = null;

  // 1. Fetch live from Government of India Open Data Portal if cache expired
  if (stateCache && now - stateCache.timestamp < CACHE_TTL_MS && stateCache.records.length > 0) {
    rawRecords = stateCache.records;
    latestDateFound = stateCache.latestDate;
  } else {
    const apiKey =
      process.env.DATA_GOV_IN_API_KEY ||
      '579b464db66ec23bdd0000010d2414e127494e75439bb55acb65834f';
    const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
    const baseUrl = `https://api.data.gov.in/resource/${resourceId}`;

    const queryParams = new URLSearchParams({
      'api-key': apiKey,
      format: 'json',
      limit: '500',
      'filters[state]': 'West Bengal',
    });

    try {
      const response = await fetch(`${baseUrl}?${queryParams.toString()}`, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 }, // 1-hour ISR
      });

      if (!response.ok) {
        throw new Error(`Data.gov.in responded with HTTP ${response.status}`);
      }

      const json = await response.json();
      if (json.error) {
        throw new Error(`Data.gov.in: ${json.error}`);
      }

      rawRecords = json.records || [];

      // Find latest date in live stream
      for (const r of rawRecords) {
        const arr = r.arrival_date || r.Arrival_Date || '';
        if (arr && (!latestDateFound || arr > latestDateFound)) {
          latestDateFound = arr;
        }
      }

      // Update state-level cache
      if (rawRecords.length > 0) {
        stateCache = {
          timestamp: now,
          records: rawRecords,
          latestDate: latestDateFound,
        };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Live Agmarknet Data.gov.in fetch failed:', message);

      return NextResponse.json({
        success: false,
        error: message,
        records: [],
        lastTradeDate: null,
        statusMessage: 'Mandi Closed / Awaiting Daily Upload',
        disclaimer:
          'Live APMC Agmarknet synchronization temporarily unavailable. Please retry shortly or check with your local Mandi Secretary.',
      });
    }
  }

  // Today's formatted date string (DD/MM/YYYY)
  const todayStr = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  // 2. Filter raw records by commodity and district with smart regional matching
  const filteredRaw = rawRecords.filter((r) => {
    // Commodity filter
    if (commodityParam !== 'all') {
      const commLower = (r.commodity || '').toLowerCase();
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
    if (districtParam !== 'All Districts') {
      const distLower = (r.district || '').toLowerCase();
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

  // 3. Transform and calculate farmer units & trends
  const parsedRecords: MandiRecord[] = filteredRaw.map((r: Record<string, string>) => {
    const modal = parseFloat(r.modal_price || r.Modal_Price || '0') || 0;
    const min = parseFloat(r.min_price || r.Min_Price || '0') || modal;
    const max = parseFloat(r.max_price || r.Max_Price || '0') || modal;
    const arrival = r.arrival_date || r.Arrival_Date || '';

    const commodityKey = `${r.district || ''}_${r.market || ''}_${r.commodity || ''}_${r.variety || ''}`.toLowerCase();

    // Calculate trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    const prevRecord = historicalModalPrices[commodityKey];

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
      historicalModalPrices[commodityKey] = { lastModal: modal, date: arrival };
    }

    return {
      state: r.state || 'West Bengal',
      district: r.district || '',
      market: r.market || '',
      commodity: r.commodity || '',
      variety: r.variety || 'Standard',
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

  const isAnyToday = parsedRecords.some((r) => r.is_today);

  return NextResponse.json({
    success: true,
    source: 'live_agmarknet',
    district: districtParam,
    commodity: commodityParam,
    records: parsedRecords,
    lastTradeDate: latestDateFound,
    statusMessage:
      parsedRecords.length === 0
        ? 'Mandi Closed / Awaiting Daily Upload'
        : isAnyToday
        ? 'Live Today'
        : `Verified Official APMC Trade Rates (${latestDateFound || 'Today'})`,
  });
}
