import { NextRequest, NextResponse } from "next/server";
import { addMinutes, parseISO, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { supabaseServer } from "@/lib/supabase/server";
import { getBusinessBySlug } from "@/lib/business";
import { computeAvailableSlots, dayRangeUtc } from "@/lib/availability";
import type { BusinessHour, Service } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const businessSlug =
    typeof body?.businessSlug === "string" ? body.businessSlug.trim() : "";

  const serviceId =
    typeof body?.serviceId === "string" ? body.serviceId : "";

  const startTime =
    typeof body?.startTime === "string" ? body.startTime : "";

  const name =
    typeof body?.name === "string" ? body.name.trim() : "";

  const email =
    typeof body?.email === "string" ? body.email.trim() : "";

  const phone =
    typeof body?.phone === "string" ? body.phone.trim() : "";

  const notes =
    typeof body?.notes === "string" ? body.notes.trim() : "";

  if (
    !businessSlug ||
    !serviceId ||
    !startTime ||
    !name ||
    (!email && !phone)
  ) {
    return NextResponse.json(
      { error: "Missing required booking details." },
      { status: 400 }
    );
  }

  const business = await getBusinessBySlug(businessSlug);

  if (!business) {
    return NextResponse.json(
      { error: "Business not found." },
      { status: 404 }
    );
  }

  // Use the business's own timezone to find which calendar day this instant
  // falls on locally — a raw UTC slice can land on the wrong day near
  // midnight depending on the business's offset from UTC.
  const dateISO = format(
    toZonedTime(parseISO(startTime), business.timezone),
    "yyyy-MM-dd"
  );

  const { startUtc, endUtc } = dayRangeUtc(
    dateISO,
    business.timezone
  );

  const { data: service } = await supabaseServer
    .from("services")
    .select("*")
    .eq("id", serviceId)
    .eq("business_id", business.id)
    .single();

  if (!service) {
    return NextResponse.json(
      { error: "That service no longer exists." },
      { status: 404 }
    );
  }

  const [{ data: hours }, { data: existing }] = await Promise.all([
    supabaseServer
      .from("business_hours")
      .select("*")
      .eq("business_id", business.id),

    supabaseServer
      .from("appointments")
      .select("start_time,end_time,buffer_minutes")
      .eq("business_id", business.id)
      .eq("status", "confirmed")
      .gte("start_time", startUtc)
      .lte("start_time", endUtc),
  ]);

  // Re-validate against live availability to prevent double-booking from a
  // stale client-side slot list.
  const validSlots = computeAvailableSlots({
    business,
    hours: (hours || []) as BusinessHour[],
    service: service as Service,
    dateISO,
    existing: existing || [],
  });

  if (!validSlots.includes(startTime)) {
    return NextResponse.json(
      {
        error:
          "That time was just taken. Please pick another slot.",
      },
      { status: 409 }
    );
  }

  const { data: contact, error: contactError } =
    await supabaseServer
      .from("contacts")
      .insert({
        business_id: business.id,
        name,
        email: email || null,
        phone: phone || null,
        message: notes || null,
        source: "booking",
      })
      .select("id")
      .single();

  if (contactError || !contact) {
    return NextResponse.json(
      { error: "Could not save your details." },
      { status: 500 }
    );
  }

  const start = parseISO(startTime);
  const end = addMinutes(
    start,
    service.duration_minutes
  );

  const { data: appointment, error: apptError } =
    await supabaseServer
      .from("appointments")
      .insert({
        business_id: business.id,
        contact_id: contact.id,
        service_id: service.id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        buffer_minutes: service.buffer_minutes,
        notes: notes || null,
      })
      .select("id,start_time,end_time")
      .single();

  if (apptError || !appointment) {
    return NextResponse.json(
      { error: "Could not book that appointment." },
      { status: 500 }
    );
  }

  return NextResponse.json({ appointment });
}