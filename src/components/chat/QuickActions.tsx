"use client";

export default function QuickActions({
  onSelect,
}: {
  onSelect: (action: "faq" | "booking" | "contact") => void;
}) {
  const options: {
    key: "faq" | "booking" | "contact";
    label: string;
    hint: string;
  }[] = [
    {
      key: "faq",
      label: "Ask a question",
      hint: "hours, location, policies…",
    },
    {
      key: "booking",
      label: "Book an appointment",
      hint: "pick a service & time",
    },
    {
      key: "contact",
      label: "Leave my contact info",
      hint: "we'll get back to you",
    },
  ];

  return (
    <div className="grid sm:grid-cols-3 gap-3 h-full">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onSelect(o.key)}
          className="min-h-[180px] h-full flex flex-col justify-center text-left rounded-md border border-ink/15 bg-white/60 hover:bg-brass/10 hover:border-brass px-6 py-6 transition-colors"
        >
          <div className="font-sans font-medium text-xl text-ink">
            {o.label}
          </div>

          <div className="font-sans text-base text-inkLight mt-2">
            {o.hint}
          </div>
        </button>
      ))}
    </div>
  );
}