-- FarmCrew initial installation, PostgreSQL 15+. Run once in a dedicated project.
-- This is an installation script, not a generated Supabase CLI migration.
begin;
create schema farmcrew_private;
revoke all on schema farmcrew_private from public, anon, authenticated;
grant usage on schema farmcrew_private to authenticated;

create table farmcrew_private.workspace (
  id boolean primary key default true check (id),
  revision bigint not null default 0,
  next_job integer not null default 1,
  settings jsonb not null default '{"name":"FarmCrew","server":"SeeRPG","currency":"Ft","fieldRate":210,"hourRate":1200,"share":80}',
  permissions jsonb not null default '{"leader":["dashboard","jobs","pricing","calendar","team","payouts","reports","settings"],"employee":["calendar","payouts"]}'
);
insert into farmcrew_private.workspace default values;
create table farmcrew_private.members (
  id text primary key default gen_random_uuid()::text,
  auth_id uuid unique references auth.users(id) on delete set null,
  email text unique check (email is null or (email = lower(trim(email)) and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')),
  name text not null check (length(trim(name)) between 3 and 80),
  role text not null default 'employee' check (role in ('leader','employee')),
  active boolean not null default true,
  color text not null default 'green' check (color in ('','green','blue','purple'))
);
create table farmcrew_private.jobs (
  id text primary key,
  body jsonb not null check (jsonb_typeof(body) = 'object' and body->>'id' = id)
);
create index jobs_crew_idx on farmcrew_private.jobs using gin ((body->'crew'));
create table farmcrew_private.payments (
  id uuid primary key default gen_random_uuid(),
  uid text not null references farmcrew_private.members(id),
  amount numeric(16,6) not null check (amount > 0 and amount <= 1000000000),
  date date not null,
  note text not null default '' check (length(note) <= 1500)
);
create index payments_uid_idx on farmcrew_private.payments(uid);
create table farmcrew_private.audit (
  request uuid primary key,
  actor uuid not null,
  action text not null,
  revision bigint not null,
  at timestamptz not null default clock_timestamp()
);
-- No browser role can read or write a base table, even if this schema is exposed later.
alter table farmcrew_private.workspace enable row level security;
alter table farmcrew_private.members enable row level security;
alter table farmcrew_private.jobs enable row level security;
alter table farmcrew_private.payments enable row level security;
alter table farmcrew_private.audit enable row level security;
revoke all on all tables in schema farmcrew_private from public, anon, authenticated;
-- Explicit deny policies document that all browser access goes through the RPC API.
create policy rpc_only on farmcrew_private.workspace for all to anon,authenticated using (false) with check (false);
create policy rpc_only on farmcrew_private.members for all to anon,authenticated using (false) with check (false);
create policy rpc_only on farmcrew_private.jobs for all to anon,authenticated using (false) with check (false);
create policy rpc_only on farmcrew_private.payments for all to anon,authenticated using (false) with check (false);
create policy rpc_only on farmcrew_private.audit for all to anon,authenticated using (false) with check (false);

create function farmcrew_private.actor() returns farmcrew_private.members
language plpgsql stable security definer set search_path = '' as $$
declare m farmcrew_private.members;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  select p.* into m from farmcrew_private.members p join auth.users u
    on u.id = auth.uid() and u.email_confirmed_at is not null
    and lower(u.email) = p.email and (p.auth_id is null or p.auth_id = u.id)
    where p.active;
  if m.id is null then raise exception 'MEMBERSHIP_REQUIRED' using errcode='42501'; end if;
  return m;
end;
$$;
create function farmcrew_private.reward(j jsonb, uid text) returns numeric
language sql immutable set search_path = '' as $$
  select case when j->>'status'='completed' and (j->'crew') ? uid
    then (j->>'price')::numeric * coalesce((j->'workerShares'->>uid)::numeric,0)/100 else 0 end;
$$;
create function farmcrew_private.balance(uid text) returns numeric
language sql stable set search_path = '' as $$
  select coalesce((select sum(farmcrew_private.reward(body, uid)) from farmcrew_private.jobs),0)
    - coalesce((select sum(amount) from farmcrew_private.payments p where p.uid=balance.uid),0);
$$;
create function farmcrew_private.schedule_seconds(j jsonb) returns integer
language sql volatile set search_path = '' as $$
  select greatest(coalesce((j->>'estimatedDurationSeconds')::int,0),1200,
    case when j->>'status'='active' then floor(extract(epoch from clock_timestamp())-(j->>'startedAt')::numeric/1000)::int else 0 end);
$$;
create function farmcrew_private.snapshot() returns jsonb
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
      case when m.role='leader' then jsonb_build_object('email',p.email) else '{}'::jsonb end order by p.name),'[]') from farmcrew_private.members p),
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

