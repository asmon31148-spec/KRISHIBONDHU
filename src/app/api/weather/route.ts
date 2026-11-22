import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveWeather } from '@/lib/weather/open-meteo';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // Default fallback coordinates: Burdwan (Bardhaman), West Bengal
    const lat = parseFloat(searchParams.get('lat') || '23.2324');
    const lon = parseFloat(searchParams.get('lon') || '87.8615');
    const locationName = searchParams.get('location') || 'Burdwan, West Bengal';

    const weather = await fetchLiveWeather(lat, lon, locationName);
    return NextResponse.json({ success: true, data: weather });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Weather service error';
    console.error('Weather route error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
