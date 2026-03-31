-- Migration: 005_mp_subscriptions
-- Description: Add mp_subscription_id column to users table for Mercado Pago integration

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS mp_subscription_id TEXT;

-- Nullable: NULL for free-plan users who have never subscribed
-- No index: lookups happen by user.id (PK) or payer_email, not by mp_subscription_id
-- No FK constraint: MP subscription IDs are external strings, not DB rows
