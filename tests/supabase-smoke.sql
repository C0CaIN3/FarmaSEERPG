-- Run as the project administrator. The inner subtransaction always rolls back.
-- No test accounts, jobs, payments or audit rows survive this check.
do $smoke$
declare
  s jsonb;
  j jsonb;
  id text;
  owner_id constant uuid := '00000000-0000-0000-0000-00000000fc01';
  worker_id constant uuid := '00000000-0000-0000-0000-00000000fc02';
begin
  begin
    insert into auth.users(id,email,email_confirmed_at,aud,role) values
      (owner_id,'farmcrew-smoke-owner@example.invalid',now(),'authenticated','authenticated'),
      (worker_id,'farmcrew-smoke-worker@example.invalid',now(),'authenticated','authenticated');
    insert into farmcrew_private.members(id,auth_id,email,name,role) values
      ('smoke-owner',owner_id,'farmcrew-smoke-owner@example.invalid','Smoke Leader','leader'),
      ('smoke-worker',worker_id,'farmcrew-smoke-worker@example.invalid','Smoke Employee','employee');
    perform set_config('request.jwt.claim.sub',owner_id::text,true);
    set local role authenticated;
    s := public.farmcrew_snapshot();
    s := public.farmcrew_command('job_save','{"first":"Private","last":"Customer","farm":"2","floor":"1","fields":40,"works":["Sadenie"],"crew":["smoke-owner","smoke-worker"],"workerShares":{"smoke-owner":30,"smoke-worker":50},"date":"2027-06-01","time":"12:20","price":10000,"status":"planned","note":"Private note","estimatedDurationSeconds":1200}',(s->>'revision')::bigint,gen_random_uuid());
    id := s->>'changedId';
    s := public.farmcrew_command('job_start',jsonb_build_object('id',id),(s->>'revision')::bigint,gen_random_uuid());
    s := public.farmcrew_command('job_finish',jsonb_build_object('id',id),(s->>'revision')::bigint,gen_random_uuid());
    s := public.farmcrew_command('payment_add','{"uid":"smoke-worker","amount":2000,"date":"2026-01-01","note":"Smoke payment"}',(s->>'revision')::bigint,gen_random_uuid());
    perform set_config('request.jwt.claim.sub',worker_id::text,true);
    s := public.farmcrew_snapshot();
    select value into j from jsonb_array_elements(s->'jobs') where value->>'id'=id;
    if j is null or (j->>'myReward')::numeric<>5000 or j ?| array['first','last','note','price','workerShares']
      or jsonb_array_length(s->'payments')<>1 then raise exception 'Smoke privacy/reward check failed'; end if;
    begin
      perform public.farmcrew_command('member_save','{"name":"Attacker Test","email":"attacker@example.invalid","role":"leader"}',(s->>'revision')::bigint,gen_random_uuid());
      raise exception 'Smoke permission check failed';
    exception when insufficient_privilege then null;
    end;
    raise exception 'Rollback successful smoke test' using errcode='ZX001';
  exception when sqlstate 'ZX001' then null;
  end;
end;
$smoke$;
select jsonb_build_object(
  'smoke_test','passed_and_rolled_back',
  'jobs',(select count(*) from farmcrew_private.jobs),
  'payments',(select count(*) from farmcrew_private.payments),
  'members',(select count(*) from farmcrew_private.members),
  'audit',(select count(*) from farmcrew_private.audit)
) as verification;
