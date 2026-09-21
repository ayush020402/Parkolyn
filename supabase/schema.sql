-- Parkolyn Amsterdam — database schema.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- Row Level Security is enabled with NO policies on purpose: the public
-- (anon) key can read/write nothing. Only the server, using the
-- service-role key (SUPABASE_SERVICE_ROLE_KEY), can touch these tables.

create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  order_ref           text not null unique,          -- customer-facing, e.g. PARK-MK3F9A-1B2C
  razorpay_order_id   text not null unique,
  razorpay_payment_id text,
  status              text not null default 'pending' check (status in ('pending', 'paid')),
  amount_paise        integer not null check (amount_paise > 0),
  currency            text not null default 'INR',
  items               jsonb not null,                -- [{ slug, name, qty, price }] price snapshot in INR
  customer_name       text not null,
  customer_email      text not null,
  customer_phone      text not null,
  shipping_address    text not null,
  notes               text,
  created_at          timestamptz not null default now(),
  paid_at             timestamptz,
  emails_sent_at      timestamptz                    -- null on a paid order = confirmation emails not sent yet
);

create index if not exists orders_status_created_idx on public.orders (status, created_at desc);
create index if not exists orders_customer_email_idx on public.orders (customer_email);

create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,                   -- stored lower-case
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  created_at timestamptz not null default now()
);

alter table public.orders           enable row level security;
alter table public.subscribers      enable row level security;
alter table public.contact_messages enable row level security;
