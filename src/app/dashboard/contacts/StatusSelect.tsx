"use client";

import { useState } from "react";
import { updateContactStatus } from "./actions";

type StatusSelectProps = {
  contactId: string;
  currentStatus: string | null;
};

export default function StatusSelect({
  contactId,
  currentStatus,
}: StatusSelectProps) {
  const startingStatus = currentStatus || "new";

  const [status, setStatus] = useState(startingStatus);
  const [isSaving, setIsSaving] = useState(false);

  async function handleChange(newStatus: string) {
    const previousStatus = status;

    setStatus(newStatus);
    setIsSaving(true);

    const result = await updateContactStatus(contactId, newStatus);

    if (!result.success) {
      setStatus(previousStatus);
      alert(result.error || "Could not update status.");
    }

    setIsSaving(false);
  }

  return (
    <select
      value={status}
      disabled={isSaving}
      onChange={(event) => handleChange(event.target.value)}
      className="rounded-full border border-ink/15 bg-white px-3 py-1 text-xs font-sans uppercase tracking-wide disabled:opacity-50"
    >
      <option value="new">New</option>
      <option value="contacted">Contacted</option>
      <option value="booked">Booked</option>
      <option value="completed">Completed</option>
    </select>
  );
}