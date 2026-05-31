-- ═══════════════════════════════════════════════════════════════════════════
-- FASE 3 — Perfiles + prueba gratuita de 7 días
-- Cada usuario tiene un perfil con su estado de suscripción. Al registrarse se
-- crea solo con 7 días de trial. El usuario NO puede cambiarse el estado
-- (solo el backend/Stripe vía service_role). Los usuarios actuales → 'active'.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  status             text not null default 'trial',          -- trial | active | past_due | canceled
  trial_ends_at      timestamptz not null default (now() + interval '7 days'),
  plan               text,                                   -- monthly | annual
  stripe_customer_id text,
  current_period_end timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- El usuario solo puede LEER su propio perfil. No puede modificarlo
-- (los cambios de estado los hace el backend con la service_role, que ignora RLS).
drop policy if exists "own_select" on public.profiles;
create policy "own_select" on public.profiles for select using (auth.uid() = id);

-- Crear perfil automáticamente al registrarse un usuario nuevo (con trial de 7 días).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: crear perfil a los usuarios YA existentes y dejarlos como 'active'
-- (tú y tus cuentas de prueba actuales no quedan bloqueados).
insert into public.profiles (id, status)
  select id, 'active' from auth.users
  on conflict (id) do nothing;

notify pgrst, 'reload schema';
