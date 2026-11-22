import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { scanId, feedbackNotes } = await req.json();

    if (!scanId) {
      return NextResponse.json({ error: 'Missing scan ID.' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    if (supabase) {
      await supabase
        .from('crop_scans')
        .update({
          user_feedback_flag: true,
          expert_advice: feedbackNotes ? `[Farmer Flagged Correction]: ${feedbackNotes}` : undefined,
        })
        .eq('id', scanId);
    }

    return NextResponse.json({ success: true, message: 'Feedback logged for pathologist review.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error reporting result';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
