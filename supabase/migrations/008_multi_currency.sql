-- Migration: 008_multi_currency
-- Adds currency columns to products + fixed_costs, display_currency to users,
-- and introduces an exchange_rates table (global + per-user overrides).

-- 1. Products: currency column
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'UYU'
    CHECK (currency IN ('UYU', 'USD'));

-- 2. Fixed costs: currency column
ALTER TABLE public.fixed_costs
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'UYU'
    CHECK (currency IN ('UYU', 'USD'));

-- 3. Users: display_currency column
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS display_currency TEXT NOT NULL DEFAULT 'UYU'
    CHECK (display_currency IN ('UYU', 'USD'));

-- 4. exchange_rates table
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.users(id) ON DELETE CASCADE,
  from_currency   TEXT NOT NULL CHECK (from_currency IN ('UYU', 'USD')),
  to_currency     TEXT NOT NULL CHECK (to_currency   IN ('UYU', 'USD')),
  rate            NUMERIC NOT NULL CHECK (rate > 0 AND rate <= 1000),
  source          TEXT NOT NULL CHECK (source IN ('api', 'manual')),
  effective_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (from_currency <> to_currency)
);

-- UNIQUE: one active rate per (user_id, from, to).
-- COALESCE trick: NULL user_id (global row) maps to sentinel UUID so the unique constraint applies.
CREATE UNIQUE INDEX IF NOT EXISTS exchange_rates_user_pair_uniq
  ON public.exchange_rates (
    COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid),
    from_currency,
    to_currency
  );

CREATE INDEX IF NOT EXISTS exchange_rates_user_idx
  ON public.exchange_rates (user_id);

-- RLS
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read own or global exchange rates"
  ON public.exchange_rates FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users insert own exchange rate override"
  ON public.exchange_rates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own exchange rate override"
  ON public.exchange_rates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own exchange rate override"
  ON public.exchange_rates FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Seed global USD->UYU row (fallback for first deploy)
INSERT INTO public.exchange_rates (user_id, from_currency, to_currency, rate, source, effective_date)
VALUES (NULL, 'USD', 'UYU', 40.0, 'api', CURRENT_DATE)
ON CONFLICT DO NOTHING;
