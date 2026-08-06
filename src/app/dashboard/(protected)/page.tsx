import { getDashboardBusiness } from "@/lib/business";
import { supabaseServer } from "@/lib/supabase/server";
import StatCard from "@/components/dashboard/StatCard";
import { formatSlotLabel } from "@/lib/availability";
import type { AppointmentWithDetails } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const business = await getDashboardBusiness();

  const [
    { count: newContacts },
    { count: contactedContacts },
    { count: bookedContacts },
    { count: upcomingCount },
    { data: todayAppointments },
  ] = await Promise.all([
   supabaseServer
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id)
    .eq("status", "new"),
  supabaseServer
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id)
    .eq("status", "contacted"),
  supabaseServer
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id)
    .eq("status", "booked"),
  supabaseServer
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id)
    .eq("status", "confirmed")
    .gte("start_time", new Date().toISOString()),
  supabaseServer
    .from("appointments")
    .select(
      "*, contact:contacts(name,email,phone), service:services(name,duration_minutes)"
    )
    .eq("business_id", business.id)
    .eq("status", "confirmed")
    .gte("start_time", new Date().toISOString())
    .order("start_time")
    .limit(5),

]);

  const appointments = (todayAppointments || []) as unknown as AppointmentWithDetails[];
  return (
    <div>
      <h1 className="font-inter text-3xl text-ink mb-1">
          Dashboard
      </h1>
      <p className="text-sm text-inkLight mb-6">
        What&apos;s happening at the front desk today.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
  label="New contacts"
  value={newContacts ?? 0}

/>

  <StatCard
  label="Contacted"
  value={contactedContacts ?? 0}

/>

  <StatCard

  label="Booked contacts"
  value={bookedContacts ?? 0}

/>

        <StatCard
          label="Upcoming appointments"
          value={upcomingCount ?? 0}
        />
      </div>

      <div className="ledger-card p-6 pt-14">
        <span className="ledger-tab">Upcoming</span>

        {appointments.length === 0 ? (
          <p className="text-sm text-inkLight">
            No upcoming tasks.
          </p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {appointments.map((appointment) => (
              <li
                key={appointment.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-sans font-medium text-lg text-ink">
                    {appointment.contact?.name || "Unknown"}
                  </p>

                  <p className="font-dmsans text-sm text-inkLight">
                    {appointment.service?.name || "Unknown service"}
                    {" · "}
                    {appointment.contact?.email ||
                      appointment.contact?.phone ||
                      "No contact information"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-sans text-sm text-brass">
                    {formatSlotLabel(
                      appointment.start_time,
                      business.timezone
                    )}
                  </p>

                  <p className="text-[10px] uppercase tracking-wide text-inkLight">
                    {appointment.status}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}