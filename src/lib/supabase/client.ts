import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zidxtfjlqgdezszsfcah.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_XQ1q_kfc60EsCD3qK12hiA_6vZsZ9aM';

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
    // Return null or dummy client for unconfigured state handled gracefully by UI
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
