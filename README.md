# Front Desk — a receptionist web app

A small front desk for your business: it greets visitors, answers FAQs,
collects contact details, books appointments against real availability, and
gives you a dashboard to manage all of it.

Built with **Next.js 14 (App Router, TypeScript)** and **Supabase** (Postgres + RLS), FAQ matching is keyword-based and free to run. 

## Features

- **Public chat widget** (`/`) — greets visitors, answers FAQs by keyword
  match, captures name/email/phone/message, and books appointments through a
  service → date → time → details flow.
- **Real scheduling** — respects your business hours per day of week, each
  service's duration and buffer time, and existing bookings. Availability is
  re-validated server-side at booking time so two people can't double-book
  the same slot.
- **Dashboard** (`/dashboard`) — overview stats, appointments (with status
  changes), contacts/leads, services, FAQs, and settings (business info,
  hours, and the passcode), all behind a passcode login.

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run `supabase/schema.sql`, then `supabase/seed.sql`
   (edit the sample business info in `seed.sql` first if you like, or just
   change it later from the dashboard's Settings page).
3. From **Project Settings → API**, grab your Project URL, `anon` public
   key, and `service_role` secret key.

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` from step 1. Generate a `SESSION_SECRET` with:

```bash
openssl rand -hex 32
```

Leave `NEXT_PUBLIC_BUSINESS_SLUG=default` unless you changed the slug in
`seed.sql`.

## 3. Set your dashboard passcode

Generate a hash for the passcode you want to use:

```bash
npm install
node scripts/hash-passcode.mjs "your-passcode-here"
```

Copy the printed `salt:hash` value and set it in Supabase (Table editor, or
SQL Editor):

```sql
update businesses set passcode_hash = 'PASTE_THE_VALUE_HERE' where slug = 'default';
```

(You can also change the passcode later from **Dashboard → Settings** once
you're logged in.)

## 4. Run it

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` for the public front desk, and
`http://localhost:3000/dashboard` for the dashboard.

## Project structure

```
supabase/schema.sql        Database tables + RLS policies
supabase/seed.sql          Sample business, hours, services, FAQs
scripts/hash-passcode.mjs  CLI to generate a passcode hash

src/lib/availability.ts    Slot-generation engine (hours, duration, buffer, timezone)
src/lib/faqMatch.ts        Keyword matching for the FAQ chat panel
src/lib/session.ts         Signed session cookie (Edge + Node compatible)
src/lib/passcode.ts        Passcode hashing/verification (Node only)
src/lib/actions.ts         Server actions used by the dashboard forms

src/app/page.tsx           Public front desk / chat widget
src/app/api/*              Contact capture, availability, booking, auth
src/app/dashboard/*        Overview, appointments, contacts, services, FAQs, settings
src/components/chat/*      Chat widget UI
src/components/dashboard/* Dashboard UI
```

## How the pieces fit together

- **Public reads** (business info, hours, services, FAQs) and **contact
  inserts** go straight from the browser to Supabase using the `anon` key,
  restricted by the RLS policies in `schema.sql`.
- **Bookings, dashboard data, and login** go through Next.js API routes /
  server actions using the `service_role` key, which never reaches the
  browser. This is what keeps `contacts` and `appointments` private without
  needing full Supabase Auth.
- **Availability** is computed by `computeAvailableSlots()` — it takes the
  day's business hours, existing confirmed appointments (each carrying its
  own buffer), and the requested service's duration/buffer, and returns
  bookable start times on your slot grid (default every 15 minutes,
  configurable in Settings). The booking API recomputes and re-checks this
  server-side before saving, so a slot that got taken between page load and
  submit is rejected with a clear error instead of double-booking.

## Extending it

- **Multiple businesses**: the schema already supports more than one row in
  `businesses`; you'd add a way to resolve which business a request is for
  (subdomain, path segment, etc.) instead of the fixed `NEXT_PUBLIC_BUSINESS_SLUG`.
  All queries already do so via `getCurrentBusiness()`.
  - **Email/SMS notifications**: hook into the `appointments`/`contacts`
    insert points in `src/app/api/*` (e.g. with Resend, Postmark, or Twilio).
  - **Smarter FAQ matching / AI chat**: swap `src/lib/faqMatch.ts` for a call
    to an LLM API if you outgrow keyword matching.
  - **Real Supabase Auth for the dashboard**: replace `src/lib/passcode.ts`
    and `src/lib/session.ts` with Supabase Auth if you need multiple staff
    logins with different permissions.

## Known limitations

- Single shared passcode for the whole dashboard (by design, per the brief) —
  there's no per-user audit trail.
- The chat's FAQ matching is keyword-based, not conversational; unmatched
  questions route the visitor to the contact form.
