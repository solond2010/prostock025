-- ───────────────────────────────────────────────────────────────────────────
-- Tabla push_subscriptions: guarda la suscripción Web Push de cada usuario.
-- Faltaba esta tabla → el cliente no podía guardar la suscripción y las
-- notificaciones nunca se enviaban (el botón se quedaba en "Activar").
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists public.push_subscriptions (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  subscription jsonb not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

-- Cada usuario gestiona SOLO su propia suscripción.
-- (El bot usa la service_role key, que ignora RLS y puede leer todas.)
drop policy if exists "own_push_select" on public.push_subscriptions;
create policy "own_push_select" on public.push_subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "own_push_insert" on public.push_subscriptions;
create policy "own_push_insert" on public.push_subscriptions
  for insert with check (auth.uid() = user_id);

drop policy if exists "own_push_update" on public.push_subscriptions;
create policy "own_push_update" on public.push_subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_push_delete" on public.push_subscriptions;
create policy "own_push_delete" on public.push_subscriptions
  for delete using (auth.uid() = user_id);

-- Refrescar la caché de esquema de PostgREST para que la API vea la tabla ya.
notify pgrst, 'reload schema';
