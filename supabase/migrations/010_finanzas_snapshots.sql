-- 010_finanzas_snapshots.sql
-- Snapshots históricos de la vista de finanzas avanzadas (Pro-only).
-- KPIs como columnas consultables + detalle de productos y costos fijos como JSONB.
-- Fidelidad histórica: usd_to_uyu_rate y display_currency se congelan al momento del snapshot.

create table if not exists public.finanzas_snapshots (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid not null references public.users(id) on delete cascade,
  created_at                  timestamptz not null default now(),
  note                        text check (note is null or char_length(note) <= 200),
  display_currency            text not null check (display_currency in ('UYU', 'USD')),
  usd_to_uyu_rate             numeric not null check (usd_to_uyu_rate > 0),
  total_fixed_costs_monthly   numeric not null default 0,
  mc_mix                      numeric,
  rc_mix                      numeric,
  break_even_units            numeric,
  break_even_revenue          numeric,
  margin_of_safety            numeric,
  actual_revenue              numeric not null default 0,
  net_profit                  numeric not null default 0,
  has_quantity_data           boolean not null default false,
  detail                      jsonb not null default '{}'::jsonb
);

create index if not exists finanzas_snapshots_user_created_idx
  on public.finanzas_snapshots (user_id, created_at desc);

alter table public.finanzas_snapshots enable row level security;

create policy "Users read own snapshots"
  on public.finanzas_snapshots for select
  using (auth.uid() = user_id);

create policy "Users insert own snapshots"
  on public.finanzas_snapshots for insert
  with check (auth.uid() = user_id);

create policy "Users delete own snapshots"
  on public.finanzas_snapshots for delete
  using (auth.uid() = user_id);
