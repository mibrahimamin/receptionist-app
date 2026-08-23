import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client.
// Uses the service role key and disables server-side fetch caching
// so database changes are returned immediately.
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (url, options = {}) =>
        fetch(url, {
          ...options,
          cache: "no-store",
        }),
    },
  }
);