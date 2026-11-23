import { NextRequest, NextResponse } from 'next/server';
import { parseAndFilterMandiRecords } from '@/lib/mandi/parser';

interface LiveRawCache {
  timestamp: number;
  records: Record<string, any>[];
  latestDate: string | null;
}

// In-memory server cache of all raw live records for West Bengal (1-hour TTL)
let stateCache: LiveRawCache | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const districtParam = searchParams.get('district') || 'All Districts';
  const commodityParam = searchParams.get('commodity') || 'all';

  const now = Date.now();
  let rawRecords: Record<string, any>[] = [];
  let latestDateFound: string | null = null;
  let fetchError: string | null = null;

  // 1. Fetch live from Government of India Open Data Portal if cache expired
  if (stateCache && now - stateCache.timestamp < CACHE_TTL_MS && stateCache.records.length > 0) {
    rawRecords = stateCache.records;
    latestDateFound = stateCache.latestDate;
  } else {
    const apiKey =
      process.env.DATA_GOV_IN_API_KEY ||
      process.env.NEXT_PUBLIC_DATA_GOV_IN_API_KEY ||
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8500);

      const response = await fetch(`${baseUrl}?${queryParams.toString()}`, {
        headers: {
          Accept: 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Referer: 'https://data.gov.in/',
        },
        signal: controller.signal,
        next: { revalidate: 3600 }, // 1-hour ISR
      });

      clearTimeout(timeoutId);

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
        const arr = String(r.arrival_date || r.Arrival_Date || '');
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
      console.warn('Server-side Agmarknet fetch notice (client will fallback if needed):', message);
      fetchError = message;
    }
  }

  // If server fetch failed and cache is empty, return indicator with client fallback guidance
  if (rawRecords.length === 0) {
    return NextResponse.json({
      success: false,
      error: fetchError || 'Server connection to NIC Agmarknet gateway timed out.',
      records: [],
      clientFallbackNeeded: true,
      lastTradeDate: null,
      statusMessage: 'Connecting to Live Agmarknet Portal...',
      disclaimer:
        'Connecting directly to Government of India Mandi Gateway from your device...',
    });
  }

  // 2. Parse and filter
  const { records: parsedRecords, latestDateFound: dateFromRecords } = parseAndFilterMandiRecords(
    rawRecords,
    districtParam,
    commodityParam
  );

  const finalDate = latestDateFound || dateFromRecords;
  const isAnyToday = parsedRecords.some((r) => r.is_today);

  return NextResponse.json({
    success: true,
    source: 'live_agmarknet',
    district: districtParam,
    commodity: commodityParam,
    records: parsedRecords,
    totalBengalRecords: rawRecords.length,
    lastTradeDate: finalDate,
    statusMessage:
      parsedRecords.length === 0
        ? 'Mandi Closed / Awaiting Daily Upload'
        : isAnyToday
        ? 'Live Today'
        : `Verified Official APMC Trade Rates (${finalDate || 'Today'})`,
  });
}
