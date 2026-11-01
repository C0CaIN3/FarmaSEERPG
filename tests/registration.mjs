import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const db=new PGlite();
await db.exec(`create role anon;create role authenticated;create schema auth;
  create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
  create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
  grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`);
for(const name of ['schema.sql','registration.sql'])await db.exec(await readFile(new URL('../database/'+name,import.meta.url),'utf8'));
const ids=Array.from({length:5},(_,i)=>`00000000-0000-0000-0000-00000000000${i+1}`);
for(let i=0;i<ids.length;i++)await db.query('insert into auth.users values($1,$2,$3)',[ids[i],`person${i}@example.test`,i===0?null:new Date()]);
async function join(id,name='Člen Test'){
  await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id||'']);await db.exec(`set role ${id?'authenticated':'anon'}`);
  return (await db.query('select public.farmcrew_join($1) as s',[name])).rows[0].s;
}
await assert.rejects(()=>join(null),/permission denied/);
await assert.rejects(()=>join(ids[0]),/EMAIL_NOT_VERIFIED/);
await assert.rejects(()=>join(ids[1],'X'),/INVALID_NAME/);
const leader=await join(ids[1],'Prvý Leader');
assert.equal(leader.users.find(u=>u.id===leader.memberId).role,'leader');assert.equal(leader.permissions.leader.length,8);
assert.equal((await join(ids[1],'Zmenené Meno')).revision,leader.revision); // no duplicate, no accidental profile changes
const worker=await join(ids[2],'Druhý Zamestnanec');
assert.equal(worker.users.find(u=>u.id===worker.memberId).role,'employee');
assert.deepEqual(worker.permissions.employee,['calendar','payouts']);
await db.exec('reset role');
await db.query('update farmcrew_private.members set active=false where auth_id=$1',[ids[2]]);
await assert.rejects(()=>join(ids[2]),/MEMBERSHIP_REQUIRED/);
await db.exec('reset role');
await db.query("insert into farmcrew_private.members(name,email,role) values('Pozvaný Člen','person3@example.test','employee')");
const invited=await join(ids[3],'Iné Meno');assert.equal(invited.users.find(u=>u.id===invited.memberId).name,'Pozvaný Člen');
await db.exec('reset role');
assert.equal((await db.query('select count(*)::int as n from farmcrew_private.members')).rows[0].n,3);
assert.equal((await db.query("select count(*)::int as n from farmcrew_private.members where role='leader'")).rows[0].n,1);
// Even a later empty members table must never reopen first-leader registration.
await db.exec('delete from farmcrew_private.members');
const later=await join(ids[4],'Neskorší Člen');assert.equal(later.users[0].role,'employee');
await db.close();
console.log('PASS: verified first member becomes leader once, full leader permissions, later employees, anonymous/unverified denial, retries, validation, blocked members, invitation binding and permanent bootstrap latch.');
