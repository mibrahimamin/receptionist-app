import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseServer } from "./supabase/server";
import type { Business } from "./types";

/**
 * Used by public Front Desk pages.
 * Example: /front-desk/john-smith
 */
export async function getBusinessBySlug(
  slug: string
): Promise<Business | null> {
  const { data, error } = await supabaseServer
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Business;
}

/**
 * Used by authenticated dashboard pages.
 */
export async function getDashboardBusiness(): Promise<Business> {
  const cookieStore = cookies();

  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Middleware handles refreshed auth cookies.
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabaseAuth.auth.getUser();

  if (userError || !user) {
    throw new Error("Not authenticated.");
  }

  const { data: business, error: businessError } =
    await supabaseServer
      .from("businesses")
      .select("*")
      .eq("owner_user_id", user.id)
      .single();

  if (businessError || !business) {
    throw new Error("No business is connected to this account.");
  }

  return business as Business;
}