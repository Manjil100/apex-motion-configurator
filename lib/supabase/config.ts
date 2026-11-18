/**
 * Public Supabase settings. The publishable key is designed to be shipped to
 * browsers: Row Level Security, not secrecy, protects the data. The service
 * role key is never used by this app.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
