"use server";

import { revalidatePath } from "next/cache";
import { getDashboardBusiness } from "@/lib/business";
import { supabaseServer } from "@/lib/supabase/server";

const allowedStatuses = [
  "new",
  "contacted",
  "booked",
  "waiting",
  "completed",
  "closed",
];

export async function updateContactStatus(
  contactId: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  if (!allowedStatuses.includes(status)) {
    return {
      success: false,
      error: "Invalid contact status.",
    };
  }

  try {
    const business = await getDashboardBusiness();

    const { error } = await supabaseServer
      .from("contacts")
      .update({ status })
      .eq("id", contactId)
      .eq("business_id", business.id);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/dashboard/contacts");

    return {
      success: true,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Status update failed.",
    };
  }
}