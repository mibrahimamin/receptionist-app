import { getDashboardBusiness } from "@/lib/business";

import { supabaseServer } from "@/lib/supabase/server";

import CalendarView, {

  type CalendarAppointment,

} from "./CalendarView";

export const dynamic = "force-dynamic";


export default async function CalendarPage() {
  const business = await getDashboardBusiness();

  const { data, error } = await supabaseServer
    .from("appointments")
    .select(
      `
        id,
        start_time,
        status,
        contact:contacts(name),
        service:services(name)
      `
    )
    .eq("business_id", business.id)
    .order("start_time", { ascending: true })
    .limit(500);

  if (error) {
    console.error("Calendar query failed:", error);

    throw new Error(
      `Could not load calendar appointments: ${error.message}`
    );
  }

  const appointments =
    (data || []) as unknown as CalendarAppointment[];

  return (
    <div>
      <h1 className="font-inter text-3xl text-ink mb-1">
        Calendar
      </h1>

      <p className="text-sm text-inkLight mb-6">
        View your appointments by month.
      </p>

      <CalendarView
        appointments={appointments}
        timezone={business.timezone}
      />
    </div>
  );
}