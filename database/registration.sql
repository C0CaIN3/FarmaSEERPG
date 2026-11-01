-- Apply after schema.sql. The bootstrap latch never reopens when members are removed.
alter table farmcrew_private.workspace add column if not exists registration_bootstrapped boolean not null default false;
update farmcrew_private.workspace set registration_bootstrapped=true where exists(select 1 from farmcrew_private.members);

create or replace function farmcrew_private.join_member(p_name text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  w farmcrew_private.workspace;
  m farmcrew_private.members;
  account_id uuid;
  account_email text;
  display_name text;
  first_member boolean;
begin
  account_id:=auth.uid();
  if account_id is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  -- Serialize all registration decisions with the same lock used by job/member changes.
  select * into w from farmcrew_private.workspace where id for update;
  select lower(trim(u.email)) into account_email from auth.users u
    where u.id=account_id and u.email_confirmed_at is not null;
  if account_email is null or account_email='' then raise exception 'EMAIL_NOT_VERIFIED' using errcode='42501'; end if;

  select * into m from farmcrew_private.members where auth_id=account_id or email=account_email;
  if m.id is not null then
    -- An existing role, invitation, or block always wins over self registration.
    if not m.active or m.email is distinct from account_email or (m.auth_id is not null and m.auth_id<>account_id)
      then raise exception 'MEMBERSHIP_REQUIRED' using errcode='42501'; end if;
    if m.auth_id is not null then return farmcrew_private.snapshot(); end if;
    update farmcrew_private.members set auth_id=account_id where id=m.id;
  else
    display_name:=trim(coalesce(p_name,''));
    if length(display_name) not between 3 and 80 then raise exception 'INVALID_NAME'; end if;
    first_member:=not w.registration_bootstrapped and not exists(select 1 from farmcrew_private.members);
    insert into farmcrew_private.members(auth_id,email,name,role)
      values(account_id,account_email,display_name,case when first_member then 'leader' else 'employee' end)
      returning * into m;
  end if;
  update farmcrew_private.workspace set registration_bootstrapped=true,revision=revision+1 where id returning revision into w.revision;
  insert into farmcrew_private.audit(request,actor,action,revision)
    values(gen_random_uuid(),account_id,'member_join',w.revision);
  return farmcrew_private.snapshot();
end;
$$;
create or replace function public.farmcrew_join(p_name text default null) returns jsonb
language sql security invoker set search_path = '' as $$ select farmcrew_private.join_member(p_name); $$;
revoke all on function farmcrew_private.join_member(text) from public,anon,authenticated;
revoke all on function public.farmcrew_join(text) from public,anon,authenticated;
grant execute on function farmcrew_private.join_member(text),public.farmcrew_join(text) to authenticated;
notify pgrst,'reload schema';
