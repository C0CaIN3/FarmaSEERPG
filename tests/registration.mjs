import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const db=new PGlite({extensions:{pgcrypto}});
await db.exec(`create role anon;create role authenticated;create schema auth;
  create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,encrypted_password text,updated_at timestamptz);
  create table auth.sessions(id uuid primary key default gen_random_uuid(),user_id uuid not null);
  create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
  grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`);
for(const name of ['schema.sql','registration.sql','name-login.sql'])await db.exec(await readFile(new URL('../database/'+name,import.meta.url),'utf8'));
const ids=Array.from({length:7},(_,i)=>`00000000-0000-0000-0000-00000000000${i+1}`);
// Name logins are auto-confirmed by Supabase Auth; ids[0] simulates an unconfirmed account.
for(let i=0;i<ids.length;i++)await db.query('insert into auth.users(id,email,email_confirmed_at) values($1,$2,$3)',[ids[i],`clen.${i}@farmcrew.invalid`,i===0?null:new Date()]);
async function as(id){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id||'']);await db.exec(`set role ${id?'authenticated':'anon'}`);}
async function join(id,name='Člen Test'){await as(id);return (await db.query('select public.farmcrew_join($1) as s',[name])).rows[0].s;}
async function snapshot(id){await as(id);return (await db.query('select public.farmcrew_snapshot() as s')).rows[0].s;}
async function command(id,action,payload){const s=await snapshot(id);return (await db.query('select public.farmcrew_command($1,$2::jsonb,$3,$4::uuid) as s',[action,JSON.stringify(payload),s.revision,crypto.randomUUID()])).rows[0].s;}
async function sql(text,args=[]){await db.exec('reset role');return (await db.query(text,args)).rows;}

await assert.rejects(()=>join(null),/permission denied/);
await assert.rejects(()=>join(ids[0]),/EMAIL_NOT_VERIFIED/);
await assert.rejects(()=>join(ids[1],'X'),/INVALID_NAME/);
await assert.rejects(()=>join(ids[1],'Jednoslovné'),/INVALID_NAME/);

// The first account becomes an active leader immediately.
const leader=await join(ids[1],'Prvý  Leader');
const leaderRow=leader.users.find(u=>u.id===leader.memberId);
assert.equal(leaderRow.role,'leader');assert.equal(leaderRow.name,'Prvý Leader');assert.equal(leaderRow.pending,false);
assert.equal(leader.permissions.leader.length,8);
assert.equal((await join(ids[1],'Zmenené Meno')).revision,leader.revision); // no duplicate, no accidental profile changes

// Later accounts wait for approval and see no business data.
const waiting=await join(ids[2],'Druhý Zamestnanec');
assert.deepEqual(waiting,{pending:true,authId:ids[2],name:'Druhý Zamestnanec'});
assert.deepEqual(await join(ids[2]),waiting);
await assert.rejects(()=>snapshot(ids[2]),/MEMBERSHIP_REQUIRED/);
await assert.rejects(()=>command(ids[2],'job_save',{}),/MEMBERSHIP_REQUIRED/);
const pendingRow=(await snapshot(ids[1])).users.find(u=>u.name==='Druhý Zamestnanec');
assert.equal(pendingRow.pending,true);assert.equal(pendingRow.active,false);assert.equal(pendingRow.role,'employee');

// A pending member cannot be assigned to work.
const job={first:'Ján',last:'Zákazník',farm:'1',floor:'Prízemie',fields:40,works:['Sadenie'],crew:[pendingRow.id],workerShares:{[pendingRow.id]:50},date:'2026-11-02',time:'10:00',price:1000,status:'planned'};
await assert.rejects(()=>command(ids[1],'job_save',job),/INVALID_SHARES/);

// Approval grants employee access; other employees never see pending registrations.
await assert.rejects(()=>command(ids[1],'member_approve',{id:leaderRow.id,approve:true}),/INVALID_MEMBER/);
await assert.rejects(()=>command(ids[1],'member_approve',{id:pendingRow.id,approve:'yes'}),/INVALID_MEMBER/);
await command(ids[1],'member_approve',{id:pendingRow.id,approve:true});
const worker=await join(ids[2]);
assert.equal(worker.memberId,pendingRow.id);assert.deepEqual(worker.permissions.employee,['calendar','payouts']);
await assert.rejects(()=>command(ids[2],'member_approve',{id:pendingRow.id,approve:true}),/FORBIDDEN/);
const third=await join(ids[3],'Tretí Čakajúci');assert.equal(third.pending,true);
const workerView=await snapshot(ids[2]);
assert(!workerView.users.some(u=>u.name==='Tretí Čakajúci'));assert(workerView.users.every(u=>!('pending' in u)&&!('email' in u)));

// Rejection blocks the account; the leader can still unblock it later.
const thirdId=(await snapshot(ids[1])).users.find(u=>u.name==='Tretí Čakajúci').id;
await command(ids[1],'member_approve',{id:thirdId,approve:false});
await assert.rejects(()=>join(ids[3]),/MEMBERSHIP_REQUIRED/);
await command(ids[1],'member_save',{id:thirdId,name:'Tretí Čakajúci',email:'clen.3@farmcrew.invalid',role:'employee',active:true});
assert.equal((await join(ids[3])).memberId,thirdId);

// A leader sets a forgotten password: stored as bcrypt, sessions revoked, never by employees.
await sql('insert into auth.sessions(user_id) values($1),($1)',[ids[2]]);
await assert.rejects(()=>command(ids[2],'member_password',{id:pendingRow.id,password:'nove-heslo-123'}),/FORBIDDEN/);
await assert.rejects(()=>command(ids[1],'member_password',{id:pendingRow.id,password:'kratke'}),/INVALID_PASSWORD/);
await command(ids[1],'member_password',{id:pendingRow.id,password:'nove-heslo-123'});
const [stored]=await sql('select encrypted_password from auth.users where id=$1',[ids[2]]);
assert.match(stored.encrypted_password,/^\$2a\$10\$/);
assert.equal((await sql('select encrypted_password=extensions.crypt($1,encrypted_password) as ok from auth.users where id=$2',['nove-heslo-123',ids[2]]))[0].ok,true);
assert.equal((await sql('select count(*)::int as n from auth.sessions where user_id=$1',[ids[2]]))[0].n,0);
assert.equal((await sql("select count(*)::int as n from farmcrew_private.audit where action='member_password'"))[0].n,1);
assert(!JSON.stringify(await sql('select * from farmcrew_private.audit')).includes('nove-heslo'));

// Invitations bound to an existing login still work.
await sql("insert into farmcrew_private.members(name,email,role) values('Pozvaný Člen','clen.4@farmcrew.invalid','employee')");
const invited=await join(ids[4],'Iné Meno');assert.equal(invited.users.find(u=>u.id===invited.memberId).name,'Pozvaný Člen');
assert.equal((await sql("select count(*)::int as n from farmcrew_private.members where role='leader'"))[0].n,1);

// Even a later empty members table must never reopen first-leader registration.
await sql('delete from farmcrew_private.members');
const later=await join(ids[5],'Neskorší Člen');assert.equal(later.pending,true);
assert.equal((await sql("select count(*)::int as n from farmcrew_private.members where role='leader'"))[0].n,0);
await db.close();
console.log('PASS: first member becomes leader once, later members wait for approval, pending members see nothing and cannot be assigned, approval, rejection and unblocking, leader password reset with bcrypt and session revocation, invitations and permanent bootstrap latch.');
