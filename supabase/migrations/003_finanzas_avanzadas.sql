-- Add quantity_sold to products (safe for existing rows — default 0)
alter table public.products
  add column quantity_sold integer not null default 0 check (quantity_sold >= 0);

-- Recurrence type for fixed costs
create type public.recurrence_type as enum ('monthly', 'annual');

-- Fixed costs table
create table public.fixed_costs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  name        text not null,
  amount      numeric not null check (amount >= 0),
  recurrence  recurrence_type not null default 'monthly',
  created_at  timestamptz not null default now()
);

alter table public.fixed_costs enable row level security;

create policy "Users can view own fixed costs"
  on public.fixed_costs for select using (auth.uid() = user_id);

create policy "Users can insert own fixed costs"
  on public.fixed_costs for insert with check (auth.uid() = user_id);

create policy "Users can update own fixed costs"
  on public.fixed_costs for update using (auth.uid() = user_id);

create policy "Users can delete own fixed costs"
  on public.fixed_costs for delete using (auth.uid() = user_id);
