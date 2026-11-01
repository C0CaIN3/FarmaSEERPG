import assert from 'node:assert/strict';
import { createCloud, loginEmail } from '../src/cloud-client.mjs';
const config={supabaseUrl:'https://project.supabase.co',publishableKey:'sb_publishable_testKey'};
assert.equal(createCloud({}),null);
assert.throws(()=>createCloud({supabaseUrl:config.supabaseUrl}),/publishable/);
assert.throws(()=>createCloud({...config,publishableKey:'sb_secret_NEVER_PUBLIC'}),/publishable/);
assert.throws(()=>createCloud({...config,supabaseUrl:'http://project.supabase.co'}),/HTTPS/);
const calls=[];let revision=7,fail=false,authId='verified-user';
const snap=()=>({authId,revision,memberId:'member',serverNow:Date.now(),users:[],jobs:[]});
const client={
  auth:{getSession:async()=>({data:{session:{user:{id:authId}}}}),getUser:async()=>({data:{user:{id:authId,user_metadata:{full_name:'Registrovaný Člen',role:'leader'}}}}),
    signOut:async()=>({data:{}}),signInWithPassword:async args=>{calls.push(args);return {data:{}};},
    signUp:async args=>{calls.push(args);return {data:{session:null}};}},
  rpc:async(name,args)=>{calls.push({name,args});if(fail)return {error:{message:'CONFLICT',code:'40001'}};if(name==='farmcrew_command')revision++;return {data:snap()};}
};
const cloud=createCloud(config,(url,key,options)=>{assert.equal(url,'https://project.supabase.co');assert.equal(key,config.publishableKey);assert.equal(options.auth.flowType,'pkce');return client;});
await assert.rejects(()=>cloud.command('job_start',{id:'FC-1'}),/Najprv/);
assert(await cloud.session());assert.equal((await cloud.load()).revision,7);
assert.equal(calls.at(-1).name,'farmcrew_join');assert.deepEqual(calls.at(-1).args,{p_name:'Registrovaný Člen'});
// Names map to stable, never-delivered login addresses.
assert.equal(loginEmail('Ján Novák'),'jan.novak@farmcrew.invalid');
assert.equal(loginEmail('  jan   NOVAK '),'jan.novak@farmcrew.invalid');
assert.equal(loginEmail('Ľudovít Štúr-Žltý'),'ludovit.stur-zlty@farmcrew.invalid');
assert.equal(loginEmail("Shaun O'Brien"),'shaun.obrien@farmcrew.invalid');
assert.match(loginEmail('Иван Петров'),/^x[0-9a-f]+\.x[0-9a-f]+@farmcrew\.invalid$/);
assert.notEqual(loginEmail('Иван Петров'),loginEmail('Петр Иванов'));
for(const bad of ['','Ján','J','  ','A'.repeat(81)+' B'])assert.throws(()=>loginEmail(bad),/INVALID_NAME/);
await cloud.signUp(' Meno   Priezvisko ','test-password-only');
assert.deepEqual(calls.at(-1).options,{data:{full_name:'Meno Priezvisko'}});assert.equal(calls.at(-1).email,'meno.priezvisko@farmcrew.invalid');
await cloud.signIn('  Pracovník Test  ','unprinted-password');assert.equal(calls.at(-1).email,'pracovnik.test@farmcrew.invalid');
await assert.rejects(()=>cloud.signIn('Jednoslovo','x'),/INVALID_NAME/);
await cloud.command('job_start',{id:'FC-1'});
const first=calls.at(-1);assert.equal(first.args.p_revision,7);assert.match(first.args.p_request,/^[0-9a-f-]{36}$/);
fail=true;await assert.rejects(()=>cloud.command('job_finish',{id:'FC-1'}),e=>e.message==='CONFLICT');
fail=false;await cloud.command('job_finish',{id:'FC-1'});assert.equal(calls.at(-1).args.p_revision,8);assert.notEqual(calls.at(-1).args.p_request,first.args.p_request);
await cloud.signOut();await assert.rejects(()=>cloud.command('job_start'),/Najprv/);
// A registration waiting for approval never yields a usable session revision.
const waiting=createCloud(config,()=>({...client,rpc:async()=>({data:{pending:true,authId,name:'Čaká Člen'}})}));
await assert.rejects(()=>waiting.load(),/APPROVAL_PENDING/);await assert.rejects(()=>waiting.command('job_start'),/Najprv/);
const forged=createCloud(config,()=>({...client,rpc:async()=>({data:{pending:true,authId:'someone-else'}})}));
await assert.rejects(()=>forged.load(),/Neplatná odpoveď/);
console.log('PASS: fail-closed config, secret key rejection, verified user lookup, automatic membership with no role metadata, name-based logins, pending approval, registration name, sessions, auth, revision checks, unique requests and surfaced write failures.');
