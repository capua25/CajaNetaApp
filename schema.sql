-- ============================================================
-- CajaNetaApp — Reference Schema (reflects all migrations)
-- ============================================================

-- Public users profile table (mirrors auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  plan text not null default 'free',
  plan_status text not null default 'free',
  created_at timestamptz not null default now()
);

-- Products table
create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  cost numeric not null check (cost >= 0),
  expenses numeric not null default 0 check (expenses >= 0),
  price numeric not null check (price >= 0),
  desired_margin numeric not null default 0.30 check (desired_margin >= 0 and desired_margin < 1),
  quantity_sold integer not null default 0 check (quantity_sold >= 0),
  created_at timestamptz not null default now()
);

-- Recurrence type
create type public.recurrence_type as enum ('monthly', 'annual');

-- Fixed costs table
create table public.fixed_costs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  amount numeric not null check (amount >= 0),
  recurrence recurrence_type not null default 'monthly',
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.fixed_costs enable row level security;

-- Users RLS
create policy "Users can view own profile"
  on public.users for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

-- Products RLS
create policy "Users can view own products"
  on public.products for select using (auth.uid() = user_id);

create policy "Users can insert own products"
  on public.products for insert with check (auth.uid() = user_id);

create policy "Users can update own products"
  on public.products for update using (auth.uid() = user_id);

create policy "Users can delete own products"
  on public.products for delete using (auth.uid() = user_id);

-- Fixed costs RLS
create policy "Users can view own fixed costs"
  on public.fixed_costs for select using (auth.uid() = user_id);

create policy "Users can insert own fixed costs"
  on public.fixed_costs for insert with check (auth.uid() = user_id);

create policy "Users can update own fixed costs"
  on public.fixed_costs for update using (auth.uid() = user_id);

create policy "Users can delete own fixed costs"
  on public.fixed_costs for delete using (auth.uid() = user_id);

-- Auto-create user profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
