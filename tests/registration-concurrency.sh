#!/usr/bin/env bash
set -euo pipefail
: "${TEST_DATABASE_URL:?Use the disposable localhost CI database}"
case "$TEST_DATABASE_URL" in
  postgresql://*@127.0.0.1:5432/farmcrew_test) ;;
  *) echo 'This test only runs against the disposable localhost farmcrew_test database.' >&2; exit 1 ;;
esac
psql "$TEST_DATABASE_URL" -Xq -v ON_ERROR_STOP=1 -f tests/postgres-auth-fixture.sql -f database/schema.sql -f database/registration.sql
registration_test_dir=$(mktemp -d)
trap 'rm -rf "$registration_test_dir"' EXIT
register_racer() {
  psql "$TEST_DATABASE_URL" -Xq -v ON_ERROR_STOP=1 <<SQL
begin;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000$1',true);
set local role authenticated;
select public.farmcrew_join('Súbežný Člen $1');
select pg_sleep(0.4);
commit;
SQL
}
register_racer 1 > "$registration_test_dir/first.log" 2>&1 &
registration_first_pid=$!
register_racer 2 > "$registration_test_dir/second.log" 2>&1 &
registration_second_pid=$!
if ! wait "$registration_first_pid"; then cat "$registration_test_dir/first.log"; exit 1; fi
if ! wait "$registration_second_pid"; then cat "$registration_test_dir/second.log"; exit 1; fi
psql "$TEST_DATABASE_URL" -Xq -v ON_ERROR_STOP=1 <<'SQL'
do $$ begin
  if (select count(*) from farmcrew_private.members)<>2
    or (select count(*) from farmcrew_private.members where role='leader')<>1
    or (select count(*) from farmcrew_private.members where role='employee')<>1
    or not (select registration_bootstrapped from farmcrew_private.workspace where id)
    then raise exception 'Concurrent first-member registration failed'; end if;
end; $$;
SQL
echo 'PASS: two concurrent verified accounts receive exactly one leader and one employee.'
