-- Move privileged bodies out of the exposed schema; public RPCs become SECURITY INVOKER wrappers.
alter function public.farmdesk_join(text) set schema private;
alter function public.farmdesk_set_member(uuid,text,text) set schema private;
alter function public.farmdesk_set_password(uuid,text) set schema private;
revoke all on function private.farmdesk_join(text), private.farmdesk_set_member(uuid,text,text), private.farmdesk_set_password(uuid,text) from public, anon;
grant execute on function private.farmdesk_join(text), private.farmdesk_set_member(uuid,text,text), private.farmdesk_set_password(uuid,text) to authenticated;

create function public.farmdesk_join(p_name text) returns public.members
language sql security invoker set search_path = '' as $$ select * from private.farmdesk_join(p_name) $$;
create function public.farmdesk_set_member(p_user uuid, p_status text default null, p_role text default null) returns public.members
language sql security invoker set search_path = '' as $$ select * from private.farmdesk_set_member(p_user, p_status, p_role) $$;
create function public.farmdesk_set_password(p_user uuid, p_password text) returns void
language sql security invoker set search_path = '' as $$ select private.farmdesk_set_password(p_user, p_password) $$;
revoke all on function public.farmdesk_join(text), public.farmdesk_set_member(uuid,text,text), public.farmdesk_set_password(uuid,text) from public, anon;
grant execute on function public.farmdesk_join(text), public.farmdesk_set_member(uuid,text,text), public.farmdesk_set_password(uuid,text) to authenticated;

-- private.state is only touched by the join function; say so explicitly.
create policy state_no_direct_access on private.state for all to authenticated using (false) with check (false);
