import { getCurrentBusiness } from "@/lib/business";
import { supabaseServer } from "@/lib/supabase/server";
import { updateBusinessSettings, updateBusinessHour, updatePasscode } from "@/lib/actions";
import type { BusinessHour } from "@/lib/types";

export const dynamic = "force-dynamic";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function SettingsPage() {
  const business = await getCurrentBusiness();

  const { data: hours } = await supabaseServer
    .from("business_hours")
    .select("*")
    .eq("business_id", business.id)
    .order("day_of_week");

  const rows = (hours || []) as BusinessHour[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-inter text-3xl text-ink mb-1">Settings</h1>
        <p className="text-sm text-inkLight">How the front desk introduces itself, when you're open, and who can get in.</p>
      </div>

      <div className="ledger-card p-6">
        <span className="ledger-tab">Business info</span>
        <form action={updateBusinessSettings} className="space-y-3 mt-2">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Business name">
              <input name="name" defaultValue={business.name} required className="input" />
            </Field>
            <Field label="Tagline">
              <input name="tagline" defaultValue={business.tagline} className="input" />
            </Field>
          </div>
          <Field label="Chat greeting">
            <textarea name="greeting" defaultValue={business.greeting} required rows={2} className="input resize-none" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Timezone (IANA name)">
              <input name="timezone" defaultValue={business.timezone} required placeholder="America/Toronto" className="input" />
            </Field>
            <Field label="Slot interval (minutes)">
              <input
                type="number"
                name="slot_interval_minutes"
                defaultValue={business.slot_interval_minutes}
                min={5}
                step={5}
                className="input"
              />
            </Field>
          </div>
          <button type="submit" className="stamp-btn stamp-btn-selected">Save business info</button>
        </form>
      </div>

      <div className="ledger-card p-6">
        <span className="ledger-tab">Hours</span>
        <div className="space-y-2 mt-2">
          {rows.map((h) => (
            <form
              key={h.id}
              action={updateBusinessHour}
              className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[120px_auto_1fr_1fr] gap-3 items-center text-sm"
            >
              <input type="hidden" name="day_of_week" value={h.day_of_week} />
              <span className="font-display">{DAY_NAMES[h.day_of_week]}</span>
              <label className="flex items-center gap-2 text-xs text-inkLight">
                <input type="checkbox" name="is_closed" defaultChecked={h.is_closed} />
                Closed
              </label>
              <input type="time" name="open_time" defaultValue={h.open_time.slice(0, 5)} className="input" />
              <div className="flex gap-2">
                <input type="time" name="close_time" defaultValue={h.close_time.slice(0, 5)} className="input" />
                <button type="submit" className="text-xs text-brass underline hover:no-underline whitespace-nowrap">
                  Save
                </button>
              </div>
            </form>
          ))}
        </div>
      </div>

      <div className="ledger-card p-6">
        <span className="ledger-tab">Dashboard passcode</span>
        <form action={updatePasscode} className="space-y-3 mt-2 max-w-sm">
          <Field label="New passcode">
            <input type="password" name="passcode" required minLength={4} className="input" />
          </Field>
          <Field label="Confirm new passcode">
            <input type="password" name="confirm_passcode" required minLength={4} className="input" />
          </Field>
          <button type="submit" className="stamp-btn stamp-btn-selected">Update passcode</button>
        </form>
      </div>
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
