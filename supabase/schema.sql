-- Receptionist app schema
-- Run this in the Supabase SQL editor (or `supabase db push`).

create extension if not exists "pgcrypto";

-- One row per business. The app is single-tenant by default (see
-- NEXT_PUBLIC_BUSINESS_SLUG) but the schema supports several.
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null default 'default',
  name text not null default 'Your Business',
  tagline text not null default 'We are glad you stopped by.',
  greeting text not null default 'Hi there! I can answer questions, take your details, or book you an appointment. How can I help?',
  timezone text not null default 'America/Toronto',
  passcode_hash text, -- salt:hash, set via the setup script or dashboard settings
  slot_interval_minutes int not null default 15,
  created_at timestamptz not null default now()
);

create table if not exists business_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6), -- 0 = Sunday
  is_closed boolean not null default false,
  open_time time not null default '09:00',
  close_time time not null default '17:00',
  unique (business_id, day_of_week)
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes int not null default 30,
  buffer_minutes int not null default 0,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  question text not null,
  keywords text not null default '', -- comma separated keywords used for matching
  answer text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  message text,
  source text not null default 'chat', -- 'chat' | 'booking'
  created_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  contact_id uuid not null references contacts(id) on delete cascade,
  service_id uuid not null references services(id) on delete restrict,
  start_time timestamptz not null,
  end_time timestamptz not null,
  -- Copied from services.buffer_minutes at booking time so availability
  -- calculations don't need to join services for historical appointments
  -- even if the service's buffer is changed later.
  buffer_minutes int not null default 0,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists appointments_business_time_idx
  on appointments (business_id, start_time)
  where status = 'confirmed';

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- The public site uses the anon key directly from the browser for simple
-- reads (business info, hours, services, faqs) and for inserting new
-- contacts. Anything that reads private data (contacts, appointments) or
-- writes appointments goes through server-only API routes using the
-- service role key, which bypasses RLS entirely. That keeps the anon key
-- safe to ship to the browser while still letting visitors submit forms.
-- ---------------------------------------------------------------------------

alter table businesses enable row level security;
alter table business_hours enable row level security;
alter table services enable row level security;
alter table faqs enable row level security;
alter table contacts enable row level security;
alter table appointments enable row level security;

drop policy if exists "public can read businesses" on businesses;
create policy "public can read businesses" on businesses for select using (true);

drop policy if exists "public can read business hours" on business_hours;
create policy "public can read business hours" on business_hours for select using (true);

drop policy if exists "public can read active services" on services;
create policy "public can read active services" on services for select using (is_active = true);

drop policy if exists "public can read faqs" on faqs;
create policy "public can read faqs" on faqs for select using (true);

drop policy if exists "public can submit contact info" on contacts;
create policy "public can submit contact info" on contacts for insert with check (true);

-- No public select/update/delete policies on contacts or appointments:
-- those tables are only ever read or written by the server (service role).
