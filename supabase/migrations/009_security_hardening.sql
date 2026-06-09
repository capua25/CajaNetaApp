-- Migration: 009_security_hardening
-- a) Idempotency table for MP webhook events (deduplication)
-- b) Fix missing WITH CHECK on exchange_rates UPDATE policy (from migration 008)

-- a) MP webhook events deduplication table
CREATE TABLE public.mp_webhook_events (
  id              BIGSERIAL PRIMARY KEY,
  subscription_id TEXT NOT NULL,
  mp_status       TEXT NOT NULL,
  processed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (subscription_id, mp_status)
);

ALTER TABLE public.mp_webhook_events ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role accesses this table (bypasses RLS).

-- b) Fix exchange_rates UPDATE policy — add missing WITH CHECK
DROP POLICY "Users update own exchange rate override" ON public.exchange_rates;

CREATE POLICY "Users update own exchange rate override"
  ON public.exchange_rates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
