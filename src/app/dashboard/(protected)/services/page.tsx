import { getDashboardBusiness } from "@/lib/business";
import { supabaseServer } from "@/lib/supabase/server";
import { upsertService, deleteService } from "@/lib/actions";
import type { Service } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const business = await getDashboardBusiness();

  const { data: services } = await supabaseServer
    .from("services")
    .select("*")
    .eq("business_id", business.id)
    .order("sort_order");

  const rows = (services || []) as Service[];

  return (
    <div>
      <h1 className="font-inter text-3xl text-ink mb-1">Services</h1>
      <p className="text-sm text-inkLight mb-6">What visitors can book, how long it takes, and the gap you need after.</p>

      <div className="space-y-4 mb-8">
        {rows.map((s) => (
          <form
            key={s.id}
            action={upsertService}
            className="ledger-card p-5 grid sm:grid-cols-[2fr_2fr_1fr_1fr_auto_auto] gap-3 items-end"
          >
            <input type="hidden" name="id" value={s.id} />
            <Field label="Name">
              <input name="name" defaultValue={s.name} required className="input" />
            </Field>
            <Field label="Description">
              <input name="description" defaultValue={s.description ?? ""} className="input" />
            </Field>
            <Field label="Duration (min)">
              <input type="number" name="duration_minutes" defaultValue={s.duration_minutes} min={5} step={5} className="input" />
            </Field>
            <Field label="Buffer after (min)">
              <input type="number" name="buffer_minutes" defaultValue={s.buffer_minutes} min={0} step={5} className="input" />
            </Field>
            <label className="flex items-center gap-2 text-xs text-inkLight pb-2">
              <input type="checkbox" name="is_active" defaultChecked={s.is_active} />
              Bookable
            </label>
            <div className="flex gap-2">
              <button type="submit" className="stamp-btn stamp-btn-selected ">Save</button>
            </div>
            <input type="hidden" name="sort_order" value={s.sort_order} />
          </form>
        ))}
      </div>

      <div className="ledger-card p-5">
        <span className="ledger-tab">Add a service</span>
        <form action={upsertService} className="grid sm:grid-cols-[2fr_2fr_1fr_1fr_auto] gap-3 items-end mt-2">
          <Field label="Name">
            <input name="name" required placeholder="e.g. Consultation" className="input" />
          </Field>
          <Field label="Description">
            <input name="description" placeholder="Optional" className="input" />
          </Field>
          <Field label="Duration (min)">
            <input type="number" name="duration_minutes" defaultValue={30} min={5} step={5} className="input" />
          </Field>
          <Field label="Buffer after (min)">
            <input type="number" name="buffer_minutes" defaultValue={0} min={0} step={5} className="input" />
          </Field>
          <div className="mt-5">
          <button type="submit" className="stamp-btn stamp-btn-selected">
          Add service
          </button>
          </div>
          <input type="hidden" name="sort_order" value={rows.length} />
          <input type="hidden" name="is_active" value="on" />
        </form>
      </div>
      
      {rows.length > 0 && (
  <div className="ledger-card p-5 mt-8 pt-12">
    <span className="ledger-tab">Remove a service</span>
    <div className="flex flex-wrap gap-3">
      {rows.map((s) => (
        <form key={s.id} action={deleteService}>
          <input type="hidden" name="id" value={s.id} />
          <button
            type="submit"
            className="stamp-btn border-clay/40 text-clay hover:bg-clay/10"
          >
            Delete “{s.name}”
          </button>
        </form>
      ))}
    </div>
  </div>
)}

    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-wide text-inkLight mb-1">{label}</span>
      {children}
    </label>
  );
}
