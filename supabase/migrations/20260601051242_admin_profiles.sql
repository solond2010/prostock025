-- ═══════════════════════════════════════════════════════════════════════════
-- Panel de admin: el dueño puede ver y cambiar el estado de todos los perfiles.
-- Se guarda el email en profiles para identificar a cada usuario en el panel.
-- ═══════════════════════════════════════════════════════════════════════════

-- Email en profiles
alter table public.profiles add column if not exists email text;
update public.profiles p set email = u.email from auth.users u where u.id = p.id and p.email is null;

-- El trigger de registro ahora también guarda el email
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end;
$$;

-- Políticas de ADMIN (solo el dueño): ver y actualizar cualquier perfil.
drop policy if exists "admin_select" on public.profiles;
create policy "admin_select" on public.profiles
  for select using (auth.uid() = 'd4b1e77e-6596-4f9d-96f8-a9eb579cc5b2');

drop policy if exists "admin_update" on public.profiles;
create policy "admin_update" on public.profiles
  for update using (auth.uid() = 'd4b1e77e-6596-4f9d-96f8-a9eb579cc5b2')
  with check (auth.uid() = 'd4b1e77e-6596-4f9d-96f8-a9eb579cc5b2');

notify pgrst, 'reload schema';
