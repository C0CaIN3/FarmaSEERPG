-- Only before real named members register. All temporary rows roll back.
do $smoke$
declare a jsonb; b jsonb; snapshot jsonb;
begin
  if exists(select 1 from farmcrew_private.members) then raise exception 'Only run bootstrap smoke on an empty members table';end if;
  begin
    insert into auth.users(id,email,email_confirmed_at,aud,role,raw_app_meta_data) values
      ('00000000-0000-0000-0000-00000000fc21',repeat('a',64)||'@members.farmcrew.invalid',now(),'authenticated','authenticated','{"farmcrew_name_login":"v1"}'),
      ('00000000-0000-0000-0000-00000000fc22',repeat('b',64)||'@members.farmcrew.invalid',now(),'authenticated','authenticated','{"farmcrew_name_login":"v1"}');
    set local role service_role;
    a:=public.farmcrew_name_enroll('00000000-0000-0000-0000-00000000fc21',repeat('a',64),'Kontrola','Leader');
    b:=public.farmcrew_name_enroll('00000000-0000-0000-0000-00000000fc22',repeat('b',64),'Kontrola','Pracovník');
    if a->>'role'<>'leader' or b->>'role'<>'employee' then raise exception 'Role assignment failed';end if;
    perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000fc21',true);
    set local role authenticated;
    snapshot:=public.farmcrew_snapshot();
    if jsonb_array_length(snapshot->'permissions'->'leader')<>8 or (snapshot->'users'->0) ? 'email' then raise exception 'Leader snapshot failed';end if;
    begin
      perform public.farmcrew_name_enroll('00000000-0000-0000-0000-00000000fc21',repeat('a',64),'Forged','Identity');
      raise exception 'Authenticated client reached server-only enrollment';
    exception when insufficient_privilege then null;end;
    raise exception 'Rollback successful name-auth check' using errcode='ZX001';
  exception when sqlstate 'ZX001' then null;end;
end;
$smoke$;
select jsonb_build_object('test','passed_and_rolled_back','members',(select count(*) from farmcrew_private.members),'bootstrap_available',not(select registration_bootstrapped from farmcrew_private.workspace where id)) as verification;
