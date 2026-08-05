import { addMinutes, isBefore, isEqual, parseISO } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import type { Business, BusinessHour, Service } from "./types";

export type BookedBlock = {
  start_time: string; // ISO, UTC
  end_time: string; // ISO, UTC
  buffer_minutes: number;
};

/**
 * Computes bookable start times (as ISO strings, UTC) for a service on a
 * given calendar date, in the business's own timezone.
 *
 * - Looks up the business's open hours for that day of week.
 * - Generates candidate starts on the business's slot grid (e.g. every 15m).
 * - Rejects any candidate that would run past closing time.
 * - Rejects any candidate that overlaps an existing appointment, expanded
 *   by that appointment's buffer, or that would leave less than the new
 *   service's own buffer before the next existing appointment.
 * - Rejects candidates in the past (for "today").
 */
export function computeAvailableSlots({
  business,
  hours,
  service,
  dateISO,
  existing,
  now = new Date(),
}: {
  business: Pick<Business, "timezone" | "slot_interval_minutes">;
  hours: BusinessHour[];
  service: Pick<Service, "duration_minutes" | "buffer_minutes">;
  dateISO: string; // 'YYYY-MM-DD'
  existing: BookedBlock[];
  now?: Date;
}): string[] {
  const zonedMidnight = parseISO(`${dateISO}T00:00:00`);
  const dayOfWeek = zonedMidnight.getDay();
  const dayHours = hours.find((h) => h.day_of_week === dayOfWeek);

  if (!dayHours || dayHours.is_closed) return [];

  const openUtc = fromZonedTime(`${dateISO}T${dayHours.open_time}`, business.timezone);
  const closeUtc = fromZonedTime(`${dateISO}T${dayHours.close_time}`, business.timezone);

  const totalDuration = service.duration_minutes;
  const step = business.slot_interval_minutes || 15;

  const blocks = existing.map((b) => ({
    start: parseISO(b.start_time),
    endBuffered: addMinutes(parseISO(b.end_time), b.buffer_minutes),
  }));

  const slots: string[] = [];
  let cursor = openUtc;

  while (isBefore(cursor, closeUtc) || isEqual(cursor, closeUtc)) {
    const slotEnd = addMinutes(cursor, totalDuration);
    const slotEndBuffered = addMinutes(slotEnd, service.buffer_minutes);

    const fitsBeforeClose = isBefore(slotEnd, closeUtc) || isEqual(slotEnd, closeUtc);
    const isInFuture = isBefore(now, cursor);

    const overlaps = blocks.some(
      (b) => isBefore(cursor, b.endBuffered) && isBefore(b.start, slotEndBuffered)
    );

    if (fitsBeforeClose && isInFuture && !overlaps) {
      slots.push(cursor.toISOString());
    }

    cursor = addMinutes(cursor, step);
  }

  return slots;
}

/** UTC instants for local midnight-to-midnight of a given calendar date. */
export function dayRangeUtc(dateISO: string, timezone: string) {
  const startUtc = fromZonedTime(`${dateISO}T00:00:00`, timezone);
  const endUtc = fromZonedTime(`${dateISO}T23:59:59.999`, timezone);
  return { startUtc: startUtc.toISOString(), endUtc: endUtc.toISOString() };
}

/** Formats a UTC ISO instant as e.g. "9:00 AM" in the business's timezone. */
export function formatSlotLabel(isoUtc: string, timezone: string) {
  const zoned = toZonedTime(parseISO(isoUtc), timezone);
  return zoned.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
