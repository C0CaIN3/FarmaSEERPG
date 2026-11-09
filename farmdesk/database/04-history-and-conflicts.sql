-- History of changes, protection against silently overwriting someone else's edit,
-- and a notification event when a player claims a watering.

-- History ---------------------------------------------------------------------------------------------
create table public.record_history (
  id        bigint generated always as identity primary key,
  at        timestamptz not null default now(),
  actor     uuid,
  op        text not null check (op in ('insert','update','delete')),
  kind      text not null,
  record_id text not null,
  old_data  jsonb,
  new_data  jsonb
);
create index record_history_at_idx on public.record_history (at desc);
create index record_history_record_idx on public.record_history (kind, record_id, at desc);
alter table public.record_history enable row level security;
revoke all on public.record_history from anon, authenticated;
grant select on public.record_history to authenticated;
create policy record_history_read on public.record_history for select to authenticated using ((select private.is_active()));

create function private.log_record_change() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and old.data = new.data then return null; end if;
  insert into public.record_history (actor, op, kind, record_id, old_data, new_data)
  values (auth.uid(), lower(tg_op), coalesce(new.kind, old.kind), coalesce(new.id, old.id),
          case when tg_op <> 'INSERT' then old.data end, case when tg_op <> 'DELETE' then new.data end);
  return null;
end $$;
revoke all on function private.log_record_change() from public, anon, authenticated;
create trigger records_history after insert or update or delete on public.records for each row execute function private.log_record_change();

-- Keep four months of history.
select cron.schedule('farmdesk-history-cleanup', '17 3 * * *', $job$ delete from public.record_history where at < now() - interval '120 days' $job$);

-- Saving with a version check -------------------------------------------------------------------------
-- Each row carries the updated_at the browser last saw. A row changed by someone else in the meantime is
-- not overwritten; it comes back as a conflict and the browser reloads it.
create function public.farmdesk_upsert(p_rows jsonb) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare r jsonb; saved jsonb := '[]'::jsonb; conflicts jsonb := '[]'::jsonb; stamp timestamptz;
begin
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) > 500 then raise exception 'invalid rows' using errcode = '22023'; end if;
  for r in select value from jsonb_array_elements(p_rows) loop
    stamp := null;
    if r ->> 'expected' is null then
      insert into public.records (kind, id, data) values (r ->> 'kind', r ->> 'id', r -> 'data')
        on conflict (kind, id) do nothing returning updated_at into stamp;
    else
      update public.records set data = r -> 'data'
        where kind = r ->> 'kind' and id = r ->> 'id' and updated_at = (r ->> 'expected')::timestamptz
        returning updated_at into stamp;
    end if;
    if stamp is null then
      conflicts := conflicts || jsonb_build_array(jsonb_build_object('kind', r ->> 'kind', 'id', r ->> 'id'));
    else
      saved := saved || jsonb_build_array(jsonb_build_object('kind', r ->> 'kind', 'id', r ->> 'id', 'updated_at', stamp));
    end if;
  end loop;
  return jsonb_build_object('saved', saved, 'conflicts', conflicts);
end $$;
revoke all on function public.farmdesk_upsert(jsonb) from public, anon;
grant execute on function public.farmdesk_upsert(jsonb) to authenticated;

-- Watering claims are notified too -----------------------------------------------------------------------
create or replace function private.queue_record_event() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' and new.kind = 'ongoing' then
    insert into public.notify_queue (event, payload, actor) values ('work_start', jsonb_build_object('ongoing', new.data, 'farm', new.data ->> 'farm'), auth.uid());
  elsif tg_op = 'DELETE' and old.kind = 'ongoing' then
    insert into public.notify_queue (event, payload, actor) values ('work_end', jsonb_build_object('ongoing', old.data, 'farm', old.data ->> 'farm'), auth.uid());
  elsif tg_op = 'INSERT' and new.kind = 'tx' and new.data ->> 'category' = 'sale' then
    insert into public.notify_queue (event, payload, actor) values ('sale', jsonb_build_object('tx', new.data, 'farm', new.data ->> 'farm'), auth.uid());
  elsif tg_op = 'UPDATE' and new.kind = 'farm' and new.data -> 'waterClaim' is not null and jsonb_typeof(new.data -> 'waterClaim') = 'object'
        and (new.data -> 'waterClaim') is distinct from (old.data -> 'waterClaim') then
    insert into public.notify_queue (event, payload, actor) values ('water_claim', jsonb_build_object('claim', new.data -> 'waterClaim', 'farm', new.id), auth.uid());
  end if;
  return null;
end $$;
create or replace trigger records_notify after insert or update or delete on public.records for each row execute function private.queue_record_event();

-- Every write gets its own timestamp, even several writes inside one transaction, so the version check
-- in farmdesk_upsert always sees that a row has changed.
create or replace function private.stamp_record() returns trigger
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
  new.updated_at := clock_timestamp();
  return new;
end $$;
