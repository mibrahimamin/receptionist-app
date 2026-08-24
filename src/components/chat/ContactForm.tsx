"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function ContactForm({
  businessId,
  businessSlug,
  onSubmitted,
  onBack,
}: {
  businessId: string;
  businessSlug: string;
  onSubmitted: (name: string) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  console.log("CONTACT FORM BUSINESS:", {

    businessId,

    businessSlug,

  });
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!businessId || !businessSlug) {
      setError("Business information is missing.");
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setError("Please provide either an email address or phone number.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          businessSlug,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      onSubmitted(name.trim());
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          className="rounded-md border border-ink/20 bg-white/80 px-3 py-2 text-sm focus:border-brass"
        />

        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number"
          className="rounded-md border border-ink/20 bg-white/80 px-3 py-2 text-sm focus:border-brass"
        />
      </div>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full rounded-md border border-ink/20 bg-white/80 px-3 py-2 text-sm focus:border-brass"
      />

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What can we help with?"
        rows={2}
        className="w-full rounded-md border border-ink/20 bg-white/80 px-3 py-2 text-sm focus:border-brass resize-none"
      />

      {error && (
        <p className="text-sm text-clay">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          aria-label="Send contact details"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brass text-white shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <span className="text-xs">...</span>
          ) : (
            <Send
              size={22}
              strokeWidth={2.5}
              className="rotate-45"
            />
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="text-xs text-inkLight underline hover:text-brass"
        >
          Back to menu
        </button>
      </div>
    </form>
  );
}