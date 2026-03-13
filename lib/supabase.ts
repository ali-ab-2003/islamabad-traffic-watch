import { createClient } from '@supabase/supabase-js'

// Public client — for browser-safe reads
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Admin client — uses service key, only used in API routes (server-side)
// NEVER import supabaseAdmin in any client component
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)