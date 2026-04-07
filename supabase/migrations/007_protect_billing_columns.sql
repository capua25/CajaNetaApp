-- Migration: 007_protect_billing_columns
-- Description: Trigger to prevent users from self-upgrading plan via direct Supabase API calls.
-- Without this, any user with their JWT + the public anon key can PATCH their own row
-- and set plan='pro', bypassing Mercado Pago entirely.
-- The trigger allows only service_role (webhooks, cron) to modify billing columns.

CREATE OR REPLACE FUNCTION prevent_plan_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  jwt_role TEXT;
BEGIN
  -- Extract role from the JWT claims set by PostgREST
  BEGIN
    jwt_role := current_setting('request.jwt.claims', true)::json->>'role';
  EXCEPTION WHEN OTHERS THEN
    jwt_role := NULL;
  END;

  -- Only service_role can modify billing columns
  IF jwt_role IS DISTINCT FROM 'service_role' THEN
    NEW.plan             := OLD.plan;
    NEW.plan_status      := OLD.plan_status;
    NEW.mp_subscription_id := OLD.mp_subscription_id;
    NEW.plan_expires_at  := OLD.plan_expires_at;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop if exists (idempotent re-run)
DROP TRIGGER IF EXISTS protect_billing_columns ON public.users;

CREATE TRIGGER protect_billing_columns
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_plan_self_update();
