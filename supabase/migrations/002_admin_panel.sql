-- Upgrade from the first schema (orders / subscribers / contact_messages) to the
-- admin-panel schema. Safe to re-run. Run it once in the Supabase SQL Editor,
-- and deploy the matching code right after (the old code reads amount_paise).
--
-- What changes:
--   * orders.amount_paise  ->  orders.amount (rupees, numeric(12,2)); existing rows converted
--   * orders.status        ->  fulfilment status; new orders.payment_status holds paid/pending/refunded
--   * structured shipping address (city / state / pincode) so orders can be filtered by city
--   * courier master list + courier / AWB / tracking columns on orders
--   * order timeline, admin users, admin sessions, login-attempt log

begin;

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------- couriers
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
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'amount_paise'
  ) then
    -- paise -> rupees
    alter table public.orders add column amount numeric(12,2);
    update public.orders set amount = amount_paise / 100.0;
    alter table public.orders alter column amount set not null;
    alter table public.orders drop column amount_paise;

    -- old `status` was really the payment flag (pending | paid)
    alter table public.orders add column payment_status text not null default 'pending';
    update public.orders set payment_status = case when status = 'paid' then 'paid' else 'pending' end;
    alter table public.orders drop constraint if exists orders_status_check;
    update public.orders set status = case when status = 'paid' then 'confirmed' else 'awaiting_payment' end;
    alter table public.orders alter column status set default 'awaiting_payment';
  end if;
end $$;

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('awaiting_payment', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));

alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check (payment_status in ('pending', 'paid', 'refunded'));

alter table public.orders drop constraint if exists orders_amount_check;
alter table public.orders add constraint orders_amount_check check (amount > 0);

alter table public.orders
  add column if not exists shipping_city    text,
  add column if not exists shipping_state   text,
  add column if not exists shipping_pincode text,
  add column if not exists courier_id       uuid references public.couriers (id) on delete set null,
  add column if not exists courier_name     text,          -- snapshot: survives renaming/removing a courier
  add column if not exists awb_number       text,
  add column if not exists tracking_url     text,
  add column if not exists shipped_at       timestamptz,
  add column if not exists delivered_at     timestamptz,
  add column if not exists cancelled_at     timestamptz,
  add column if not exists admin_notes      text,
  add column if not exists updated_at       timestamptz not null default now();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

drop index if exists public.orders_status_created_idx;
create index if not exists orders_status_created_idx  on public.orders (status, created_at desc);
create index if not exists orders_payment_created_idx on public.orders (payment_status, created_at desc);
create index if not exists orders_city_idx            on public.orders (lower(shipping_city));
create index if not exists orders_awb_idx             on public.orders (awb_number);

-- ------------------------------------------------------------ order timeline
create table if not exists public.order_events (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  message    text not null,
  actor      text not null default 'system',               -- admin email, or 'system' / 'razorpay'
  created_at timestamptz not null default now()
);
create index if not exists order_events_order_idx on public.order_events (order_id, created_at);

-- ------------------------------------------------------------ contact inbox
alter table public.contact_messages add column if not exists handled_at timestamptz;

-- --------------------------------------------------------------- admin auth
create table if not exists public.admin_users (
  id                  uuid primary key default gen_random_uuid(),
  email               text not null unique,                 -- stored lower-case
  name                text,
  password_hash       text not null,                        -- scrypt$N$r$p$salt$hash — never plaintext
  active              boolean not null default true,
  created_at          timestamptz not null default now(),
  last_login_at       timestamptz,
  password_changed_at timestamptz
);

create table if not exists public.admin_sessions (
  id           uuid primary key default gen_random_uuid(),
  admin_id     uuid not null references public.admin_users (id) on delete cascade,
  token_hash   text not null unique,                        -- sha256 of the cookie token; the token itself is never stored
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

-- RLS on, no policies: only the server (service-role key) can touch any of this.
alter table public.couriers              enable row level security;
alter table public.order_events          enable row level security;
alter table public.admin_users           enable row level security;
alter table public.admin_sessions        enable row level security;
alter table public.admin_login_attempts  enable row level security;

commit;
