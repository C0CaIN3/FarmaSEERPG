const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'..','app.js'),'utf8');
function boot(initial,initialNow=Date.parse('2027-05-03T08:00:00Z')){
 const elements=new Map(),handlers={};let values={},now=initialNow,liveNodes=[];
 class ClockDate extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
 const node=()=>({innerHTML:'',textContent:'',value:'',dataset:{},style:{},className:'',offsetTop:0,scrollTop:0,classList:{add(){},remove(){},toggle(){}},append(){},remove(){},focus(){},scrollIntoView(){},querySelector(){return null},querySelectorAll(){return []}});
 const doc={documentElement:{dataset:{theme:'dark'},style:{}},body:{style:{}},activeElement:null,querySelector(s){if(s==='.modal')return null;if(!elements.has(s))elements.set(s,node());return elements.get(s);},querySelectorAll(s){return s==='[data-job-timer]'?liveNodes:[];},createElement:node,addEventListener(name,fn){(handlers[name]??=[]).push(fn);}};
 class FD{constructor(){this.values=values;}entries(){return Object.entries(this.values).flatMap(([k,v])=>Array.isArray(v)?v.map(x=>[k,x]):[[k,v]]);}[Symbol.iterator](){return this.entries()[Symbol.iterator]();}getAll(k){return Array.isArray(this.values[k])?this.values[k]:[this.values[k]].filter(v=>v!==undefined);}}
 const local=new Map(initial?[['farmcrew_data_v1',JSON.stringify(initial)]]:[]);
 const context=vm.createContext({document:doc,window:{innerWidth:1440,addEventListener(){},scrollTo(){},setInterval(fn){this.tick=fn;}},localStorage:{getItem:k=>local.get(k),setItem:(k,v)=>local.set(k,v)},Intl,Date:ClockDate,Math,Number,String,Array,JSON,Set,Object,FormData:FD,setTimeout(){},Blob,URL,navigator:{}});
 const run=code=>vm.runInContext(code,context);run(source);
 return {run,doc,elements,node,handlers,local,setValues(v){values=v},advance(seconds){now+=seconds*1000;},now:()=>now,setLive(nodes){liveNodes=nodes},state:()=>JSON.parse(local.get('farmcrew_data_v1')),submit(vals,id=''){values=vals;for(const fn of handlers.submit)fn({target:{id:'job-form',dataset:{id},reportValidity:()=>true},preventDefault(){}});}};
}
let b=boot(),r=b.run;
assert.equal(r('data.version'),3);assert(r("data.jobs.filter(j=>j.status==='planned').every(j=>j.durationSeconds===0&&j.estimatedDurationSeconds>0)"));
const vals={first:'Test',last:'Časovač',farm:'3',floor:'prízemie',fields:'80',works:['Okopávanie','Sadenie'],crew:['u1','u2'],date:'2027-06-01',time:'12:00',price:'10000',status:'planned',note:'automatické meranie','share-u1':'30','share-u2':'20'};
const before=r('data.jobs.length'),earnedBefore=r("earned('u1')");b.submit(vals);assert.equal(r('data.jobs.length'),before+1);const id=r('data.jobs.at(-1).id');assert.equal(r('data.jobs.at(-1).durationSeconds'),0);assert.equal(r('data.jobs.at(-1).estimatedDurationSeconds'),0);assert.equal(r('scheduleSeconds(data.jobs.at(-1))'),1200);
assert.equal(r(`finishJob('${id}')`),false);assert.equal(r("earned('u1')"),earnedBefore);
r('jobForm()');const form=b.elements.get('#overlay-root').innerHTML;assert(form.includes('Odhad trvania pre kalendár (nepovinné)'));assert(!form.includes('Čas práce *'));for(const input of form.matchAll(/<input[^>]*name="duration(?:Hours|Minutes|SecondsPart)"[^>]*>/g))assert(!input[0].includes(' required'));
assert.equal(r(`startJob('${id}')`),true);const started=b.now();assert.equal(r('data.jobs.at(-1).startedAt'),started);assert.equal(r('data.jobs.at(-1).status'),'active');assert.equal(r(`startJob('${id}')`),false);assert.equal(r('data.jobs.at(-1).startedAt'),started);
b.advance(65);assert.equal(r('jobSeconds(data.jobs.at(-1))'),65);assert.equal(r('data.jobs.at(-1).durationSeconds'),0);assert.equal(r("earned('u1')"),earnedBefore);
const live={dataset:{jobTimer:id},textContent:''};b.setLive([live]);r('updateLiveTimers()');assert.equal(live.textContent,'00:01:05');
// Editing does not reset, replace, or manually finish a running stopwatch.
b.submit({...vals,note:'Upravená poznámka',durationHours:'0',durationMinutes:'20',durationSecondsPart:'0',status:'completed'},id);assert.equal(r('data.jobs.at(-1).status'),'active');assert.equal(r('data.jobs.at(-1).startedAt'),started);assert.equal(r('jobSeconds(data.jobs.at(-1))'),65);
// A second active job with the same workers is blocked, regardless of booking date.
b.submit({...vals,date:'2027-06-02'});const other=r('data.jobs.at(-1).id');assert.notEqual(other,id);assert.equal(r(`startJob('${other}')`),false);
b.submit({...vals,date:'2027-06-03',crew:['u3','u4'],'share-u3':'35','share-u4':'25'});const parallel=r('data.jobs.at(-1).id');assert.equal(r(`startJob('${parallel}')`),true);assert.equal(r('data.jobs.filter(hasRunningTimer).length'),2);
// Reload and a closed-page interval use the persisted timestamp rather than interval ticks.
const saved=b.state();b=boot(saved,b.now()+3600*1000);r=b.run;assert.equal(r(`jobSeconds(data.jobs.find(j=>j.id==='${id}'))`),3665);assert.equal(r(`data.jobs.find(j=>j.id==='${id}').startedAt`),started);
assert.equal(r(`finishJob('${id}')`),true);const done=r(`data.jobs.find(j=>j.id==='${id}')`);assert.equal(done.durationSeconds,3665);assert.equal(done.completedAt,b.now());assert.equal(done.minutes,3665/60);assert.equal(r(`hasRunningTimer(data.jobs.find(j=>j.id==='${parallel}'))`),true);assert(Math.abs(r("earned('u1')")-earnedBefore-3000)<1e-7);
b.advance(7200);assert.equal(r(`jobSeconds(data.jobs.find(j=>j.id==='${id}'))`),3665);assert.equal(r(`finishJob('${id}')`),false);assert.equal(r(`startJob('${id}')`),false);
// Saved actual measurement cannot be overwritten by editing a completed record.
b.submit({...vals,durationHours:'99',durationMinutes:'59',durationSecondsPart:'59'},id);assert.equal(r(`data.jobs.find(j=>j.id==='${id}').durationSeconds`),3665);assert.equal(r(`data.jobs.find(j=>j.id==='${id}').startedAt`),started);
// Cancellation freezes the elapsed time and grants no income.
const u3Before=r("earned('u3')"),cancelledSeconds=r(`jobSeconds(data.jobs.find(j=>j.id==='${parallel}'))`);assert.equal(r(`cancelJob('${parallel}')`),true);b.advance(90);assert.equal(r(`jobSeconds(data.jobs.find(j=>j.id==='${parallel}'))`),cancelledSeconds);assert.equal(r("earned('u3')"),u3Before);assert.equal(r(`finishJob('${parallel}')`),false);
// Permission boundaries, instant completion, and long-running counters.
r("session='u2'");assert.equal(r(`startJob('${other}')`),false);r("session='u1'");assert.equal(r(`startJob('${other}')`),true);assert.equal(r(`finishJob('${other}')`),true);assert.equal(r(`data.jobs.find(j=>j.id==='${other}').durationSeconds`),1);
b.submit({...vals,date:'2027-06-04'});const long=r('data.jobs.at(-1).id');r(`startJob('${long}')`);b.advance(100*3600+2);assert.equal(r(`durationText(jobSeconds(data.jobs.find(j=>j.id==='${long}')))`),'100:00:02');assert(r(`finishJob('${long}')`));
// Old completed rewards are untouched; unfinished durations become estimates, not fictitious measurements.
const v2={...saved,version:2,jobs:[{id:'OLD',first:'Pôvodný',last:'Člen',farm:'7',floor:'2',fields:80,works:['Sadenie'],crew:['u1','u2'],minutes:75,durationSeconds:4500,price:10000,share:80,status:'completed',date:'2026-01-01',time:'12:00'},{id:'UNTIMED',first:'Pôvodný',last:'Aktívny',farm:'6',floor:'1',fields:40,works:['Okopávanie'],crew:['u1','u2'],minutes:50,durationSeconds:3000,price:6000,share:80,status:'active',date:'2026-01-01',time:'14:00'}],payments:[]};
const legacy=boot(v2);assert.equal(legacy.run("earned('u1')"),4000);assert.equal(legacy.run('data.jobs[0].durationSeconds'),4500);assert.equal(legacy.run('data.jobs[1].durationSeconds'),0);assert.equal(legacy.run('data.jobs[1].estimatedDurationSeconds'),3000);assert.equal(legacy.run('hasRunningTimer(data.jobs[1])'),false);assert.equal(legacy.run("startJob('UNTIMED')"),true);assert.equal(legacy.run('jobSeconds(data.jobs[1])'),0);
// CSV and render paths can consume the new states without missing values.
r("download=(content,name,type)=>{globalThis.exported={content,name,type}};exportJobs()");const csv=r('exported.content');assert(csv.includes('Skutočný čas'));assert(csv.includes('Spustené'));assert(csv.includes('01:01:05'));assert(!csv.includes('NaN'));
b.setValues({fields:'80',people:'2',works:['Okopávanie'],durationHours:'1',durationMinutes:'0',durationSecondsPart:'0',previous:'',margin:'0'});
for(const route of ['dashboard','jobs','pricing','calendar','team','payouts','reports','settings']){r(`page='${route}';render()`);const html=b.elements.get('#app').innerHTML;assert(!html.includes('NaN'),route);assert(!html.includes('undefined'),route);}
console.log('PASS: no required duration, start/finish lifecycle, live display, duplicate actions, worker conflicts, edits preserve timestamps, reload/offline recovery, stable final duration, exact rewards, cancellation, permissions, instant and 100-hour timers, legacy migration, CSV and all screens.');
