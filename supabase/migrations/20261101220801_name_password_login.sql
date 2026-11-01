-- Apply after registration.sql. Players sign in with their first and last name and a password.
-- The browser derives a never-delivered login address from the name (…@farmcrew.invalid), so
-- Supabase Auth must have e-mail confirmation turned off. Because nobody proves an e-mail any
-- more, every account after the first leader waits for a leader's approval.
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
alter table farmcrew_private.members add column if not exists pending boolean not null default false;
alter table farmcrew_private.members add constraint members_pending_inactive check (not pending or not active);

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
    -- An existing role, invitation, approval or block always wins over self registration.
    if m.email is distinct from account_email or (m.auth_id is not null and m.auth_id<>account_id)
      then raise exception 'MEMBERSHIP_REQUIRED' using errcode='42501'; end if;
    if m.pending then return jsonb_build_object('pending',true,'authId',account_id,'name',m.name); end if;
    if not m.active then raise exception 'MEMBERSHIP_REQUIRED' using errcode='42501'; end if;
    if m.auth_id is not null then return farmcrew_private.snapshot(); end if;
    update farmcrew_private.members set auth_id=account_id where id=m.id;
  else
    display_name:=trim(regexp_replace(coalesce(p_name,''),'[[:space:]]+',' ','g'));
    if length(display_name) not between 3 and 80 or position(' ' in display_name)=0 then raise exception 'INVALID_NAME'; end if;
    first_member:=not w.registration_bootstrapped and not exists(select 1 from farmcrew_private.members);
    if not first_member and (select count(*) from farmcrew_private.members where pending)>=50 then raise exception 'TOO_MANY_PENDING'; end if;
    -- Without e-mail verification anyone can register, so later accounts wait for a leader.
    insert into farmcrew_private.members(auth_id,email,name,role,active,pending)
      values(account_id,account_email,display_name,case when first_member then 'leader' else 'employee' end,first_member,not first_member)
      returning * into m;
  end if;
  update farmcrew_private.workspace set registration_bootstrapped=true,revision=revision+1 where id returning revision into w.revision;
  insert into farmcrew_private.audit(request,actor,action,revision)
    values(gen_random_uuid(),account_id,'member_join',w.revision);
  if m.pending then return jsonb_build_object('pending',true,'authId',account_id,'name',m.name); end if;
  return farmcrew_private.snapshot();
end;
$$;

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
    -- Pending registrations are visible only to leaders, who approve or reject them.
    'users',(select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'name',p.name,'role',p.role,'color',p.color,'active',p.active) ||
      case when m.role='leader' then jsonb_build_object('email',p.email,'pending',p.pending) else '{}'::jsonb end order by p.name),'[]')
      from farmcrew_private.members p where m.role='leader' or not p.pending),
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
  now_ms bigint; seconds bigint; perms jsonb; amount numeric; new_role text; new_email text; new_active boolean; new_password text;
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
        update farmcrew_private.members set name=trim(p_payload->>'name'),email=new_email,role=new_role,active=new_active,pending=pending and not new_active,
          auth_id=case when new_email is distinct from target.email then (select id from auth.users where lower(email)=new_email) else target.auth_id end where id=target.id;
      end if;
    elsif p_action='member_approve' then
      -- Approval activates a self-registered account; rejection leaves it blocked.
      select * into target from farmcrew_private.members where id=p_payload->>'id';
      if target.id is null or not target.pending or jsonb_typeof(p_payload->'approve') is distinct from 'boolean' then raise exception 'INVALID_MEMBER'; end if;
      jid:=target.id;
      update farmcrew_private.members set pending=false,active=(p_payload->>'approve')::boolean where id=target.id;
    elsif p_action='member_password' then
      -- Accounts have no reachable e-mail, so a leader sets a new password directly.
      select * into target from farmcrew_private.members where id=p_payload->>'id';
      new_password:=p_payload->>'password';
      if target.auth_id is null then raise exception 'INVALID_MEMBER'; end if;
      if new_password is null or length(new_password) not between 8 and 72 then raise exception 'INVALID_PASSWORD'; end if;
      jid:=target.id;
      update auth.users set encrypted_password=extensions.crypt(new_password,extensions.gen_salt('bf',10)),updated_at=now() where id=target.auth_id;
      -- Sign the member out everywhere; refresh tokens are removed with their sessions.
      delete from auth.sessions where user_id=target.auth_id;
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

revoke all on all functions in schema farmcrew_private from public, anon, authenticated;
grant execute on function farmcrew_private.snapshot(),farmcrew_private.command(text,jsonb,bigint,uuid),farmcrew_private.join_member(text) to authenticated;
notify pgrst,'reload schema';
