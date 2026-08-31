-- Ejecutar una vez en Supabase: SQL Editor > New query.
-- Este tracker usa un único tablero compartido. Para restringir el acceso por
-- usuario, hay que añadir autenticación antes de reemplazar estas políticas.

create table if not exists public.project_snapshots (
  id text primary key,
  snapshot jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.project_snapshots enable row level security;

-- Required when "Automatically expose new tables" is disabled in Supabase.
grant select, insert, update on table public.project_snapshots to anon;

drop policy if exists "Read shared project tracker" on public.project_snapshots;
create policy "Read shared project tracker"
  on public.project_snapshots for select to anon using (id = 'project-tracker');

drop policy if exists "Create shared project tracker" on public.project_snapshots;
create policy "Create shared project tracker"
  on public.project_snapshots for insert to anon with check (id = 'project-tracker');

drop policy if exists "Update shared project tracker" on public.project_snapshots;
create policy "Update shared project tracker"
  on public.project_snapshots for update to anon
  using (id = 'project-tracker')
  with check (id = 'project-tracker');
