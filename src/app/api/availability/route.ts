import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getBusinessBySlug } from "@/lib/business";
import { computeAvailableSlots, dayRangeUtc } from "@/lib/availability";
import type { BusinessHour, Service } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const slug = searchParams.get("slug");
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date"); // YYYY-MM-DD

  if (!slug || !serviceId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      {
        error: "slug, serviceId, and date (YYYY-MM-DD) are required.",
      },
      { status: 400 }
    );
  }

  const business = await getBusinessBySlug(slug);

  if (!business) {
    return NextResponse.json(
      { error: "Business not found." },
      { status: 404 }
    );
  }

  const { startUtc, endUtc } = dayRangeUtc(
    date,
    business.timezone
  );

  const [
    { data: service, error: serviceError },
    { data: hours, error: hoursError },
    { data: existing, error: apptError },
  ] = await Promise.all([
    supabaseServer
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .eq("business_id", business.id)
      .single(),

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

  if (serviceError || !service) {
    return NextResponse.json(
      { error: "Service not found." },
      { status: 404 }
    );
  }

  if (hoursError || apptError) {
    return NextResponse.json(
      { error: "Could not load availability." },
      { status: 500 }
    );
  }

  const slots = computeAvailableSlots({
    business,
    hours: (hours || []) as BusinessHour[],
    service: service as Service,
    dateISO: date,
    existing: existing || [],
  });

  return NextResponse.json({
    slots,
    timezone: business.timezone,
  });
}