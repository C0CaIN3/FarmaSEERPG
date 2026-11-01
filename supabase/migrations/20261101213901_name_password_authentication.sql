-- Named credentials use Supabase Auth's password hashing and sessions.
-- The server alone provisions internal identifiers; no real email is requested or sent.
create table farmcrew_private.name_accounts (
  auth_id uuid primary key references auth.users(id) on delete cascade,
  login_key text not null unique check (login_key ~ '^[0-9a-f]{64}$'),
  first_name text not null check (length(first_name) between 1 and 50),
  last_name text not null check (length(last_name) between 1 and 60)
);
create table farmcrew_private.auth_attempts (
  scope text not null,
  window_at timestamptz not null,
  attempts integer not null check (attempts>0),
  primary key(scope,window_at)
);
alter table farmcrew_private.name_accounts enable row level security;
alter table farmcrew_private.auth_attempts enable row level security;
create policy rpc_only on farmcrew_private.name_accounts for all to anon,authenticated using(false) with check(false);
create policy rpc_only on farmcrew_private.auth_attempts for all to anon,authenticated using(false) with check(false);
revoke all on farmcrew_private.name_accounts,farmcrew_private.auth_attempts from public,anon,authenticated;

create function farmcrew_private.name_attempt(p_login_key text,p_peer_key text,p_register boolean) returns boolean
language plpgsql security definer set search_path='' as $$
declare win timestamptz; k text; scopes text[]; limits int[]; n int; i int; allowed boolean:=true;
begin
  if p_login_key is null or p_peer_key is null or p_login_key !~ '^[0-9a-f]{64}$' or p_peer_key !~ '^[0-9a-f]{64}$' then raise exception 'INVALID_REQUEST'; end if;
  win:=to_timestamp(floor(extract(epoch from clock_timestamp())/600)*600);
  scopes:=array['name:'||p_login_key,'peer:'||p_peer_key];limits:=array[10,60];
  if p_register then scopes:=scopes||array['signup:global'];limits:=limits||array[30];end if;
  -- Lock/upsert keys in a fixed order to avoid deadlocks between different names.
  for i in 1..array_length(scopes,1) loop
    k:=scopes[i];
    insert into farmcrew_private.auth_attempts(scope,window_at,attempts) values(k,win,1)
      on conflict(scope,window_at) do update set attempts=farmcrew_private.auth_attempts.attempts+1 returning attempts into n;
    allowed:=allowed and n<=limits[i];
  end loop;
  delete from farmcrew_private.auth_attempts where window_at<win-interval '1 day';
  return allowed;
end;
$$;

