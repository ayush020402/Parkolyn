-- Tightens the "Track my order" phone match introduced in 003.
--
-- 003 keyed orders on "the last 10 digits" of whatever was typed, so a number
-- with a different country code (+44 98111 11111) matched an Indian customer
-- whose number ends the same way. This replaces it with a real Indian-mobile
-- normaliser: a key exists only for a valid number, and everything else is NULL
-- (that customer can still look up by email).
--
-- Safe to re-run. Additive from the running code's point of view: the app only
-- reads customer_phone_key, and rows keep a key or become NULL.
--
-- KEEP IN SYNC with indianMobileKey() in lib/identifier.mjs.

begin;

create or replace function public.phone_key(p text) returns text
language sql immutable parallel safe as $$
  select case
    when d ~ '^[6-9][0-9]{9}$'       then d              -- 9811111111
    when d ~ '^0[6-9][0-9]{9}$'      then substr(d, 2)   -- 09811111111
    when d ~ '^91[6-9][0-9]{9}$'     then substr(d, 3)   -- +91 98111 11111
    when d ~ '^0091[6-9][0-9]{9}$'   then substr(d, 5)   -- 0091 98111 11111
    else null
  end
  from (select regexp_replace(coalesce(p, ''), '\D', '', 'g') as d) s
$$;

drop index if exists public.orders_phone_key_idx;
alter table public.orders drop column if exists customer_phone_key;
alter table public.orders
  add column customer_phone_key text generated always as (public.phone_key(customer_phone)) stored;
create index if not exists orders_phone_key_idx on public.orders (customer_phone_key);

-- The rate limiter's window queries and the periodic cleanup filter on created_at alone.
create index if not exists tracking_lookups_created_idx on public.tracking_lookups (created_at);

commit;
