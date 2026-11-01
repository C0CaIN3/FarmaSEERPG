const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'..','app.js'),'utf8');
function boot(cloud,config){
  const elements=new Map(),handlers={},stored=new Map([['farmcrew_data_v1','{"original":"kept"}']]),messages=[];
  const node=()=>({innerHTML:'',textContent:'',dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},append(el){messages.push(el.innerHTML);},remove(){},focus(){},scrollIntoView(){},querySelector(){return null;},querySelectorAll(){return [];}});
  const document={documentElement:{dataset:{theme:'dark'},style:{}},body:{style:{},classList:{add(){},remove(){}}},hidden:false,
    querySelector(s){if(s==='.modal')return null;if(!elements.has(s))elements.set(s,node());return elements.get(s);},querySelectorAll(){return [];},createElement:node,addEventListener(k,v){(handlers[k]??=[]).push(v);}};
  class FD{[Symbol.iterator](){return [][Symbol.iterator]();}getAll(){return [];}}
  const context=vm.createContext({document,window:{FarmCloud:cloud,FARMCREW_CONFIG:config,setInterval(){},addEventListener(){},scrollTo(){}},localStorage:{getItem:k=>stored.get(k),setItem:(k,v)=>stored.set(k,v)},Intl,Date,Math,Number,String,Array,JSON,Set,Object,FormData:FD,setTimeout(){},Blob,URL,navigator:{}});
  const run=s=>vm.runInContext(s,context);run(source);
  return {run,elements,stored,messages};
}
const routes=['dashboard','jobs','pricing','calendar','team','payouts','reports','settings'];
const snapshot={version:3,revision:0,memberId:'member',serverNow:Date.now(),users:[{id:'member',name:'Leader Test',role:'leader',email:'owner@example.test',active:true}],jobs:[],payments:[],settings:{name:'Partia',server:'SeeRPG',currency:'$',fieldRate:210,hourRate:1200,share:80},permissions:{leader:routes,employee:['calendar','payouts']},nextJob:1};
(async()=>{
  const configured=boot(null,{supabaseUrl:'https://project.supabase.co',publishableKey:'sb_publishable_test'});
  assert.equal(configured.run('session'),null);assert.equal(configured.run('data.jobs.length'),0);assert(configured.elements.get('#app').innerHTML.includes('čaká na dokončenie'));
  let reject=false,resolveWrite,commands=[];
  const cloud={session:async()=>null,onAuthChange(){},load:async()=>snapshot,command:async(action,payload)=>{commands.push({action,payload});if(reject)throw {message:'CONFLICT'};return new Promise(resolve=>{resolveWrite=resolve;});}};
  const b=boot(cloud);await new Promise(setImmediate);
  assert(b.elements.get('#app').innerHTML.includes('Prihlásiť sa'));assert(!b.elements.get('#app').innerHTML.includes('data-login'));
  b.run("authMode='register';renderCloudLogin()");
  const registrationHtml=b.elements.get('#app').innerHTML;
  assert(registrationHtml.includes('name="name"'));assert(registrationHtml.includes('name="password2"'));assert(registrationHtml.includes('Prvý člen'));
  assert(!registrationHtml.includes('name="role"'));assert(!/e-mail|type="email"|name="email"/i.test(registrationHtml));
  await b.run("submitCloudAuth({name:'X',password:'test-password-only',password2:'test-password-only'})");
  assert(b.elements.get('#form-error').textContent.includes('meno aj priezvisko'));assert.equal(b.run('cloudBusy'),false);
  await b.run("submitCloudAuth({name:'Meno Priezvisko',password:'test-password-only',password2:'ine-heslo-123'})");
  assert(b.elements.get('#form-error').textContent.includes('nezhodujú'));
  b.run("authMode='login';renderCloudLogin()");const loginHtml=b.elements.get('#app').innerHTML;
  assert(!/type="email"|name="email"|Zabudnuté heslo<\/button>/.test(loginHtml));assert(loginHtml.includes('Požiadaj leadera'));
  // A pending registration shows a waiting screen, not a form or business data.
  const waitingCloud={...cloud,load:async()=>{throw new Error('APPROVAL_PENDING');},signIn:async()=>{}};
  const w=boot(waitingCloud);await new Promise(setImmediate);
  await w.run("submitCloudAuth({name:'Čakajúci Člen',password:'heslo-1234'})");
  const waitingHtml=w.elements.get('#app').innerHTML;
  assert(waitingHtml.includes('Počkaj na schválenie'));assert(waitingHtml.includes('cloud-refresh'));assert(!waitingHtml.includes('cloud-auth-form'));assert.equal(w.run('session'),null);
  b.run("authMode='login'");
  const withPending={...snapshot,users:[...snapshot.users,{id:'new',name:'Nový Hráč',role:'employee',email:'novy.hrac@farmcrew.invalid',active:false,pending:true}]};
  b.run(`acceptCloud(${JSON.stringify(withPending)});land();render()`);
  assert.equal(b.run('data.users.length'),1);assert.equal(b.run('data.pendingUsers.length'),1);
  b.run("page='team';render()");const teamHtml=b.elements.get('#app').innerHTML;
  assert(teamHtml.includes('Čakajú na schválenie'));assert(teamHtml.includes('data-action="approve-user" data-id="new"'));assert(teamHtml.includes('novy hrac'));
  b.run("page='payouts';render()");assert(!b.elements.get('#app').innerHTML.includes('Nový Hráč'));
  assert.equal(b.stored.get('farmcrew_data_v1'),'{"original":"kept"}');
  b.run("setSession('u1')");assert.equal(b.run('session'),'member');
  const pending=b.run("cloudWrite('job_start',{id:'FC-1'})");await Promise.resolve();
  assert.equal(await b.run("cloudWrite('job_start',{id:'FC-1'})"),false);assert.equal(commands.length,1);
  resolveWrite({...snapshot,revision:1});assert.equal((await pending).revision,1);
  assert.equal(b.run('data.revision'),1);assert.equal(b.run('cloudBusy'),false);
  reject=true;assert.equal(await b.run("cloudWrite('job_finish',{id:'FC-1'})"),false);assert.equal(b.run('data.revision'),1);assert.equal(b.run('cloudBusy'),false);
  assert(b.elements.get('#form-error').textContent.includes('medzitým zmenil'));
  assert.equal(b.stored.get('farmcrew_data_v1'),'{"original":"kept"}');
  for(const route of routes){b.run(`page='${route}';render()`);const html=b.elements.get('#app').innerHTML;assert(!html.includes('NaN'),route);assert(!html.includes('undefined'),route);}
  console.log('PASS: name and password forms without e-mail, waiting screen for pending accounts, leader approval list, configured SDK failures stay signed out, no fake cloud profiles, local backup preservation, all shared views, duplicate writes blocked, failed writes retain data and surface errors.');
})().catch(error=>{console.error(error);process.exitCode=1;});
