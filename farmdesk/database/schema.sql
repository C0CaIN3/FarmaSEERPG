-- FarmDesk shared database (Supabase project "FarmDesk").
-- Players sign in with name + password (Supabase Auth, pseudo e-mail on farmdesk.invalid).
-- The first player to join becomes leader; everyone after waits for the leader's approval.
-- Every record stores who created and who last changed it; the server sets these, not the browser.

create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Players ------------------------------------------------------------------
create table public.members (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  name       text not null check (char_length(name) between 2 and 60),
  role       text not null default 'player' check (role in ('leader','player')),
  status     text not null default 'pending' check (status in ('pending','active','blocked')),
  created_at timestamptz not null default now()
);
create unique index members_name_key on public.members (lower(name));

-- One-time flag so the leader seat is handed out only once.
create table private.state (
  id boolean primary key default true check (id),
  bootstrapped boolean not null default false
);
insert into private.state default values;

-- Shared farm data ---------------------------------------------------------
-- kind: farm | tx (money movement) | log (journal) | ongoing (work in progress) | worker (phone book) | settings
create table public.records (
  kind       text not null check (kind in ('farm','tx','log','ongoing','worker','settings')),
  id         text not null check (char_length(id) between 1 and 100),
  data       jsonb not null check (jsonb_typeof(data) = 'object' and pg_column_size(data) < 200000),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (kind, id)
);
create index records_created_by_idx on public.records (created_by);
create index records_updated_by_idx on public.records (updated_by);

-- Server-side authorship: the browser cannot claim another player's work.
create function private.stamp_record() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := auth.uid();
    new.created_at := now();
  else
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;
  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end $$;
create trigger records_stamp before insert or update on public.records
  for each row execute function private.stamp_record();

-- Access checks --------------------------------------------------------------
create function private.is_active() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.members m where m.user_id = (select auth.uid()) and m.status = 'active');
$$;
create function private.is_leader() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.members m where m.user_id = (select auth.uid()) and m.status = 'active' and m.role = 'leader');
$$;
revoke all on function private.is_active(), private.is_leader(), private.stamp_record() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_active(), private.is_leader() to authenticated;

alter table public.members enable row level security;
alter table public.records enable row level security;
alter table private.state  enable row level security;

revoke all on public.members, public.records from anon;
revoke all on public.members from authenticated;
grant select on public.members to authenticated;
revoke all on public.records from authenticated;
grant select, insert, update, delete on public.records to authenticated;
revoke all on private.state from public, anon, authenticated;

-- Members: you always see yourself; active players see the whole team. Changes only via RPC below.
create policy members_read on public.members for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_active()));

-- Records: only active (approved, not blocked) players read and write.
create policy records_read   on public.records for select to authenticated using ((select private.is_active()));
create policy records_insert on public.records for insert to authenticated with check ((select private.is_active()));
create policy records_update on public.records for update to authenticated using ((select private.is_active())) with check ((select private.is_active()));
create policy records_delete on public.records for delete to authenticated using ((select private.is_active()));

-- RPC: join after sign-up/sign-in ---------------------------------------------
create function public.farmdesk_join(p_name text) returns public.members
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  clean text := btrim(regexp_replace(coalesce(p_name,''), '\s+', ' ', 'g'));
  me public.members;
  first_seat boolean;
begin
  if uid is null then raise exception 'not signed in' using errcode = '42501'; end if;
  perform pg_advisory_xact_lock(hashtext('farmdesk_join'));
  select * into me from public.members where user_id = uid;
  if found then return me; end if;
  if char_length(clean) < 2 or char_length(clean) > 60 then raise exception 'invalid name' using errcode = '22023'; end if;
  select not bootstrapped into first_seat from private.state where id;
  insert into public.members (user_id, name, role, status)
    values (uid, clean, case when first_seat then 'leader' else 'player' end, case when first_seat then 'active' else 'pending' end)
    returning * into me;
  if first_seat then update private.state set bootstrapped = true where id; end if;
  return me;
end $$;

-- RPC: leader approves, blocks or promotes a player ---------------------------
create function public.farmdesk_set_member(p_user uuid, p_status text default null, p_role text default null) returns public.members
language plpgsql security definer set search_path = '' as $$
declare target public.members;
begin
  if not private.is_leader() then raise exception 'leader only' using errcode = '42501'; end if;
  if p_user = auth.uid() then raise exception 'cannot change yourself' using errcode = '22023'; end if;
  if p_status is not null and p_status not in ('pending','active','blocked') then raise exception 'invalid status' using errcode = '22023'; end if;
  if p_role is not null and p_role not in ('leader','player') then raise exception 'invalid role' using errcode = '22023'; end if;
  update public.members set status = coalesce(p_status, status), role = coalesce(p_role, role)
    where user_id = p_user returning * into target;
  if not found then raise exception 'unknown player' using errcode = '22023'; end if;
  if p_status = 'blocked' then delete from auth.sessions where user_id = p_user; end if;
  return target;
end $$;

-- RPC: leader sets a forgotten password (signs the player out everywhere) ----
create function public.farmdesk_set_password(p_user uuid, p_password text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_leader() then raise exception 'leader only' using errcode = '42501'; end if;
  if char_length(coalesce(p_password,'')) < 8 then raise exception 'password too short' using errcode = '22023'; end if;
  if not exists (select 1 from public.members where user_id = p_user) then raise exception 'unknown player' using errcode = '22023'; end if;
  update auth.users set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf', 10)), updated_at = now() where id = p_user;
  delete from auth.sessions where user_id = p_user;
end $$;

revoke all on function public.farmdesk_join(text), public.farmdesk_set_member(uuid,text,text), public.farmdesk_set_password(uuid,text) from public, anon;
grant execute on function public.farmdesk_join(text), public.farmdesk_set_member(uuid,text,text), public.farmdesk_set_password(uuid,text) to authenticated;

-- Live updates for open apps.
alter publication supabase_realtime add table public.records, public.members;