-- Whitelist and validate job input. All timestamps for new work come from the DB.
create function farmcrew_private.clean_job(p jsonb, old jsonb, new_id text) returns jsonb
language plpgsql set search_path = '' as $$
declare j jsonb; uid text; total numeric:=0; start_time timestamp; end_time timestamp; status text;
begin
  if jsonb_typeof(p->'crew') is distinct from 'array' or jsonb_array_length(p->'crew') not between 1 and 100
    or jsonb_typeof(p->'works') is distinct from 'array' or jsonb_array_length(p->'works') not between 1 and 4
    or jsonb_typeof(p->'workerShares') is distinct from 'object' then raise exception 'INVALID_JOB'; end if;
  if (select count(*) from jsonb_array_elements_text(p->'crew')) <> (select count(distinct value) from jsonb_array_elements_text(p->'crew'))
    or (select count(*) from jsonb_array_elements_text(p->'works')) <> (select count(distinct value) from jsonb_array_elements_text(p->'works'))
    or exists(select 1 from jsonb_array_elements_text(p->'works') t where t.value not in ('Okopávanie','Rylovanie','Polievanie','Sadenie')) then raise exception 'INVALID_CREW_OR_WORK'; end if;
  for uid in select jsonb_array_elements_text(p->'crew') loop
    if not exists(select 1 from farmcrew_private.members m where m.id=uid and (m.active or (old->'crew') ? uid))
      or jsonb_typeof(p->'workerShares'->uid) is distinct from 'number'
      or (p->'workerShares'->>uid)::numeric not between 0 and 100 then raise exception 'INVALID_SHARES'; end if;
    total:=total+(p->'workerShares'->>uid)::numeric;
  end loop;
  if total>100.000000001 or exists(select 1 from jsonb_object_keys(p->'workerShares') k where not (p->'crew') ? k) then raise exception 'INVALID_SHARES'; end if;
  status:=coalesce(old->>'status','planned');
  if status in ('planned','cancelled') then
    status:=p->>'status';
    if status is null or status not in ('planned','cancelled') then raise exception 'INVALID_STATUS'; end if;
  end if;
  if status is null or status not in ('planned','cancelled','active','completed') then raise exception 'INVALID_STATUS'; end if;
  if length(trim(coalesce(p->>'first',''))) not between 1 and 50 or length(trim(coalesce(p->>'last',''))) not between 1 and 60
    or length(trim(coalesce(p->>'floor',''))) not between 1 and 30 or coalesce(p->>'farm','') not in ('1','2','3','4','5','6','7')
    or coalesce(p->>'fields','') not in ('40','80','120') or coalesce(p->>'time','') !~ '^([01][0-9]|2[0-3]):(00|20|40)$'
    or coalesce(p->>'date','') !~ '^20[0-9]{2}-[0-9]{2}-[0-9]{2}$' or length(coalesce(p->>'note',''))>1500
    or jsonb_typeof(p->'price') is distinct from 'number' or (p->>'price')::numeric not between 1 and 1000000000
    or coalesce(p->>'estimatedDurationSeconds','0') !~ '^[0-9]{1,6}$'
    or coalesce((p->>'estimatedDurationSeconds')::int,0)>359999 then raise exception 'INVALID_JOB'; end if;
  start_time:=(p->>'date')::date+(p->>'time')::time;
  end_time:=start_time+make_interval(secs=>greatest(coalesce((p->>'estimatedDurationSeconds')::int,0),farmcrew_private.schedule_seconds(old)));
  j:=jsonb_build_object('id',new_id,'first',trim(p->>'first'),'last',trim(p->>'last'),'farm',p->>'farm','floor',trim(p->>'floor'),
    'fields',(p->>'fields')::int,'works',p->'works','work',(select string_agg(v,', ') from jsonb_array_elements_text(p->'works') t(v)),
    'crew',p->'crew','workerShares',p->'workerShares','share',total,'date',p->>'date','time',p->>'time','price',(p->>'price')::numeric,
    'note',coalesce(p->>'note',''),'status',status,'estimatedDurationSeconds',coalesce((p->>'estimatedDurationSeconds')::int,0),
    'durationSeconds',coalesce(old->'durationSeconds','0'),'minutes',coalesce(old->'minutes','0'),
    'startedAt',old->'startedAt','completedAt',old->'completedAt','stoppedAt',old->'stoppedAt');
  if status='planned' then j:=j||'{"startedAt":null,"completedAt":null,"stoppedAt":null,"durationSeconds":0,"minutes":0}'; end if;
  if status in ('planned','active') and exists(select 1 from farmcrew_private.jobs other where other.id<>new_id
    and other.body->>'status' in ('planned','active') and (other.body->'crew') ?| array(select jsonb_array_elements_text(p->'crew'))
    and start_time<(other.body->>'date')::date+(other.body->>'time')::time+make_interval(secs=>farmcrew_private.schedule_seconds(other.body))
    and (other.body->>'date')::date+(other.body->>'time')::time<end_time) then raise exception 'BOOKING_CONFLICT'; end if;
  if status='active' and exists(select 1 from farmcrew_private.jobs other where other.id<>new_id and other.body->>'status'='active'
    and (other.body->'crew') ?| array(select jsonb_array_elements_text(p->'crew'))) then raise exception 'WORKER_BUSY'; end if;
  return j;
