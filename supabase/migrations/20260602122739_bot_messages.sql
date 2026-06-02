-- Plantillas de mensaje del bot, editables por cada usuario desde la web.
-- El bot elige una al azar de las activas (mantiene variedad anti-baneo).
create table if not exists public.bot_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  text       text not null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.bot_messages enable row level security;
drop policy if exists "own_select" on public.bot_messages;
drop policy if exists "own_insert" on public.bot_messages;
drop policy if exists "own_update" on public.bot_messages;
drop policy if exists "own_delete" on public.bot_messages;
create policy "own_select" on public.bot_messages for select using (auth.uid() = user_id);
create policy "own_insert" on public.bot_messages for insert with check (auth.uid() = user_id);
create policy "own_update" on public.bot_messages for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.bot_messages for delete using (auth.uid() = user_id);

notify pgrst, 'reload schema';
