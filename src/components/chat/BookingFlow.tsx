"use client";

import { useEffect, useMemo, useState } from "react";
import type { Service } from "@/lib/types";
import { formatSlotLabel } from "@/lib/availability";

type Step = "service" | "date" | "slot" | "details";

function nextDays(count: number) {
  const out: { iso: string; label: string }[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);

    const iso = d.toISOString().slice(0, 10);

    const label = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    out.push({ iso, label });
  }

  return out;
}

export default function BookingFlow({
  services,
  businessId,
  businessSlug,
  timezone,
  onConfirmed,
  onBack,
}: {
  services: Service[];
  businessId: string;
  businessSlug: string;
  timezone: string;
  onConfirmed: (summary: string) => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState<Step>("service");
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const days = useMemo(() => nextDays(14), []);

  useEffect(() => {
    if (
      step !== "slot" ||
      !service ||
      !date ||
      !businessSlug
    ) {
      return;
    }

    setLoadingSlots(true);
    setSlotError(null);

    const params = new URLSearchParams({
      slug: businessSlug,
      serviceId: service.id,
      date,
    });

    fetch(`/api/availability?${params.toString()}`)
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Could not load available times."
          );
        }

        return data;
      })
      .then((data) => {
        setSlots(data.slots || []);
      })
      .catch((error) => {
        setSlots([]);
        setSlotError(
          error instanceof Error
            ? error.message
            : "Could not load times. Please try again."
        );
      })
      .finally(() => {
        setLoadingSlots(false);
      });
  }, [step, service, date, businessSlug]);

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();

    if (!service || !slot) {
      return;
    }

    if (!businessSlug || !businessId) {
      setSubmitError("Business information is missing.");
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setSubmitError(
        "Please provide either an email address or phone number."
      );
      return;
    }

    setSubmitError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          businessSlug,
          serviceId: service.id,
          startTime: slot,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(
          data.error || "Could not book that appointment."
        );
        return;
      }

      const label = formatSlotLabel(slot, timezone);

      const dateLabel = new Date(slot).toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          month: "long",
          day: "numeric",
        }
      );

      onConfirmed(
        `${service.name} on ${dateLabel} at ${label}.`
      );
    } catch {
      setSubmitError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "service") {
    return (
      <div className="space-y-3">
        {services.length === 0 && (
          <p className="text-sm text-inkLight">
            No services are available to book right now.
          </p>
        )}

        <div className="grid gap-2">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setService(s);
                setDate(null);
                setSlot(null);
                setSlots([]);
                setStep("date");
              }}
              className="text-left rounded-md border border-ink/15 bg-white/60 hover:border-brass hover:bg-brass/5 px-4 py-3 transition-colors"
            >
              <div className="flex justify-between items-baseline">
                <span className="font-display text-ink">
                  {s.name}
                </span>

                <span className="font-sans text-xs text-inkLight">
                  {s.duration_minutes} min
                </span>
              </div>

              {s.description && (
                <p className="text-xs text-inkLight mt-1">
                  {s.description}
                </p>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={onBack}
          className="text-xs text-inkLight underline hover:text-brass"
        >
          Back to menu
        </button>
      </div>
    );
  }

  if (step === "date") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-inkLight">
          Pick a day for your{" "}
          {service?.name.toLowerCase()}:
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {days.map((d) => (
            <button
              key={d.iso}
              onClick={() => {
                setDate(d.iso);
                setSlot(null);
                setSlots([]);
                setStep("slot");
              }}
              className="stamp-btn stamp-btn-available"
            >
              {d.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setStep("service")}
          className="text-xs text-inkLight underline hover:text-brass"
        >
          ← change service
        </button>
      </div>
    );
  }

  if (step === "slot") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-inkLight">
          Times for{" "}
          {date &&
            new Date(`${date}T12:00:00`).toLocaleDateString(
              "en-US",
              {
                weekday: "long",
                month: "long",
                day: "numeric",
              }
            )}
          :
        </p>

        {loadingSlots && (
          <p className="text-sm text-inkLight font-sans">
            Checking the book…
          </p>
        )}

        {slotError && (
          <p className="text-sm text-clay">
            {slotError}
          </p>
        )}

        {!loadingSlots &&
          !slotError &&
          slots.length === 0 && (
            <p className="text-sm text-inkLight">
              No open times that day — try another date.
            </p>
          )}

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map((s) => (
            <button
              key={s}
              onClick={() => {
                setSlot(s);
                setStep("details");
              }}
              className="stamp-btn stamp-btn-available"
            >
              {formatSlotLabel(s, timezone)}
            </button>
          ))}
        </div>

        <button
          onClick={() => setStep("date")}
          className="text-xs text-inkLight underline hover:text-brass"
        >
          ← change date
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleConfirm}
      className="space-y-3"
    >
      <p className="text-sm text-inkLight">
        Booking{" "}
        <strong className="text-ink">
          {service?.name}
        </strong>{" "}
        on{" "}
        {date &&
          new Date(`${date}T12:00:00`).toLocaleDateString(
            "en-US",
            {
              month: "long",
              day: "numeric",
            }
          )}{" "}
        at{" "}
        {slot && formatSlotLabel(slot, timezone)}. Just
        need your details:
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="rounded-md border border-ink/20 bg-white/80 px-3 py-2 text-sm focus:border-brass"
        />

        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (optional)"
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
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Anything we should know? (optional)"
        rows={2}
        className="w-full rounded-md border border-ink/20 bg-white/80 px-3 py-2 text-sm focus:border-brass resize-none"
      />

      {submitError && (
        <p className="text-sm text-clay">
          {submitError}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="stamp-btn stamp-btn-selected disabled:opacity-50"
        >
          {submitting
            ? "Booking…"
            : "Confirm appointment"}
        </button>

        <button
          type="button"
          onClick={() => setStep("slot")}
          className="text-xs text-inkLight underline hover:text-brass"
        >
          ← change time
        </button>
      </div>
    </form>
  );
}