create function farmcrew_private.name_enroll(p_auth_id uuid,p_login_key text,p_first text,p_last text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare w farmcrew_private.workspace; m farmcrew_private.members; account_email text; first_member boolean; full_name text;
begin
  if p_auth_id is null or p_login_key is null or p_login_key !~ '^[0-9a-f]{64}$'
    or length(coalesce(p_first,'')) not between 1 and 50 or length(coalesce(p_last,'')) not between 1 and 60 then raise exception 'INVALID_NAME';end if;
  full_name:=p_first||' '||p_last;
  if length(full_name)>80 then raise exception 'INVALID_NAME';end if;
  select * into w from farmcrew_private.workspace where id for update;
  select u.email into account_email from auth.users u where u.id=p_auth_id and u.email=p_login_key||'@members.farmcrew.invalid'
    and u.email_confirmed_at is not null and u.raw_app_meta_data->>'farmcrew_name_login'='v1';
  if account_email is null then raise exception 'INVALID_ACCOUNT';end if;
  select * into m from farmcrew_private.members where auth_id=p_auth_id;
  if m.id is not null then
    if not m.active or m.email is distinct from account_email then raise exception 'MEMBERSHIP_REQUIRED' using errcode='42501';end if;
    if not exists(select 1 from farmcrew_private.name_accounts where auth_id=p_auth_id and login_key=p_login_key) then raise exception 'INVALID_ACCOUNT';end if;
    return jsonb_build_object('memberId',m.id,'role',m.role);
  end if;
  if exists(select 1 from farmcrew_private.name_accounts where login_key=p_login_key) then raise exception 'NAME_TAKEN';end if;
  first_member:=not w.registration_bootstrapped and not exists(select 1 from farmcrew_private.members);
  insert into farmcrew_private.members(auth_id,email,name,role) values(p_auth_id,account_email,full_name,case when first_member then 'leader' else 'employee' end) returning * into m;
  insert into farmcrew_private.name_accounts(auth_id,login_key,first_name,last_name) values(p_auth_id,p_login_key,p_first,p_last);
  update farmcrew_private.workspace set registration_bootstrapped=true,revision=revision+1 where id returning revision into w.revision;
  insert into farmcrew_private.audit(request,actor,action,revision) values(gen_random_uuid(),p_auth_id,'member_join',w.revision);
  return jsonb_build_object('memberId',m.id,'role',m.role);
end;
$$;

create function public.farmcrew_name_attempt(p_login_key text,p_peer_key text,p_register boolean) returns boolean
language sql security invoker set search_path='' as $$select farmcrew_private.name_attempt(p_login_key,p_peer_key,p_register);$$;
create function public.farmcrew_name_enroll(p_auth_id uuid,p_login_key text,p_first text,p_last text) returns jsonb
language sql security invoker set search_path='' as $$select farmcrew_private.name_enroll(p_auth_id,p_login_key,p_first,p_last);$$;
revoke all on function farmcrew_private.name_attempt(text,text,boolean),farmcrew_private.name_enroll(uuid,text,text,text),public.farmcrew_name_attempt(text,text,boolean),public.farmcrew_name_enroll(uuid,text,text,text) from public,anon,authenticated;
grant usage on schema farmcrew_private to service_role;
grant execute on function farmcrew_private.name_attempt(text,text,boolean),farmcrew_private.name_enroll(uuid,text,text,text),public.farmcrew_name_attempt(text,text,boolean),public.farmcrew_name_enroll(uuid,text,text,text) to service_role;
-- Membership creation now belongs only to the password-authenticated gateway.
revoke all on function public.farmcrew_join(text),farmcrew_private.join_member(text) from public,anon,authenticated;

create or replace function farmcrew_private.snapshot() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare m farmcrew_private.members; w farmcrew_private.workspace; full_jobs boolean; result jsonb;
begin
  -- Readers and writers share the same lock: every snapshot is internally consistent.
  select * into w from farmcrew_private.workspace where id for share;
  m := farmcrew_private.actor();
  full_jobs := m.role='leader' or (w.permissions->'employee') ?| array['dashboard','jobs','pricing','reports'];
  select jsonb_build_object(
    'version',3,'revision',w.revision,'serverNow',floor(extract(epoch from clock_timestamp())*1000),
    'authId',auth.uid(),'memberId',m.id,'nextJob',w.next_job,
    'settings',case when m.role='leader' or full_jobs or (w.permissions->'employee') ? 'settings' then w.settings else w.settings - 'fieldRate' - 'hourRate' - 'share' end,
    'permissions',w.permissions,
    'users',(select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'name',p.name,'role',p.role,'color',p.color,'active',p.active) ||
      case when m.role='leader' then '{}'::jsonb else '{}'::jsonb end order by p.name),'[]') from farmcrew_private.members p),
    'jobs',(select coalesce(jsonb_agg(case when full_jobs then j.body else
      jsonb_build_object('id',j.id,'farm',j.body->'farm','floor',j.body->'floor','fields',j.body->'fields',
        'works',j.body->'works','work',j.body->'work','crew',j.body->'crew','date',j.body->'date','time',j.body->'time',
        'status',j.body->'status','durationSeconds',j.body->'durationSeconds','minutes',j.body->'minutes',
        'startedAt',j.body->'startedAt','completedAt',j.body->'completedAt','stoppedAt',j.body->'stoppedAt',
        'estimatedDurationSeconds',j.body->'estimatedDurationSeconds') ||
        case when (j.body->'crew') ? m.id and (w.permissions->'employee') ? 'payouts' then
          jsonb_build_object('myReward',farmcrew_private.reward(j.body,m.id)) else '{}'::jsonb end end order by j.id),'[]')
      from farmcrew_private.jobs j where full_jobs or (w.permissions->'employee') ? 'calendar'
        or ((w.permissions->'employee') ? 'payouts' and (j.body->'crew') ? m.id and j.body->>'status'='completed')),
    'payments',(select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'uid',p.uid,'amount',p.amount,'date',p.date,'note',p.note) order by p.date,p.id),'[]')
      from farmcrew_private.payments p where m.role='leader' or (p.uid=m.id and (w.permissions->'employee') ? 'payouts'))
  ) into result;
  return result;
