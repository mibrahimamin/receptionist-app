import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-only: uses the service role key, which bypasses RLS. Never import
// this file from a "use client" component or expose it to the browser.
// Used by API routes and dashboard server components that need to read or
// write contacts/appointments, or verify the dashboard passcode.
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
