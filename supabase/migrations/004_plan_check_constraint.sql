ALTER TABLE users
  ADD CONSTRAINT users_plan_check
  CHECK (plan IN ('free', 'plus', 'pro'));
