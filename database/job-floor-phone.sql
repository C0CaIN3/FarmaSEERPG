-- Floors are now a choice of 1-15 and a job may carry the customer's phone number.
-- The phone is customer data: the sanitized employee calendar view never includes it.
create or replace function farmcrew_private.clean_job(p jsonb, old jsonb, new_id text) returns jsonb
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
    or coalesce(p->>'floor','') !~ '^([1-9]|1[0-5])$'
    or jsonb_typeof(coalesce(p->'phone','""'::jsonb)) is distinct from 'string'
    or (trim(coalesce(p->>'phone',''))<>'' and (trim(p->>'phone') !~ '^[0-9+()/ -]{3,20}$'
      or length(regexp_replace(p->>'phone','[^0-9]','','g'))<3)) or coalesce(p->>'farm','') not in ('1','2','3','4','5','6','7')
    or coalesce(p->>'fields','') not in ('40','80','120') or coalesce(p->>'time','') !~ '^([01][0-9]|2[0-3]):(00|20|40)$'
    or coalesce(p->>'date','') !~ '^20[0-9]{2}-[0-9]{2}-[0-9]{2}$' or length(coalesce(p->>'note',''))>1500
    or jsonb_typeof(p->'price') is distinct from 'number' or (p->>'price')::numeric not between 1 and 1000000000
    or coalesce(p->>'estimatedDurationSeconds','0') !~ '^[0-9]{1,6}$'
    or coalesce((p->>'estimatedDurationSeconds')::int,0)>359999 then raise exception 'INVALID_JOB'; end if;
  start_time:=(p->>'date')::date+(p->>'time')::time;
  end_time:=start_time+make_interval(secs=>greatest(coalesce((p->>'estimatedDurationSeconds')::int,0),farmcrew_private.schedule_seconds(old)));
  j:=jsonb_build_object('id',new_id,'first',trim(p->>'first'),'last',trim(p->>'last'),'phone',regexp_replace(trim(coalesce(p->>'phone','')),'[[:space:]]+',' ','g'),'farm',p->>'farm','floor',trim(p->>'floor'),
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

revoke all on function farmcrew_private.clean_job(jsonb,jsonb,text) from public, anon, authenticated;
notify pgrst,'reload schema';
