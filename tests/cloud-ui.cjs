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
  b.run(`acceptCloud(${JSON.stringify(snapshot)});land();render()`);
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
  console.log('PASS: configured SDK failures stay signed out, no fake cloud profiles, local backup preservation, all shared views, duplicate writes blocked, failed writes retain data and surface errors.');
})().catch(error=>{console.error(error);process.exitCode=1;});
