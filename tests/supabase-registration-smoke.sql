-- Administrator-only check for an empty deployment. Everything rolls back.
do $smoke$
declare s jsonb; first_id text;
begin
  if exists(select 1 from farmcrew_private.members) then raise exception 'Run this bootstrap check only before the first real member joins'; end if;
  begin
    insert into auth.users(id,email,email_confirmed_at,aud,role) values
      ('00000000-0000-0000-0000-00000000fc11','signup-smoke1@example.invalid',now(),'authenticated','authenticated'),
      ('00000000-0000-0000-0000-00000000fc12','signup-smoke2@example.invalid',now(),'authenticated','authenticated');
    perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000fc11',true);
    set local role authenticated;
    s:=public.farmcrew_join('Prvý Smoke Člen');first_id:=s->>'memberId';
    if not exists(select 1 from jsonb_array_elements(s->'users') u where u->>'id'=first_id and u->>'role'='leader')
      or jsonb_array_length(s->'permissions'->'leader')<>8 then raise exception 'First leader check failed'; end if;
    s:=public.farmcrew_join('Opakovaný Pokus');
    if s->>'memberId'<>first_id or jsonb_array_length(s->'users')<>1 then raise exception 'Idempotent registration check failed'; end if;
    perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000fc12',true);
    s:=public.farmcrew_join('Druhý Smoke Člen');
    if s->>'pending' is distinct from 'true' or s ? 'users' then raise exception 'Later member approval check failed'; end if;
    raise exception 'Rollback successful registration check' using errcode='ZX001';
  exception when sqlstate 'ZX001' then null;
  end;
end;
$smoke$;
select jsonb_build_object('registration_test','passed_and_rolled_back',
  'members',(select count(*) from farmcrew_private.members),
  'auth_users',(select count(*) from auth.users),
  'registration_bootstrapped',(select registration_bootstrapped from farmcrew_private.workspace where id)) as verification;
