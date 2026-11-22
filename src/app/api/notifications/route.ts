import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { fetchLiveWeather } from '@/lib/weather/open-meteo';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ notifications: [] });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ notifications: [] });
    }

    // 1. Fetch user's stored notifications
    const { data: stored, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    // 2. Derive real-time weather advisory if none recorded today
    const { data: profile } = await supabase
      .from('profiles')
      .select('latitude, longitude, district')
      .eq('id', user.id)
      .single();

    const lat = profile?.latitude || 23.2324;
    const lon = profile?.longitude || 87.8615;

    try {
      const weather = await fetchLiveWeather(lat, lon, profile?.district || undefined);
      if (weather.agronomicInsights.heatRainWarning) {
        // Check if an unread weather alert already exists
        const exists = stored?.some(
          (n) => n.category === 'weather' && n.message === weather.agronomicInsights.heatRainWarning
        );
        if (!exists) {
          await supabase.from('notifications').insert({
            user_id: user.id,
            title: 'Active Agro-Meteorological Warning',
            message: weather.agronomicInsights.heatRainWarning,
            category: 'weather',
            action_url: '/weather',
          });
        }
      }
    } catch (weatherErr) {
      console.warn('Real-time weather notification check skipped:', weatherErr);
    }

    // Refetch latest
    const { data: finalNotifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ notifications: finalNotifications || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching notifications';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return NextResponse.json({ error: 'Unconfigured' }, { status: 400 });

    const { id } = await req.json();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

    if (id === 'all') {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating notification';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
