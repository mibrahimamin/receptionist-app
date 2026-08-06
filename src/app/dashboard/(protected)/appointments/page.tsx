import { getDashboardBusiness } from "@/lib/business";
import { supabaseServer } from "@/lib/supabase/server";
import { updateAppointmentStatus } from "@/lib/actions";
import { formatSlotLabel } from "@/lib/availability";
import type { AppointmentWithDetails } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "text-sage border-sage/40 bg-sage/10",
  completed: "text-brass border-brass/40 bg-brass/10",
  cancelled: "text-clay border-clay/40 bg-clay/10",
};

export default async function AppointmentsPage() {
  const business = await getDashboardBusiness();

  const { data: appointments, error: appointmentsError } =

  await supabaseServer
    .from("appointments")
    .select("*")
    .eq("business_id", business.id)
    .neq("status", "completed")
    .order("start_time", { ascending: false })
    .limit(200);

if (appointmentsError) {
  console.error("Appointments query failed:", appointmentsError);
  throw new Error(`Could not load appointments: ${appointmentsError.message}`);
}

const contactIds = [
  ...new Set(
    (appointments ?? [])
      .map((appointment) => appointment.contact_id)
      .filter(Boolean)
  ),
];

const serviceIds = [
  ...new Set(
    (appointments ?? [])
      .map((appointment) => appointment.service_id)
      .filter(Boolean)
  ),
];

const { data: contacts, error: contactsError } = contactIds.length
  ? await supabaseServer
      .from("contacts")
      .select("id,name,email,phone")
      .in("id", contactIds)
  : { data: [], error: null };

if (contactsError) {
  console.error("Contacts query failed:", contactsError);
}

const { data: services, error: servicesError } = serviceIds.length
  ? await supabaseServer
      .from("services")
      .select("id,name,duration_minutes")
      .in("id", serviceIds)
  : { data: [], error: null };

if (servicesError) {
  console.error("Services query failed:", servicesError);
}

const contactsById = new Map(
  (contacts ?? []).map((contact) => [contact.id, contact])
);

const servicesById = new Map(
  (services ?? []).map((service) => [service.id, service])
);

const rows = (appointments ?? []).map((appointment) => ({
  ...appointment,
  contact: appointment.contact_id
    ? contactsById.get(appointment.contact_id) ?? null
    : null,
  service: appointment.service_id
    ? servicesById.get(appointment.service_id) ?? null
    : null,
})) as AppointmentWithDetails[];
  return (
    <div>
      <h1 className="font-inter text-3xl text-ink mb-1">Appointments</h1>
      <p className="text-sm text-inkLight mb-6">Everything booked through the front desk, most recent first.</p>

      <div className="ledger-card overflow-hidden">
        <span className="ledger-tab">{rows.length} booked</span>
        <table className="w-full text-sm mt-8">
          <thead>
            <tr className="text-left border-b border-ink/10 text-xs uppercase tracking-wide text-inkLight">
              <th className="px-5 py-3 font-normal">When</th>
              <th className="px-5 py-3 font-normal">Service</th>
              <th className="px-5 py-3 font-normal">Guest</th>
              <th className="px-5 py-3 font-normal">Status</th>
              <th className="px-5 py-3 font-normal">Update</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-inkLight">
                  No appointments yet.
                </td>
              </tr>
            )}
            {rows.map((a) => (
              <tr key={a.id} className="border-b border-ink/5 last:border-0 align-top">
                <td className="px-5 py-3">
                  <div className="font-sans text-brass">{formatSlotLabel(a.start_time, business.timezone)}</div>
                  <div className="text-xs text-inkLight">
                    {new Date(a.start_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="font-dmsans">

  {a.service?.name || "Unknown service"}

            </div>

              {a.service?.duration_minutes && (

              <div className="text-xs text-inkLight">

              {a.service.duration_minutes} min

            </div>

)}
                </td>
                <td className="px-5 py-3 text-inkLight">
                 <div className="font-sans">

  {a.contact?.name || "Unknown guest"}

</div>

<div className="font-inter text-xs">

  {a.contact?.email || a.contact?.phone || "No contact information"}

</div>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] font-sans uppercase tracking-wide border rounded-full px-2 py-0.5 ${STATUS_STYLES[a.status]}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <form action={updateAppointmentStatus} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={a.id} />
                    <select
                      name="status"
                      defaultValue={a.status}
                      className="text-xs border border-ink/20 rounded-md px-2 py-1 bg-white/80"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button type="submit" className="text-xs text-brass underline hover:no-underline">
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
