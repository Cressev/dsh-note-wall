-- Dedicated note-wall storage. Existing tables and other applications are untouched.
-- Apply only in the intended project. No anonymous access or service key is needed.
create table if not exists public.dsh_note_wall_sync_v1 (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision bigint not null default 1 check (revision > 0),
  wall jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.dsh_note_wall_sync_v1 enable row level security;
revoke all on public.dsh_note_wall_sync_v1 from public, anon, authenticated;
grant select on public.dsh_note_wall_sync_v1 to authenticated;
drop policy if exists dsh_note_wall_read_own on public.dsh_note_wall_sync_v1;
create policy dsh_note_wall_read_own on public.dsh_note_wall_sync_v1
  for select to authenticated using ((select auth.uid()) = user_id);

-- A write succeeds only against the revision that the client has read. The
-- function derives ownership from the authenticated session, never the caller.
create or replace function public.dsh_note_wall_compare_and_swap_v1(expected_revision bigint, new_wall jsonb)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  changed integer;
begin
  if caller is null then raise exception 'authentication required'; end if;
  if jsonb_typeof(new_wall) is distinct from 'object'
     or jsonb_typeof(new_wall->'folders') is distinct from 'array'
     or jsonb_typeof(new_wall->'notes') is distinct from 'array'
     or jsonb_typeof(new_wall->'images') is distinct from 'array' then
    raise exception 'invalid wall';
  end if;
  if expected_revision = 0 then
    insert into public.dsh_note_wall_sync_v1(user_id, revision, wall)
    values (caller, 1, new_wall) on conflict (user_id) do nothing;
  else
    update public.dsh_note_wall_sync_v1
    set revision = revision + 1, wall = new_wall, updated_at = now()
    where user_id = caller and revision = expected_revision;
  end if;
  get diagnostics changed = row_count;
  return changed = 1;
end;
$$;
revoke all on function public.dsh_note_wall_compare_and_swap_v1(bigint, jsonb) from public, anon;
grant execute on function public.dsh_note_wall_compare_and_swap_v1(bigint, jsonb) to authenticated;
