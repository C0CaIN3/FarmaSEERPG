-- Only for the disposable CI PostgreSQL service, not a Supabase project.
create role anon;
create role authenticated;
create role service_role;
create schema auth;
create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_app_meta_data jsonb default '{"farmcrew_name_login":"v1"}');
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
$$;
grant usage on schema auth to authenticated;
grant execute on function auth.uid() to authenticated;
insert into auth.users values
  ('00000000-0000-0000-0000-000000000001',repeat('a',64)||'@members.farmcrew.invalid',now(),'{"farmcrew_name_login":"v1"}'),
  ('00000000-0000-0000-0000-000000000002',repeat('b',64)||'@members.farmcrew.invalid',now(),'{"farmcrew_name_login":"v1"}');
