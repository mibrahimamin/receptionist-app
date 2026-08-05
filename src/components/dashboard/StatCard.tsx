export default function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="ledger-card p-5">
      <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-sage mb-2">{label}</p>
      <p className="font-sans text-3xl text-ink">{value}</p>
      {hint && <p className="text-xs text-inkLight mt-1">{hint}</p>}
    </div>
  );
}
