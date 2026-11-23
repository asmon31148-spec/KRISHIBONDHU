import { NextRequest, NextResponse } from 'next/server';
import { MandiRecord } from '@/lib/mandi/types';

interface CacheEntry {
  timestamp: number;
  data: MandiRecord[];
  lastTradeDate: string | null;
}

// In-memory cache with 4-hour TTL
const cache: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 4 * 60 * 60 * 1000;

// Historical price memory for real inter-day or intra-auction trend tracking
const historicalModalPrices: Record<string, { lastModal: number; date: string }> = {};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const districtParam = searchParams.get('district') || 'All Districts';
  const commodityParam = searchParams.get('commodity') || 'all';

  const cacheKey = `${districtParam}_${commodityParam}`;
  const now = Date.now();

  // 1. Check cache
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      success: true,
      source: 'cache',
      district: districtParam,
      commodity: commodityParam,
      records: cache[cacheKey].data,
      lastTradeDate: cache[cacheKey].lastTradeDate,
      cachedAt: new Date(cache[cacheKey].timestamp).toISOString(),
    });
  }

  const apiKey = process.env.DATA_GOV_IN_API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b'; // Default open government key
  const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
  const baseUrl = `https://api.data.gov.in/resource/${resourceId}`;

  const queryParams = new URLSearchParams({
    'api-key': apiKey,
    format: 'json',
    limit: '200',
    'filters[state]': 'West Bengal',
  });

  if (districtParam !== 'All Districts') {
    queryParams.append('filters[district]', districtParam);
  }

  if (commodityParam !== 'all') {
    queryParams.append('filters[commodity]', commodityParam);
  }

  try {
    const response = await fetch(`${baseUrl}?${queryParams.toString()}`, {
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 14400 }, // 4 hours ISR
    });

    if (!response.ok) {
      throw new Error(`Data.gov.in responded with HTTP ${response.status}`);
    }

    const json = await response.json();
    const rawRecords = json.records || [];

    // Parse and normalize records
    const todayStr = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date()); // DD/MM/YYYY

    let latestDateFound: string | null = null;

    const parsedRecords: MandiRecord[] = rawRecords.map((r: Record<string, string>) => {
      const modal = parseFloat(r.modal_price || r.Modal_Price || '0') || 0;
      const min = parseFloat(r.min_price || r.Min_Price || '0') || modal;
      const max = parseFloat(r.max_price || r.Max_Price || '0') || modal;
      const arrival = r.arrival_date || r.Arrival_Date || '';

      if (arrival && (!latestDateFound || arrival > latestDateFound)) {
        latestDateFound = arrival;
      }

      const commodityKey = `${r.district || ''}_${r.market || ''}_${r.commodity || ''}_${r.variety || ''}`.toLowerCase();
      
      // Calculate true price trend: compare against historical modal or auction weighted center
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
        // Fallback: compare modal price to midpoint of the daily auction range
        const midPoint = (min + max) / 2;
        if (modal > midPoint + 30) {
          trend = 'up';
        } else if (modal < midPoint - 30) {
          trend = 'down';
        } else {
          trend = 'stable';
        }
      }

      // Store current modal for subsequent trend comparisons
      if (modal > 0) {
        historicalModalPrices[commodityKey] = { lastModal: modal, date: arrival };
      }

      return {
        state: r.state || 'West Bengal',
        district: r.district || '',
        market: r.market || '',
        commodity: r.commodity || '',
        variety: r.variety || 'Common',
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

    // Save in cache
    cache[cacheKey] = {
      timestamp: now,
      data: parsedRecords,
      lastTradeDate: latestDateFound,
    };

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
          : parsedRecords.some((r) => r.is_today)
          ? 'Live Today'
          : 'Latest Available Official Trading Record',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Mandi API Error:', message);

    // Return honest zero-mock status
    return NextResponse.json(
      {
        success: false,
        error: message,
        records: [],
        lastTradeDate: null,
        statusMessage: 'Mandi Closed / Awaiting Daily Upload',
        disclaimer:
          'Live APMC Agmarknet synchronization temporarily unavailable. Please retry shortly or check with your local Mandi Secretary.',
      },
      { status: 200 }
    );
  }
}
