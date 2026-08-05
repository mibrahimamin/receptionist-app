"use client";

import { useState } from "react";
import type { Faq } from "@/lib/types";
import { matchFaq } from "@/lib/faqMatch";

export default function FaqPanel({
  faqs,
  onAsked,
  onBack,
}: {
  faqs: Faq[];
  onAsked: (question: string, answer: string | null) => void;
  onBack: () => void;
}) {
  const [value, setValue] = useState("");

  const uniqueFaqs = faqs.filter(
    (faq, index, array) =>
      index ===
      array.findIndex(
        (item) =>
          item.business_id === faq.business_id &&
          item.question.trim().toLowerCase() ===
            faq.question.trim().toLowerCase()
      )
  );

  function ask(question: string) {
    const trimmed = question.trim();

    if (!trimmed) return;

    const match = matchFaq(trimmed, uniqueFaqs);

    onAsked(trimmed, match?.answer ?? null);

    setValue("");
  }

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(value);
        }}
        className="flex gap-2"
      >
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your question…"
          className="flex-1 rounded-md border border-ink/20 bg-white/80 px-3 py-2 text-sm focus:border-brass"
        />

        <button type="submit" className="stamp-btn stamp-btn-selected">
          Ask
        </button>
      </form>

      {uniqueFaqs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uniqueFaqs.slice(0, 10).map((f) => (
            <button
              key={f.id}
              onClick={() => ask(f.question)}
              className="text-xs font-sans text-inkLight border border-ink/15 rounded-full px-3 py-1 hover:border-brass hover:text-brass"
            >
              {f.question}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={onBack}
        className="text-xs text-inkLight underline hover:text-brass"
      >
        Back to menu
      </button>
    </div>
  );
}