end;
$$;

create function farmcrew_private.command(p_action text, p_payload jsonb, p_revision bigint, p_request uuid) returns jsonb
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
      new_role:=p_payload->>'role'; new_active:=coalesce((p_payload->>'active')::boolean,true); new_email:=nullif(lower(trim(p_payload->>'email')),'');
      if new_role not in ('leader','employee') or new_role is null or length(trim(coalesce(p_payload->>'name',''))) not between 3 and 80
        or (target.id is null and new_email is null) then raise exception 'INVALID_MEMBER'; end if;
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

-- Only these two invoker wrappers are exposed through PostgREST.
create function public.farmcrew_snapshot() returns jsonb language sql security invoker set search_path = '' as $$ select farmcrew_private.snapshot(); $$;
create function public.farmcrew_command(p_action text,p_payload jsonb,p_revision bigint,p_request uuid) returns jsonb language sql security invoker set search_path = '' as $$
  select farmcrew_private.command(p_action,p_payload,p_revision,p_request);
$$;
revoke all on all functions in schema farmcrew_private from public, anon, authenticated;
revoke all on function public.farmcrew_snapshot() from public,anon,authenticated;
revoke all on function public.farmcrew_command(text,jsonb,bigint,uuid) from public,anon,authenticated;
grant execute on function farmcrew_private.snapshot(),farmcrew_private.command(text,jsonb,bigint,uuid) to authenticated;
grant execute on function public.farmcrew_snapshot(),public.farmcrew_command(text,jsonb,bigint,uuid) to authenticated;
notify pgrst, 'reload schema';
commit;
