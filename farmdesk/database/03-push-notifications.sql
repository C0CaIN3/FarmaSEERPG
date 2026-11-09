-- Push notifications for FarmDesk.
-- Devices subscribe per player; a scheduled Edge Function (farmdesk-notify) sends water, harvest and rent
-- alerts it computes from the shared records, plus events queued by triggers (work, sales, new players).
-- Keys and the cron secret never leave the database: only the service role (Edge Function) can read them.

-- Devices -------------------------------------------------------------------------------------------
create table public.push_subscriptions (
  endpoint   text primary key check (char_length(endpoint) between 10 and 1000 and endpoint like 'https://%'),
  user_id    uuid not null references auth.users(id) on delete cascade,
  p256dh     text not null check (char_length(p256dh) between 20 and 200),
  auth       text not null check (char_length(auth) between 10 and 100),
  prefs      jsonb not null default '{"water":true,"harvest":true,"rent":true,"work":true,"money":true,"players":true}'
             check (jsonb_typeof(prefs) = 'object' and pg_column_size(prefs) < 2000),
  user_agent text check (char_length(user_agent) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index push_subscriptions_user_idx on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon, authenticated;
grant select, delete on public.push_subscriptions to authenticated;
-- A player sees and removes only their own devices; saving goes through farmdesk_save_push().
create policy push_read_own on public.push_subscriptions for select to authenticated using (user_id = (select auth.uid()));
create policy push_delete_own on public.push_subscriptions for delete to authenticated using (user_id = (select auth.uid()));

-- Owning the browser's endpoint proves the device, so saving it moves the device to the signed-in player.
create function private.farmdesk_save_push(p_endpoint text, p_p256dh text, p_auth text, p_prefs jsonb, p_user_agent text)
returns public.push_subscriptions language plpgsql security definer set search_path = '' as $$
declare row public.push_subscriptions; clean jsonb := '{}'::jsonb; k text;
begin
  if not private.is_active() then raise exception 'active players only' using errcode = '42501'; end if;
  foreach k in array array['water','harvest','rent','work','money','players'] loop
    clean := clean || jsonb_build_object(k, coalesce((p_prefs ->> k)::boolean, true));
  end loop;
  insert into public.push_subscriptions (endpoint, user_id, p256dh, auth, prefs, user_agent)
    values (p_endpoint, auth.uid(), p_p256dh, p_auth, clean, left(p_user_agent, 300))
  on conflict (endpoint) do update set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth,
    prefs = excluded.prefs, user_agent = excluded.user_agent, updated_at = now()
  returning * into row;
  return row;
end $$;
revoke all on function private.farmdesk_save_push(text,text,text,jsonb,text) from public, anon;
grant execute on function private.farmdesk_save_push(text,text,text,jsonb,text) to authenticated;
create function public.farmdesk_save_push(p_endpoint text, p_p256dh text, p_auth text, p_prefs jsonb, p_user_agent text default null)
returns public.push_subscriptions language sql security invoker set search_path = '' as $$
  select * from private.farmdesk_save_push(p_endpoint, p_p256dh, p_auth, p_prefs, p_user_agent) $$;
revoke all on function public.farmdesk_save_push(text,text,text,jsonb,text) from public, anon;
grant execute on function public.farmdesk_save_push(text,text,text,jsonb,text) to authenticated;

-- Server-only state ----------------------------------------------------------------------------------
create table public.notify_config (
  id boolean primary key default true check (id),
  cron_secret   text not null default encode(extensions.gen_random_bytes(32), 'hex'),
  vapid_public  text,
  vapid_private text
);
insert into public.notify_config default values;

create table public.notify_sent (
  key     text primary key check (char_length(key) <= 300),
  sent_at timestamptz not null default now()
);
create table public.notify_queue (
  id         bigint generated always as identity primary key,
  event      text not null,
  payload    jsonb not null default '{}'::jsonb,
  actor      uuid,
  created_at timestamptz not null default now(),
  sent_at    timestamptz
);
create index notify_queue_unsent_idx on public.notify_queue (id) where sent_at is null;

alter table public.notify_config enable row level security;
alter table public.notify_sent   enable row level security;
alter table public.notify_queue  enable row level security;
revoke all on public.notify_config, public.notify_sent, public.notify_queue from anon, authenticated;
create policy notify_config_none on public.notify_config for all to authenticated using (false) with check (false);
create policy notify_sent_none   on public.notify_sent   for all to authenticated using (false) with check (false);
create policy notify_queue_none  on public.notify_queue  for all to authenticated using (false) with check (false);

-- Public key for subscribing (not secret, but only approved players need it).
create function private.farmdesk_push_key() returns text language sql stable security definer set search_path = '' as $$
  select case when private.is_active() then (select vapid_public from public.notify_config where id) end $$;
revoke all on function private.farmdesk_push_key() from public, anon;
grant execute on function private.farmdesk_push_key() to authenticated;
create function public.farmdesk_push_key() returns text language sql stable security invoker set search_path = '' as $$
  select private.farmdesk_push_key() $$;
revoke all on function public.farmdesk_push_key() from public, anon;
grant execute on function public.farmdesk_push_key() to authenticated;

-- Events queued by triggers --------------------------------------------------------------------------
create function private.queue_record_event() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' and new.kind = 'ongoing' then
    insert into public.notify_queue (event, payload, actor) values ('work_start', jsonb_build_object('ongoing', new.data, 'farm', new.data ->> 'farm'), auth.uid());
  elsif tg_op = 'DELETE' and old.kind = 'ongoing' then
    insert into public.notify_queue (event, payload, actor) values ('work_end', jsonb_build_object('ongoing', old.data, 'farm', old.data ->> 'farm'), auth.uid());
  elsif tg_op = 'INSERT' and new.kind = 'tx' and new.data ->> 'category' = 'sale' then
    insert into public.notify_queue (event, payload, actor) values ('sale', jsonb_build_object('tx', new.data, 'farm', new.data ->> 'farm'), auth.uid());
  end if;
  return null;
end $$;
create trigger records_notify after insert or delete on public.records for each row execute function private.queue_record_event();

create function private.queue_member_event() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'pending' then
    insert into public.notify_queue (event, payload, actor) values ('player_pending', jsonb_build_object('name', new.name, 'user', new.user_id), new.user_id);
  end if;
  return null;
end $$;
create trigger members_notify after insert on public.members for each row execute function private.queue_member_event();
revoke all on function private.queue_record_event(), private.queue_member_event() from public, anon, authenticated;

-- Schedule: every minute the database calls the Edge Function with the secret only it knows.
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;
select cron.schedule('farmdesk-notify', '* * * * *', $job$
  select net.http_post(
    url := 'https://twkswwabwhpmxqtiidxx.supabase.co/functions/v1/farmdesk-notify',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', (select cron_secret from public.notify_config where id)),
    body := '{"run":"cron"}'::jsonb,
    timeout_milliseconds := 25000)
$job$);
