-- Parkolyn Amsterdam — database schema (fresh install).
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- Already running the first version of the schema? Don't run this — run
-- supabase/migrations/002_admin_panel.sql and then 003_order_tracking.sql instead
-- (they upgrade in place).
--
-- Row Level Security is enabled with NO policies on purpose: the public
-- (anon) key can read/write nothing. Only the server, using the
-- service-role key (SUPABASE_SERVICE_ROLE_KEY), can touch these tables.

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------- couriers
-- Master list the admin panel picks from when adding an AWB to an order.
create table if not exists public.couriers (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  tracking_url_template text,                          -- e.g. https://courier.example/track/{awb}
  active                boolean not null default true,
  created_at            timestamptz not null default now()
);
create unique index if not exists couriers_name_lower_key on public.couriers (lower(name));

insert into public.couriers (name) values
  ('Delhivery'), ('Blue Dart'), ('DTDC'), ('India Post (Speed Post)'), ('Ecom Express'),
  ('XpressBees'), ('Shadowfax'), ('Ekart Logistics'), ('Amazon Shipping'),
  ('FedEx'), ('DHL Express'), ('Professional Couriers')
on conflict do nothing;

-- ------------------------------------------------------------------ orders
create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  order_ref           text not null unique,          -- customer-facing, e.g. PARK-MK3F9A-1B2C
  razorpay_order_id   text not null unique,
  razorpay_payment_id text,

  payment_status      text not null default 'pending'
                        check (payment_status in ('pending', 'paid', 'refunded')),
  status              text not null default 'awaiting_payment'   -- fulfilment status
                        check (status in ('awaiting_payment', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),

  amount              numeric(12,2) not null check (amount > 0), -- INR, in rupees
  currency            text not null default 'INR',
  items               jsonb not null,                -- [{ slug, name, qty, price }] price snapshot in INR

  customer_name       text not null,
  customer_email      text not null,
  customer_phone      text not null,
  customer_phone_key  text generated always as (right(regexp_replace(customer_phone, '\D', '', 'g'), 10)) stored,
                                                     -- last 10 digits; lets "Track my order" match however the number was typed
  shipping_address    text not null,                 -- street / flat / landmark
  shipping_city       text,
  shipping_state      text,
  shipping_pincode    text,
  notes               text,                          -- customer's order notes
  admin_notes         text,                          -- internal notes, never shown to the customer

  courier_id          uuid references public.couriers (id) on delete set null,
  courier_name        text,                          -- snapshot: survives renaming/removing a courier
  awb_number          text,
  tracking_url        text,

  created_at          timestamptz not null default now(),
  paid_at             timestamptz,
  shipped_at          timestamptz,
  delivered_at        timestamptz,
  cancelled_at        timestamptz,
  updated_at          timestamptz not null default now(),
  emails_sent_at      timestamptz                    -- null on a paid order = confirmation emails not sent yet
);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create index if not exists orders_status_created_idx  on public.orders (status, created_at desc);
create index if not exists orders_payment_created_idx on public.orders (payment_status, created_at desc);
create index if not exists orders_customer_email_idx  on public.orders (customer_email);
create index if not exists orders_city_idx            on public.orders (lower(shipping_city));
create index if not exists orders_awb_idx             on public.orders (awb_number);
create index if not exists orders_phone_key_idx       on public.orders (customer_phone_key);

-- ------------------------------------------------------------ order timeline
create table if not exists public.order_events (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  message    text not null,
  actor      text not null default 'system',         -- admin email, or 'system' / 'razorpay'
  created_at timestamptz not null default now()
);
create index if not exists order_events_order_idx on public.order_events (order_id, created_at);

-- ----------------------------------------------------- newsletter + contact
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
  created_at timestamptz not null default now(),
  handled_at timestamptz
);

-- --------------------------------------------------------------- admin auth
create table if not exists public.admin_users (
  id                  uuid primary key default gen_random_uuid(),
  email               text not null unique,           -- stored lower-case
  name                text,
  password_hash       text not null,                  -- scrypt$N$r$p$salt$hash — never plaintext
  active              boolean not null default true,
  created_at          timestamptz not null default now(),
  last_login_at       timestamptz,
  password_changed_at timestamptz
);

create table if not exists public.admin_sessions (
  id           uuid primary key default gen_random_uuid(),
  admin_id     uuid not null references public.admin_users (id) on delete cascade,
  token_hash   text not null unique,                 -- sha256 of the cookie token; the token itself is never stored
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at   timestamptz not null,
  ip           text,
  user_agent   text
);
create index if not exists admin_sessions_admin_idx on public.admin_sessions (admin_id);

create table if not exists public.admin_login_attempts (
  id         bigint generated always as identity primary key,
  email      text,
  ip         text,
  success    boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists admin_login_attempts_email_idx on public.admin_login_attempts (email, created_at);
create index if not exists admin_login_attempts_ip_idx    on public.admin_login_attempts (ip, created_at);

-- Rate-limit log for the public "Track my order" page (identifier stored hashed).
create table if not exists public.tracking_lookups (
  id         bigint generated always as identity primary key,
  ip         text,
  key_hash   text not null,
  created_at timestamptz not null default now()
);
create index if not exists tracking_lookups_ip_idx  on public.tracking_lookups (ip, created_at);
create index if not exists tracking_lookups_key_idx on public.tracking_lookups (key_hash, created_at);

-- RLS on, no policies: only the server (service-role key) can touch any of this.
alter table public.couriers              enable row level security;
alter table public.orders                enable row level security;
alter table public.order_events          enable row level security;
alter table public.subscribers           enable row level security;
alter table public.contact_messages      enable row level security;
alter table public.admin_users           enable row level security;
alter table public.admin_sessions        enable row level security;
alter table public.admin_login_attempts  enable row level security;
alter table public.tracking_lookups      enable row level security;
