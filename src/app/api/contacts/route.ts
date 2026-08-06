import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getBusinessBySlug } from "@/lib/business";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    const slug =
      typeof body?.slug === "string" ? body.slug.trim() : "";

    const name =
      typeof body?.name === "string" ? body.name.trim() : "";

    const email =
      typeof body?.email === "string" ? body.email.trim() : "";

    const phone =
      typeof body?.phone === "string" ? body.phone.trim() : "";

    const message =
      typeof body?.message === "string" ? body.message.trim() : "";

    if (!slug) {
      return NextResponse.json(
        { error: "Business information is missing." },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Please share your name." },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        {
          error:
            "Please share an email or phone number so we can reach you.",
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

    const { data, error } = await supabaseServer
      .from("contacts")
      .insert({
        business_id: business.id,
        name,
        email: email || null,
        phone: phone || null,
        message: message || null,
        source: "chat",
        status: "new",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Contact insert failed:", error);

      return NextResponse.json(
        { error: "Could not save your details. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        contactId: data.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact API failed:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}