end;
$$;

create or replace function farmcrew_private.command(p_action text, p_payload jsonb, p_revision bigint, p_request uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare m farmcrew_private.members; w farmcrew_private.workspace; old jsonb; j jsonb; jid text; target farmcrew_private.members;
  now_ms bigint; seconds bigint; perms jsonb; amount numeric; new_role text; new_email text; new_active boolean;
begin
  select * into w from farmcrew_private.workspace where id for update;
  m:=farmcrew_private.actor();
  if p_request is null or p_action is null or jsonb_typeof(p_payload) is distinct from 'object' or length(p_payload::text)>100000 then raise exception 'INVALID_REQUEST'; end if;
  if exists(select 1 from farmcrew_private.audit a where a.request=p_request and a.actor=auth.uid()) then return farmcrew_private.snapshot(); end if;
  if p_revision is distinct from w.revision then raise exception 'CONFLICT' using errcode='40001'; end if;
  if p_action in ('job_save','job_start','job_finish','job_cancel','job_delete') then
    if m.role<>'leader' and not (w.permissions->'employee') ? 'jobs' then raise exception 'FORBIDDEN' using errcode='42501'; end if;
    jid:=p_payload->>'id'; select body into old from farmcrew_private.jobs where id=jid;
    if p_action='job_save' then
      if jid is not null and old is null then raise exception 'JOB_NOT_FOUND'; end if;
      if old is null then jid:='FC-'||w.next_job; update farmcrew_private.workspace set next_job=next_job+1 where id; end if;
      j:=farmcrew_private.clean_job(p_payload,old,jid);
    else
      if old is null then raise exception 'JOB_NOT_FOUND'; end if;
      j:=old; now_ms:=floor(extract(epoch from clock_timestamp())*1000);
      if p_action='job_start' then
        if old->>'status'<>'planned' then raise exception 'INVALID_STATUS'; end if;
        if exists(select 1 from farmcrew_private.jobs o where o.id<>jid and o.body->>'status'='active'
          and (o.body->'crew') ?| array(select jsonb_array_elements_text(old->'crew'))) then raise exception 'WORKER_BUSY'; end if;
        j:=j||jsonb_build_object('status','active','startedAt',now_ms,'completedAt',null,'stoppedAt',null,'durationSeconds',0,'minutes',0);
      elsif p_action in ('job_finish','job_cancel') then
        if p_action='job_finish' and old->>'status'<>'active' or p_action='job_cancel' and old->>'status' not in ('planned','active') then raise exception 'INVALID_STATUS'; end if;
        seconds:=case when old->>'status'='active' then greatest(1,floor((now_ms-(old->>'startedAt')::bigint)/1000)) else 0 end;
        j:=j||jsonb_build_object('status',case when p_action='job_finish' then 'completed' else 'cancelled' end,
          'durationSeconds',seconds,'minutes',seconds::numeric/60,
          'completedAt',case when p_action='job_finish' then now_ms else null end,'stoppedAt',case when p_action='job_cancel' then now_ms else null end);
      end if;
    end if;
    if p_action='job_delete' then delete from farmcrew_private.jobs where id=jid;
    else insert into farmcrew_private.jobs(id,body) values(jid,j) on conflict(id) do update set body=excluded.body; end if;
    if exists(select 1 from farmcrew_private.members p where farmcrew_private.balance(p.id)< -0.000001) then raise exception 'ALREADY_PAID'; end if;
  else
    if m.role<>'leader' then raise exception 'FORBIDDEN' using errcode='42501'; end if;
    if p_action='member_save' then
      select * into target from farmcrew_private.members where id=p_payload->>'id';
      new_role:=p_payload->>'role'; new_active:=coalesce((p_payload->>'active')::boolean,true); new_email:=coalesce(nullif(lower(trim(p_payload->>'email')),''),target.email);
      if new_role not in ('leader','employee') or new_role is null or length(trim(coalesce(p_payload->>'name',''))) not between 3 and 80
        or (target.id is null and new_email is null) then raise exception 'INVALID_MEMBER'; end if;
      if target.id is not null and exists(select 1 from farmcrew_private.name_accounts a where a.auth_id=target.auth_id) and (new_email is distinct from target.email or trim(p_payload->>'name') is distinct from target.name) then raise exception 'LOGIN_NAME_IMMUTABLE';end if;
      if target.role='leader' and (new_role<>'leader' or not new_active) and not exists(select 1 from farmcrew_private.members p where p.role='leader' and p.active and p.id<>target.id) then raise exception 'LAST_LEADER'; end if;
      if target.id=m.id and (new_email is distinct from m.email or not new_active) then raise exception 'KEEP_OWN_ACCESS'; end if;
      if target.id is null then
        insert into farmcrew_private.members(name,email,role,active,auth_id) values(trim(p_payload->>'name'),new_email,new_role,new_active,(select id from auth.users where lower(email)=new_email));
      else
        update farmcrew_private.members set name=trim(p_payload->>'name'),email=new_email,role=new_role,active=new_active,
          auth_id=case when new_email is distinct from target.email then (select id from auth.users where lower(email)=new_email) else target.auth_id end where id=target.id;
      end if;
    elsif p_action='payment_add' then
      amount:=(p_payload->>'amount')::numeric;
      if amount is null or amount<=0 or amount>farmcrew_private.balance(p_payload->>'uid') then raise exception 'PAYMENT_EXCEEDS_BALANCE'; end if;
      if (p_payload->>'date')::date>(clock_timestamp() at time zone 'Europe/Bratislava')::date then raise exception 'FUTURE_PAYMENT'; end if;
      insert into farmcrew_private.payments(uid,amount,date,note) values(p_payload->>'uid',amount,(p_payload->>'date')::date,coalesce(p_payload->>'note',''));
    elsif p_action='settings_save' then
      j:=w.settings||p_payload;
      if length(trim(coalesce(j->>'name',''))) not between 1 and 40 or length(trim(coalesce(j->>'server',''))) not between 1 and 30
        or length(trim(coalesce(j->>'currency',''))) not between 1 and 8 or (j->>'fieldRate')::numeric not between 1 and 1000000
        or (j->>'hourRate')::numeric not between 1 and 1000000 or (j->>'share')::numeric not between 0 and 100
        or j->>'fieldRate' is null or j->>'hourRate' is null or j->>'share' is null then raise exception 'INVALID_SETTINGS'; end if;
      update farmcrew_private.workspace set settings=jsonb_build_object('name',j->>'name','server',j->>'server','currency',j->>'currency',
        'fieldRate',(j->>'fieldRate')::numeric,'hourRate',(j->>'hourRate')::numeric,'share',(j->>'share')::numeric) where id;
    elsif p_action='permissions_save' then
      perms:=p_payload->'employee';
      if jsonb_typeof(perms) is distinct from 'array' or jsonb_array_length(perms)>8 or exists(select 1 from jsonb_array_elements_text(perms) t
        where t.value not in ('dashboard','jobs','pricing','calendar','team','payouts','reports','settings')) then raise exception 'INVALID_PERMISSIONS'; end if;
      update farmcrew_private.workspace set permissions=jsonb_set(permissions,'{employee}',perms) where id;
    else raise exception 'UNKNOWN_ACTION'; end if;
  end if;
  update farmcrew_private.workspace set revision=revision+1 where id returning revision into w.revision;
  insert into farmcrew_private.audit(request,actor,action,revision) values(p_request,auth.uid(),p_action,w.revision);
  return farmcrew_private.snapshot()||jsonb_build_object('changedId',jid);
end;
$$;
notify pgrst,'reload schema';
