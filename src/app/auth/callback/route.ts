import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        // Retrieve authenticated user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Check if onboarding completed
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single();

          if (!profile || !profile.onboarding_completed) {
            return NextResponse.redirect(`${origin}/onboarding`);
          }
        }

        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Redirect to login if OAuth code exchange fails
  return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
}
