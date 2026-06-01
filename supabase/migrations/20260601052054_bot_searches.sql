-- ═══════════════════════════════════════════════════════════════════════════
-- Búsquedas del bot por usuario. Cada cliente define sus propias búsquedas de
-- Wallapop desde la web; el bot las lee (con service_role) y le llena su feed.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.bot_searches (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name        text not null,
  keywords    text not null,
  order_by    text not null default 'newest',      -- newest | relevance
  time_filter text not null default 'lastWeek',    -- today | lastWeek | lastMonth
  distance_km int,                                  -- null = sin filtro de distancia
  lat         double precision,
  lng         double precision,
  min_price   int,
  max_price   int,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.bot_searches enable row level security;
drop policy if exists "own_select" on public.bot_searches;
drop policy if exists "own_insert" on public.bot_searches;
drop policy if exists "own_update" on public.bot_searches;
drop policy if exists "own_delete" on public.bot_searches;
create policy "own_select" on public.bot_searches for select using (auth.uid() = user_id);
create policy "own_insert" on public.bot_searches for insert with check (auth.uid() = user_id);
create policy "own_update" on public.bot_searches for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.bot_searches for delete using (auth.uid() = user_id);

notify pgrst, 'reload schema';
