-- Only for the disposable CI PostgreSQL service, not a Supabase project.
create role anon;
create role authenticated;
create schema auth;
create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
$$;
grant usage on schema auth to authenticated;
grant execute on function auth.uid() to authenticated;
insert into auth.users values
  ('00000000-0000-0000-0000-000000000001','racer1@example.test',now()),
  ('00000000-0000-0000-0000-000000000002','racer2@example.test',now());
