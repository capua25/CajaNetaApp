-- 009_terms_acceptance.sql
-- Aceptación legal de Términos y Condiciones y Política de Privacidad (compliance).
-- Columnas nullables: NULL = el usuario todavía no aceptó (caerá en el gate de aceptación).
alter table public.users
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_version text;

comment on column public.users.terms_accepted_at is 'Timestamp de aceptación de Términos y Política de Privacidad. NULL = no aceptado.';
comment on column public.users.terms_version is 'Versión de los términos que el usuario aceptó.';
