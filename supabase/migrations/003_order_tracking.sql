-- Public "Track my order" page support. Additive and safe to re-run; the code
-- that was deployed before this keeps working, so run it BEFORE deploying.
--
--   * customer_phone_key — the last 10 digits of the phone number, computed by
--     the database, so "+91 98111-11111", "098111 11111" and "9811111111" all
--     match the same customer no matter how it was typed at checkout
--   * tracking_lookups — one row per lookup, used only for rate limiting
--     (the email/phone is stored as a SHA-256, never in the clear)

begin;

alter table public.orders
  add column if not exists customer_phone_key text
  generated always as (right(regexp_replace(customer_phone, '\D', '', 'g'), 10)) stored;

create index if not exists orders_phone_key_idx on public.orders (customer_phone_key);

create table if not exists public.tracking_lookups (
  id         bigint generated always as identity primary key,
  ip         text,
  key_hash   text not null,
  created_at timestamptz not null default now()
);
create index if not exists tracking_lookups_ip_idx  on public.tracking_lookups (ip, created_at);
create index if not exists tracking_lookups_key_idx on public.tracking_lookups (key_hash, created_at);

alter table public.tracking_lookups enable row level security;

commit;
