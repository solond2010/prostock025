-- ═══════════════════════════════════════════════════════════════════════════
-- FIX RLS: había políticas antiguas "permitir a todos" que anulaban el
-- aislamiento (RLS combina políticas con OR). Este script borra TODAS las
-- políticas de cada tabla y deja SOLO las de propiedad (auth.uid() = user_id).
-- push_subscriptions se excluye (ya tiene sus propias políticas correctas).
-- ═══════════════════════════════════════════════════════════════════════════

do $$
declare
  t text;
  pol record;
  tablas text[] := array[
    'stock_items','gastos_material','personal_finance_movements','repuestos_inventario',
    'tasks','events','deals','bot_status','bot_commands'
  ];
begin
  foreach t in array tablas loop
    execute format('alter table public.%I enable row level security', t);
    -- Borrar TODAS las políticas existentes de la tabla
    for pol in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', pol.policyname, t);
    end loop;
    -- Recrear únicamente las de propiedad
    execute format('create policy own_select on public.%I for select using (auth.uid() = user_id)', t);
    execute format('create policy own_insert on public.%I for insert with check (auth.uid() = user_id)', t);
    execute format('create policy own_update on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('create policy own_delete on public.%I for delete using (auth.uid() = user_id)', t);
  end loop;
end $$;

notify pgrst, 'reload schema';
