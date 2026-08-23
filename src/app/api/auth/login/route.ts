import { NextRequest, NextResponse } from "next/server";
import { getDashboardBusiness } from "@/lib/business";
import { verifyPasscode } from "@/lib/passcode";
import { createSessionCookieValue, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const passcode = typeof body?.passcode === "string" ? body.passcode : "";

  if (!passcode) {
    return NextResponse.json({ error: "Enter the passcode." }, { status: 400 });
  }

const business = await getDashboardBusiness();
  if (!business.passcode_hash) {
    return NextResponse.json(
      { error: "No passcode has been set up yet. See README.md for setup." },
      { status: 400 }
    );
  }

  if (!verifyPasscode(passcode, business.passcode_hash)) {
    return NextResponse.json({ error: "That passcode isn't right." }, { status: 401 });
  }

  const cookieValue = await createSessionCookieValue(business.id);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
  return response;
}
