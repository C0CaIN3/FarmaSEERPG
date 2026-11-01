import assert from 'node:assert/strict';
import {createHandler} from '../supabase/functions/name-auth/handler.mjs';
import {loginIdentity} from '../supabase/functions/name-auth/names.mjs';
const a=await loginIdentity('  Ján  ',' NOVÁK '),b=await loginIdentity('ján','novák');assert.equal(a.key,b.key);assert.equal(a.key.length,64);
assert.notEqual((await loginIdentity('Anna Mária','Novák')).key,(await loginIdentity('Anna','Mária Novák')).key);
await assert.rejects(()=>loginIdentity('<script>','Test'),/INVALID_NAME/);
const calls=[];let duplicate=false,wrong=false,limited=false,blocked=false,revoked=0;
const handle=createHandler({origins:['https://c0cain3.github.io'],validKey:k=>k==='public-test',
attempt:async()=>!limited,createUser:async data=>{calls.push(data);return {error:duplicate?{code:'email_exists'}:null};},
signIn:async()=>wrong?{error:{}}:{session:{access_token:'test-access',refresh_token:'test-refresh'},user:{id:'test-id',app_metadata:{farmcrew_name_login:'v1'}},signOut:async()=>{revoked++;}},
enroll:async(...args)=>{if(blocked)throw new Error('MEMBERSHIP_REQUIRED');calls.push(args);}});
const base={action:'register',first:'Ján',last:'Novák',password:'test-only-password'};
const request=(body=base,extras={})=>new Request('https://project.supabase.co/functions/v1/name-auth',{method:'POST',headers:{'Content-Type':'application/json',apikey:'public-test',origin:'https://c0cain3.github.io',...extras},body:typeof body==='string'?body:JSON.stringify(body)});
let response=await handle(request());assert.equal(response.status,200);assert.deepEqual(await response.json(),{session:{access_token:'test-access',refresh_token:'test-refresh'}});
assert.equal(calls[0].email_confirm,true);assert.equal(calls[0].app_metadata.farmcrew_name_login,'v1');assert(!Object.hasOwn(calls[0].user_metadata,'role'));
duplicate=true;assert.equal((await handle(request())).status,200);
wrong=true;response=await handle(request());assert.equal(response.status,409);assert.equal((await response.json()).code,'NAME_TAKEN');
assert.equal((await handle(request({...base,action:'login'}))).status,401);wrong=false;
blocked=true;assert.equal((await handle(request({...base,action:'login'}))).status,403);assert.equal(revoked,1);blocked=false;
limited=true;assert.equal((await handle(request())).status,429);limited=false;
assert.equal((await handle(request(base,{apikey:'wrong'}))).status,401);
assert.equal((await handle(request(base,{origin:'https://attacker.example'}))).status,403);
assert.equal((await handle(request({...base,password:'short'}))).status,400);
assert.equal((await handle(request('x'.repeat(5000)))).status,400);
assert.equal((await handle(request('{bad json'))).status,400);
assert.equal((await handle(new Request('https://example.test',{method:'OPTIONS',headers:{origin:'https://c0cain3.github.io'}}))).status,204);
console.log('PASS: name normalization, case-insensitive identity, native password provisioning without mail, API key/CORS, duplicate recovery, wrong passwords, blocked sessions, rate limits, input bounds and no user-selectable roles.');
