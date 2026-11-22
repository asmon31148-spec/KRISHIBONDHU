import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { predictionId, actualYieldTons } = await req.json();

    if (!predictionId || actualYieldTons === undefined) {
      return NextResponse.json({ error: 'Missing parameters.' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database unconfigured.' }, { status: 400 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Auth required.' }, { status: 401 });
    }

    const { error } = await supabase
      .from('yield_predictions')
      .update({ actual_harvest_yield_tons: parseFloat(actualYieldTons) })
      .eq('id', predictionId)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error logging actual yield';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
