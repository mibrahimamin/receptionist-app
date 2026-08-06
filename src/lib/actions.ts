"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { scryptSync, randomBytes } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { supabaseServer } from "./supabase/server";

/**
 * Confirms that the server action was called by a logged-in owner
 * and returns that owner's business.
 */
async function requireSession(): Promise<{
  businessId: string;
  businessSlug: string;
}> {
  const cookieStore = cookies();

  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Middleware handles refreshed authentication cookies.
          }
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

  const { data: business, error: businessError } = await supabaseServer
    .from("businesses")
    .select("id, slug")
    .eq("owner_user_id", user.id)
    .single();

  if (businessError || !business) {
    throw new Error("No business is connected to this account.");
  }

  if (!business.slug) {
    throw new Error("This business does not have a public slug.");
  }

  return {
    businessId: business.id,
    businessSlug: business.slug,
  };
}

/**
 * Refreshes both the private dashboard and the business's public page.
 */
function revalidateBusinessPages(businessSlug: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/front-desk/${businessSlug}`);
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

export async function upsertFaq(formData: FormData) {
  const { businessId, businessSlug } = await requireSession();

  const id = formData.get("id") as string | null;
  const question = (formData.get("question") as string)?.trim();
  const keywords =
    (formData.get("keywords") as string)?.trim() ?? "";
  const answer = (formData.get("answer") as string)?.trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!question || !answer) {
    throw new Error("Question and answer are required.");
  }

  if (id) {
    const { error } = await supabaseServer
      .from("faqs")
      .update({
        question,
        keywords,
        answer,
        sort_order: sortOrder,
      })
      .eq("id", id)
      .eq("business_id", businessId);

    if (error) {
      throw new Error(`Could not update FAQ: ${error.message}`);
    }
  } else {
    const { error } = await supabaseServer
      .from("faqs")
      .insert({
        business_id: businessId,
        question,
        keywords,
        answer,
        sort_order: sortOrder,
      });

    if (error) {
      throw new Error(`Could not add FAQ: ${error.message}`);
    }
  }

  revalidatePath("/dashboard/faqs");
  revalidateBusinessPages(businessSlug);
}

export async function deleteFaq(formData: FormData) {
  const { businessId, businessSlug } = await requireSession();
  const id = formData.get("id") as string;

  const { error } = await supabaseServer
    .from("faqs")
    .delete()
    .eq("id", id)
    .eq("business_id", businessId);

  if (error) {
    throw new Error(`Could not delete FAQ: ${error.message}`);
  }

  revalidatePath("/dashboard/faqs");
  revalidateBusinessPages(businessSlug);
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export async function upsertService(formData: FormData) {
  const { businessId, businessSlug } = await requireSession();

  const id = formData.get("id") as string | null;
  const name = (formData.get("name") as string)?.trim();
  const description =
    (formData.get("description") as string)?.trim() ?? "";

  const duration = Number(
    formData.get("duration_minutes") ?? 30
  );

  const buffer = Number(
    formData.get("buffer_minutes") ?? 0
  );

  const sortOrder = Number(
    formData.get("sort_order") ?? 0
  );

  const isActive = formData.get("is_active") === "on";

  if (!name) {
    throw new Error("Service name is required.");
  }

  if (id) {
    const { error } = await supabaseServer
      .from("services")
      .update({
        name,
        description,
        duration_minutes: duration,
        buffer_minutes: buffer,
        sort_order: sortOrder,
        is_active: isActive,
      })
      .eq("id", id)
      .eq("business_id", businessId);

    if (error) {
      throw new Error(`Could not update service: ${error.message}`);
    }
  } else {
    const { error } = await supabaseServer
      .from("services")
      .insert({
        business_id: businessId,
        name,
        description,
        duration_minutes: duration,
        buffer_minutes: buffer,
        sort_order: sortOrder,
        is_active: isActive,
      });

    if (error) {
      throw new Error(`Could not add service: ${error.message}`);
    }
  }

  revalidatePath("/dashboard/services");
  revalidateBusinessPages(businessSlug);
}

export async function deleteService(formData: FormData) {
  const { businessId, businessSlug } = await requireSession();
  const id = formData.get("id") as string;

  const { error } = await supabaseServer
    .from("services")
    .delete()
    .eq("id", id)
    .eq("business_id", businessId);

  if (error) {
    throw new Error(`Could not delete service: ${error.message}`);
  }

  revalidatePath("/dashboard/services");
  revalidateBusinessPages(businessSlug);
}

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

export async function updateAppointmentStatus(
  formData: FormData
) {
  const { businessId, businessSlug } = await requireSession();

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  if (
    !["confirmed", "cancelled", "completed"].includes(status)
  ) {
    throw new Error("Invalid status.");
  }

  const { error } = await supabaseServer
    .from("appointments")
    .update({ status })
    .eq("id", id)
    .eq("business_id", businessId);

  if (error) {
    throw new Error(
      `Could not update appointment: ${error.message}`
    );
  }

  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard/calendar");
  revalidateBusinessPages(businessSlug);
}

// ---------------------------------------------------------------------------
// Business hours
// ---------------------------------------------------------------------------

export async function updateBusinessHour(
  formData: FormData
) {
  const { businessId, businessSlug } = await requireSession();

  const dayOfWeek = Number(formData.get("day_of_week"));
  const isClosed = formData.get("is_closed") === "on";
  const openTime = formData.get("open_time") as string;
  const closeTime = formData.get("close_time") as string;

  const { error } = await supabaseServer
    .from("business_hours")
    .update({
      is_closed: isClosed,
      open_time: openTime,
      close_time: closeTime,
    })
    .eq("business_id", businessId)
    .eq("day_of_week", dayOfWeek);

  if (error) {
    throw new Error(
      `Could not update business hours: ${error.message}`
    );
  }

  revalidatePath("/dashboard/settings");
  revalidateBusinessPages(businessSlug);
}

// ---------------------------------------------------------------------------
// Business settings
// ---------------------------------------------------------------------------

export async function updateBusinessSettings(
  formData: FormData
) {
  const { businessId, businessSlug } = await requireSession();

  const name = (formData.get("name") as string)?.trim();
  const tagline =
    (formData.get("tagline") as string)?.trim() ?? "";
  const greeting = (formData.get("greeting") as string)?.trim();
  const timezone = (formData.get("timezone") as string)?.trim();

  const slotInterval = Number(
    formData.get("slot_interval_minutes") ?? 15
  );

  if (!name || !greeting || !timezone) {
    throw new Error(
      "Name, greeting, and timezone are required."
    );
  }

  const { error } = await supabaseServer
    .from("businesses")
    .update({
      name,
      tagline,
      greeting,
      timezone,
      slot_interval_minutes: slotInterval,
    })
    .eq("id", businessId);

  if (error) {
    throw new Error(
      `Could not update business settings: ${error.message}`
    );
  }

  revalidatePath("/dashboard/settings");
  revalidateBusinessPages(businessSlug);
}

// ---------------------------------------------------------------------------
// Legacy passcode
// ---------------------------------------------------------------------------

export async function updatePasscode(formData: FormData) {
  const { businessId } = await requireSession();

  const newPasscode =
    (formData.get("passcode") as string)?.trim();

  const confirmPasscode =
    (formData.get("confirm_passcode") as string)?.trim();

  if (!newPasscode || newPasscode.length < 4) {
    throw new Error(
      "Passcode must be at least 4 characters."
    );
  }

  if (newPasscode !== confirmPasscode) {
    throw new Error("Passcodes do not match.");
  }

  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(newPasscode, salt, 64).toString("hex");

  const { error } = await supabaseServer
    .from("businesses")
    .update({
      passcode_hash: `${salt}:${hash}`,
    })
    .eq("id", businessId);

  if (error) {
    throw new Error(
      `Could not update passcode: ${error.message}`
    );
  }

  revalidatePath("/dashboard/settings");
}