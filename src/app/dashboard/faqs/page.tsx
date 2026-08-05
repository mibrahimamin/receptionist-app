import { getCurrentBusiness } from "@/lib/business";
import { supabaseServer } from "@/lib/supabase/server";
import { upsertFaq, deleteFaq } from "@/lib/actions";
import type { Faq } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function FaqsPage() {
  const business = await getCurrentBusiness();

  const { data: faqs } = await supabaseServer
    .from("faqs")
    .select("*")
    .eq("business_id", business.id)
    .order("sort_order");

  const rows = (faqs || []) as Faq[];

  return (
    <div>
      <h1 className="font-inter text-3xl text-ink mb-1">FAQs</h1>
      <p className="text-sm text-inkLight mb-6">
        Keywords (comma separated) are matched against a visitor's question to find the best answer.
      </p>

      <div className="space-y-4 mb-8">
        {rows.map((f) => (
          <form key={f.id} action={upsertFaq} className="ledger-card p-5 space-y-3">
            <input type="hidden" name="id" value={f.id} />
            <input type="hidden" name="sort_order" value={f.sort_order} />
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Question">
                <input name="question" defaultValue={f.question} required className="input" />
              </Field>
              <Field label="Match keywords">
                <input name="keywords" defaultValue={f.keywords} placeholder="hours, open, when" className="input" />
              </Field>
            </div>
            <Field label="Answer">
              <textarea name="answer" defaultValue={f.answer} required rows={2} className="input resize-none" />
            </Field>
            <div className="flex gap-3">
              <button type="submit" className="stamp-btn stamp-btn-selected">Save</button>
            </div>
          </form>
        ))}
      </div>

      <div className="ledger-card p-5">
        <span className="ledger-tab">Add an FAQ</span>
        <form action={upsertFaq} className="space-y-3 mt-2">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Question">
              <input name="question" required placeholder="e.g. Do you offer parking?" className="input" />
            </Field>
            <Field label="Match keywords">
              <input name="keywords" placeholder="parking, park, car" className="input" />
            </Field>
          </div>
          <Field label="Answer">
            <textarea name="answer" required rows={2} className="input resize-none" />
          </Field>
          <input type="hidden" name="sort_order" value={rows.length} />
          <button type="submit" className="stamp-btn stamp-btn-selected">Add FAQ</button>
        </form>
      </div>

      {rows.length > 0 && (
        <div className="mt-8">
          <p className="text-xs uppercase tracking-wide text-inkLight mb-2">Remove an FAQ</p>
          <div className="flex flex-wrap gap-2">
            {rows.map((f) => (
              <form key={f.id} action={deleteFaq}>
                <input type="hidden" name="id" value={f.id} />
                <button
                  type="submit"
                  className="text-xs font-sans text-clay border border-clay/30 rounded-full px-3 py-1 hover:bg-clay/10"
                >
                  Delete "{f.question}"
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
    <label className="block pt-2">
      <span className="block text-[10px] uppercase tracking-wide text-inkLight mb-1">{label}</span>
      {children}
    </label>
  );
}
