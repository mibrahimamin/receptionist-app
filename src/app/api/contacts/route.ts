import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    const name =
      typeof body?.name === "string" ? body.name.trim() : "";

    const email =
      typeof body?.email === "string" ? body.email.trim() : "";

    const phone =
      typeof body?.phone === "string" ? body.phone.trim() : "";

    const message =
      typeof body?.message === "string" ? body.message.trim() : "";

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

    const business = await getCurrentBusiness();

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
        { error: error.message },
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