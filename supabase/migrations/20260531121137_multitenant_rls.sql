-- ═══════════════════════════════════════════════════════════════════════════
-- FASE 1 — Aislamiento de datos por usuario (multi-tenant con RLS)
-- Cada usuario solo puede ver/editar sus propias filas. El bot usa la
-- service_role key, que ignora RLS, así que sigue funcionando igual.
--
-- Seguro de re-ejecutar (idempotente). Aplicar ANTES de crear más cuentas.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Helper conceptual: para cada tabla hacemos ──
--   1) añadir user_id (si falta) con default = usuario actual
--   2) asignar filas existentes al primer usuario (tú)
--   3) user_id NOT NULL
--   4) activar RLS
--   5) 4 políticas: select / insert / update / delete  (auth.uid() = user_id)

-- ─────────────────────────────────────────────────────────────
-- TABLAS SIN user_id (hay que crearlo): stock_items, gastos_material,
-- personal_finance_movements, repuestos_inventario
-- ─────────────────────────────────────────────────────────────

-- stock_items
alter table public.stock_items add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
update public.stock_items set user_id = (select id from auth.users order by created_at asc limit 1) where user_id is null;
alter table public.stock_items alter column user_id set not null;
alter table public.stock_items enable row level security;
drop policy if exists "own_select" on public.stock_items;
drop policy if exists "own_insert" on public.stock_items;
drop policy if exists "own_update" on public.stock_items;
drop policy if exists "own_delete" on public.stock_items;
create policy "own_select" on public.stock_items for select using (auth.uid() = user_id);
create policy "own_insert" on public.stock_items for insert with check (auth.uid() = user_id);
create policy "own_update" on public.stock_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.stock_items for delete using (auth.uid() = user_id);

-- gastos_material
alter table public.gastos_material add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
update public.gastos_material set user_id = (select id from auth.users order by created_at asc limit 1) where user_id is null;
alter table public.gastos_material alter column user_id set not null;
alter table public.gastos_material enable row level security;
drop policy if exists "own_select" on public.gastos_material;
drop policy if exists "own_insert" on public.gastos_material;
drop policy if exists "own_update" on public.gastos_material;
drop policy if exists "own_delete" on public.gastos_material;
create policy "own_select" on public.gastos_material for select using (auth.uid() = user_id);
create policy "own_insert" on public.gastos_material for insert with check (auth.uid() = user_id);
create policy "own_update" on public.gastos_material for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.gastos_material for delete using (auth.uid() = user_id);

-- personal_finance_movements
alter table public.personal_finance_movements add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
update public.personal_finance_movements set user_id = (select id from auth.users order by created_at asc limit 1) where user_id is null;
alter table public.personal_finance_movements alter column user_id set not null;
alter table public.personal_finance_movements enable row level security;
drop policy if exists "own_select" on public.personal_finance_movements;
drop policy if exists "own_insert" on public.personal_finance_movements;
drop policy if exists "own_update" on public.personal_finance_movements;
drop policy if exists "own_delete" on public.personal_finance_movements;
create policy "own_select" on public.personal_finance_movements for select using (auth.uid() = user_id);
create policy "own_insert" on public.personal_finance_movements for insert with check (auth.uid() = user_id);
create policy "own_update" on public.personal_finance_movements for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.personal_finance_movements for delete using (auth.uid() = user_id);

-- repuestos_inventario
alter table public.repuestos_inventario add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
update public.repuestos_inventario set user_id = (select id from auth.users order by created_at asc limit 1) where user_id is null;
alter table public.repuestos_inventario alter column user_id set not null;
alter table public.repuestos_inventario enable row level security;
drop policy if exists "own_select" on public.repuestos_inventario;
drop policy if exists "own_insert" on public.repuestos_inventario;
drop policy if exists "own_update" on public.repuestos_inventario;
drop policy if exists "own_delete" on public.repuestos_inventario;
create policy "own_select" on public.repuestos_inventario for select using (auth.uid() = user_id);
create policy "own_insert" on public.repuestos_inventario for insert with check (auth.uid() = user_id);
create policy "own_update" on public.repuestos_inventario for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.repuestos_inventario for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- TABLAS QUE YA TIENEN user_id: solo default + RLS + políticas.
-- (El bot escribe deals/bot_status/bot_commands con service_role → ignora RLS.)
-- ─────────────────────────────────────────────────────────────

-- tasks
alter table public.tasks alter column user_id set default auth.uid();
alter table public.tasks enable row level security;
drop policy if exists "own_select" on public.tasks;
drop policy if exists "own_insert" on public.tasks;
drop policy if exists "own_update" on public.tasks;
drop policy if exists "own_delete" on public.tasks;
create policy "own_select" on public.tasks for select using (auth.uid() = user_id);
create policy "own_insert" on public.tasks for insert with check (auth.uid() = user_id);
create policy "own_update" on public.tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.tasks for delete using (auth.uid() = user_id);

-- events
alter table public.events alter column user_id set default auth.uid();
alter table public.events enable row level security;
drop policy if exists "own_select" on public.events;
drop policy if exists "own_insert" on public.events;
drop policy if exists "own_update" on public.events;
drop policy if exists "own_delete" on public.events;
create policy "own_select" on public.events for select using (auth.uid() = user_id);
create policy "own_insert" on public.events for insert with check (auth.uid() = user_id);
create policy "own_update" on public.events for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.events for delete using (auth.uid() = user_id);

-- deals
alter table public.deals enable row level security;
drop policy if exists "own_select" on public.deals;
drop policy if exists "own_insert" on public.deals;
drop policy if exists "own_update" on public.deals;
drop policy if exists "own_delete" on public.deals;
create policy "own_select" on public.deals for select using (auth.uid() = user_id);
create policy "own_insert" on public.deals for insert with check (auth.uid() = user_id);
create policy "own_update" on public.deals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.deals for delete using (auth.uid() = user_id);

-- bot_status
alter table public.bot_status enable row level security;
drop policy if exists "own_select" on public.bot_status;
drop policy if exists "own_insert" on public.bot_status;
drop policy if exists "own_update" on public.bot_status;
drop policy if exists "own_delete" on public.bot_status;
create policy "own_select" on public.bot_status for select using (auth.uid() = user_id);
create policy "own_insert" on public.bot_status for insert with check (auth.uid() = user_id);
create policy "own_update" on public.bot_status for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.bot_status for delete using (auth.uid() = user_id);

-- bot_commands
alter table public.bot_commands enable row level security;
drop policy if exists "own_select" on public.bot_commands;
drop policy if exists "own_insert" on public.bot_commands;
drop policy if exists "own_update" on public.bot_commands;
drop policy if exists "own_delete" on public.bot_commands;
create policy "own_select" on public.bot_commands for select using (auth.uid() = user_id);
create policy "own_insert" on public.bot_commands for insert with check (auth.uid() = user_id);
create policy "own_update" on public.bot_commands for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.bot_commands for delete using (auth.uid() = user_id);

-- push_subscriptions ya tiene RLS (migración anterior). No se toca.

-- Refrescar la caché de esquema de PostgREST.
notify pgrst, 'reload schema';
