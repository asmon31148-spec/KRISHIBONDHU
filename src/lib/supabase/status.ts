/**
 * KRISHIBONDHU - Service Configuration Status Checker
 * Detects whether services are properly configured via environment variables.
 */

export interface ServiceStatus {
  supabaseConfigured: boolean;
  supabaseServiceRoleConfigured: boolean;
  geminiConfigured: boolean;
  groqConfigured: boolean;
  openrouterConfigured: boolean;
  anyAiConfigured: boolean;
  appUrl: string;
  appEnv: string;
}

export function getServiceStatus(): ServiceStatus {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zidxtfjlqgdezszsfcah.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_XQ1q_kfc60EsCD3qK12hiA_6vZsZ9aM';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const isSupabaseConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    supabaseAnonKey.length > 20
  );

  const isSupabaseServiceConfigured = Boolean(
    supabaseServiceKey &&
    !supabaseServiceKey.includes('...') &&
    supabaseServiceKey.length > 20
  );

  const geminiKey = process.env.GEMINI_API_KEY || '';
  const groqKey = process.env.GROQ_API_KEY || '';
  const openrouterKey = process.env.OPENROUTER_API_KEY || '';

  const isGeminiConfigured = Boolean(
    geminiKey && !geminiKey.includes('your_gemini_api_key') && geminiKey.length > 10
  );
  const isGroqConfigured = Boolean(
    groqKey && !groqKey.includes('your_groq_api_key') && groqKey.length > 10
  );
  const isOpenRouterConfigured = Boolean(
    openrouterKey && !openrouterKey.includes('your_openrouter_api_key') && openrouterKey.length > 10
  );

  return {
    supabaseConfigured: isSupabaseConfigured,
    supabaseServiceRoleConfigured: isSupabaseServiceConfigured,
    geminiConfigured: isGeminiConfigured,
    groqConfigured: isGroqConfigured,
    openrouterConfigured: isOpenRouterConfigured,
    anyAiConfigured: isGeminiConfigured || isGroqConfigured || isOpenRouterConfigured,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    appEnv: process.env.NEXT_PUBLIC_APP_ENV || 'pilot',
  };
}
