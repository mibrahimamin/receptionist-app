import { getDashboardBusiness } from "@/lib/business";
import { supabaseServer } from "@/lib/supabase/server";
import type { Contact } from "@/lib/types";
import StatusSelect from "./StatusSelect";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const business = await getDashboardBusiness();

  const { data: contacts } = await supabaseServer
  .from("contacts")
  .select("*")
  .eq("business_id", business.id)
  .neq("status", "completed")
  .order("created_at", { ascending: false });

  const rows = (contacts || []) as Contact[];

  return (
    <div>
      <h1 className="font-inter text-3xl text-ink mb-1">Contacts</h1>
      <p className="text-sm text-inkLight mb-6">Everyone who's left their details, newest first.</p>

      <div className="ledger-card overflow-hidden pt-14">
        <span className="ledger-tab">{rows.length} on file</span>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-ink/10 text-xs uppercase tracking-wide text-inkLight">
              <th className="px-5 py-3 font-normal">Name</th>
              <th className="px-5 py-3 font-normal">Contact</th>
              <th className="px-5 py-3 font-normal">Status</th>
              <th className="px-5 py-3 font-normal">Message</th>
              <th className="px-5 py-3 font-normal">Source</th>
              <th className="px-5 py-3 font-normal">When</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-inkLight">
                  No contacts yet — they'll show up here as soon as someone reaches out.
                </td>
              </tr>
            )}
           {rows.map((c) => (
  <tr key={c.id} className="border-b border-ink/5 last:border-0">
    <td className="px-5 py-3 font-inter font-normal text-lg">
      {c.name}
    </td>

    <td className="px-5 py-3 text-inkLight">
      {c.email && <div>{c.email}</div>}
      {c.phone && (
        <div className="font-sans text-xs">
          {c.phone}
        </div>
      )}
    </td>

    <td className="px-5 py-3">
      <StatusSelect
        contactId={c.id}
        currentStatus={c.status}
      />
    </td>

    <td className="px-5 py-3 text-inkLight max-w-xs truncate">
      {c.message || "—"}
    </td>

    <td className="px-5 py-3">
      <span className="text-[10px] font-sans uppercase tracking-wide border border-ink/15 rounded-full px-2 py-0.5">
        {c.source}
      </span>
    </td>

    <td className="px-5 py-3 text-inkLight font-sans text-xs">
      {new Date(c.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}
    </td>
  </tr>
))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
