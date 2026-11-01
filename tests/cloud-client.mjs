import assert from 'node:assert/strict';
import {createCloud} from '../src/cloud-client.mjs';
const config={supabaseUrl:'https://project.supabase.co',publishableKey:'sb_publishable_testKey'};
assert.equal(createCloud({}),null);assert.throws(()=>createCloud({supabaseUrl:config.supabaseUrl}),/publishable/);
assert.throws(()=>createCloud({...config,publishableKey:'sb_secret_NEVER_PUBLIC'}),/publishable/);
assert.throws(()=>createCloud({...config,supabaseUrl:'http://project.supabase.co'}),/HTTPS/);
const calls=[];let revision=7,fail=false,authFail=false;
const snap=()=>({authId:'user-id',revision,memberId:'member',serverNow:Date.now(),users:[],jobs:[]});
const client={auth:{getSession:async()=>({data:{session:{user:{id:'user-id'}}}}),getUser:async()=>({data:{user:{id:'user-id'}}}),signOut:async()=>({data:{}}),setSession:async session=>{calls.push({session});return {data:{}};}},
functions:{invoke:async(name,args)=>{calls.push({name,...args});return authFail?{error:{context:{json:async()=>({code:'INVALID_CREDENTIALS'})}}}:{data:{session:{access_token:'test-access',refresh_token:'test-refresh'}}};}},
rpc:async(name,args)=>{calls.push({name,args});if(fail)return {error:{message:'CONFLICT'}};if(name==='farmcrew_command')revision++;return {data:snap()};}};
const cloud=createCloud(config,(url,key,options)=>{assert.equal(options.auth.detectSessionInUrl,false);return client;});
await assert.rejects(()=>cloud.command('job_start'),/Najprv/);
await cloud.signUp('Meno','Priezvisko','test-only-password');
assert.deepEqual(calls[0],{name:'name-auth',body:{action:'register',first:'Meno',last:'Priezvisko',password:'test-only-password'}});assert.equal(calls[1].session.access_token,'test-access');
assert(await cloud.session());assert.equal((await cloud.load()).revision,7);assert.equal(calls.at(-1).name,'farmcrew_snapshot');
await cloud.signIn('Meno','Priezvisko','test-only-password');assert.equal(calls.at(-2).body.action,'login');
authFail=true;await assert.rejects(()=>cloud.signIn('Meno','Priezvisko','wrong'),/INVALID_CREDENTIALS/);authFail=false;
await cloud.command('job_start',{id:'FC-1'});const first=calls.at(-1);assert.equal(first.args.p_revision,7);assert.match(first.args.p_request,/^[0-9a-f-]{36}$/);
fail=true;await assert.rejects(()=>cloud.command('job_finish',{id:'FC-1'}),e=>e.message==='CONFLICT');fail=false;
await cloud.command('job_finish',{id:'FC-1'});assert.equal(calls.at(-1).args.p_revision,8);assert.notEqual(calls.at(-1).args.p_request,first.args.p_request);
await cloud.signOut();await assert.rejects(()=>cloud.command('job_start'),/Najprv/);
console.log('PASS: public config, name/password gateway, immediate native sessions, meaningful auth errors, verified snapshot, revisions, unique requests and surfaced write failures.');
