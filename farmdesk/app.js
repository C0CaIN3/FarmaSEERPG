const paths={search:'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-2 5 6 6',brand:'M2 10 12 3l10 7M4 12l8-5 8 5M4 15l8-5 8 5M4 18l8-5 8 5M5 21l7-5 7 5',leaf:'M4 20C4 9 11 4 21 3c0 12-6 18-15 15m0 0L17 8',sprout:'M12 21v-9M12 15C4 16 3 11 3 7c6 0 9 3 9 8Zm0-3c0-6 4-9 10-9 0 6-4 10-10 9Z',grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',barn:'M2 11l4-7 6-2 6 2 4 7M4 10v11h16V10M8 21V11h8v10m-8-9 8 8m0-8-8 8',wallet:'M3 7h17v13H3z M3 7V5l14-3v5m3 4h-6v5h6m-4-2.5h.2',bell:'M4 17h16l-2-3V9a6 6 0 0 0-12 0v5Zm6 3a2 2 0 0 0 4 0',settings:'M4 6h8m4 0h4M4 12h2m4 0h10M4 18h10m4 0h2M12 3v6M7 9v6m8 0v6',water:'M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13Z',basket:'M2 10h20l-3 11H5z M6 10l5-7m7 7-5-7m-4 10 1 5m4-5-1 5',pin:'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0ZM14 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0',plus:'M12 5v14M5 12h14',right:'m9 5 7 7-7 7',arrow:'M3 12h17m-6-6 6 6-6 6',clock:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-10-6v6l4 3',history:'M3 11a9 9 0 1 1 1 6M3 4v7h7m2-5v6l4 2',calendar:'M3 5h18v16H3z M3 10h18M7 3v5m10-5v5',user:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2',key:'M14 14a6 6 0 1 0-4-4l-7 7v4h4v-3h3l4-4Z',x:'m6 6 12 12M6 18 18 6',menu:'M3 6h18M3 12h18M3 18h18',chart:'M3 20h18M6 17v-6m6 6V7m6 10V3',work:'M4 19 16 7m-5-4c5-2 10 3 10 8l-5-4Z',log:'M5 3h14v18H5z M8 8h8m-8 4h8m-8 4h5',cash:'M2 5h20v14H2z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',check:'m4 12 5 5L20 6',home:'M2 11 12 3l10 8M5 9v12h14V9'};
const ic=k=>'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="'+(paths[k]||paths.leaf)+'"/></svg>';
// Hand-drawn farmer portraits. The same seed (player id or worker name) always gives the same farmer.
function farmer(seed,size=32,label=''){
  let h=2166136261;for(const ch of String(seed||'farmár'))h=Math.imul(h^ch.codePointAt(0),16777619)>>>0;
  const pick=(list,shift)=>list[(h>>>shift)%list.length];
  const skin=pick(['#f3cfae','#e6b18f','#c98c62','#9a6342','#f6dcc2','#b97a52'],0);
  const hair=pick(['#3a2a1e','#6b4426','#a8742f','#2b2b2b','#c9c3b8','#8a3f22'],3);
  const bg=pick(['#2f4b3a','#3a4160','#4c3b2a','#2c4652','#46324c','#4a4426'],6);
  const shirt=pick(['#c4553f','#4f8fcf','#5aa461','#d6a33c','#9a72c8','#d47a3f'],9);
  const hatKind=(h>>>12)%3,hatCol=pick(['#d94f3d','#3d7dd9','#3fa35a','#e0a63a','#7a5bd0','#2f2f36'],14);
  const beard=(h>>>17)%3===0,stache=!beard&&(h>>>19)%2===0;
  const hat=hatKind===0
    ?`<path d="M20 22 Q21 7 32 7 Q43 7 44 22Z" fill="#e8c97a"/><rect x="20.5" y="17" width="23" height="4" fill="${hatCol}"/><ellipse cx="32" cy="22" rx="21" ry="5" fill="#ddb862"/><path d="M14 22 Q32 26 50 22" stroke="#c49a45" stroke-width="1" fill="none"/>`
    :hatKind===1
    ?`<path d="M19.5 25 Q19.5 9 32 9 Q44.5 9 44.5 25Z" fill="${hatCol}"/><path d="M32 23 Q47 21.5 52 25.5 Q43 27.5 32 25Z" fill="${hatCol}" opacity=".78"/><circle cx="32" cy="9.5" r="1.6" fill="#0003"/><path d="M26 14 Q32 11.5 38 14" stroke="#fff6" stroke-width="1.3" fill="none"/>`
    :`<path d="M19 25 Q19 8 32 8 Q45 8 45 25Z" fill="${hatCol}"/><rect x="18.5" y="20.5" width="27" height="6" rx="3" fill="${hatCol}" opacity=".75"/><circle cx="32" cy="7.5" r="3.4" fill="#f4efe6"/>`;
  return `<svg class="farmer" width="${size}" height="${size}" style="width:${size}px;height:${size}px" viewBox="0 0 64 64" role="img" aria-label="${E(label||'Farmár')}" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" fill="${bg}"/><path d="M8 64 Q10 45 32 43 Q54 45 56 64Z" fill="${shirt}"/>
    <path d="M21 64 V52 Q21 49 24 49 H40 Q43 49 43 52 V64Z" fill="#355a86"/><path d="M24 49 L20 44 M40 49 L44 44" stroke="#355a86" stroke-width="3" stroke-linecap="round"/>
    <circle cx="25" cy="53" r="1.3" fill="#e8c97a"/><circle cx="39" cy="53" r="1.3" fill="#e8c97a"/>
    <rect x="27" y="37" width="10" height="9" rx="3" fill="${skin}"/><circle cx="20" cy="31" r="3.2" fill="${skin}"/><circle cx="44" cy="31" r="3.2" fill="${skin}"/>
    <ellipse cx="32" cy="30" rx="12" ry="13" fill="${skin}"/><path d="M20.5 24 V31 M43.5 24 V31" stroke="${hair}" stroke-width="2.6" stroke-linecap="round"/>
    ${beard?`<path d="M20.5 31 Q21 46.5 32 47 Q43 46.5 43.5 31 Q40 40.5 32 40.5 Q24 40.5 20.5 31Z" fill="${hair}"/>`:''}
    <circle cx="27" cy="30" r="1.7" fill="#262626"/><circle cx="37" cy="30" r="1.7" fill="#262626"/><circle cx="27.6" cy="29.4" r=".5" fill="#fff"/><circle cx="37.6" cy="29.4" r=".5" fill="#fff"/>
    <circle cx="24.5" cy="35" r="2.3" fill="#e2725f" opacity=".4"/><circle cx="39.5" cy="35" r="2.3" fill="#e2725f" opacity=".4"/>
    <path d="M30.8 31.5 Q32 34 33.2 31.5" stroke="#0002" stroke-width="1.2" fill="none"/>
    ${stache?`<path d="M26.5 36 Q32 33 37.5 36 Q32 37.5 26.5 36Z" fill="${hair}"/>`:''}<path d="M28.5 ${beard?'38.5':'37.5'} Q32 ${beard?'40.5':'40'} 35.5 ${beard?'38.5':'37.5'}" stroke="${beard?'#f3d6c4':'#7a3b2b'}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    ${hat}</svg>`;
}
const $=s=>document.querySelector(s), E=s=>String(s??'').replace(/[&<>"']/g,v=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[v]));
const H=3600000,D=24*H, now=()=>Date.now(), uid=()=>crypto.randomUUID(), key='farmdesk-sk-v1', names={water:'Polievanie',overview:'Prehľad',farms:'Moje farmy',finance:'Ekonomika',alerts:'Upozornenia',history:'Denník prác',settings:'Nastavenia'};
const types={own:'Vlastná (od štátu)',player:'Prenajatá od hráča'}, categories={sale:'Tržba',rent:'Nájom',wage:'Mzda',seed:'Osivo',invest:'Investícia',other:'Iný výdavok'};
const fmt=n=>new Intl.NumberFormat('sk-SK',{maximumFractionDigits:2}).format(n), date=t=>new Date(t).toLocaleString('sk-SK',{dateStyle:'short',timeStyle:'short'}), local=t=>t?new Date(t-new Date(t).getTimezoneOffset()*60000).toISOString().slice(0,16):'';
const forintFormat=new Intl.NumberFormat('en-US',{useGrouping:true,maximumFractionDigits:2});
function forintDigits(value){
  return forintFormat.format(value);
}
const money=n=>forintDigits(n)+' Ft';
function ungroupAmount(value){
  const text=String(value??'').trim().replace(/\s*Ft$/i,'').trim();
  // Previous exports and copied amounts can use bars or spaces with a decimal comma.
  if(text.startsWith(',')||/[|\s]/.test(text))return text.replace(/[|\s]/g,'').replace(',','.');
  return text.replace(/,/g,'');
}
function groupAmountEntry(value){
  const raw=ungroupAmount(value);
  if(!/^\d*(?:\.\d*)?$/.test(raw))return String(value);
  const [whole,fraction]=raw.split('.');
  const grouped=(whole|| (fraction!==undefined?'0':'')).replace(/\B(?=(\d{3})+(?!\d))/g,',');
  return fraction===undefined?grouped:grouped+'.'+fraction;
}
function updateAmountInput(input,pasted=false){
  const old=input.value,start=input.selectionStart;
  const entry=pasted&&/^\d+,[0-9]{1,2}(?:\s*Ft)?$/i.test(old.trim())?old.replace(',','.'):old;
  const formatted=groupAmountEntry(entry);
  if(old===formatted)return;
  const prefix=ungroupAmount(entry.slice(0,start));
  const logical=prefix.length+(prefix.startsWith('.')?1:0);
  let caret=0,count=0;
  while(caret<formatted.length&&count<logical){if(formatted[caret]!==',')count++;caret++}
  input.value=formatted;
  input.setSelectionRange(caret,caret);
}
function forintField(label,name,value='',{precise=false,required=false}={}){
  const pattern='[0-9]+(?:,[0-9]{3})*(?:[.][0-9]'+(precise?'+':'{1,2}')+')?';
  return field(label+' (Ft)',name,'text',groupAmountEntry(value),
    'data-forint inputmode="decimal" title="Tisíce oddeľuje čiarka, desatinné miesta bodka." maxlength="48" pattern="'+pattern+'" '+(required?'required':''));
}
function fresh(demo=true){let t=now();let base={demo,growth:48,dry:24,sound:false,notices:false,farms:[],tx:[],logs:[],sent:{}};if(!demo)return base;
 base.farms=[['Smaragdová lúka','own',1,3,80,30.7,5.3,12],['Borovicový háj','player',3,7,40,17.7,19.5,1.6],['Zlatý klas','own',5,2,120,51,9,8]].map(([name,type,loc,floor,size,g,w,d],i)=>({id:'ex'+i,name,type,loc,floor,size,art:i,createdAt:t,planted:t-g*H,watered:t-w*H,due:t+d*D,owner:i===1?'Martin Green':'',phone:i===1?'555-0142':'',account:i===1?'RP-10428':'',worker:i===1?'Alex Farmer':'',crop:'Úroda',term:type==='player'?'Ďalšie nájomné':'Koniec nájmu'}));
 base.tx=[
 ['sale',1800,2,6],['sale',3100,2,5],['sale',1900,2,4],['sale',3400,2,3],['sale',2100,2,2],['sale',2500,2,1],['sale',3600,2,0],
 ['rent',1600,1,6],['rent',1600,1,2],['seed',400,0,5],['seed',800,0,4],['seed',650,0,1],['seed',550,0,0]
 ].map(([category,amount,i,days])=>({id:uid(),farm:'ex'+i,category,amount,at:t-days*D,desc:''}));base.logs=[['water','Polievanie',0,5.3],['sprout','Sadenie',1,17.7],['work','Rýľovanie',1,18]].map(([icon,action,i,h])=>({id:uid(),farm:'ex'+i,icon,action,who:i===1?'Alex Farmer':'Ja',at:t-h*H}));for(const x of [...base.farms,...base.tx,...base.logs])x.sample=true;return base}
// Older versions stored direct state leases under both 'state' and 'own'.
function readFarmData(raw){
  const data=JSON.parse(raw);
  if(Array.isArray(data?.farms)){
    for(const farm of data.farms)if(farm?.type==='state')farm.type='own';
  }
  return data;
}
// Shared mode: farms live in the FarmDesk database; only personal preferences stay in this browser.
const CLOUD=!!(window.FARMDESK_CONFIG&&window.FarmCloud),prefKey='farmdesk-cloud-prefs';
function readPrefs(){try{return JSON.parse(localStorage.getItem(prefKey))||{}}catch{return {}}}
function sharedEmpty(){const p=readPrefs();return {demo:false,growth:48,dry:24,sound:!!p.sound,notices:!!p.notices,sent:p.sent||{},farms:[],tx:[],logs:[],ongoing:[],workers:{}}}
let db;if(CLOUD)db=sharedEmpty();else{try{let raw=localStorage.getItem(key);db=raw?readFarmData(raw):fresh()}catch{db=fresh(false)}}let page='overview',filter='all',query='',activeFarm=null,audioCtx,toastTimer;
function save(){
  if(CLOUD){try{localStorage.setItem(prefKey,JSON.stringify({sound:db.sound,notices:db.notices,sent:db.sent}))}catch{}queueSync();return}
  try{localStorage.setItem(key,JSON.stringify(db))}catch{toast('Prehliadač nedokázal uložiť zmeny. Exportuj zálohu v nastaveniach.')}
}
if(!CLOUD)save();
function toast(msg){let t=$('#toast');t.textContent=msg;t.style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.style.display='none',4500)}
const go=p=>{if(p==='settings')settingsTab=null;if(/^#farma-/.test(location.hash)){try{history.replaceState(null,'',location.pathname+location.search)}catch{}}page=p;query='';filter='all';document.body.classList.remove('navopen');render();window.scrollTo(0,0)};
const btn=(label,action,icon='',style='')=>'<button type="button" class="btn '+style+'" data-a="'+action+'">'+(icon?ic(icon):'')+label+'</button>';
const link=(label,action)=>'<button class="btnlink" data-a="'+action+'">'+label+ic('arrow')+'</button>';
const melon='Vodný melón';
const melonMeasurementHours=18+24/60;
const measuredMelonHours=Math.round(melonMeasurementHours/(103/246));
// 119 of 246 moisture pixels remained after one uninterrupted drying interval.
const measuredMelonDryHours=Number((melonMeasurementHours/(1-119/246)).toFixed(2));
function dryingHours(f){return f.crop===melon?(db.melonDryHours??measuredMelonDryHours):db.dry}
function growthHours(f){return f.crop===melon?(db.melonHours??measuredMelonHours):db.growth}
const pumpkin='Tekvica',namedCrops=[melon,pumpkin];
const cropOf=v=>namedCrops.includes(v)?v:'Úroda';
const cropName=c=>c&&c!=='Úroda'?c:'Neurčená plodina';
function growthProfile(crop){
  return select('Plodina','crop',[
    ['Úroda','Neurčená · všeobecný odhad '+fmt(db.growth)+' h'],
    [melon,melon+' · približne '+fmt(growthHours({crop:melon}))+' h'],
    [pumpkin,pumpkin+' · zatiaľ všeobecný odhad '+fmt(db.growth)+' h']
  ],cropOf(crop));
}
function progress(f,t=now()){
  const percent=(stamp,hours)=>Math.max(0,Math.min(100,(t-stamp)/(hours*H)*100));
  const growth=f.planted?percent(f.planted,growthHours(f)):0;
  const g=f.crop===melon&&growth<100?Math.min(99,Math.round(growth)):Math.floor(growth);
  const remaining=f.watered?100-percent(f.watered,dryingHours(f)):0;
  const w=f.crop===melon&&remaining>0?Math.max(1,Math.round(remaining)):Math.ceil(remaining);
  return {g,w};
}
function stage(f){if(f.archived)return ['Archivovaná','idle'];let {g,w}=progress(f);return !f.planted?['Príprava pôdy','idle']:g===100?['Na zber','ready']:w<=25?['Treba poliať','warn']:['Rastie','']}
function timeLeft(due,current=now()){
  const minutes=Math.ceil(Math.max(0,due-current)/60000);
  const days=Math.floor(minutes/1440),hours=Math.floor(minutes%1440/60);
  const parts=[];
  if(days)parts.push(dayLabel(days));
  if(hours)parts.push(hours+' h');
  if(minutes%60||!parts.length)parts.push(minutes%60+' min');
  return parts.join(' ');
}
function countdown(t){return t<=now()?'Po termíne':'O '+timeLeft(t)}
function duePanel(f){
  if(f.archived)return '';
  const current=now(),expired=f.due&&f.due<=current;
  const label=f.term===weeklyTerm?'Do splatnosti nájmu':f.term==='Koniec nájmu'?'Do konca nájmu':'Do zúčtovania';
  const value=!f.due?'Bez termínu':expired?(f.term===weeklyTerm?'Po splatnosti':'Po termíne'):timeLeft(f.due,current);
  const tone=!f.due?'':expired?'overdue':current>=shiftDays(f.due,-2)?'soon':'';
  return `<section class="due-panel ${tone}"><div>${ic('calendar')}<span>${label}</span></div><strong>${value}</strong>${f.due?'<time datetime="'+new Date(f.due).toISOString()+'">'+date(f.due)+'</time>':''}</section>`;
}
function refreshDuePanel(){
  const node=document.querySelector('[data-farm-timer]');
  if(!node)return;
  const farm=db.farms.find(f=>f.id===node.dataset.farmTimer);
  node.innerHTML=farm?duePanel(farm):'';
}
const activeFarms=()=>db.farms.filter(f=>!f.archived);
function alerts(){let a=[];for(const f of activeFarms()){let {g,w}=progress(f);let add=(icon,title,detail,kind)=>a.push({f,icon,title,detail,kind});if(f.due&&now()>=shiftDays(f.due,-2))add('calendar',f.term,countdown(f.due),f.due<=now()?'overdue':'gold');if(f.planted&&g===100)add('basket','Úroda je pripravená na zber','Rast 100 %','gold');else if(f.planted&&w<=25)add('water','Farma potrebuje vodu','Voda '+w+' %','blue')}return a}
// Soil state from the work journal: planted, worked (dug or tilled since the last harvest) or untouched.
function soil(f){
  if(f.planted)return ['Zasadená','planted'];
  const logs=db.logs.filter(l=>l.farm===f.id).sort((a,b)=>b.at-a.at);
  for(const l of logs){if(l.action==='Zber')break;if(l.action==='Kopanie'||l.action==='Rýľovanie')return ['Opracovaná, nezasadená','worked']}
  return ['Neopracovaná','raw'];
}
const soilPill=f=>{const [label,kind]=soil(f);return '<span class="pill soil-'+kind+'" title="Stav pôdy"><i></i>'+label+'</span>'};
const metric=(label,key,n,w='')=>'<div class="metric '+w+'">'+ic(key)+label+'<b>'+n+' %</b></div><div class="bar '+w+'"><i style="width:'+n+'%"></i></div>';
// Capacity is read directly from the farm, including older saved records.
const capacityStyles = {
  40:  {label:'Malá farma',     ink:'#72cc72', base:'#23392c', line:'#486751'},
  80:  {label:'Stredná farma',  ink:'#5db6e5', base:'#203443', line:'#40667b'},
  120: {label:'Veľká farma',    ink:'#f0c850', base:'#3c3523', line:'#74653c'}
};

function barnMarker(rank, ink) {
  const chevrons=Array.from({length:rank},(_,i)=>
    `<path class="rank-chevron" transform="translate(0 ${i*11})" d="M5 42 23 51 41 42v7l-18 9-18-9z" fill="${ink}"/>`
  ).join('');
  return `<g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 22 9 9 23 3l14 6 6 13h-4v15H7V22Z" stroke="${ink}" fill="${ink}" fill-opacity=".13" stroke-width="2.5"/>
    <path d="M18.5 12.5h9v8h-9zM12 37V25h22v12M12 25l22 12m0-12L12 37" stroke="${ink}" stroke-width="2"/>
    ${chevrons}</g>`;
}

function plotBlock(x,y,style) {
  // One drawn block contains 8 by 5 plots. A larger farm repeats this unit.
  return `<g transform="translate(${x} ${y}) matrix(1 .34 -.94 .40 0 0)">
    <rect width="80" height="50" rx="1.5" fill="${style.line}" stroke="${style.ink}" stroke-width="1.1"/>
    <path d="M10 0v50M20 0v50M30 0v50M40 0v50M50 0v50M60 0v50M70 0v50M0 10h80M0 20h80M0 30h80M0 40h80" fill="none" stroke="${style.base}" stroke-width="2.2"/></g>`;
}

function capacityGraphic(size,compact=false) {
  const style=capacityStyles[size],rank=size/40;
  const title=`${style.label} · ${size} polí`;
  const marker=barnMarker(rank,style.ink);
  if(compact){
    return `<svg class="size-mini" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 38" role="img" aria-label="${title}">
      <rect x=".5" y=".5" width="74" height="37" rx="7" fill="${style.base}" stroke="${style.line}"/>
      <g transform="translate(6 ${(38-(47+rank*11)*.4)/2}) scale(.40)">${marker}</g>
      <g font-family="Inter,Arial,sans-serif" fill="${style.ink}"><text x="31" y="21" font-size="17" font-weight="700">${size}</text><text x="31" y="31" font-size="9">polí</text></g></svg>`;
  }
  const plots=Array.from({length:rank},(_,i)=>plotBlock(278+(i-(rank-1)/2)*9,39+(i-(rank-1)/2)*24,style)).join('');
  return `<svg class="size-plate" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 368 118" role="img" aria-label="${title}" style="background:${style.base}">
    <rect width="368" height="118" fill="${style.base}"/>
    <path d="m219 118 149-79m-97 79 97-51m-151-67 151 67m-89-67 89 40" fill="none" stroke="${style.line}" opacity=".45"/>
    <g transform="translate(17 ${(118-(47+rank*11)*.92)/2}) scale(.92)">${marker}</g>
    <g font-family="Inter,Arial,sans-serif" fill="${style.ink}">
      <text x="76" y="43" font-size="13" font-weight="600">${style.label}</text>
      <text x="73" y="87" font-size="47" font-weight="700" letter-spacing="-2">${size}<tspan dx="5" font-size="15" font-weight="500" letter-spacing="0">polí</tspan></text>
    </g>${plots}</svg>`;
}

function card(f) {
  const {g,w} = progress(f);
  const [state, tone] = stage(f);
  const soon = f.due && now() >= shiftDays(f.due,-2);
  const position = placeText(f);
  return `<article class="farmcard" role="button" tabindex="0" data-a="farm:${f.id}" aria-label="Otvoriť farmu ${E(f.name)}, ${f.size} polí">
    <div class="farm-size-banner size-${f.size}">${capacityGraphic(f.size)}</div>
    <div class="cardbody"><div class="cardheading"><h3>${E(f.name)}</h3>${ic('arrow')}</div>
    <div class="cardmeta">${ic('pin')}${position} · ${types[f.type]}</div>
    <div class="cardmeters"><div>${metric('Rast','sprout',g)}</div><div>${metric('Voda','water',w,'water')}</div></div></div>
    <div class="cardfoot"><span class="inline"><span class="pill ${tone}"><i></i>${state}</span>${soilPill(f)}${workingPill(f)}</span><span class="deadline ${soon?(f.due<=now()?'overdue':'urgent'):''}" title="${E(f.term)}">${ic('calendar')}${f.due?countdown(f.due):'Bez termínu'}</span></div></article>`;
}
function stat(label,n,detail,icon,color=''){return '<div class="stat"><div class="statlabel"><span class="ico '+color+'">'+ic(icon)+'</span>'+label+'</div><strong>'+n+'</strong><small>'+detail+'</small></div>'}
function totals(rows){let rev=0,cost=0;rows.forEach(x=>x.category==='sale'?rev+=x.amount:cost+=x.amount);return {rev,cost,profit:rev-cost}}
function section(title,action=''){return '<div class="sectionhead"><h2>'+title+'</h2>'+action+'</div>'}
const empty=s=>'<div class="empty">'+s+'</div>';
function row(icon,title,sub,end='',cls='',action=''){return '<div class="activity '+(action?'click':'')+'" '+(action?'role="button" tabindex="0" data-a="'+action+'"':'')+'><span class="ico '+cls+'">'+ic(icon)+'</span><div><strong>'+E(title)+'</strong><small>'+E(sub)+'</small></div><time>'+E(end)+'</time></div>'}
const fname=id=>db.farms.find(f=>f.id===id)?.name||'Všeobecné';
const logrows=(n=Infinity)=>[...db.logs].sort((a,b)=>b.at-a.at).slice(0,n).map(l=>row(l.icon,l.action,fname(l.farm)+' · '+withPhone(l.who),date(l.at),l.icon==='water'?'blue':'' )).join('')||empty('Zaznamenané práce sa zobrazia tu.');
const alertrows=(n=Infinity)=>alerts().slice(0,n).map(a=>row(a.icon,a.title,a.f.name,a.detail,a.kind,'farm:'+a.f.id)).join('')||empty('Žiadna farma teraz nevyžaduje pozornosť.');
function tabs(){let fs=activeFarms();return '<div class="tabs">'+[['all','Všetky',fs.length],['own','Vlastné (od štátu)',fs.filter(f=>f.type==='own').length],['player','Od hráčov',fs.filter(f=>f.type==='player').length],...(fs.some(f=>ongoingOn(f).length)?[['working','Pracuje sa',fs.filter(f=>ongoingOn(f).length).length]]:[]),...(page==='farms'&&db.farms.some(f=>f.archived)?[['archive','Archív',db.farms.filter(f=>f.archived).length]]:[])].map(([v,l,n])=>'<button aria-pressed="'+(filter===v)+'" class="'+(filter===v?'sel':'')+'" data-a="filter:'+v+'">'+l+' <b>'+n+'</b></button>').join('')+'</div>'}
function farmsgrid(){let fs=db.farms.filter(f=>(filter==='archive'?f.archived:!f.archived&&(filter==='all'||f.type===filter||filter==='working'&&ongoingOn(f).length))&&(f.name+' '+placeCode(f)+' '+placeText(f)).toLocaleLowerCase('sk').includes(query.toLocaleLowerCase('sk')));return fs.length?'<div class="farmgrid">'+fs.map(card).join('')+'</div>':empty('Žiadne farmy v tomto výbere.')}
const pad=n=>String(n).padStart(2,'0');
// A farm is found by building (1–7), floor (1–15) and door number (1–11 on each floor).
// Each floor has 11 doors in three rows: left 1–4, middle 1–3, right 1–4 (stored as 1–11).
const DOORS=11,doorSides=[['Ľavé',4],['Stredné',3],['Pravé',4]];
function doorLabel(n){
  n=+n;let start=0;
  for(const [side,count] of doorSides){if(n>start&&n<=start+count)return side+' '+(n-start);start+=count}
  return '';
}
const doorText=n=>doorLabel(n).toLocaleLowerCase('sk').replace(/ (\d+)$/,' dvere $1');
function doorSelect(value){
  let n=0;
  const groups=doorSides.map(([side,count])=>'<optgroup label="'+side+'">'+Array.from({length:count},(_,i)=>{n++;return '<option value="'+n+'" '+(String(value)===String(n)?'selected':'')+'>'+side+' '+(i+1)+'</option>'}).join('')+'</optgroup>').join('');
  return '<label class="field">Dvere<select name="door"><option value="">–</option>'+groups+'</select></label>';
}
const placeCode=f=>'F'+pad(f.loc)+' / P'+pad(f.floor)+(f.door?' / '+doorLabel(f.door):'');
const placeText=f=>'Budova '+f.loc+' · '+f.floor+'. poschodie'+(f.door?' · '+doorText(f.door):'');
const sameDoor=(a,b)=>a.id!==b.id&&!a.archived&&!b.archived&&a.door&&a.loc===b.loc&&a.floor===b.floor&&a.door===b.door;
const locations=[[.14,.41],[.36,.23],[.31,.72],[.53,.49],[.71,.26],[.69,.78],[.88,.56]];
function locationMap(fs) {
  const pins=locations.map(([x,y],i)=>{
    const farms=fs.filter(f=>f.loc===i+1);
    const label='Lokalita '+(i+1)+' · počet fariem '+farms.length;
    return `<button class="map-pin ${farms.length?'occupied':''}" style="--x:${x*100}%;--y:${y*100}%" data-a="location:${i+1}" aria-label="${label}" title="${label}"><span>F${pad(i+1)}</span></button>`;
  }).join('');
  const live=[...new Set(fs.map(f=>f.loc))].join(',');
  return `<section class="map-pane"><div class="map-heading"><h2>${ic('pin')}Plán lokalít</h2><span class="map-key"><i></i>Aktívna <i></i>Voľná</span></div>
    <div class="map-stage"><canvas data-art="map" data-occupied="${live}" aria-hidden="true"></canvas>${pins}</div><div class="map-foot"><span>7 lokalít</span><span>15 poschodí</span><span>11 fariem na poschodí</span></div></section>`;
}
function locationDetail(loc) {
  const farms=activeFarms().filter(f=>f.loc===loc).sort((a,b)=>a.floor-b.floor||(a.door||99)-(b.door||99));
  const content=farms.map(f=>`<button class="location-farm" data-a="farm:${f.id}">${capacityGraphic(f.size,true)}<span><strong>${E(f.name)}</strong><small>${f.floor}. poschodie${f.door?' · '+doorText(f.door):''} · ${stage(f)[0]}</small></span>${ic('right')}</button>`).join('');
  modal('Lokalita '+pad(loc),(content||empty('Na tejto lokalite zatiaľ neeviduješ farmu.'))+'<div class="actions">'+btn('Pridať farmu na lokalite','newloc:'+loc,'plus','primary')+'</div>');
}
// Most urgent farms first: work in progress, overdue lease, ripe crop, dry soil, lease due soon.
function urgency(f){
  const t=now(),{g,w}=progress(f);
  if(ongoingOn(f).length)return 0;
  if(f.due&&f.due<=t)return 1;
  if(f.planted&&g>=100)return 2;
  if(f.planted&&w<=25)return 3;
  if(f.due&&t>=shiftDays(f.due,-2))return 4;
  return 5;
}
// Money for the current lease period (same period as in the farm detail), or the whole record without one.
function periodMoney(f){
  const rows=db.tx.filter(x=>x.farm===f.id),period=farmLeasePeriod(f,rows);
  const part=period&&period.start<=now()?rows.filter(x=>{const stamp=x.category==='rent'?(x.rentStart??x.at):x.at;return stamp>=period.start&&stamp<period.end}):rows;
  return totals(part);
}
function moneyCell(f){
  const {rev,cost,profit}=periodMoney(f);
  if(!rev&&!cost)return '<span class="money-mini empty-money">—</span>';
  return `<span class="money-mini"><b class="${profit<0?'loss':profit>0?'gain':''}">${profit>0?'+':''}${money(profit)}</b><small>inv. ${forintDigits(cost)} · trž. ${forintDigits(rev)}</small></span>`;
}
function propertyTable(fs) {
  const list=fs.filter(f=>filter==='all'||f.type===filter||filter==='working'&&ongoingOn(f).length)
    .map((f,i)=>({f,i,u:urgency(f)})).sort((a,b)=>a.u-b.u||a.i-b.i).map(x=>x.f);
  if(!list.length)return empty('Žiadne farmy v tomto výbere.');
  const body=list.map(f=>{
    const {g,w}=progress(f),[state,tone]=stage(f);
    const meter=(n,water)=>`<span class="matrix-meter ${water?'water':''}"><i><b style="width:${n}%"></b></i><small>${n}%</small></span>`;
    return `<tr tabindex="0" role="button" aria-label="Otvoriť farmu ${E(f.name)}, ${f.size} polí" data-a="farm:${f.id}">
      <td><div class="asset-name">${capacityGraphic(f.size,true)}<div><strong>${E(f.name)}</strong><small>${placeCode(f)}</small><span class="soil-inline">${soilPill(f)}${workingPill(f)}</span></div></div></td>
      <td class="moneycell">${moneyCell(f)}</td><td><span class="pill ${tone}"><i></i>${state}</span></td><td class="soilcell">${soilPill(f)}${workingPill(f)}</td><td>${meter(g,false)}</td><td>${meter(w,true)}</td>
      <td class="termcell ${f.due&&f.due<=now()?'overdue':f.due&&now()>=shiftDays(f.due,-2)?'soon':''}">${f.due?countdown(f.due):'—'}</td><td class="openarrow">${ic('right')}</td></tr>`;
  }).join('');
  return `<div class="matrix-wrap"><table class="matrix"><thead><tr><th>Farma</th><th class="moneycell" title="Aktuálne nájomné obdobie: zisk, investícia a tržba">Zisk · inv. · trž.</th><th>Stav</th><th class="soilcell">Pôda</th><th>Rast</th><th>Voda</th><th class="termcell">Termín</th><th aria-label="Detail"></th></tr></thead><tbody>${body}</tbody></table></div>`;
}
let chartDays=7;

function dailyLedger(days,end=new Date()) {
  const first=new Date(end);
  first.setHours(0,0,0,0);
  first.setDate(first.getDate()-days+1);
  const dates=Array.from({length:days},(_,i)=>{
    const day=new Date(first);
    day.setDate(day.getDate()+i);
    return {at:day.getTime(),rev:0,cost:0};
  });
  const index=new Map(dates.map(d=>[new Date(d.at).toDateString(),d]));
  for(const tx of db.tx){
    const day=index.get(new Date(tx.at).toDateString());
    if(day&&tx.at<=end.getTime())day[tx.category==='sale'?'rev':'cost']+=tx.amount;
  }
  return dates;
}

function trendPath(points) {
  // Shape-preserving horizontal tangents stay inside each adjacent value range.
  return points.reduce((d,[x,y],i)=>{
    if(!i)return 'M'+x+' '+y;
    const [px,py]=points[i-1],mid=(x+px)/2;
    return d+' C'+mid+' '+py+' '+mid+' '+y+' '+x+' '+y;
  },'');
}

function reportChart(days) {
  const series=dailyLedger(days);
  const R=614,T=10,B=141;
  const peak=Math.max(1,...series.flatMap(d=>[d.rev,d.cost]));
  const step=10**Math.floor(Math.log10(peak));
  const ceiling=Math.ceil(peak/step)*step;
  const L=Math.max(44,forintDigits(ceiling).length*6.5+15);
  const y=v=>B-(B-T)*v/ceiling;
  const x=i=>L+(R-L)*i/(days-1);
  const grid=[0,1,2,3].map(i=>{
    const amount=ceiling*i/3,h=y(amount);
    return `<line x1="${L}" x2="${R}" y1="${h}" y2="${h}" class="plot-grid"/><text x="${L-9}" y="${h+3.5}" text-anchor="end">${forintDigits(Math.round(amount))}</text>`;
  }).join('');
  const tickIndices=[...new Set(Array.from({length:7},(_,i)=>Math.round(i*(days-1)/6)))];
  const axis=tickIndices.map(i=>`<text x="${x(i)}" y="165" text-anchor="middle">${new Date(series[i].at).toLocaleDateString('sk-SK',{day:'numeric',month:'numeric'})}</text>`).join('');
  const points=key=>series.map((d,i)=>[x(i),y(d[key])]);
  const rev=trendPath(points('rev')),cost=trendPath(points('cost'));
  const hitZones=series.map((d,i)=>{
    const label=new Date(d.at).toLocaleDateString('sk-SK',{day:'numeric',month:'long'})+' · Tržby '+money(d.rev)+' · Náklady '+money(d.cost);
    const start=i===0?L:(x(i-1)+x(i))/2,stop=i===days-1?R:(x(i)+x(i+1))/2;
    return `<g class="plot-hit" tabindex="0" aria-label="${E(label)}" data-point="${i}" data-readout="${E(label)}"><rect x="${start}" y="${T}" width="${stop-start}" height="${B-T}" fill="transparent"/><g class="crosshair"><line x1="${x(i)}" x2="${x(i)}" y1="${T}" y2="${B}"/><circle cx="${x(i)}" cy="${y(d.rev)}" r="4"/></g></g>`;
  }).join('');
  const dateRange=new Date(series[0].at).toLocaleDateString('sk-SK',{day:'numeric',month:'numeric'})+' – '+new Date(series.at(-1).at).toLocaleDateString('sk-SK',{day:'numeric',month:'numeric'});
  const controls=[7,14,30].map(n=>`<button data-a="range:${n}" class="${days===n?'on':''}" aria-pressed="${days===n}">${n} dní</button>`).join('');
  return `<section class="report-panel"><div class="report-heading"><div><h2>Finančný prehľad</h2><p>Denné tržby a náklady vo forintoch (Ft)</p></div><div class="range-tabs">${controls}</div></div>
    <div class="plot-legend"><span><i></i>Tržby</span><span><i></i>Náklady</span><small>${dateRange}</small></div>
    <svg class="ledger-plot" viewBox="0 0 642 176" preserveAspectRatio="none" role="group" aria-label="Porovnanie denných tržieb a nákladov"><defs><linearGradient id="income-fill" x1="0" x2="0" y1="0" y2="1"><stop stop-color="var(--growth)" stop-opacity=".26"/><stop offset="1" stop-color="var(--growth)" stop-opacity=".015"/></linearGradient></defs>
    ${grid}<path d="${rev} L${R} ${B} L${L} ${B} Z" fill="url(#income-fill)"/><path d="${cost}" class="cost-line"/><path d="${rev}" class="rev-line"/>${axis}${hitZones}</svg><output class="chart-readout" aria-live="polite"></output></section>`;
}

const fieldStates=[
  {label:'Rastie',color:'var(--growth)'},
  {label:'Na zber',color:'var(--harvest)'},
  {label:'Treba poliať',color:'var(--water)'},
  {label:'Príprava pôdy',color:'#7e8c94'}
];
function fieldSummary(farms) {
  // Counted in farms, not fields.
  const amounts=fieldStates.map(s=>farms.filter(f=>stage(f)[0]===s.label).length);
  const total=amounts.reduce((a,b)=>a+b,0);
  let offset=0;
  const arcs=amounts.map((v,i)=>{
    if(!v)return '';
    const pct=v/total*100,start=offset;offset+=pct;
    return `<circle cx="70" cy="70" r="54" fill="none" stroke="${fieldStates[i].color}" stroke-width="13" pathLength="100" stroke-dasharray="${Math.max(.1,pct-(pct===100?0:1.5))} 100" stroke-dashoffset="${-start}" transform="rotate(-90 70 70)"/>`;
  }).join('');
  const labels=fieldStates.map((st,i)=>`<div class="state-row"><span class="state-name"><i style="background:${st.color}"></i>${st.label}</span><b>${fmt(amounts[i])}</b></div>`).join('');
  return `<section class="crop-panel"><div class="report-heading"><div><h2>Stav pestovania</h2><p>Rozdelenie fariem podľa stavu</p></div><button class="minor-arrow" data-a="go:farms" aria-label="Otvoriť farmy">${ic('arrow')}</button></div><div class="crop-layout"><div class="crop-ring"><svg viewBox="0 0 140 140" aria-hidden="true"><circle cx="70" cy="70" r="54" fill="none" stroke="#343a40" stroke-width="13"/>${arcs}</svg><div><strong>${fmt(total)}</strong><small>${total===1?'farma':total>=2&&total<=4?'farmy':'fariem'} spolu</small></div></div><div class="state-legend">${labels}</div></div></section>`;
}
function summaryCard(label,value,note,icon,tone,action,graphic) {
  return `<button class="summary-card ${tone}" data-a="${action}"><span class="summary-label">${ic(icon)}${label}</span><span class="card-arrow">${ic('arrow')}</span><strong>${value}</strong><small>${note}</small><span class="summary-graphic" aria-hidden="true">${graphic}</span></button>`;
}
// A farm is active only while something is planted and its lease has not run out.
// An expired lease means the farm has lapsed, even with a crop on it.
function farmStatus(f,t=now()){
  if(f.due&&f.due<=t)return 'lapsed';
  return f.planted?'active':'empty';
}
function farmStatusCard(fs){
  const states=fs.map(f=>farmStatus(f));
  const active=states.filter(s=>s==='active').length,lapsed=states.filter(s=>s==='lapsed').length,emptyFarms=states.filter(s=>s==='empty').length;
  const inactive=lapsed+emptyFarms;
  const worked=fs.filter((f,i)=>states[i]==='empty'&&soil(f)[1]==='worked').length,raw=emptyFarms-worked;
  const note=!fs.length?'Zatiaľ bez fariem':inactive?[raw?raw+' bez prípravy':'',worked?worked+' opracované, čakajú na sadenie':'',lapsed?lapsed+' po skončení nájmu':''].filter(Boolean).join(' · '):'Všetky farmy sú vysadené';
  return `<button class="summary-card status-card" data-a="go:farms"><span class="summary-label">${ic('barn')}Stav fariem</span><span class="card-arrow">${ic('arrow')}</span>
    <span class="farm-split"><span class="on"><strong>${fmt(active)}</strong><small>Vysadené</small></span><span class="off ${inactive?'':'zero'}"><strong>${fmt(inactive)}</strong><small>Neopracované</small></span></span><small>${note}</small></button>`;
}
// Watering overview: planted farms ordered from the driest, so a low one is seen at a glance.
function waterList(fs){return fs.filter(f=>f.planted).map(f=>({f,w:progress(f).w})).sort((a,b)=>a.w-b.w)}
const waterTone=w=>w<=25?'dry':w<=50?'low':'';
function waterCard(fs){
  const list=waterList(fs),dry=list.filter(x=>x.w<=25).length;
  const rows=list.slice(0,3).map(({f,w})=>`<span class="water-row ${waterTone(w)}"><span class="water-name">${E(f.name)}</span><i><b style="width:${w}%"></b></i><em>${w} %</em></span>`).join('');
  const note=!list.length?'Žiadna farma nie je zasadená':dry?(dry===1?'1 farmu treba poliať':dry+(dry<5?' farmy treba poliať':' fariem treba poliať')):'Všetky zasadené farmy majú dosť vody';
  return `<button class="summary-card water-card" data-a="waterview"><span class="summary-label">${ic('water')}Polievanie${dry?'<span class="total dry-count">'+dry+'</span>':''}</span><span class="card-arrow">${ic('arrow')}</span>
    <span class="water-list">${rows}</span><small class="${dry?'water-alert':''}">${note}${list.length>3?' · +'+(list.length-3)+' ďalšie':''}</small></button>`;
}
// Harvest overview: planted farms ordered from the ripest.
function harvestList(fs){return fs.filter(f=>f.planted).map(f=>({f,g:progress(f).g,at:f.planted+growthHours(f)*H})).sort((a,b)=>b.g-a.g||a.at-b.at)}
const harvestTone=g=>g>=100?'ripe':g>=75?'near':'';
const harvestLeft=({g,at})=>g>=100?'Zrelé':'o '+timeLeft(at);
function harvestCard(fs){
  const list=harvestList(fs),ripe=list.filter(x=>x.g>=100);
  const fields=ripe.reduce((n,x)=>n+x.f.size,0);
  const rows=list.slice(0,3).map(({f,g})=>`<span class="water-row ${harvestTone(g)}"><span class="water-name">${E(f.name)}</span><i><b style="width:${g}%"></b></i><em>${g} %</em></span>`).join('');
  const next=list.find(x=>x.g<100);
  const note=!list.length?'Žiadna farma nie je zasadená':ripe.length?(ripe.length===1?'1 farma':ripe.length+(ripe.length<5?' farmy':' fariem'))+' na zber · '+fmt(fields)+' polí':'Najbližší zber '+harvestLeft(next);
  return `<button class="summary-card harvest-card" data-a="harvestview"><span class="summary-label">${ic('basket')}Na zber${ripe.length?'<span class="total ripe-count">'+ripe.length+'</span>':''}</span><span class="card-arrow">${ic('arrow')}</span>
    <span class="water-list">${rows}</span><small class="${ripe.length?'harvest-alert':''}">${note}${list.length>3?' · +'+(list.length-3)+' ďalšie':''}</small></button>`;
}
function harvestView(){
  const list=harvestList(activeFarms());
  const ripe=list.find(x=>x.g>=100);
  modal('Prehľad zberu',list.length?'<p class="hint">Od najzrelšej farmy. Pri 100 % je úroda pripravená na zber.</p>'+list.map(x=>`<button class="water-line harvest-line ${harvestTone(x.g)}" data-a="farm:${x.f.id}"><span><strong>${E(x.f.name)}</strong><small>${placeCode(x.f)} · ${x.f.size} polí · zber ${x.g>=100?'možný teraz':date(x.at)+' ('+harvestLeft(x)+')'}</small></span><i><b style="width:${x.g}%"></b></i><em>${x.g} %</em></button>`).join('')+(ripe?'<div class="actions">'+btn('Zapísať zber','work:'+ripe.f.id,'basket','primary')+'</div>':''):empty('Žiadna farma nie je zasadená.'));
}
// ---- Watering schedule: when each planted farm needs water, and who takes it ----
const CLAIM_HOURS=6;
function activeClaim(f){const c=f.waterClaim;return c&&c.at>(f.watered||0)&&now()-c.at<CLAIM_HOURS*H?c:null}
const claimName=c=>c.name||(CLOUD?playerName(c.by):'Ja');
const claimMine=c=>CLOUD?c.by===me?.user_id:true;
let waterHours=24;
function waterTimes(f){const dry=dryingHours(f)*H,from=f.watered||f.planted;return {low:from+dry*.75,empty:from+dry}}
function waterPage(){
  const t=now(),span=waterHours*H,list=activeFarms().filter(f=>f.planted).map(f=>({f,w:progress(f).w,...waterTimes(f),claim:activeClaim(f)})).sort((a,b)=>a.low-b.low);
  const pos=x=>Math.max(0,Math.min(100,(x-t)/span*100));
  const ticks=Array.from({length:7},(_,i)=>i*waterHours/6).map(h=>'<span style="left:'+(h/waterHours*100)+'%">'+(h?'+'+h+' h':'teraz')+'</span>').join('');
  const line=x=>{
    const late=x.low<=t,claim=x.claim;
    const who=claim?'<span class="claim '+(claimMine(claim)?'mine':'')+'">'+farmer(claim.by||'ja',20,claimName(claim))+E(claimMine(claim)?'Beriem ja':'Berie '+claimName(claim))+' · '+ago(claim.at)+'</span>':'';
    const act=claim?(claimMine(claim)?btn('Zrušiť','unclaim:'+x.f.id,'x'):''):btn('Beriem ja','claim:'+x.f.id,'check','primary');
    return `<div class="sched-row ${waterTone(x.w)} ${claim?'claimed':''}"><button class="sched-name" data-a="farm:${x.f.id}"><strong>${E(x.f.name)}</strong><small>${placeCode(x.f)} · ${x.w} % · ${late?'pod 25 % už '+(x.empty<=t?'je sucho':'teraz'):'pod 25 % '+countdown(x.low).toLowerCase()}</small></button>
      <div class="sched-track" aria-hidden="true"><i class="sched-ok" style="width:${pos(x.low)}%"></i><i class="sched-low" style="left:${pos(x.low)}%;width:${pos(x.empty)-pos(x.low)}%"></i><i class="sched-dry" style="left:${pos(x.empty)}%;right:0"></i>${x.low>t&&x.low<t+span?'<b style="left:'+pos(x.low)+'%">'+new Date(x.low).toLocaleTimeString('sk-SK',{hour:'2-digit',minute:'2-digit'})+'</b>':''}</div>
      <div class="sched-who">${who}<div class="sched-act">${act}${btn('Poliate','workwater:'+x.f.id,'water')}</div></div></div>`;
  };
  const now25=list.filter(x=>x.low<=t),soon=list.filter(x=>x.low>t&&x.low<=t+span),later=list.filter(x=>x.low>t+span);
  const group=(title,l,note='')=>l.length?'<section class="panel sched-group">'+section(title+' <span class="total">'+l.length+'</span>')+(note?'<p class="hint">'+note+'</p>':'')+'<div class="sched-axis">'+ticks+'</div>'+l.map(line).join('')+'</section>':'';
  const open=now25.filter(x=>!x.claim).length;
  return heading('Rozpis polievania','Kedy ktorá farma klesne pod 25 % vody a kto ju ide poliať. Záber „Beriem ja“ platí, kým farmu niekto nepoleje, najviac '+CLAIM_HOURS+' h.',
      '<div class="tabs">'+[12,24,48].map(h=>'<button aria-pressed="'+(waterHours===h)+'" class="'+(waterHours===h?'sel':'')+'" data-a="waterspan:'+h+'">'+h+' h</button>').join('')+'</div>')+
    (list.length?'<div class="stats">'+stat('Treba poliať teraz',String(now25.length),open?open+' ešte nikto nezobral':now25.length?'Všetky sú rozobraté':'Žiadna farma nie je suchá','water',now25.length?'gold':'')+stat('Do '+waterHours+' h',String(soon.length),'Klesnú pod 25 %','clock','blue')+stat('Zobraté',String(list.filter(x=>x.claim).length),'Niekto ich ide poliať','user','purple')+'</div>'+
      group('Teraz treba poliať',now25)+group('V najbližších '+waterHours+' h',soon,'Žltá časť pásu = pod 25 %, červená = bez vody.')+(later.length?'<section class="panel sched-group">'+section('Neskôr <span class="total">'+later.length+'</span>')+later.map(x=>row('water',x.f.name,placeCode(x.f)+' · '+x.w+' %','pod 25 % '+date(x.low),'blue','farm:'+x.f.id)).join('')+'</section>':'')
    :empty('Žiadna farma nie je zasadená, polievanie sa zatiaľ neplánuje.'));
}
function waterView(){
  const list=waterList(activeFarms());
  modal('Prehľad polievania',list.length?'<p class="hint">Od najsuchšej farmy. Pod 25 % treba poliať.</p>'+list.map(({f,w})=>`<button class="water-line ${waterTone(w)}" data-a="farm:${f.id}"><span><strong>${E(f.name)}</strong><small>${placeCode(f)} · poliate ${f.watered?date(f.watered):'—'}</small></span><i><b style="width:${w}%"></b></i><em>${w} %</em></button>`).join('')+'<div class="actions">'+btn('Zapísať polievanie','work:'+(list[0]?.f.id||''),'water','primary')+'</div>':empty('Žiadna farma nie je zasadená, voda sa zatiaľ nesleduje.'));
}
function home() {
  const fs=activeFarms(),items=alerts(),profit=totals(db.tx).profit;
  const total=fs.reduce((n,f)=>n+f.size,0),planted=fs.reduce((n,f)=>n+(f.planted?f.size:0),0);
  const ready=fs.filter(f=>stage(f)[0]==='Na zber');
  const levels=Array.from({length:7},(_,i)=>fs.filter(f=>f.loc===i+1).length);
  const bars=levels.map(v=>`<i style="height:${v?10+30*v/Math.max(1,...levels):3}px"></i>`).join('');
  const cells=Array.from({length:40},(_,i)=>`<i class="${total&&i<Math.round(planted/total*40)?'lit':''}"></i>`).join('');
  const revHistory=dailyLedger(7);let balance=0;
  const amounts=revHistory.map(d=>(balance+=d.rev-d.cost));
  const low=Math.min(0,...amounts),span=Math.max(1,Math.max(0,...amounts)-low);
  const spark=trendPath(amounts.map((v,i)=>[i*100/(amounts.length-1),40-(v-low)/span*32]));
  const share=fs.length?Math.round(ready.length/fs.length*100):0;
  // Farm money: everything spent on farms, all harvest sales, and profit of the farms still active.
  const farmTx=db.tx.filter(x=>x.farm&&db.farms.some(f=>f.id===x.farm));
  const farmTotals=totals(farmTx);
  const activeIds=new Set(fs.map(f=>f.id));
  const activeProfit=totals(farmTx.filter(x=>activeIds.has(x.farm))).profit;
  const moneyCard=`<button class="summary-card ${activeProfit<0?'profit-card negative-result':'profit-card'}" data-a="go:finance"><span class="summary-label">${ic('wallet')}Hospodárenie fariem</span><span class="card-arrow">${ic('arrow')}</span>
    <span class="profit-split"><span><small>Investované do fariem</small><b>${money(farmTotals.cost)}</b></span><span><small>Tržby z fariem celkovo</small><b>${money(farmTotals.rev)}</b></span><span class="net"><small>Zisk fariem</small><b>${money(activeProfit)}</b></span></span></button>`;
  const kpis=moneyCard+
    farmStatusCard(fs)+
    waterCard(fs)+
    harvestCard(fs);
  const waiting=items.slice().sort((a,b)=>Number(b.icon==='calendar'&&b.f.due<=now())-Number(a.icon==='calendar'&&a.f.due<=now()));
  const tasks=waiting.slice(0,4).map(a=>row(a.icon,a.f.name,a.title,a.detail,a.kind,'farm:'+a.f.id)).join('');
  const day=new Date().toLocaleDateString('sk-SK',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  return `<div class="console-title"><div><h1>Prehľad hospodárstva</h1><div class="console-date">${ic('calendar')}${day}</div></div><div class="actiongrid">${btn('Zapísať prácu','work','log')}${btn('Pridať farmu','new','plus','primary')}</div></div>
  <div class="summary-grid">${kpis}</div><div class="analysis-grid">${reportChart(chartDays)}${fieldSummary(fs)}</div>
  <div class="work-grid"><section class="portfolio"><div class="work-head"><h2>Moje farmy <span class="total">${fs.length}</span></h2><button class="btnlink" data-a="map">${ic('pin')}Lokality</button></div>${tabs()}${propertyTable(fs)}</section>
  <div class="side-stack">${workingPane()}<section class="task-pane"><div class="work-head"><h2>Najbližšie úlohy <span class="total">${items.length}</span></h2><button class="minor-arrow" data-a="go:alerts" aria-label="Všetky upozornenia">${ic('arrow')}</button></div><div class="queue-body">${tasks||empty('Žiadna farma teraz nevyžaduje pozornosť.')}</div></section></div></div>`;
}
function priorityView(which) {
  const labels = {water:'Farmy na polievanie',basket:'Farmy pripravené na zber',calendar:'Blízke termíny'};
  const items = alerts().filter(a=>a.icon === which);
  if(which==='calendar')items.sort((a,b)=>a.f.due-b.f.due);
  modal(labels[which],items.length ? items.map(a=>row(a.icon,a.f.name,a.title,a.detail,a.kind,'farm:'+a.f.id)).join('') : empty('Momentálne tu nemáš žiadne úlohy.'));
}
function heading(t,p='',a=''){return '<div class="pagetitle"><div><h1>'+t+'</h1>'+(p?'<p>'+p+'</p>':'')+'</div>'+a+'</div>'}
function finance() {
  const {rev,cost,profit}=totals(db.tx);
  const expenseCategories=Object.entries(categories).filter(([key])=>key!=='sale').map(([key,label])=>({
    label, amount:db.tx.reduce((sum,x)=>sum+(x.category===key?x.amount:0),0)
  })).filter(x=>x.amount>0).sort((a,b)=>b.amount-a.amount);
  const expenseMix=expenseCategories.map(({label,amount})=>`<div class="expense"><div><span>${label}</span><strong>${money(amount)}</strong></div><div class="bar"><i style="width:${amount/cost*100}%"></i></div></div>`).join('');
  const movements=[...db.tx].sort((a,b)=>b.at-a.at).map(x=>row(x.category==='sale'?'cash':'wallet',categories[x.category]+' · '+fname(x.farm),date(x.at)+(x.desc?' · '+x.desc:'')+byLine('tx',x.id),(x.category==='sale'?'+':'−')+money(x.amount),x.category==='sale'?'':'gold','txview:'+x.id)).join('');
  return heading('Ekonomika','Finančný výsledok za celé obdobie.',btn('Pridať pohyb','tx','plus','primary'))+
    '<div class="stats">'+stat('Tržby',money(rev),'Príjmy z predaja','cash')+stat('Náklady',money(cost),'Vrátane investícií a miezd','wallet','gold')+stat('Čistý zisk',money(profit),'Tržby mínus náklady','chart','blue')+stat('Návratnosť',cost?fmt(100*profit/cost)+' %':'—','Zisk / náklady','chart','purple')+'</div>'+
    '<div class="financegrid"><section class="panel">'+section('Výsledky podľa farmy',btn('Kalkulácia cyklu','calc','chart'))+farmResults()+'</section><section class="panel">'+section('Štruktúra nákladov')+(expenseMix||empty('Zatiaľ bez výdavkov.'))+'</section></div>'+
    cropReport()+(CLOUD?playerResults():'')+'<section class="panel">'+section('Pohyby na účte')+(movements||empty('Pridaj prvý príjem alebo výdavok.'))+'</section>';
}
// ---- Harvests and prices: which crop and farm size earns the most per hour ----
function rentShare(f,start,end){
  // Rent counts for the part of each paid lease that the cycle used.
  let sum=0;
  for(const x of db.tx){
    if(x.farm!==f.id||x.category!=='rent')continue;
    const a=x.rentStart??x.at,b=x.rentEnd??shiftDays(a,leaseDays(f));
    const overlap=Math.min(b,end)-Math.max(a,start);
    if(b>a&&overlap>0)sum+=x.amount*overlap/(b-a);
  }
  return sum;
}
function cropCycles(){
  const out=[];
  for(const f of db.farms){
    const harvests=db.logs.filter(l=>l.farm===f.id&&l.action==='Zber'&&l.cycleAt).sort((a,b)=>a.at-b.at);
    harvests.forEach((h,i)=>{
      const prev=harvests[i-1]?.at??-Infinity,next=harvests[i+1]?.at??Infinity;
      const rows=db.tx.filter(x=>x.farm===f.id);
      const sales=rows.filter(x=>x.category==='sale'&&x.at>=h.at&&x.at<next);
      const spent=rows.filter(x=>(x.category==='seed'||x.category==='wage')&&x.at>prev&&x.at<=h.at).reduce((n,x)=>n+x.amount,0);
      const revenue=sales.reduce((n,x)=>n+x.amount,0);
      const hours=Math.max(0,(h.at-h.cycleAt)/H);
      out.push({farm:f,crop:h.crop||'Úroda',size:h.size||f.size,hours,pieces:h.pieces??null,revenue,cost:spent+rentShare(f,h.cycleAt,h.at),at:h.at});
    });
  }
  return out;
}
function cropReport(){
  const cycles=cropCycles().filter(c=>c.hours>0);
  const head=section('Úroda · čo sa najviac oplatí');
  if(!cycles.length)return '<section class="panel crop-report">'+head+empty('Zatiaľ žiadny dokončený cyklus. Pri zápise Zberu môžeš zadať, koľko kusov ste zobrali. Predaj zapíš na farmu, z ktorej úroda je.')+'</section>';
  const groups=new Map();
  for(const c of cycles){const k=c.crop+'|'+c.size;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(c)}
  const sum=(l,k)=>l.reduce((n,c)=>n+c[k],0);
  const rows=[...groups.values()].map(l=>{
    const withPieces=l.filter(c=>c.pieces!=null),hours=sum(l,'hours'),profit=sum(l,'revenue')-sum(l,'cost');
    return {crop:l[0].crop,size:l[0].size,n:l.length,pieces:withPieces.length?sum(withPieces,'pieces')/withPieces.length:null,cost:sum(l,'cost')/l.length,hours:hours/l.length,revenue:sum(l,'revenue')/l.length,perHour:hours?profit/hours:0};
  }).sort((a,b)=>b.perHour-a.perHour);
  const best=rows[0];
  const body=rows.map((r,i)=>`<tr class="${i===0&&r.perHour>0?'best-row':''}"><th scope="row">${E(cropName(r.crop))}${i===0&&r.perHour>0?' <span class="pill ready">najlepšie</span>':''}</th><td>${r.size} polí</td><td>${r.n}</td><td>${r.pieces==null?'—':fmt(Math.round(r.pieces))}</td><td>${money(cents(r.cost))}</td><td>${money(cents(r.revenue))}</td><td>${fmt(Math.round(r.hours*10)/10)} h</td><td class="${r.perHour<0?'loss':r.perHour>0?'gain':''}">${money(cents(r.perHour))}</td></tr>`).join('');
  return '<section class="panel crop-report">'+head+(best.perHour>0?'<p class="crop-best">'+ic('chart')+'Najviac zarába <strong>'+E(cropName(best.crop))+'</strong> na farme s <strong>'+best.size+' poliami</strong>: približne '+money(cents(best.perHour))+' za hodinu.</p>':'')+
    `<div class="tablewrap"><table><thead><tr><th>Plodina</th><th>Veľkosť</th><th>Cyklov</th><th>Ø kusov</th><th>Náklad na cyklus</th><th>Ø tržba</th><th>Ø dĺžka</th><th>Zisk / hod.</th></tr></thead><tbody>${body}</tbody></table></div>`+
    '<p class="hint">Cyklus je od zasadenia po zber. Náklad na cyklus = semienka a mzdy od predošlého zberu + pomerná časť nájmu za čas rastu. Tržba = predaje na farme po zbere (do ďalšieho zberu). Vlastná práca hráčov sa sem neráta.</p></section>';
}
function farmResults() {
  if(!db.farms.length)return empty('Zatiaľ bez fariem.');
  const rows=db.farms.map(f=>{
    const t=totals(db.tx.filter(x=>x.farm===f.id));
    return `<tr><th scope="row"><button class="tablelink" data-a="farm:${f.id}">${E(f.name)}</button></th><td>${money(t.rev)}</td><td>${money(t.cost)}</td><td class="${t.profit<0?'loss':'gain'}">${money(t.profit)}</td></tr>`;
  }).join('');
  return `<div class="tablewrap"><table><thead><tr><th>Farma</th><th>Tržby</th><th>Náklady</th><th>Zisk</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function journal() {
  const ordered=[...db.logs].sort((a,b)=>b.at-a.at);
  const groups=new Map();
  for(const l of ordered){
    const day=new Date(l.at).toLocaleDateString('sk-SK',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    if(!groups.has(day))groups.set(day,[]);
    groups.get(day).push(l);
  }
  const paidIds=new Set(db.tx.filter(x=>x.workId).map(x=>x.workId));
  function journalRow(l){
    const paid=paidIds.has(l.id),pending=l.fee>0&&!paid;
    const fee=l.fee>0?' · '+money(l.fee)+(l.batchLabel?' za '+l.batchLabel:'')+(paid?' vyplatené':' na vyplatenie'):'';
    const cycle=l.cycleAt&&l.action!=='Sadenie'?' · Výsadba '+date(l.cycleAt):'';
    return row(l.icon,l.action,fname(l.farm)+' · '+withPhone(l.who)+fee+cycle+byLine('log',l.id,'zapísal'),
      pending?'Zapísať výplatu':new Date(l.at).toLocaleTimeString('sk-SK',{hour:'2-digit',minute:'2-digit'}),
      l.icon==='water'?'blue':'',pending?'paywork:'+l.id:'farm:'+l.farm);
  }
  const entries=[...groups].map(([day,logs])=>`<section class="panel jour"><h2>${E(day)}</h2>${logs.map(journalRow).join('')}</section>`).join('');
  const contacts=Object.entries(db.workers||{}).sort((a,b)=>a[0].localeCompare(b[0],'sk'));
  const book=contacts.length?'<section class="panel jour contacts">'+section('Pracovníci','<span class="total">'+contacts.length+'</span>')+'<div class="contact-list">'+contacts.map(([n,ph])=>'<div class="contact">'+farmer('worker:'+n,34,n)+'<div><strong>'+E(n)+'</strong><small>tel. '+E(ph)+'</small></div></div>').join('')+'</div></section>':'';
  return heading('Denník prác','Práca na farmách podľa dátumu.',btn('Zapísať prácu','work','plus','primary'))+book+(entries||'<div class="panel">'+empty('Tu uvidíš prvú zapísanú prácu.')+'</div>');
}
function noticesPage() {
  const items=alerts();
  const panels=[['calendar','Platby a nájmy'],['water','Polievanie'],['basket','Zber']].map(([kind,label])=>{
    const group=items.filter(a=>a.icon===kind);
    if(kind==='calendar')group.sort((a,b)=>a.f.due-b.f.due);
    return `<section class="panel">${section(label,'<span class="total">'+group.length+'</span>')}${group.map(a=>row(a.icon,a.f.name,a.title,a.detail,a.kind,'farm:'+a.f.id)).join('')||empty('Žiadne aktuálne upozornenia.')}</section>`;
  }).join('');
  return heading('Upozornenia','Zber, polievanie a blížiace sa termíny.',btn('Nastavenia','go:settings','settings'))+'<div class="noticesgrid">'+panels+'</div>';
}
// Settings are split into categories; the chosen one is remembered for this visit.
let settingsTab=null; // null = list of categories (phone); the computer shows the first one
function settingsTabs(){
  return CLOUD?[['alerts','Upozornenia','bell'],['crops','Pestovanie','sprout'],['team','Hráči','user'],['history','História zmien','history'],['app','Appka','home'],['data','Údaje','log']]
    :[['alerts','Upozornenia','bell'],['crops','Pestovanie','sprout'],['data','Údaje','log']];
}
function cropsPanel(){
  return '<section class="panel">'+section('Časy pestovania')+'<p>Rast a úbytok vody sa počítajú rovnomerne od posledného sadenia a poliatia. Zadaj časy odmerané v hre. Zmena prepočíta aj rozbehnuté cykly.</p><form id="timing"><div class="formgrid">'+field('Všeobecný rast do zberu (hodiny)','growth','number',db.growth,'required min=".01" max="8760" step=".01"')+field('Vodný melón – rast (hodiny)','melonHours','number',growthHours({crop:melon}),'required min=".01" max="8760" step=".01"')+field('Vodný melón – vyschnutie zo 100 % (hodiny)','melonDryHours','number',dryingHours({crop:melon}),'required min=".01" max="8760" step=".01"')+field('Všeobecné vyschnutie zo 100 % (hodiny)','dry','number',db.dry,'required min=".01" max="8760" step=".01"')+'</div><button class="btn primary">Uložiť časy</button></form><p><strong>Meranie melóna po 18 h 24 min</strong><br>Rast ≈ 42 %, vlhkosť ≈ 48 %, stav ≈ 100 %. Z jedného merania vychádza pri rovnomernom raste odhad približne 44 hodín od zasadenia po zber. Vlhkosť začala na 100 % a bez ďalšieho poliatia klesla na približne 48 %. Pri rovnomernom úbytku vychádza vyschnutie asi po 35 h 40 min od plného poliatia.</p></section>';
}
function inAppAlertsPanel(){
  return '<section class="panel">'+section(CLOUD?'Keď je appka otvorená':'Upozornenia na termíny')+'<p>Pri otvorenej appke dostaneš pripomienku dva dni pred termínom, deň pred ním a v deň termínu. Termíny si môžeš dať aj do kalendára v telefóne.</p><div class="actiongrid">'+btn(db.sound?'Vypnúť zvuk':'Zapnúť zvuk','sound','bell')+(CLOUD?'':btn(db.notices?'Vypnúť oznámenia':'Povoliť oznámenia','notify','bell'))+btn('Export termínov (.ics)','ics','calendar')+'</div></section>';
}
function localDataPanel(){
  return '<section class="panel">'+section('Údaje v tomto prehliadači')+'<p>'+(db.demo?'Pracuješ s ukážkovými údajmi. Pred prvým vlastným zápisom môžeš začať s prázdnou evidenciou. ':'')+'Záloha obsahuje farmy, kontakty, denník, financie a nastavenia.</p><div class="actiongrid">'+btn('Export zálohy','backup','log')+btn('Obnoviť zálohu','restore','history')+(db.demo?btn('Odstrániť ukážkové údaje','clear','','danger'):'')+'</div></section>';
}
// ---- History of changes (kept 120 days on the server) ----
let historyState={rows:null,loading:false,error:'',limit:150};
async function loadHistory(force=false){
  if(!CLOUD||historyState.loading||(historyState.rows&&!force))return;
  historyState.loading=true;historyState.error='';
  try{historyState.rows=await FarmCloud.history({limit:historyState.limit})}catch(e){historyState.error=cloudError(e,'Históriu sa nepodarilo načítať.')}
  historyState.loading=false;
  if(page==='settings'&&settingsTab==='history'&&!$('#modal').open)render();
}
const fieldNames={name:'názov',loc:'budova',floor:'poschodie',door:'dvere',size:'veľkosť',type:'typ prenájmu',due:'termín nájmu',term:'termín',rentAmount:'cena nájmu',leaseDays:'doba prenájmu',owner:'prenajímateľ',phone:'telefón',account:'účet',reminders:'pripomienky',assignments:'dohody s pracovníkmi',notes:'poznámka',createdAt:'dátum pridania'};
function histFarmName(h){const d=h.new_data||h.old_data||{};if(h.kind==='farm')return d.name||'Farma';return d.farm?(db.farms.find(f=>f.id===d.farm)?.name||'Odstránená farma'):'Všeobecné'}
function describeChange(h){
  const n=h.new_data||{},o=h.old_data||{},d=h.op==='delete'?o:n;
  if(h.kind==='farm'){
    if(h.op==='insert')return ['barn','Pridal farmu '+(n.name||'')];
    if(h.op==='delete')return ['x','Odstránil farmu '+(o.name||'')];
    const out=[];
    // Planting, watering and harvest also come as work entries, so a farm change with only those is not repeated.
    if(n.archived!==o.archived)out.push(n.archived?'archivoval farmu':'obnovil farmu');
    const nc=n.waterClaim?.at,oc=o.waterClaim?.at;if(nc&&nc!==oc)out.push('zobral polievanie');else if(!nc&&oc&&n.watered===o.watered)out.push('zrušil záber polievania');
    if((n.settlements||[]).length!==(o.settlements||[]).length)out.push((n.settlements||[]).length>(o.settlements||[]).length?'uzavrel vyúčtovanie':'znova otvoril vyúčtovanie');
    const fields=Object.keys(fieldNames).filter(k=>JSON.stringify(n[k])!==JSON.stringify(o[k]));
    if(fields.length){
      const detail=k=>k==='name'?'názov „'+(o.name||'')+'“ → „'+(n.name||'')+'“':k==='rentAmount'?'cena nájmu '+(o.rentAmount!=null?money(o.rentAmount):'—')+' → '+(n.rentAmount!=null?money(n.rentAmount):'—'):k==='size'?'veľkosť '+o.size+' → '+n.size+' polí':k==='due'?'termín nájmu → '+(n.due?date(n.due):'bez termínu'):fieldNames[k];
      out.push('upravil '+fields.map(detail).join(', '));
    }
    if(!out.length)return null;
    return [out.every(x=>/polievan/.test(x))?'water':'settings',out.join(' · ').replace(/^./,c=>c.toLocaleUpperCase('sk'))];
  }
  if(h.kind==='tx'){const what=({sale:'tržbu',rent:'nájom',wage:'mzdu',seed:'osivo',invest:'investíciu',other:'výdavok'}[d.category]||'pohyb')+' '+money(+d.amount||0)+(d.pieces?' · '+d.pieces+' ks':'');return [d.category==='sale'?'cash':'wallet',(h.op==='insert'?'Zapísal ':h.op==='delete'?'Odstránil ':'Upravil ')+what]}
  if(h.kind==='log'){const what=(d.batchLabel||d.action||'práca')+(d.pieces!=null?' · '+d.pieces+' ks':'');return [d.icon||'work',h.op==='insert'?'Zapísal prácu: '+what:h.op==='delete'?'Odstránil prácu: '+what:n.paid!==o.paid||n.wage!==o.wage?'Vyplatil odmenu: '+what:'Upravil prácu: '+what]}
  if(h.kind==='ongoing')return ['work',h.op==='insert'?'Poslal na prácu: '+(d.who||'')+' · '+jobNames(d.jobs||[]):h.op==='delete'?'Ukončil prebiehajúcu prácu: '+(d.who||''):'Upravil prebiehajúcu prácu'];
  if(h.kind==='worker')return ['user',(h.op==='delete'?'Odstránil':'Uložil')+' telefón pracovníka '+(d.name||h.record_id)];
  if(h.kind==='settings')return ['settings','Zmenil nastavenia pestovania alebo ceny práce'];
  return ['log','Zmena záznamu'];
}
function historyRows(list){
  // Several jobs saved at once are one entry: the first carries the label "Sadenie, Polievanie".
  const batch=list.filter(o=>o.kind==='log'&&o.op==='insert'&&o.new_data?.batchLabel);
  const shown=list.filter(h=>!(h.kind==='log'&&h.op==='insert'&&!h.new_data?.batchLabel&&batch.some(o=>o.new_data.farm===h.new_data?.farm&&o.actor===h.actor&&Math.abs(o.new_data.at-h.new_data.at)<50)));
  return shown.map(h=>{const r=describeChange(h);if(!r)return '';const [icon,text]=r;return '<div class="hist-row">'+farmer(h.actor,28,playerName(h.actor))+'<div><strong>'+E(playerName(h.actor))+'</strong> <span>'+E(text)+'</span><small>'+E(histFarmName(h))+' · '+date(new Date(h.at).getTime())+'</small></div>'+ic(icon)+'</div>'}).join('');
}
function historyPanel(){
  if(!historyState.rows&&!historyState.loading)setTimeout(()=>loadHistory(),0);
  const s=historyState;
  return '<section class="panel">'+section('Posledné zmeny',btn('Obnoviť','histreload','history'))+
    (s.error?'<p class="auth-msg error">'+E(s.error)+'</p>':'')+
    (!s.rows?empty(s.loading||!s.error?'Načítavam históriu…':'—'):s.rows.length?'<div class="hist-list">'+historyRows(s.rows)+'</div>'+(s.rows.length>=s.limit?'<div class="actions">'+btn('Načítať staršie','histmore','arrow')+'</div>':''):empty('Zatiaľ žiadne zmeny.'))+
    '<p class="hint">Každá zmena farmy, platby, práce aj nastavení sa zapíše automaticky na serveri. Uchováva sa 120 dní. Ak dvaja hráči zmenia to isté naraz, uloží sa prvá zmena a druhý hráč dostane upozornenie.</p></section>';
}
async function historyModal(f){
  modal('História zmien · '+f.name,empty('Načítavam…'));
  try{
    const rows=await FarmCloud.history({limit:200,farm:f.id}),body=$('#modal .dialogbody');
    if($('#modal').open&&body)body.innerHTML=rows.length?'<div class="hist-list">'+historyRows(rows)+'</div><p class="hint">Posledných 200 zmien tejto farmy, jej platieb a prác.</p>':empty('Na tejto farme zatiaľ nie sú zmeny.');
  }
  catch(e){modal('História zmien',empty(cloudError(e,'Históriu sa nepodarilo načítať.')))}
}
function settingsHints(){
  const active=CLOUD?members.filter(m=>m.status==='active').length:0,waiting=CLOUD&&isLeader()?members.filter(m=>m.status==='pending').length:0;
  return {
    alerts:CLOUD?(pushState.endpoint?'Notifikácie zapnuté na tomto zariadení':'Notifikácie do telefónu a pripomienky'):'Pripomienky termínov a kalendár',
    crops:'Časy rastu a vody'+(CLOUD?', cena vlastnej práce':''),
    team:active+' '+(active===1?'hráč':active<5?'hráči':'hráčov')+(waiting?' · '+waiting+' čaká na schválenie':'')+' · odhlásenie',
    history:'Kto čo zmenil za posledné 4 mesiace',
    app:isStandalone()?'Beží ako nainštalovaná appka':'Pridať FarmDesk na plochu telefónu',
    data:CLOUD?'Záloha spoločných údajov':'Záloha a obnovenie'
  };
}
// Settings as a list of categories: on a phone the list opens each category on its own screen,
// on a computer the list stays on the left and the chosen category is shown on the right.
function settings(){
  const tabsList=settingsTabs();
  if(settingsTab&&!tabsList.some(([k])=>k===settingsTab))settingsTab=null;
  const current=settingsTab||tabsList[0][0];
  const hints=settingsHints(),waiting=CLOUD&&isLeader()?members.filter(m=>m.status==='pending').length:0;
  const profile=CLOUD
    ?'<div class="settings-profile">'+farmer(me?.user_id,76,myName())+'<strong>'+E(myName())+'</strong><small>'+(isLeader()?'Leader':'Hráč')+' · FarmDesk SeeRPG</small></div>'
    :'<div class="settings-profile">'+farmer('farmdesk',76,'Farmár')+'<strong>FarmDesk</strong><small>Údaje v tomto prehliadači</small></div>';
  const rows=tabsList.map(([k,label,icon])=>'<button class="settings-row '+(current===k?'on':'')+'" data-a="settab:'+k+'"><span class="settings-ico">'+ic(icon)+'</span><span class="settings-text"><strong>'+label+(k==='team'&&waiting?' <b class="tab-badge">'+waiting+'</b>':'')+'</strong><small>'+E(hints[k])+'</small></span>'+ic('right')+'</button>').join('');
  const [,title,icon]=tabsList.find(([k])=>k===current);
  const body={
    alerts:()=>(CLOUD?pushPanel():'')+inAppAlertsPanel(),
    crops:()=>cropsPanel()+(CLOUD?workPricePanel():''),
    team:()=>cloudPanels(),
    history:()=>historyPanel(),
    app:()=>installPanel(),
    data:()=>CLOUD?sharedDataPanel():localDataPanel()
  }[current]();
  return '<div class="settings-shell '+(settingsTab?'has-detail':'')+'">'+
    '<aside class="settings-nav"><h1 class="settings-title">Nastavenia</h1>'+profile+'<nav class="settings-list" aria-label="Kategórie nastavení">'+rows+'</nav></aside>'+
    '<section class="settings-detail"><button class="settings-back" data-a="settab:">'+ic('right')+'Nastavenia</button><div class="settings-head"><span class="settings-ico">'+ic(icon)+'</span><div><h2>'+title+'</h2><p>'+E(hints[current])+'</p></div></div>'+
    '<div class="settings">'+body+'</div></section></div><input type="file" hidden id="file" accept=".json,application/json">';
}
function render(){
 const count=alerts().length;
 const nav=(p,i)=>`<button class="rail-link ${page===p||page==='farm'&&p==='farms'?'active':''}" title="${names[p]}" aria-label="${names[p]}" aria-current="${page===p?'page':'false'}" data-a="go:${p}">${ic(i)}<span>${names[p]}</span></button>`;
 $('#sidebar').innerHTML=`<button class="rail-logo" data-a="go:overview" aria-label="FarmDesk">${ic('brand')}</button><nav>${nav('overview','grid')}${nav('farms','barn')}${nav('water','water')}${nav('finance','chart')}${nav('history','log')}${nav('alerts','bell')}</nav><div class="rail-bottom">${nav('settings','settings')}<button class="rail-avatar" data-a="go:settings" title="${E(CLOUD?myName():'Farmár')}">${farmer(CLOUD?me?.user_id:'farmdesk',34,CLOUD?myName():'Farmár')}</button></div>`;
 $('#top').innerHTML=`<div class="top-id"><button class="iconbtn menu" data-a="menu" aria-label="Menu">${ic('menu')}</button><strong>FarmDesk</strong><span class="divider"></span><span class="server-name">SeeRPG</span></div><div class="top-actions"><button class="search-shortcut" data-a="searchfarm">${ic('search')}<span>Vyhľadať farmu</span></button>${db.demo?'<button class="demo" data-a="go:settings">Ukážkové údaje</button>':''}${CLOUD?cloudTopbar():''}<button class="iconbtn" aria-label="Upozornenia" data-a="go:alerts">${ic('bell')}${count?'<i class="dot"></i>':''}</button></div>`;
 $('#main').innerHTML=page==='overview'?home():page==='farms'?heading('Moje farmy','Evidencia prenájmov od štátu a od hráčov.',btn('Pridať farmu','new','plus','primary'))+'<div class="filters"><input id="search" aria-label="Vyhľadať farmu" placeholder="Vyhľadať farmu podľa mena alebo čísla (napr. D05)…" value="'+E(query)+'"></div>'+tabs()+'<div id="matches">'+farmsgrid()+'</div>':page==='finance'?finance():page==='settings'?settings():page==='history'?journal():page==='farm'?farmPage():page==='water'?waterPage():noticesPage();document.querySelectorAll('canvas').forEach(paint)}
const field=(l,n,t,v='',attr='')=>'<label class="field">'+l+'<input name="'+n+'" type="'+t+'" value="'+E(v)+'" '+attr+'></label>';
function select(l,n,opts,val,attr=''){return '<label class="field">'+l+'<select name="'+n+'" '+attr+'>'+opts.map(([v,s])=>'<option value="'+E(v)+'" '+(String(val)===String(v)?'selected':'')+'>'+E(s)+'</option>').join('')+'</select></label>'}
const seq=(n)=>Array.from({length:n},(_,i)=>[i+1,String(i+1)]);
const farmopts=()=>db.farms.map(f=>[f.id,f.name]);
function modal(title,html){let m=$('#modal');m.innerHTML='<header><h2 id="dialog-title">'+E(title)+'</h2><button class="iconbtn" data-a="close" aria-label="Zavrieť">'+ic('x')+'</button></header><div class="dialogbody">'+html+'</div>';if(!m.open)m.showModal();m.querySelectorAll('canvas').forEach(paint);m.scrollTop=0}
const close=()=>$('#modal').close();
const form=(id,html,submit='Uložiť')=>'<form id="'+id+'"><div class="formgrid">'+html+'</div><div class="actions">'+btn('Zrušiť','close')+'<button class="btn primary">'+submit+'</button></div></form>';
const weeklyTerm='Ďalšie nájomné';
function shiftDays(stamp,days){
  const result=new Date(stamp);
  result.setDate(result.getDate()+days);
  return result.getTime();
}
const leaseDays=f=>f?.leaseDays??7;
const validLeaseDays=n=>Number.isInteger(n)&&n>=1&&n<=30;
const dayLabel=n=>n+' '+(n===1?'deň':n<=4?'dni':'dní');
const leaseEnd=(start,f)=>shiftDays(start,leaseDays(f));
const agreedRent=f=>f?.rentAmount===undefined?f?.weeklyRent:f.rentAmount;
function reminderOffsets(f){
  return [2,1,0].filter(days=>!f.createdAt||Math.floor(shiftDays(f.due,-days)/60000)>=Math.floor(f.createdAt/60000));
}
function reminderText(days){
  return days===0?'Dnes je termín':days===1?'Termín je zajtra':'Termín je o 2 dni';
}
function reminderSummary(f){
  if(!f.due||f.archived)return '';
  return '<section class="contract-box"><h3>Pripomienky termínu</h3><div class="contract-lines">'+
    reminderOffsets(f).map(days=>'<span>'+(['V deň termínu','Deň pred termínom','Dva dni pred termínom'][days])+'</span><strong>'+new Date(shiftDays(f.due,-days)).toLocaleString('sk-SK',{weekday:'long',day:'numeric',month:'numeric',hour:'2-digit',minute:'2-digit'})+'</strong>').join('')+'</div></section>';
}
const isAmount=n=>Number.isFinite(n)&&n>=0&&n<=999999999999&&Math.round(n*100)/100===n;

function edit(f){
  activeFarm=f?.id||null;
  const editingFields=f?select('Sledovaný termín','term',[['Koniec nájmu','Koniec nájmu'],['Zúčtovanie','Zúčtovanie'],[weeklyTerm,weeklyTerm]],f.term)+
    field('Dátum a čas termínu','due','datetime-local',local(f.due))+
    field('Pridaná do evidencie','createdAt','datetime-local',local(f.createdAt),f.createdAt?'required':''):'';
  const legacyName=f?.owner&&f.ownerFirst===undefined;
  const person=legacyName?'<div class="wide">'+field('Meno a priezvisko','owner','text',f.owner,'maxlength="161"')+'</div>':
    field('Meno','ownerFirst','text',f?.ownerFirst,'maxlength="80"')+field('Priezvisko','ownerLast','text',f?.ownerLast,'maxlength="80"');
  const playerFields='<fieldset id="contacts" class="formgrid wide hire-fields" '+(f?.type==='player'?'':'hidden disabled')+'><legend>Údaje prenajímateľa</legend>'+
    person+field('Herné telefónne číslo','phone','tel',f?.phone,'maxlength="50"')+
    field('Herné číslo účtu','account','text',f?.account,'maxlength="80"')+'</fieldset>';
  modal(f?'Upraviť farmu':'Pridať farmu',form('farmform',
    '<div class="wide name-door">'+field('Názov farmy','name','text',f?.name,'required maxlength="70"')+doorSelect(f?.door||'')+'</div>'+
    select('Typ prenájmu','type',Object.entries(types),f?.type||'own')+
    select('Počet polí','size',[[40,40],[80,80],[120,120]],f?.size||40)+
    select('Budova (farma)','loc',seq(7),f?.loc||1)+select('Poschodie','floor',seq(15),f?.floor||1)+
    select('Dohodnutá doba prenájmu','leaseDays',seq(30).map(([n])=>[n,dayLabel(n)]),leaseDays(f))+
    forintField('Dohodnuté nájomné za celé obdobie','rentAmount',agreedRent(f)??'')+
    (f?'':field('Začiatok nájmu','startedAt','datetime-local',local(now()),'required max="'+local(now())+'"')+'<p class="hint lease-hint">Pri farme, ktorú máte už dlhšie, zadaj, kedy začal aktuálny nájom. Od toho sa počíta koniec nájmu.</p>')+
    (f?'':'<label class="checkline wide"><input type="checkbox" name="rentPaid" checked><span><strong>Nájom je už zaplatený</strong><small>Zapíše sa ako náklad farmy'+(CLOUD?', zaplatil '+E(myName()):'')+'. Ráta sa do vkladu vo vyúčtovaní.</small></span></label>')+
    playerFields+editingFields+(f?.planted?growthProfile(f.crop):''),f?'Uložiť':'Pridať farmu'));
}

function rentSummary(f){
  if(f.type!=='player'&&agreedRent(f)==null)return '';
  const last=db.tx.filter(x=>x.farm===f.id&&x.rentStart!=null).sort((a,b)=>b.rentEnd-a.rentEnd)[0];
  return `<section class="contract-box"><h3>Nájom na ${dayLabel(leaseDays(f))}</h3><div class="contract-lines">
    <span>Dohodnutá suma</span><strong>${agreedRent(f)!=null?money(agreedRent(f))+' za celé obdobie':'Nezadaná'}</strong>
    ${last?'<span>Posledné uhradené obdobie</span><strong>'+date(last.rentStart)+' – '+date(last.rentEnd)+'</strong>':''}</div>
    ${f.archived?'':'<div class="actiongrid">'+btn('Zapísať úhradu nájmu','rent:'+f.id,'wallet','primary')+'</div>'}</section>`;
}
function agreements(f){
  const entries=f.assignments||[];
  if(f.archived&&!entries.length)return '';
  const body=entries.map(a=>`<div class="agreement-row"><div><strong>${E(jobs[a.job][0])} · ${E(withPhone(a.who))}</strong><small>${money(a.fee)} · ${a.plannedAt?date(a.plannedAt):'Termín podľa dohody'}</small></div>
    ${f.archived?'':'<div class="actiongrid">'+btn('Dokončiť','finishjob:'+a.id,'check')+btn('Upraviť','editjob:'+a.id,'settings')+'</div>'}</div>`).join('');
  return `<section class="contract-box"><h3>Dohodnuté práce</h3>${body}
    ${f.archived?'':btn('Dohodnúť prácu','agree:'+f.id,'plus')}</section>`;
}
function agreementForm(f,a=null){
  if(!f||f.archived)return;
  const fields='<input type="hidden" name="farm" value="'+E(f.id)+'"><input type="hidden" name="assignment" value="'+E(a?.id||'')+'">'+
    select('Dohodnutá práca','job',Object.entries(jobs).map(([key,v])=>[key,v[0]]),a?.job||'plant')+
    field('Meno pracovníka','who','text',a?.who||'','required maxlength="80" list="workers"')+
    phoneField(a?.who||'')+'<datalist id="workers">'+Object.keys(db.workers||{}).map(n=>'<option value="'+E(n)+'"></option>').join('')+'</datalist>'+
    forintField('Odmena za túto prácu','fee',a?.fee??'',{required:true})+
    field('Plánovaný čas (voliteľné)','plannedAt','datetime-local',local(a?.plannedAt));
  modal(a?'Upraviť dohodu':'Dohodnúť prácu',form('agreementform',fields,'Uložiť dohodu')+(a?btn('Zrušiť dohodu','canceljob:'+a.id,'x','danger'):''));
}
function findAgreement(id){
  const f=activeFarms().find(f=>f.assignments?.some(a=>a.id===id));
  return {f,a:f?.assignments.find(a=>a.id===id)};
}

function wagesFor(f){
  const unpaid=db.logs.filter(l=>l.farm===f.id&&l.fee>0&&!db.tx.some(x=>x.workId===l.id));
  if(!unpaid.length)return '';
  return '<section class="contract-box"><h3>Odmeny na vyplatenie</h3>'+unpaid.map(l=>row('wallet',withPhone(l.who)+' · '+money(l.fee),workLabel(l)+' · '+date(l.at),'Zapísať výplatu','gold','paywork:'+l.id)).join('')+'</section>';
}
function payout(l){
  if(!l||!l.fee||db.tx.some(x=>x.workId===l.id))return;
  modal('Zapísať výplatu odmeny',form('payform',
    '<input type="hidden" name="log" value="'+E(l.id)+'"><p class="wide">'+E(l.who)+' · '+E(workLabel(l))+' · '+E(fname(l.farm))+'<br><strong>'+money(l.fee)+'</strong></p>'+
    '<div class="wide">'+field('Kedy si odmenu vyplatil?','at','datetime-local',local(now()),'required max="'+local(now())+'"')+'</div>','Potvrdiť výplatu'));
}
function addWage(l,at){
  if(!l||!l.fee||db.tx.some(x=>x.workId===l.id))return false;
  db.tx.push({id:uid(),category:'wage',farm:l.farm,workId:l.id,amount:l.fee,at,desc:l.who+' · '+workLabel(l)+' · práca '+date(l.at)});
  return true;
}

function rentFields(f){
  if(!f||f.type!=='player'||f.archived)return '';
  // An existing next-payment date is the start of a renewal, including early payments.
  const first=f.dueFromEntry&&f.createdAt;
  const start=first||f.due||now();
  return '<div class="wide rent-period"><p>'+E(f.owner||'Prenajímateľ')+' · Účet '+E(f.account||'neuvedený')+'</p></div>'+
    (first?select('Platené obdobie','rentPeriod',[['first','Prvé obdobie od pridania'],['renew','Predĺženie od splatnosti']],'first'):'')+
    field('Začiatok plateného obdobia','rentStart','datetime-local',local(start),'required')+
    '<div class="field"><span>Nasledujúca splatnosť</span><output id="next-rent">'+date(leaseEnd(start,f))+'</output></div>'+
    '<p class="wide hint">Platba pokrýva '+dayLabel(leaseDays(f))+'. Pri predĺžení obdobie začína doterajším termínom.</p>';
}
function saveRent(f,d,at,amount){
  const start=new Date(d.rentStart).getTime(),end=leaseEnd(start,f);
  if(!Number.isFinite(start)||!Number.isFinite(end)){toast('Zadaj začiatok plateného obdobia.');return false}
  const existing=db.tx.filter(x=>x.farm===f.id&&x.rentStart!=null);
  if(existing.some(x=>start<x.rentEnd&&end>x.rentStart)){
    toast('Za toto obdobie už máš na farme zapísanú platbu.');return false;
  }
  if(!existing.length){f.rentBaseDue=f.due;f.rentBaseTerm=f.term;f.rentBaseFromEntry=!!f.dueFromEntry}
  const desc=[f.owner,'Nájom na '+dayLabel(leaseDays(f))+' · '+date(start)+' – '+date(end),d.desc].filter(Boolean).join(' · ');
  db.tx.push({id:uid(),farm:f.id,category:'rent',amount,at,desc,rentStart:start,rentEnd:end});
  if(agreedRent(f)==null)f.rentAmount=amount;
  f.term=weeklyTerm;
  f.dueFromEntry=false;
  f.due=Math.max(end,...existing.map(x=>x.rentEnd));
  return true;
}
function removeMovement(id){
  const item=db.tx.find(x=>x.id===id);
  if(!item)return;
  db.tx=db.tx.filter(x=>x.id!==id);
  const f=db.farms.find(f=>f.id===item.farm);
  if(item.rentEnd&&f?.due===item.rentEnd&&f.term===weeklyTerm){
    const others=db.tx.filter(x=>x.farm===f.id&&x.rentEnd);
    f.due=others.length?Math.max(...others.map(x=>x.rentEnd)):f.rentBaseDue??null;
    if(!others.length){f.term=f.rentBaseTerm||weeklyTerm;f.dueFromEntry=!!f.rentBaseFromEntry&&f.createdAt!=null&&f.due===leaseEnd(f.createdAt,f)}
  }
}

function farmLeasePeriod(f,rows,current=now()){
  // Explicit paid periods take precedence, including renewals paid in advance.
  const periods=rows.filter(x=>x.category==='rent'&&x.rentStart!=null&&x.rentEnd>x.rentStart)
    .map(x=>({start:x.rentStart,end:x.rentEnd})).sort((a,b)=>a.start-b.start);
  const active=periods.find(p=>p.start<=current&&current<p.end);
  if(active)return active;
  const end=periods.length?f.rentBaseDue:f.due;
  if(end){
    const fromEntry=periods.length?f.rentBaseFromEntry:f.dueFromEntry;
    const start=fromEntry&&f.createdAt?f.createdAt:shiftDays(end,-leaseDays(f));
    const initial={start:Math.floor(start/60000)*60000,end};
    if(initial.start<end&&!periods.some(p=>p.start<end&&initial.start<p.end))periods.push(initial);
  }else if(!periods.length&&f.createdAt){
    periods.push({start:Math.floor(f.createdAt/60000)*60000,end:leaseEnd(f.createdAt,f)});
  }
  return periods.filter(p=>p.start<=current).sort((a,b)=>b.start-a.start)[0]||
    periods.sort((a,b)=>a.start-b.start)[0]||null;
}

function farmAccounts(f){
  const rows=db.tx.filter(x=>x.farm===f.id),current=now();
  const period=farmLeasePeriod(f,rows,current);
  const inPeriod=period?rows.filter(x=>{
    const stamp=x.category==='rent'?(x.rentStart??x.at):x.at;
    return stamp>=period.start&&stamp<period.end;
  }):[];
  const all=totals(rows),part=totals(inPeriod);
  const expense=(entries,kind)=>entries.reduce((sum,x)=>sum+(x.category===kind?x.amount:0),0);
  function line(label,periodValue,lifeValue,kind=''){
    const tone=n=>kind==='profit'?(n<0?'loss':n>0?'gain':''):'';
    return `<tr class="${kind}"><th scope="row">${label}</th><td class="${tone(periodValue)}">${period?money(periodValue):'—'}</td><td class="${tone(lifeValue)}">${money(lifeValue)}</td></tr>`;
  }
  const expenses=[['seed','Semienka'],['wage','Vyplatené odmeny'],['rent','Uhradený nájom'],
    ['invest','Ďalšie investície'],['other','Ostatné výdavky']].map(([key,label])=>{
    const total=expense(rows,key);
    return !total&&(key==='other'||key==='invest')?'':line(label,expense(inPeriod,key),total);
  }).join('');
  const periodLabel=!period?'Nájom':current<period.start?'Budúci nájom':current>=period.end?'Posledný nájom':'Tento nájom';
  return `<section class="contract-box farm-accounts"><h3>Hospodárenie farmy</h3>
    ${period?'<p class="account-dates">'+periodLabel+' · '+date(period.start)+' – '+date(period.end)+'</p>':'<p class="account-dates">Dátumy nájomného obdobia nie sú zadané.</p>'}
    <div class="tablewrap"><table><thead><tr><th scope="col">Položka</th><th scope="col">${periodLabel}</th><th scope="col">Celá evidencia</th></tr></thead><tbody>
    ${expenses}${line('Náklady spolu',part.cost,all.cost,'subtotal')}${line('Tržby z úrody',part.rev,all.rev)}${line('Čistý zisk',part.profit,all.profit,'profit')}
    </tbody></table></div><div class="actiongrid">${btn('Nákup semienok','seed:'+f.id,'sprout')}${btn('Predaj úrody','sale:'+f.id,'cash')}</div></section>`;
}

// A farm opens as its own page (#farma-<id>), not as a dialog, so it has room and the back button works.
let farmPageId=null,prevPage='overview';
function detail(f){
  if(!f)return;
  if($('#modal').open)$('#modal').close();
  if(page!=='farm')prevPage=page;
  page='farm';farmPageId=f.id;activeFarm=f.id;
  document.body.classList.remove('navopen');
  try{if(location.hash!=='#farma-'+f.id)location.hash='farma-'+f.id}catch{}
  render();window.scrollTo(0,0);
}
function openFromHash(){
  const m=location.hash.match(/^#farma-(.+)$/),f=m&&db.farms.find(x=>x.id===decodeURIComponent(m[1]));
  if(f)detail(f);else if(page==='farm')go(prevPage||'overview');
}
function farmPage(){
  const f=db.farms.find(x=>x.id===farmPageId);
  if(!f)return heading('Farma sa nenašla','Farma bola odstránená alebo ešte nie je načítaná.',btn('Späť na farmy','go:farms','arrow'));
  activeFarm=f.id;
  const {g,w}=progress(f),[s,cls]=stage(f),prop=(l,v)=>'<div><small>'+l+'</small>'+E(v)+'</div>';
  const actions='<div class="actiongrid">'+(f.archived?'':btn('Zapísať prácu','work:'+f.id,'work','primary'))+btn('Pridať pohyb','tx:'+f.id,'wallet')+btn('Upraviť','edit:'+f.id,'settings')+btn(f.archived?'Obnoviť farmu':'Archivovať','archive:'+f.id,'log')+(CLOUD?btn('História zmien','farmhist:'+f.id,'history'):'')+(!CLOUD||isLeader()?btn('Odstrániť','delfarm:'+f.id,'x','danger'):'')+'</div>';
  const props=prop('Umiestnenie',placeText(f))+prop('Výsadbu má na starosti',f.planted?withPhone(f.worker||'Ja'):'Podľa novej dohody')+prop('Dohodnutá doba prenájmu',dayLabel(leaseDays(f)))+prop('Pridaná do evidencie',(f.createdAt?date(f.createdAt):'Dátum neuvedený')+(CLOUD?byLine('farm',f.id,'pridal'):''))+(f.planted?prop('Plodina',cropName(f.crop)+' · odhad '+fmt(growthHours(f))+' h'):'')+prop('Zasadené',f.planted?date(f.planted):'—')+prop('Predpokladaný zber',f.planted?date(f.planted+growthHours(f)*H):'—')+prop('Posledné polievanie',f.watered?date(f.watered):'—')+(f.archived?prop(f.term,f.due?date(f.due):'Bez termínu'):'')+(f.type==='player'?prop('Prenajímateľ',f.owner||'—')+prop('Telefón',f.phone||'—')+prop('Účet na nájomné',f.account||'—'):'');
  const history=[...db.logs].filter(l=>l.farm===f.id).sort((a,b)=>b.at-a.at);
  const journal='<section class="contract-box farm-journal"><h3>Práce na farme <span class="total">'+history.length+'</span></h3>'+(history.slice(0,12).map(l=>row(l.icon,l.action,withPhone(l.who)+(l.fee>0?' · '+money(l.fee):'')+byLine('log',l.id,'zapísal'),date(l.at),l.icon==='water'?'blue':'')).join('')||empty('Na tejto farme zatiaľ nie je zapísaná práca.'))+(history.length>12?'<p class="hint">Staršie práce nájdeš v Denníku prác.</p>':'')+'</section>';
  return `<div class="pagetitle farm-title"><div><button class="btnlink back-link" data-a="back">${ic('arrow')}Späť</button><h1>${E(f.name)}${f.door?' <span class="door-tag">'+E(doorLabel(f.door))+'</span>':''}</h1><p>${E(placeText(f))} · ${types[f.type]} · ${f.size} polí</p></div>${actions}</div>
  <div class="farm-page"><div class="farm-col"><section class="panel farm-hero"><div class="detail-size-banner size-${f.size}">${capacityGraphic(f.size)}</div><div class="inline"><span class="pill ${cls}"><i></i>${s}</span>${soilPill(f)}${workingPill(f)}</div><div data-farm-timer="${E(f.id)}">${duePanel(f)}</div>${metric('Odhad rastu','sprout',g)}${metric('Odhad vody','water',w,'water')}<div class="details">${props}</div></section>${ongoingBox(f)}${reminderSummary(f)}${agreements(f)}</div>
  <div class="farm-col">${farmAccounts(f)}${CLOUD?settlementBox(f)+settlementHistory(f):''}${rentSummary(f)}${wagesFor(f)}${journal}</div></div>`;
}
const jobs={dig:['Kopanie','work'],till:['Rýľovanie','work'],water:['Polievanie','water'],plant:['Sadenie','sprout'],harvest:['Zber','basket']};
// Shown in work order; saved in game order (a harvest first, so a new crop can follow on the same visit).
const jobShown=['dig','till','plant','water','harvest'],jobOrder=['harvest','dig','till','plant','water'];
const fullCycle=f=>f?.planted?jobOrder:jobOrder.filter(j=>j!=='harvest');
function jobPicker(f,selected,locked){
  if(locked)return '<div class="field wide"><span>Druh práce</span><input type="hidden" name="job" value="'+E(locked)+'"><div class="jobchips"><span class="jobchip fixed">'+ic(jobs[locked][1])+jobs[locked][0]+'</span></div></div>';
  const cycle=fullCycle(f);
  const chips=jobShown.map(k=>'<label class="jobchip"><input type="checkbox" name="job" value="'+k+'" '+(selected.includes(k)?'checked ':'')+(k==='harvest'&&!f.planted?'disabled ':'')+'>'+ic(jobs[k][1])+jobs[k][0]+'</label>').join('');
  return '<fieldset class="wide jobpick"><legend>Druh práce <small>· môžeš vybrať viac</small></legend><div class="jobchips">'+chips+
    '<label class="jobchip all"><input type="checkbox" name="alljobs" '+(cycle.every(k=>selected.includes(k))?'checked':'')+'>'+ic('check')+'Všetko</label></div></fieldset>';
}
const checkedJobs=form=>[...form.querySelectorAll('[name="job"]')].filter(i=>i.type==='hidden'||i.checked&&!i.disabled).map(i=>i.value);
function syncJobPicker(form,farm){
  const boxes=[...form.querySelectorAll('input[type="checkbox"][name="job"]')];
  const harvest=boxes.find(b=>b.value==='harvest');
  if(harvest){harvest.disabled=!farm?.planted;if(harvest.disabled)harvest.checked=false}
  const all=form.elements.alljobs;
  if(all)all.checked=fullCycle(farm).every(k=>boxes.find(b=>b.value===k)?.checked);
  $('#crop-profile').hidden=!checkedJobs(form).includes('plant');
  const pieces=$('#harvest-fields');if(pieces){const on=checkedJobs(form).includes('harvest');pieces.hidden=!on;pieces.querySelector('input').disabled=!on}
}
const workLabel=l=>l.batchLabel||l.action;
// Work in progress: a worker has been sent to a farm; it becomes journal entries once confirmed as done.
const ongoingWork=()=>(db.ongoing||[]).filter(o=>activeFarms().some(f=>f.id===o.farm)).sort((a,b)=>a.startedAt-b.startedAt);
const ongoingOn=f=>(db.ongoing||[]).filter(o=>o.farm===f.id);
const jobNames=list=>jobShown.filter(j=>list.includes(j)).map(j=>jobs[j][0]).join(', ');
function ago(t){const m=Math.max(0,Math.round((now()-t)/60000));if(m<1)return 'práve teraz';const h=Math.floor(m/60);return 'pred '+(h?h+' h'+(m%60?' '+m%60+' min':''):m+' min')}
const workingPill=f=>ongoingOn(f).length?'<span class="pill working" title="Pracuje sa"><i></i>Pracuje sa</span>':'';
function workingPane(){
  const list=ongoingWork();
  const rows=list.map(o=>{const f=db.farms.find(x=>x.id===o.farm);return row('work',f.name,withPhone(o.who)+' · '+jobNames(o.jobs)+byLine('ongoing',o.id,'poslal'),ago(o.startedAt),'busy','finishwork:'+o.id)}).join('');
  return `<section class="task-pane working-pane"><div class="work-head"><h2>Práve sa pracuje <span class="total ${list.length?'busy-count':''}">${list.length}</span></h2>${btn('Poslať na prácu','startwork','plus')}</div><div class="queue-body">${rows||empty('Momentálne sa nikde nepracuje. Keď pošleš pracovníka na farmu, uvidíš ho tu.')}</div>${list.length?'<p class="pane-hint">Klikni na farmu, keď je práca hotová.</p>':''}</section>`;
}
function ongoingBox(f){
  const list=ongoingOn(f);if(!list.length||f.archived)return '';
  return '<section class="contract-box working-box"><h3>Práve sa pracuje</h3>'+list.map(o=>'<div class="agreement-row"><div><strong>'+E(jobNames(o.jobs))+' · '+E(withPhone(o.who))+'</strong><small>Od '+date(o.startedAt)+' · '+ago(o.startedAt)+(o.fee?' · '+money(o.fee):'')+'</small></div><div class="actiongrid">'+btn('Hotovo','finishwork:'+o.id,'check','primary')+btn('Zrušiť','cancelwork:'+o.id,'x')+'</div></div>').join('')+'</section>';
}
// Worker phone book: one game phone number per worker name, reused next time the name is entered.
const workerPhone=name=>name&&name!=='Ja'?(db.workers?.[name.trim()]||''):'';
const withPhone=name=>name+(workerPhone(name)?' · tel. '+workerPhone(name):'');
function rememberWorker(name,phone){
  name=(name||'').trim();phone=(phone||'').trim();
  if(!name||name==='Ja'||phone===undefined)return;
  db.workers??={};
  if(phone)db.workers[name]=phone;
}
const phoneField=name=>field('Telefón pracovníka (v hre)','workerPhone','tel',workerPhone(name),'maxlength="50" placeholder="napr. 555-0123"');
function work(id,assignment=null,ongoing=null,mode='done'){
  if(!activeFarms().length){toast('Najprv pridaj farmu.');return}
  const f=activeFarms().find(f=>f.id===id)||activeFarms()[0];
  const job=assignment?.job||(f.planted?(progress(f).g===100?'harvest':'water'):'dig');
  const plantedByHire=f.planted&&(f.workerHired??(!!f.worker&&f.worker!=='Ja'&&!f.crew));
  const worker=ongoing?.who||assignment?.who||(plantedByHire?f.worker:'Ja');
  const people=[...new Set([...db.logs.map(l=>l.who),...db.farms.map(f=>f.worker),...Object.keys(db.workers||{})].filter(n=>n&&n!=='Ja'))];
  const hire=ongoing?ongoing.performer==='hired':!!assignment||!!plantedByHire;
  const fixedFarm=assignment||ongoing;
  const title=ongoing?'Dokončiť prácu':assignment?'Dokončiť dohodnutú prácu':mode==='ongoing'?'Poslať na prácu':'Zapísať prácu';
  modal(title,form('workform',
    (assignment?'<input type="hidden" name="assignment" value="'+E(assignment.id)+'">':'')+
    (ongoing?'<input type="hidden" name="ongoing" value="'+E(ongoing.id)+'"><input type="hidden" name="status" value="done"><p class="wide hint worktime">'+ic('clock')+'Práca začala '+date(ongoing.startedAt)+' ('+ago(ongoing.startedAt)+'). Uprav, čo sa naozaj spravilo, a potvrď.</p>':'')+
    select('Farma','farm',(fixedFarm?[f]:activeFarms()).map(x=>[x.id,x.name]),f.id)+
    jobPicker(f,ongoing?ongoing.jobs:[job],assignment?.job)+
    '<div id="crop-profile" class="wide" '+((ongoing?ongoing.jobs.includes('plant'):job==='plant')?'':'hidden')+'>'+growthProfile(ongoing?.crop||'Úroda')+'</div>'+
    (()=>{const on=ongoing?ongoing.jobs.includes('harvest'):job==='harvest';return '<div id="harvest-fields" class="wide" '+(on?'':'hidden')+'>'+field('Koľko kusov ste zobrali ('+cropName(f.crop)+')','pieces','number','','min="0" max="100000" step="1" inputmode="numeric" placeholder="nepovinné"'+(on?'':' disabled'))+'<p class="hint">Appka z toho ukáže, koľko kusov priemerne dáva ktorá plodina a veľkosť farmy.</p></div>'})()+
    (fixedFarm?'':'<div class="wide">'+select('Stav práce','status',[['done','Hotová – zapísať do denníka'],['ongoing','Prebieha – pracovník práve začal']],mode)+'</div>')+
    '<div class="wide">'+select('Kto vykonal prácu?','performer',[['self',CLOUD?'My, hráči sami':'Ja'],['hired','Najatý pracovník']],hire?'hired':'self')+'</div>'+
    (CLOUD?crewPicker(ongoing?.players||[me?.user_id],hire):'')+
    (ongoing?'':'<p class="wide hint worktime">'+ic('clock')+'Dátum a čas sa zapíšu automaticky pri stlačení Zapísať. Pri prebiehajúcej práci ako čas začiatku.</p>'+
      '<details class="wide past-time"><summary>Práca bola spravená skôr?</summary><p class="hint">Pre farmy rozrobené pred appkou alebo zabudnutý zápis. Rast a voda sa potom počítajú od tohto času.</p>'+field('Kedy bola práca spravená','at','datetime-local','','max="'+local(now())+'"')+'</details>')+
    '<fieldset id="hire-fields" class="wide formgrid hire-fields" '+(hire?'':'hidden disabled')+'><legend>Dohoda za túto prácu</legend>'+
    field('Meno pracovníka','who','text',hire?worker:'','required maxlength="80" list="workers"')+
    phoneField(hire?worker:'')+
    '<datalist id="workers">'+people.map(n=>'<option value="'+E(n)+'"></option>').join('')+'</datalist>'+
    forintField('Dohodnutá odmena','fee',assignment?.fee??ongoing?.fee??'',{required:true})+
    select('Vyplatenie','settlement',[['pending','Vyplatím neskôr'],['paid','Už vyplatené pri práci']],ongoing?.settlement||'pending')+
    '</fieldset>',ongoing?'Potvrdiť dokončenie':'Zapísať'));
}
function tx(id,category){
  const f=db.farms.find(x=>x.id===id);
  const rent=category==='rent'&&f&&!f.archived;
  const title=rent?'Úhrada nájmu':category==='seed'?'Nákup semienok':id&&category==='sale'?'Predaj úrody':'Pridať finančný pohyb';
  modal(title,form('txform',
    (id?'<input type="hidden" name="fromFarm" value="1">':'')+
    select('Farma','farm',[['','Všeobecné'],...farmopts()],id||'')+select('Kategória','category',Object.entries(categories),category||'sale')+
    forintField('Suma','amount',rent?agreedRent(f)??'':'',{required:true})+
    field('Dátum a čas platby','at','datetime-local',local(now()),'required')+
    '<div id="rent-fields" class="wide formgrid">'+(rent?rentFields(f):'')+'</div>'+
    '<div class="wide">'+field('Poznámka','desc','text','','maxlength="150"')+'</div>','Uložiť pohyb'));
}

function calc(){modal('Kalkulácia pestovateľského cyklu','<form id="calcform"><div class="formgrid">'+field('Počet polí','plots','number',40,'min="1" max="120"')+field('Výnos na pole (kusy)','yield','number',1,'min="0" step="any"')+forintField('Cena za kus','price',0,{precise:true})+forintField('Nájom za cyklus','rent',0,{precise:true})+forintField('Osivo a vstupy','inputs',0,{precise:true})+forintField('Mzdy za cyklus','wages',0,{precise:true})+forintField('Investícia na začiatku','investment',0,{precise:true})+'</div><div id="calcresult" class="calcresult"></div></form>');calculate()}
function calculate(){
  const form=$('#calcform'),d=Object.fromEntries(new FormData(form));
  for(const key of ['price','rent','inputs','wages','investment']){
    const raw=ungroupAmount(d[key]);
    if(raw&&!/^\d*(?:\.\d*)?$/.test(raw)){$('#calcresult').textContent='Zadaj platnú sumu vo forintoch.';return}
    d[key]=Number(raw);
  }
  let units=d.plots*d.yield,rev=units*d.price,cost=+d.rent+ +d.inputs+ +d.wages,p=rev-cost;$('#calcresult').innerHTML='Tržby '+money(rev)+' · Náklady '+money(cost)+'<br>Zisk za cyklus '+money(p)+'<br><small>'+(+d.investment===0?'Bez počiatočnej investície':p>0?'Investícia sa vráti za '+Math.ceil(d.investment/p)+' cyklov.':'Pri tomto zisku sa investícia nevráti.')+'</small>'}
async function download(name,data,type){
  // Hosted on claude.ai the page cannot start downloads itself; use the downloads capability there.
  try{const dl=window.claude?.use?await window.claude.use('downloads'):null;if(dl){try{await dl.save({filename:name,data})}catch{toast('Súbor sa nepodarilo uložiť.')}return}}catch{}
  let a=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)}
function calendar(){const stamp=t=>new Date(t).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';const esc=s=>s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/[,;]/g,c=>'\\'+c);let farms=activeFarms().filter(f=>f.due);if(!farms.length){toast('Najprv nastav termín na farme.');return}
 let lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//FarmDesk//SK','CALSCALE:GREGORIAN'];farms.forEach(f=>{let summary=esc(f.term+' – '+f.name);lines.push('BEGIN:VEVENT','UID:'+f.id+'@farmdesk','DTSTAMP:'+stamp(now()),'DTSTART:'+stamp(f.due),'DURATION:PT15M','SUMMARY:'+summary);reminderOffsets(f).forEach(days=>lines.push('BEGIN:VALARM','TRIGGER;VALUE=DATE-TIME:'+stamp(shiftDays(f.due,-days)),'ACTION:DISPLAY','DESCRIPTION:'+summary,'END:VALARM'));lines.push('END:VEVENT')});lines.push('END:VCALENDAR');download('farmdesk-terminy.ics',lines.join('\r\n')+'\r\n','text/calendar')}
function beep(){if(!db.sound||!audioCtx)return;try{let o=audioCtx.createOscillator(),v=audioCtx.createGain();o.connect(v);v.connect(audioCtx.destination);o.frequency.value=740;v.gain.setValueAtTime(.09,audioCtx.currentTime);v.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.27);o.start();o.stop(audioCtx.currentTime+.27)}catch{}}
function check(){
  const current=now(),today=new Date(current).toDateString(),messages=[];
  db.sent??={};
  for(const f of activeFarms()){
    if(!f.due)continue;
    for(const days of reminderOffsets(f)){
      const target=shiftDays(f.due,-days);
      if(current<target||new Date(target).toDateString()!==today)continue;
      const key=[f.id,'weekly',Math.floor(f.due/60000),days].join('/');
      if(db.sent[key])continue;
      db.sent[key]=true;
      const message=f.name+' · '+f.term+' · '+reminderText(days)+' ('+date(f.due)+')';
      messages.push(message);
      if(db.notices&&window.Notification?.permission==='granted'){
        try{new Notification('FarmDesk',{body:message,tag:key})}catch{}
      }
    }
  }
  if(messages.length){save();toast(messages.join(' • '));beep()}
}
function confirmBox(title,msg,action){modal(title,'<p>'+E(msg)+'</p><div class="actions">'+btn('Zrušiť','close')+btn('Potvrdiť',action,'check','primary')+'</div>')}
document.addEventListener('click',async e=>{const b=e.target.closest('[data-a]');if(!b)return;let [a,id]=b.dataset.a.split(':');let f=db.farms.find(x=>x.id===id);
 if(a==='range'){const days=Number(id);if([7,14,30].includes(days)){chartDays=days;render();document.querySelector('[data-a="range:'+days+'"]')?.focus()}}else if(a==='map')modal('Lokality fariem',locationMap(activeFarms()));else if(a==='searchfarm'){go('farms');$('#search').focus()}else if(a==='location')locationDetail(Number(id));else if(a==='newloc'){edit(null);document.querySelector('[name="loc"]').value=id}else if(a==='priority')priorityView(id);
 else if(a==='pushon'||a==='pushoff'||a==='pushtest'){if(pushState.busy)return;pushState.busy=true;try{if(a==='pushon')await enablePush();else if(a==='pushoff')await disablePush();else{if(!pushState.endpoint){await enablePush();if(!pushState.endpoint)return}const r=await FarmCloud.testPush();toast(r?.sent?'Skúšobná notifikácia odoslaná ('+r.sent+'×). Mala by prísť do pár sekúnd.':'Na tvoje zariadenia sa nepodarilo nič poslať. Vypni a znova zapni notifikácie.')}}catch(err){toast(cloudError(err,'Notifikácie sa nepodarilo nastaviť.'))}finally{pushState.busy=false;render()}}else if(a==='settab'){if(page!=='settings')go('settings');settingsTab=id||null;render();window.scrollTo(0,0)}
 else if(a==='install'&&installPrompt){installPrompt.prompt();installPrompt.userChoice.finally(()=>{installPrompt=null;render()})}
 else if(a==='settle'&&f){const st=settlementFor(f);if(st)confirmBox('Uzavrieť vyúčtovanie?',(st.transfers.length?st.transfers.map(t=>playerName(t.from)+' pošle '+playerName(t.to)+' '+money(t.amount)).join(' · ')+'. ':'Nikto nikomu nič neposiela. ')+'Po uzavretí sa prevody započítajú hráčom v Ekonomike.','settleok:'+id)}
 else if(a==='settleok'&&f){closeSettlement(f);save();close();render();toast('Vyúčtovanie je uzavreté.')}
 else if(a==='settlereopen'&&f)confirmBox('Otvoriť vyúčtovanie znova?','Prevody z tohto vyúčtovania sa prestanú rátať v Ekonomike, kým ho znova neuzavrieš.','settlereopenok:'+id);
 else if(a==='settlereopenok'&&f){const st=settlementFor(f);if(st?.closed)f.settlements=(f.settlements||[]).filter(x=>x!==st.closed);save();close();render()}else if(a==='back'){if(/^#farma-/.test(location.hash)&&history.length>1)history.back();else go(prevPage||'overview')}else if(a==='waterview')go('water');else if(a==='waterspan'){waterHours=[12,24,48].includes(+id)?+id:24;render()}
 else if(a==='claim'&&f){const c=activeClaim(f);if(c&&!claimMine(c)){toast('Túto farmu už berie '+claimName(c)+'.');return}f.waterClaim={by:CLOUD?me?.user_id:null,name:CLOUD?myName():'Ja',at:now()};save();render();toast('Farma '+f.name+' je tvoja na poliatie.')}
 else if(a==='unclaim'&&f){delete f.waterClaim;save();render()}
 else if(a==='workwater'&&f){work(id);const fm=$('#workform');if(fm){fm.querySelectorAll('input[name="job"]').forEach(b=>{if(b.type==='checkbox')b.checked=b.value==='water'});syncJobPicker(fm,f)}}else if(a==='harvestview')harvestView();else if(a==='go')go(id);else if(a==='menu')document.body.classList.toggle('navopen');else if(a==='close')close();else if(a==='filter'){filter=id;render()}else if(a==='farm')detail(f);else if(a==='archive'){confirmBox(f.archived?'Obnoviť farmu?':'Archivovať farmu?',f.archived?'Farma sa vráti medzi aktívne farmy.':'Farma sa presunie do archívu. História a financie ostanú v evidencii.','archiveok:'+id)}else if(a==='delfarm'&&f){if(CLOUD&&!isLeader()){toast('Farmu môže úplne odstrániť iba leader.');return}const n=db.tx.filter(x=>x.farm===id).length,l=db.logs.filter(x=>x.farm===id).length;confirmBox('Odstrániť farmu úplne?',f.name+': odstráni sa farma, '+n+' pohybov na účte a '+l+' zápisov prác. Tržby a náklady zmiznú aj z Ekonomiky. Toto sa nedá vrátiť'+(CLOUD?' (v Histórii zmien ostane záznam 120 dní).':'.')+' Ak ju chceš len odložiť, použi Archivovať.','delfarmok:'+id)}
 else if(a==='delfarmok'&&f){deleteFarm(f);save();close();go('farms');toast('Farma '+f.name+' bola odstránená.')}
 else if(a==='farmhist'&&f)historyModal(f);
 else if(a==='histreload'){historyState.rows=null;historyState.limit=150;loadHistory(true);render()}
 else if(a==='histmore'){historyState.limit+=150;loadHistory(true)}
 else if(a==='archiveok'){f.archived=!f.archived;f.sample=false;save();close();render()}else if(a==='new')edit(null);else if(a==='edit')edit(f);else if(a==='work')work(id);else if(a==='startwork')work(id,null,null,'ongoing');
 else if(a==='finishwork'){const o=(db.ongoing||[]).find(x=>x.id===id);if(o)work(o.farm,null,o);else toast('Táto práca už bola uzavretá.')}
 else if(a==='cancelwork'){const o=(db.ongoing||[]).find(x=>x.id===id);if(o)confirmBox('Zrušiť prebiehajúcu prácu?',fname(o.farm)+' · '+o.who+' · '+jobNames(o.jobs)+'. Do denníka sa nič nezapíše.','cancelworkok:'+id)}
 else if(a==='cancelworkok'){const o=(db.ongoing||[]).find(x=>x.id===id);db.ongoing=(db.ongoing||[]).filter(x=>x.id!==id);save();if(o&&db.farms.find(f=>f.id===o.farm))detail(db.farms.find(f=>f.id===o.farm));else{close();render()}}else if(a==='agree')agreementForm(f);
 else if(['finishjob','editjob','canceljob','canceljobok'].includes(a)){
   const {f:target,a:agreement}=findAgreement(id);
   if(!target){toast('Táto dohoda už nie je otvorená.');return}
   if(a==='finishjob')work(target.id,agreement);
   if(a==='editjob')agreementForm(target,agreement);
   if(a==='canceljob')confirmBox('Zrušiť dohodu?',agreement.who+' · '+jobs[agreement.job][0]+' · '+money(agreement.fee),'canceljobok:'+id);
   if(a==='canceljobok'){target.assignments=target.assignments.filter(x=>x.id!==id);save();detail(target)}
 }
 else if(a==='seed'||a==='sale')tx(id,a);else if(a==='rent')tx(id,'rent');else if(a==='paywork')payout(db.logs.find(l=>l.id===id));else if(a==='tx')tx(id);else if(a==='calc')calc();else if(a==='ics')calendar();else if(a==='backup')download('farmdesk-zaloha.json',JSON.stringify(db,null,2),'application/json');else if(a==='restore'){if(CLOUD&&!isLeader())toast('Spoločnú zálohu môže obnoviť iba leader.');else $('#file').click()}else if(a==='clear')confirmBox('Odstrániť ukážkové údaje?','Odstránia sa tri vzorové farmy a ich vzorové pohyby a práce. Vlastné záznamy sa zachovajú.','clearok');else if(a==='clearok'){let used=new Set([...db.logs,...db.tx].filter(x=>!x.sample).map(x=>x.farm));db.farms=db.farms.filter(x=>!x.sample||used.has(x.id));db.logs=db.logs.filter(x=>!x.sample);db.tx=db.tx.filter(x=>!x.sample);db.demo=false;save();close();render();toast('Ukážkové údaje boli odstránené.')}
 else if(a==='sound'){db.sound=!db.sound;if(db.sound){try{audioCtx??=new AudioContext();await audioCtx.resume();beep()}catch{db.sound=false;toast('Zvuk sa nepodarilo zapnúť.')}}save();render()}
 else if(a==='notify'){if(db.notices)db.notices=false;else{try{db.notices=(await Notification.requestPermission())==='granted';if(!db.notices)toast('Povoľ oznámenia v nastaveniach prehliadača.')}catch{toast('Prehliadač nepodporuje systémové oznámenia.')}}save();render()}
 else if(a==='txview'){let x=db.tx.find(x=>x.id===id);modal(categories[x.category]+' · '+money(x.amount),'<p>'+E(fname(x.farm))+' · '+date(x.at)+'</p><p>'+E(x.desc)+'</p>'+btn('Odstrániť pohyb','deltx:'+id,'x','danger'))}else if(a==='deltx')confirmBox('Odstrániť pohyb?','Pohyb sa odstráni z nákladov alebo tržieb. Pri prepojenej platbe sa upraví aj splatnosť nájmu alebo stav odmeny.','deltxok:'+id);else if(a==='deltxok'){removeMovement(id);save();close();render()}
 else if(a==='restoreok'&&pendingRestore){db=CLOUD?{...pendingRestore,demo:false,sound:db.sound,notices:db.notices,sent:db.sent,farms:pendingRestore.farms.map(f=>({...f,sample:false}))}:pendingRestore;pendingRestore=null;save();close();render();toast('Záloha bola obnovená.')}
});
document.addEventListener('submit',e=>{e.preventDefault();let id=e.target.id,d=Object.fromEntries(new FormData(e.target)),f=db.farms.find(x=>x.id===d.farm);
 if(id==='farmform'){
   if(!d.name.trim()){toast('Zadaj názov farmy.');return}
   if(!Object.hasOwn(types,d.type)){toast('Vyber typ prenájmu.');return}
   const old=db.farms.find(x=>x.id===activeFarm);
   let createdAt=old ? old.createdAt??null : (d.startedAt?new Date(d.startedAt).getTime():now());
   if(!old&&(!Number.isFinite(createdAt)||createdAt>now()+60000)){toast('Začiatok nájmu nemôže byť v budúcnosti.');return}
   if(old && d.createdAt && d.createdAt!==local(createdAt)){
     createdAt=new Date(d.createdAt).getTime();
     if(!Number.isFinite(createdAt)||createdAt<=0){toast('Zadaj platný dátum a čas pridania.');return}
   }
   const door=d.door?+d.door:null;
   if(door!==null&&!(Number.isInteger(door)&&door>=1&&door<=DOORS)){toast('Vyber dvere zo zoznamu.');return}
   const taken=door&&db.farms.find(x=>sameDoor(x,{id:old?.id||'new',loc:+d.loc,floor:+d.floor,door}));
   if(taken){toast(doorText(door).replace(/^./,c=>c.toLocaleUpperCase('sk'))+' na '+d.floor+'. poschodí budovy '+d.loc+' už má farma '+taken.name+'.');return}
   const days=Number(d.leaseDays??leaseDays(old));
   if(!validLeaseDays(days)){toast('Vyber dobu prenájmu od 1 do 30 dní.');return}
   const rentPrice=d.rentAmount?Number(ungroupAmount(d.rentAmount)):null;
   if(rentPrice!==null&&(!isAmount(rentPrice)||rentPrice<=0)){toast('Zadaj kladnú sumu nájmu alebo nechaj pole prázdne.');return}
   if(!old&&d.rentPaid&&!rentPrice){toast('Zadaj sumu nájmu, alebo odškrtni „Nájom je už zaplatený“.');return}
   const unchangedDue=old&&d.due===local(old.due);
   const dueFromEntry=!old||Boolean(createdAt&&old.dueFromEntry&&unchangedDue);
   const due=dueFromEntry?shiftDays(createdAt,days):unchangedDue?old.due:d.due?new Date(d.due).getTime():null;
   if(due!==null&&!Number.isFinite(due)){toast('Skontroluj dátum termínu.');return}
   const entry={...(old||{id:uid(),planted:null,watered:null,worker:'',art:db.farms.length%3,owner:'',phone:'',account:''}),...d,
     rentAmount:rentPrice,
     term:old&&d.term?d.term:d.type==='player'?weeklyTerm:'Koniec nájmu',
     createdAt,name:d.name.trim(),loc:+d.loc,floor:+d.floor,door:d.door?+d.door:null,size:+d.size,leaseDays:days,due,dueFromEntry,sample:false};
   delete entry.startedAt;delete entry.rentPaid;
   if(d.ownerFirst!==undefined)entry.owner=[d.ownerFirst.trim(),(d.ownerLast||'').trim()].filter(Boolean).join(' ');
   if(old)Object.assign(old,entry);else db.farms.push(entry);
   // A new farm whose lease is already paid books the rent right away, for the lease it starts.
   if(!old&&d.rentPaid&&rentPrice){
     if(entry.type==='player')saveRent(entry,{rentStart:local(createdAt)},createdAt,rentPrice);
     else{const end=leaseEnd(createdAt,entry);db.tx.push({id:uid(),farm:entry.id,category:'rent',amount:rentPrice,at:createdAt,desc:'Nájom na '+dayLabel(days)+' · '+date(createdAt)+' – '+date(end),rentStart:createdAt,rentEnd:end})}
   }
   activeFarm=entry.id;
 }
 else if(id==='agreementform'){
   const who=(d.who||'').trim(),fee=Number(ungroupAmount(d.fee)),plannedAt=d.plannedAt?new Date(d.plannedAt).getTime():null;
   if(!f||f.archived||!Object.hasOwn(jobs,d.job)||!who||!isAmount(fee)||d.fee===''||(plannedAt!==null&&!Number.isFinite(plannedAt))){toast('Skontroluj dohodnutú prácu, meno, termín a odmenu.');return}
   const old=f.assignments?.find(a=>a.id===d.assignment);
   if(d.assignment&&!old){toast('Táto dohoda už nie je otvorená.');return}
   rememberWorker(who,d.workerPhone);
   const entry={id:old?.id||uid(),job:d.job,who,fee,plannedAt};
   if(old)Object.assign(old,entry);else(f.assignments??=[]).push(entry);
   f.sample=false;activeFarm=f.id;
 }
 else if(id==='workform'){
   const chosen=checkedJobs(e.target).filter(j=>Object.hasOwn(jobs,j));
   const selected=jobOrder.filter(j=>chosen.includes(j));
   if(!f||f.archived||!selected.length){toast('Vyber aktívnu farmu a aspoň jednu prácu.');return}
   const assignment=d.assignment&&f.assignments?.find(a=>a.id===d.assignment&&selected.includes(a.job));
   if(d.assignment&&!assignment){toast('Dohoda už bola dokončená alebo zrušená.');return}
   const hired=d.performer==='hired';
   const crew=!hired&&CLOUD?[...new FormData(e.target).getAll('players')].filter(id=>members.some(m=>m.user_id===id&&m.status==='active')):[];
   if(!hired&&CLOUD&&!crew.length){toast('Vyber, ktorí hráči na práci robili.');return}
   const who=hired?(d.who||'').trim():CLOUD?crew.map(playerName).join(', '):(d.performer?'Ja':(d.who||'Ja').trim());
   const fee=hired?Number(ungroupAmount(d.fee)):0;
   if(!who||!isAmount(fee)||(hired&&(d.fee==null||d.fee===''))){toast('Doplň meno pracovníka a dohodnutú odmenu.');return}
   if(hired)rememberWorker(who,d.workerPhone);
   if(d.ongoing&&!(db.ongoing||[]).some(o=>o.id===d.ongoing)){toast('Táto práca už bola uzavretá.');return}
   // The work is stamped with the moment it is saved, unless an earlier time was entered.
   const at=d.at?new Date(d.at).getTime():now();
   if(!Number.isFinite(at)){toast('Skontroluj zadaný čas práce.');return}
   if(at>now()+60000){toast('Čas práce nemôže byť v budúcnosti.');return}
   const pieces=d.pieces===undefined||d.pieces===''?null:Number(d.pieces);
   if(pieces!==null&&!(Number.isInteger(pieces)&&pieces>=0&&pieces<=100000)){toast('Počet kusov zadaj ako celé číslo.');return}
   const previous=db.logs.filter(x=>x.farm===f.id&&['Sadenie','Zber','Polievanie'].includes(x.action));
   if(selected.some(j=>['plant','water','harvest'].includes(j))&&previous.some(l=>l.at>at+59999)){toast('Zadaj čas po poslednej práci, ktorá zmenila stav farmy.');return}
   if(selected.some(j=>j==='water'||j==='harvest')&&f.planted&&at+59999<f.planted){toast('Čas práce musí byť po zasadení.');return}
   let planted=!!f.planted;
   for(const j of selected){
     if(j==='harvest'&&!planted){toast('Na farme zatiaľ nie je zasadená úroda.');return}
     if(j==='plant'&&planted){toast('Na farme ešte rastie úroda. Zaškrtni aj Zber, alebo ho zapíš najprv.');return}
     if(j==='harvest')planted=false;
     if(j==='plant')planted=true;
   }
   if(d.status==='ongoing'&&!d.ongoing){
     (db.ongoing??=[]).push({id:uid(),farm:f.id,jobs:selected,who,performer:hired?'hired':'self',...(crew.length?{players:crew}:{}),fee,settlement:d.settlement||'pending',crop:cropOf(d.crop),startedAt:at});
     activeFarm=f.id;
   }else{
   const batchLabel=selected.length>1?selected.map(j=>jobs[j][0]).join(', '):undefined;
   const created=[];
   selected.forEach((j,i)=>{
     const stamp=at+i,cycleAt=j==='plant'?stamp:f.planted,cropBefore=f.crop||'Úroda';
     if(j==='harvest'){f.crop='Úroda';f.planted=null;f.watered=null;delete f.waterClaim}
     if(j==='plant'){f.crop=cropOf(d.crop);f.planted=stamp;f.worker=who;f.workerHired=hired;if(crew.length)f.crew=crew;else delete f.crew;if(!f.watered)f.watered=stamp}
     if(j==='water'){f.watered=stamp;delete f.waterClaim}
     const [action,icon]=jobs[j];
     // The agreed fee covers the whole visit, so it is booked once, on the first entry.
     const log={id:uid(),farm:f.id,action,icon,who,at:stamp,fee:i?0:fee,cycleAt,performer:hired?'hired':'self'};
     if(crew.length)log.players=crew;
     if(!i&&batchLabel)log.batchLabel=batchLabel;
     if(j==='harvest'){log.crop=cropBefore;log.size=f.size;if(pieces!==null)log.pieces=pieces}
     db.logs.push(log);created.push(log);
   });
   if(assignment)f.assignments=f.assignments.filter(a=>a.id!==assignment.id);
   if(d.ongoing)db.ongoing=db.ongoing.filter(o=>o.id!==d.ongoing);
   if(hired&&d.settlement==='paid'&&fee>0)addWage(created[0],at);
   activeFarm=f.id}}
 else if(id==='payform'){
   const l=db.logs.find(l=>l.id===d.log),at=new Date(d.at).getTime();
   if(!l||!Number.isFinite(at)||at>now()||at+59999<l.at){toast('Zadaj dátum výplaty po vykonaní práce.');return}
   if(!addWage(l,at)){toast('Odmena je už vyplatená.');return}
   activeFarm=l.farm;
 }
 else if(id==='txform'){
   const at=new Date(d.at).getTime(),amount=Number(ungroupAmount(d.amount));
   if(!Number.isFinite(at)||!isAmount(amount)||amount<=0){toast('Skontroluj dátum a sumu platby.');return}
   if(d.category==='rent'&&f?.type==='player'&&!f.archived){
     if(at>now()){toast('Úhradu zapíš po zaplatení v hre.');return}
     if(!saveRent(f,d,at,amount))return;
   }else db.tx.push({id:uid(),category:d.category,farm:d.farm,desc:d.desc||'',amount,at});
 }
 else if(id==='workprices'){
   const prices={};
   for(const k of jobShown){const n=Number(ungroupAmount(d['price_'+k]||'0'));if(!isAmount(n)){toast('Skontroluj cenu práce '+jobs[k][0]+'.');return}prices[k]=n}
   db.workPrices=prices;save();render();toast('Ceny vlastnej práce sú uložené.');return}
 else if(id==='timing'){db.growth=+d.growth;db.dry=+d.dry;if(d.melonHours)db.melonHours=+d.melonHours;if(d.melonDryHours)db.melonDryHours=+d.melonDryHours;save();render();toast('Časy pestovania boli uložené.');return}else return;
 save();close();render();if(id==='workform'||id==='agreementform')detail(f);else if(id==='farmform'||id==='payform')detail(db.farms.find(x=>x.id===activeFarm));else if(id==='txform'&&(d.fromFarm||d.category==='rent')&&f)detail(f);toast('Záznam bol uložený.')});
document.addEventListener('change',async e=>{const cat=e.target.dataset?.pushcat;if(!cat)return;try{await togglePushCategory(cat)}catch(err){e.target.checked=!e.target.checked;toast(cloudError(err))}});
document.addEventListener('input',e=>{if(e.target.name==='who'&&e.target.form?.elements.workerPhone){const known=workerPhone(e.target.value);if(known)e.target.form.elements.workerPhone.value=known}if(e.target.hasAttribute('data-forint'))updateAmountInput(e.target,e.inputType==='insertFromPaste');if(e.target.id==='search'){query=e.target.value;$('#matches').innerHTML=farmsgrid();$('#matches').querySelectorAll('canvas').forEach(paint)}if(e.target.closest('#calcform'))calculate()});
let pendingRestore=null;
function isBackup(v){let finite=Number.isFinite,txt=x=>typeof x==='string',id=x=>txt(x)&&/^[a-z0-9-]{1,70}$/i.test(x),time=x=>x===null||(finite(x)&&x>0&&x<8640000000000000);if(!v||![v.growth,v.dry,v.melonHours??measuredMelonHours,v.melonDryHours??measuredMelonDryHours].every(x=>finite(x)&&x>=.01&&x<=8760)||![v.logs,v.tx,v.farms].every(Array.isArray))return false;
 const allowedTerms=['Zúčtovanie','Koniec nájmu',weeklyTerm];
 const linkedIds=new Set();
 function validPayment(x){
   if(x.rentStart!=null||x.rentEnd!=null){
     if(x.category!=='rent'||!x.farm||!x.rentStart||!x.rentEnd||!time(x.rentStart)||!time(x.rentEnd)||x.rentEnd<=x.rentStart)return false;
   }
   if(x.workId==null)return true;
   const log=v.logs.find(l=>l.id===x.workId);
   if(x.category!=='wage'||!log||log.farm!==x.farm||log.fee!==x.amount||linkedIds.has(x.workId))return false;
   linkedIds.add(x.workId);
   return true;
 }
 let valid=v.farms.every(f=>id(f.id)&&txt(f.name)&&(f.assignments===undefined||(Array.isArray(f.assignments)&&f.assignments.every(a=>a&&id(a.id)&&Object.hasOwn(jobs,a.job)&&txt(a.who)&&isAmount(a.fee)&&time(a.plannedAt))))&&Object.hasOwn(types,f.type)&&[40,80,120].includes(f.size)&&[0,1,2].includes(f.art)&&Number.isInteger(f.loc)&&f.loc>=1&&f.loc<=7&&Number.isInteger(f.floor)&&f.floor>=1&&f.floor<=15&&(f.door==null||Number.isInteger(f.door)&&f.door>=1&&f.door<=DOORS)&&[f.planted,f.due,f.watered].every(time)&&(f.createdAt===undefined||time(f.createdAt))&&(f.dueFromEntry===undefined||typeof f.dueFromEntry==='boolean')&&(f.rentBaseFromEntry===undefined||typeof f.rentBaseFromEntry==='boolean')&&allowedTerms.includes(f.term)&&(f.weeklyRent==null||isAmount(f.weeklyRent))&&(f.rentAmount==null||isAmount(f.rentAmount))&&(f.leaseDays===undefined||validLeaseDays(f.leaseDays))&&(f.ownerFirst===undefined||txt(f.ownerFirst))&&(f.ownerLast===undefined||txt(f.ownerLast))&&(f.access==null||['waiting','granted','unknown'].includes(f.access))&&(f.rentBaseDue===undefined||time(f.rentBaseDue))&&(f.rentBaseTerm==null||allowedTerms.includes(f.rentBaseTerm))&&[f.worker,f.owner,f.account,f.phone].every(txt));let ids=new Set(v.farms.map(f=>f.id));return valid&&ids.size===v.farms.length&&v.tx.every(x=>id(x.id)&&(!x.farm||ids.has(x.farm))&&Object.hasOwn(categories,x.category)&&finite(x.amount)&&x.amount>0&&time(x.at)&&x.at!==null&&txt(x.desc)&&validPayment(x))&&v.logs.every(x=>id(x.id)&&ids.has(x.farm)&&Object.hasOwn(paths,x.icon)&&txt(x.action)&&txt(x.who)&&(x.fee==null||isAmount(x.fee))&&(x.cycleAt===undefined||time(x.cycleAt))&&time(x.at)&&x.at!==null)}
document.addEventListener('change',async e=>{let el=e.target;if(el.name==='type'){
   const contacts=$('#contacts');contacts.hidden=contacts.disabled=el.value!=='player';
   if(el.form.elements.term)el.form.elements.term.value=el.value==='player'?weeklyTerm:'Koniec nájmu';
 }
 if(el.closest('#workform')){
   const fields=el.form.elements;
   if(el.name==='farm'){
     const farm=db.farms.find(x=>x.id===el.value);
     const pick=farm.planted?(progress(farm).g===100?'harvest':'water'):'dig';
     el.form.querySelectorAll('input[type="checkbox"][name="job"]').forEach(b=>b.checked=b.value===pick);
     fields.performer.value=farm.planted&&(farm.workerHired??(!!farm.worker&&farm.worker!=='Ja'&&!farm.crew))?'hired':'self';
     fields.who.value=fields.performer.value==='hired'?farm.worker:'';
     fields.workerPhone.value=workerPhone(fields.who.value);
     fields.fee.value='';fields.settlement.value='pending';
   }
   if(el.name==='alljobs'){const cycle=fullCycle(db.farms.find(x=>x.id===fields.farm.value));el.form.querySelectorAll('input[type="checkbox"][name="job"]').forEach(b=>b.checked=el.checked&&cycle.includes(b.value))}
   if(['farm','job','alljobs'].includes(el.name))syncJobPicker(el.form,db.farms.find(x=>x.id===fields.farm.value));
   if(el.name==='farm'||el.name==='performer'){
     const box=$('#hire-fields');box.hidden=box.disabled=fields.performer.value!=='hired';
     const crewBox=$('#crew-fields');if(crewBox)crewBox.hidden=crewBox.disabled=fields.performer.value==='hired';
   }
 }
 if(el.closest('#txform')&&(el.name==='farm'||el.name==='category')){
   const fields=el.form.elements, farm=db.farms.find(x=>x.id===fields.farm.value);
   const rent=fields.category.value==='rent'?rentFields(farm):'';
   $('#rent-fields').innerHTML=rent;
   if(fields.category.value==='rent')fields.amount.value=groupAmountEntry(agreedRent(farm));
 }
 if(el.name==='rentPeriod'){
   const fields=el.form.elements,farm=db.farms.find(x=>x.id===fields.farm.value);
   const start=el.value==='first'?farm.createdAt:farm.due;
   fields.rentStart.value=local(start);
   $('#next-rent').textContent=date(leaseEnd(start,farm));
 }
 if(el.name==='rentStart')el.dataset.edited='yes';
 if(el.closest('#txform')&&el.name==='at'){
   const fields=el.form.elements, farm=db.farms.find(x=>x.id===fields.farm.value);
   if(fields.rentStart&&!farm?.due&&!fields.rentStart.dataset.edited&&el.value){
     fields.rentStart.value=el.value;
     $('#next-rent').textContent=date(leaseEnd(new Date(el.value).getTime(),farm));
   }
 }
 if(el.name==='rentStart'&&$('#next-rent')){
   const farm=db.farms.find(x=>x.id===el.form.elements.farm.value);
   const start=new Date(el.value).getTime();$('#next-rent').textContent=Number.isFinite(start)?date(leaseEnd(start,farm)):'—';
 }
 if(el.id==='file'&&el.files.length){try{let v=readFarmData(await el.files[0].text());if(!isBackup(v))throw 0;pendingRestore={...v,sent:{},sound:false,notices:false};confirmBox('Obnoviť zálohu?',(CLOUD?'Spoločné údaje všetkých hráčov nahradí obsah súboru (':'Aktuálne údaje nahradí obsah súboru (')+v.farms.length+' fariem).','restoreok')}catch{toast('Súbor nie je platná záloha FarmDesk.')}el.value=''}});
document.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&e.target.matches('[role="button"]')){e.preventDefault();e.target.click()}});
function pointReadout(e){
 const point=e.target.closest?.('[data-point]');
 if(!point)return;
 const output=point.closest('.report-panel').querySelector('.chart-readout');
 output.textContent=point.dataset.readout;
}
document.addEventListener('pointerover',pointReadout);
document.addEventListener('focusin',pointReadout);
document.addEventListener('pointerdown',()=>{if(db.sound){try{audioCtx??=new AudioContext();audioCtx.resume().catch(()=>{})}catch{}}});
window.addEventListener('storage',e=>{if(!CLOUD&&e.key===key&&e.newValue){try{db=readFarmData(e.newValue);if(!$('#modal').open)render();else refreshDuePanel()}catch{}}});
// ---- Shared database mode (FarmDesk on GitHub Pages + Supabase) --------------------------------
// The whole app keeps working on the in-memory `db`; save() pushes only the records that changed.
// Every record carries its author, set by the server, so the team sees who bought, paid or sold what.
let cloudReady=false,me=null,members=[],syncChain=Promise.resolve(),syncState='ok',refreshTimer=null,stopLive=null,pendingPaint=false,cloudTimer=null;
const lastSynced=new Map(),meta=new Map(),dropLocal=new Set();let conflictNote=[];
const rkey=(kind,id)=>kind+'\u0001'+id;
function recordList(state=db){
  const out=[];
  for(const f of state.farms)out.push({kind:'farm',id:f.id,data:f});
  for(const x of state.tx)out.push({kind:'tx',id:x.id,data:x});
  for(const l of state.logs)out.push({kind:'log',id:l.id,data:l});
  for(const o of state.ongoing||[])out.push({kind:'ongoing',id:o.id,data:o});
  for(const [name,phone] of Object.entries(state.workers||{}))out.push({kind:'worker',id:name,data:{name,phone}});
  const st={growth:state.growth,dry:state.dry};
  if(state.workPrices)st.workPrices=state.workPrices;
  if(state.melonHours!=null)st.melonHours=state.melonHours;
  if(state.melonDryHours!=null)st.melonDryHours=state.melonDryHours;
  out.push({kind:'settings',id:'main',data:st});
  return out;
}
const recordMap=list=>new Map(list.map(r=>[rkey(r.kind,r.id),r]));
function applyRecords(list){
  const next=sharedEmpty();next.sound=db.sound;next.notices=db.notices;next.sent=db.sent;
  for(const r of list){
    const d=r.data;
    if(r.kind==='farm')next.farms.push(d);
    else if(r.kind==='tx')next.tx.push(d);
    else if(r.kind==='log')next.logs.push(d);
    else if(r.kind==='ongoing')next.ongoing.push(d);
    else if(r.kind==='worker'&&d.phone)next.workers[d.name||r.id]=d.phone;
    else if(r.kind==='settings'){
      if(+d.growth>0)next.growth=+d.growth;if(+d.dry>0)next.dry=+d.dry;
      if(+d.melonHours>0)next.melonHours=+d.melonHours;if(+d.melonDryHours>0)next.melonDryHours=+d.melonDryHours;
      if(d.workPrices&&typeof d.workPrices==='object')next.workPrices=d.workPrices;
    }
  }
  db=next;
}
const myName=()=>me?.name||'Hráč';
const isLeader=()=>me?.role==='leader'&&me?.status==='active';
const playerName=uid=>uid?(members.find(m=>m.user_id===uid)?.name||'Bývalý hráč'):'—';
const recordMeta=(kind,id)=>meta.get(rkey(kind,id));
function byLine(kind,id,verb='zapísal'){
  if(!CLOUD)return '';
  const m=recordMeta(kind,id);
  return ' · '+verb+' '+(m?playerName(m.created_by):myName());
}
function cloudError(e,fallback=''){
  const msg=String(e?.message||e||'');
  if(/Invalid login credentials/i.test(msg))return 'Nesprávne meno alebo heslo.';
  if(/already registered|already exists/i.test(msg))return 'Hráč s týmto menom už existuje. Prihlás sa.';
  if(msg==='CONFIRM_EMAIL_ON'||/confirmation email|Email not confirmed/i.test(msg))return 'Registrácia ešte nie je zapnutá: v Supabase treba vypnúť potvrdzovanie e-mailu.';
  if(msg==='INVALID_NAME'||/invalid name/i.test(msg))return 'Zadaj meno hráča (2 až 60 znakov).';
  if(msg==='SHORT'||/Password should be at least|password too short/i.test(msg))return 'Heslo musí mať aspoň 8 znakov.';
  if(msg==='MISMATCH')return 'Heslá sa nezhodujú.';
  if(/members_name_key|duplicate key/i.test(msg))return 'Toto meno už používa iný hráč.';
  if(/signups? (are )?(not allowed|disabled)/i.test(msg))return 'Registrácia je v Supabase vypnutá.';
  if(/rate limit|For security purposes/i.test(msg))return 'Priveľa pokusov. Skús to o chvíľu.';
  if(/Failed to fetch|NetworkError|network/i.test(msg))return 'Nepodarilo sa spojiť so serverom. Skontroluj internet.';
  if(/42501|row-level security|leader only|permission/i.test(msg))return 'Na túto akciu nemáš oprávnenie.';
  return fallback||('Niečo sa nepodarilo: '+msg);
}
const syncTitle=()=>({ok:'Uložené v spoločnej databáze',saving:'Ukladám…',error:'Poslednú zmenu sa nepodarilo uložiť'})[syncState];
function setSync(state){syncState=state;const el=$('#sync');if(el){el.className='sync-dot '+state;el.title=syncTitle()}}
async function pushDiff(){
  if(!cloudReady)return;
  const cur=recordMap(recordList()),up=[],del=[];
  for(const [k,r] of cur){if(dropLocal.has(k))continue;const j=JSON.stringify(r.data);if(lastSynced.get(k)!==j)up.push([k,r,j])}
  for(const k of lastSynced.keys())if(!cur.has(k)){const [kind,id]=k.split('\u0001');del.push({k,kind,id})}
  if(!up.length&&!del.length)return;
  setSync('saving');
  try{
    // Each row carries the version this browser last saw; the server refuses rows someone else changed since.
    const res=up.length?await FarmCloud.save(up.map(([k,r])=>({kind:r.kind,id:r.id,data:r.data,expected:lastSynced.has(k)?(meta.get(k)?.updated_at??null):null}))):{saved:[],conflicts:[]};
    const stamps=new Map(res.saved.map(x=>[rkey(x.kind,x.id),x.updated_at]));
    for(const [k,,j] of up){
      if(!stamps.has(k))continue;
      lastSynced.set(k,j);
      const m=meta.get(k)||{created_by:me?.user_id,created_at:new Date().toISOString()};
      meta.set(k,{...m,updated_by:me?.user_id,updated_at:stamps.get(k)});
    }
    if(del.length)await FarmCloud.remove(del);
    for(const d of del){lastSynced.delete(d.k);meta.delete(d.k)}
    if(res.conflicts.length){
      // Someone else saved these first: their version wins, this browser's change is dropped and reloaded.
      for(const c of res.conflicts){const k=rkey(c.kind,c.id);dropLocal.add(k);conflictNote.push({kind:c.kind,id:c.id,name:c.kind==='farm'?db.farms.find(f=>f.id===c.id)?.name:null})}
      setSync('ok');scheduleRefresh(50);return;
    }
    setSync('ok');
  }catch(e){setSync('error');toast(cloudError(e,'Zmenu sa nepodarilo uložiť do spoločnej databázy. Appka sa obnoví zo servera.'));scheduleRefresh(2500);throw e}
}
function queueSync(){if(!cloudReady)return;syncChain=syncChain.then(pushDiff).catch(()=>{})}
async function loadMembership(){
  const session=await FarmCloud.session();
  if(!session){cloudReady=false;authScreen('login','Prihlásenie vypršalo. Prihlás sa znova.');return null}
  members=await FarmCloud.members();
  me=members.find(m=>m.user_id===session.user.id)||null;
  if(!me||me.status!=='active'){cloudReady=false;authScreen(me?.status==='blocked'?'blocked':'pending');return null}
  return me;
}
async function refreshInner(){
  const first=!cloudReady;
  if(!await loadMembership())return;
  if(!first)await pushDiff().catch(()=>{});
  const rows=await FarmCloud.loadAll();
  // Changes typed while the download was running stay on top of the server copy and are sent next.
  const local=first?new Map():recordMap(recordList());
  const dirty=[...local].filter(([k,r])=>!dropLocal.has(k)&&lastSynced.get(k)!==JSON.stringify(r.data)).map(([,r])=>r);
  dropLocal.clear();
  const removed=first?[]:[...lastSynced.keys()].filter(k=>!local.has(k));
  lastSynced.clear();meta.clear();
  const merged=new Map();
  for(const r of rows){const k=rkey(r.kind,r.id);lastSynced.set(k,JSON.stringify(r.data));meta.set(k,{created_by:r.created_by,created_at:r.created_at,updated_by:r.updated_by,updated_at:r.updated_at});merged.set(k,r)}
  for(const r of dirty)merged.set(rkey(r.kind,r.id),r);
  for(const k of removed)merged.delete(k);
  applyRecords([...merged.values()]);
  if(conflictNote.length){
    const c=conflictNote[0],k=rkey(c.kind,c.id),by=meta.get(k)?.updated_by,what=c.kind==='farm'?'Farmu '+(db.farms.find(f=>f.id===c.id)?.name||c.name||''):'Tento záznam';
    toast(meta.has(k)?what+' medzitým zmenil '+playerName(by)+'. Tvoja zmena sa neuložila, načítal som jeho verziu. Skontroluj a zopakuj ju.':what+' medzitým niekto odstránil. Tvoja zmena sa neuložila.');
    conflictNote=[];
  }
  if(dirty.length||removed.length)queueSync();
  if(syncState!=='saving')setSync('ok');
  paintAfterRefresh();
}
function scheduleRefresh(ms=400){
  if(!CLOUD)return;
  clearTimeout(refreshTimer);
  refreshTimer=setTimeout(()=>{if(cloudReady)syncChain=syncChain.then(refreshInner).catch(()=>setSync('error'))},ms);
}
const typingInMain=()=>{const a=document.activeElement;return !!(a&&$('#main')?.contains(a)&&a.matches('input,select,textarea'))};
function paintAfterRefresh(){
  if(!cloudReady)return;
  if(typingInMain()){pendingPaint=true;return}
  render();refreshDuePanel();
}
document.addEventListener('focusout',()=>{if(pendingPaint)setTimeout(()=>{if(pendingPaint&&!typingInMain()){pendingPaint=false;render()}},60)});
function cloudTopbar(){
  const waiting=isLeader()?members.filter(m=>m.status==='pending').length:0;
  return (waiting?'<button class="demo pending-chip" data-a="settab:team">'+waiting+' čaká na schválenie</button>':'')+
    '<span id="sync" class="sync-dot '+syncState+'" title="'+syncTitle()+'"></span><button class="me-chip" data-a="go:settings" title="Prihlásený hráč">'+farmer(me?.user_id,22,myName())+'<span>'+E(myName())+'</span></button>';
}
function playerResults(){
  const rows=new Map(),add=uid=>{if(!rows.has(uid))rows.set(uid,{rev:0,cost:0,adj:0});return rows.get(uid)};
  for(const m of members)if(m.status==='active')add(m.user_id);
  for(const x of db.tx){const r=add(recordMeta('tx',x.id)?.created_by??me?.user_id);if(x.category==='sale')r.rev+=x.amount;else r.cost+=x.amount}
  // Money passed between players in closed settlements moves profit from the seller to the investors.
  for(const f of db.farms)for(const st of f.settlements||[])for(const t of st.transfers||[]){add(t.from).adj-=t.amount;add(t.to).adj+=t.amount}
  const list=[...rows].map(([uid,r])=>({uid,...r,profit:r.rev-r.cost+r.adj})).sort((a,b)=>b.profit-a.profit);
  const tot=list.reduce((t,r)=>({rev:t.rev+r.rev,cost:t.cost+r.cost}),{rev:0,cost:0}),tp=tot.rev-tot.cost;
  const signed=n=>n?(n>0?'+':'')+money(n):'—';
  const body=list.map(r=>`<tr><th scope="row"><span class="player-cell">${farmer(r.uid,24,playerName(r.uid))}${E(playerName(r.uid))}</span>${r.uid===me?.user_id?' <span class="sub">(ty)</span>':''}</th><td>${money(r.cost)}</td><td>${money(r.rev)}</td><td class="${r.adj<0?'loss':r.adj>0?'gain':''}">${signed(r.adj)}</td><td class="${r.profit<0?'loss':r.profit>0?'gain':''}">${money(r.profit)}</td></tr>`).join('');
  return `<section class="panel player-results">${section('Hráči')}<div class="tablewrap"><table><thead><tr><th>Hráč</th><th>Investoval</th><th>Prijal z predaja</th><th>Vyúčtovanie</th><th>Zisk</th></tr></thead><tbody>${body}<tr class="total-row"><th scope="row">Spolu</th><td>${money(tot.cost)}</td><td>${money(tot.rev)}</td><td>—</td><td class="${tp<0?'loss':tp>0?'gain':''}">${money(tp)}</td></tr></tbody></table></div><p class="hint">Platba sa ráta hráčovi, ktorý ju zapísal. Stĺpec Vyúčtovanie ukazuje peniaze, ktoré si hráči poslali pri uzavretých vyúčtovaniach fariem (delenie podľa vkladu).</p></section>`;
}
// ---- Settlement: the lease's sales are shared in proportion to what each player paid in ----
const cents=n=>Math.round(n*100)/100;
function leaseRows(f,period){
  return db.tx.filter(x=>x.farm===f.id).filter(x=>{const stamp=x.category==='rent'?(x.rentStart??x.at):x.at;return stamp>=period.start&&stamp<period.end});
}
// ---- Own work: a job the players did themselves counts as a stake, priced like a hired worker ----
const DEFAULT_WORK_PRICES={dig:100000,till:100000,plant:100000,water:100000,harvest:100000};
const workPrices=()=>({...DEFAULT_WORK_PRICES,...(db.workPrices||{})});
const jobKeyOf=action=>Object.keys(jobs).find(k=>jobs[k][0]===action);
// Prices are for a 40-field farm; bigger farms are more work.
const jobValue=(f,action)=>{const k=jobKeyOf(action);return k?cents((workPrices()[k]||0)*(f.size||40)/40):0};
function crewPicker(selected,hidden){
  const list=members.filter(m=>m.status==='active');
  return '<fieldset id="crew-fields" class="wide hire-fields crew-fields" '+(hidden?'hidden disabled':'')+'><legend>Kto z vás robil</legend><div class="jobchips">'+
    list.map(m=>'<label class="jobchip crew-chip"><input type="checkbox" name="players" value="'+E(m.user_id)+'" '+(selected.includes(m.user_id)?'checked':'')+'>'+farmer(m.user_id,20,m.name)+E(m.name)+'</label>').join('')+
    '</div><p class="hint">Hodnota práce sa rozdelí rovným dielom medzi vybraných hráčov a ráta sa im do vkladu vo vyúčtovaní.</p></fieldset>';
}
function workPricePanel(){
  const p=workPrices();
  return '<section class="panel">'+section('Cena vlastnej práce')+'<p>Keď prácu spravíte sami namiesto najatého pracovníka, ráta sa ako váš vklad do farmy, akoby ste za ňu zaplatili. Ceny sú za farmu so 40 políčkami; farma s 80 políčkami má prácu 2× drahšiu, so 120 políčkami 3×. Keď robia dvaja, každý dostane polovicu.</p><form id="workprices"><div class="formgrid">'+
    jobShown.map(k=>forintField(jobs[k][0],'price_'+k,p[k])).join('')+'</div><button class="btn primary">Uložiť ceny</button></form></section>';
}
function laborRows(f,period){
  return db.logs.filter(l=>l.farm===f.id&&l.at>=period.start&&l.at<period.end&&l.performer!=='hired'&&!(l.performer==null&&l.who&&l.who!=='Ja'&&!l.players));
}
function settlementFor(f){
  const rows=db.tx.filter(x=>x.farm===f.id),period=farmLeasePeriod(f,rows);
  if(!period)return null;
  const per=new Map(),add=uid=>{if(!per.has(uid))per.set(uid,{uid,invested:0,labor:0,jobs:0,received:0});return per.get(uid)};
  for(const x of leaseRows(f,period)){const p=add(recordMeta('tx',x.id)?.created_by??me?.user_id);if(x.category==='sale')p.received+=x.amount;else p.invested+=x.amount}
  for(const l of laborRows(f,period)){
    const value=jobValue(f,l.action),crew=l.players?.length?l.players:[recordMeta('log',l.id)?.created_by??me?.user_id];
    for(const uid of crew){const p=add(uid);p.labor=cents(p.labor+value/crew.length);p.jobs+=1/crew.length}
  }
  const people=[...per.values()].filter(p=>p.invested||p.received||p.labor);
  const invested=people.reduce((n,p)=>n+p.invested,0),labor=people.reduce((n,p)=>n+p.labor,0),revenue=people.reduce((n,p)=>n+p.received,0);
  const stakes=invested+labor;
  for(const p of people){p.stake=p.invested+p.labor;p.share=stakes?p.stake/stakes:0;p.due=Math.round(revenue*p.share)}
  if(people.length&&stakes){const top=people.reduce((a,b)=>b.share>a.share?b:a);top.due+=Math.round(revenue)-people.reduce((n,p)=>n+p.due,0)}
  for(const p of people){p.profit=cents(p.due-p.invested);p.balance=cents(p.due-p.received)}
  // Who sends money to whom: largest debts paid to largest claims first.
  const transfers=[];
  if(stakes>0){
    const owe=people.filter(p=>p.balance<0).map(p=>({uid:p.uid,left:-p.balance})).sort((a,b)=>b.left-a.left);
    const get=people.filter(p=>p.balance>0).map(p=>({uid:p.uid,left:p.balance})).sort((a,b)=>b.left-a.left);
    for(const o of owe)for(const g of get){
      const amount=cents(Math.min(o.left,g.left));
      if(amount>=1){transfers.push({from:o.uid,to:g.uid,amount});o.left=cents(o.left-amount);g.left=cents(g.left-amount)}
      if(o.left<0.01)break;
    }
  }
  const closed=(f.settlements||[]).find(st=>st.start===period.start&&st.end===period.end)||null;
  return {period,people,invested,labor,stakes,revenue,transfers,closed};
}
function settlementBox(f){
  const st=settlementFor(f);
  if(!st)return '';
  const {period,people,invested,labor,stakes,revenue,transfers,closed}=st;
  const head=`<section class="contract-box settle-box"><h3>Vyúčtovanie hráčov</h3><p class="account-dates">Nájom ${date(period.start)} – ${date(period.end)} · delí sa podľa peňazí a vlastnej práce</p>`;
  if(!people.length)return head+empty('V tomto nájme zatiaľ nikto nič nezaplatil, neodpracoval ani nepredal.')+'</section>';
  const signed=n=>n?money(n):'—';
  const table=`<div class="tablewrap"><table><thead><tr><th>Hráč</th><th>Peniaze</th><th>Práca</th><th>Podiel</th><th>Má dostať</th><th>Zisk</th></tr></thead><tbody>${people.sort((a,b)=>b.stake-a.stake).map(p=>`<tr><th scope="row"><span class="player-cell">${farmer(p.uid,22,playerName(p.uid))}${E(playerName(p.uid))}</span></th><td>${signed(p.invested)}</td><td title="${fmt(Math.round(p.jobs*10)/10)} prác">${signed(p.labor)}</td><td>${stakes?fmt(Math.round(p.share*1000)/10)+' %':'—'}</td><td>${money(p.due)}</td><td class="${p.profit<0?'loss':p.profit>0?'gain':''}">${money(p.profit)}</td></tr>`).join('')}<tr class="total-row"><th scope="row">Spolu</th><td>${money(invested)}</td><td>${money(labor)}</td><td>100 %</td><td>${money(revenue)}</td><td class="${revenue-invested<0?'loss':revenue-invested>0?'gain':''}">${money(cents(revenue-invested))}</td></tr></tbody></table></div>`;
  const note='<p class="hint">Práca = hodnota prác, ktoré ste spravili sami (ceny v Nastaveniach). Zisk = čo má hráč dostať mínus peniaze, ktoré vložil.</p>';
  if(!stakes)return head+table+'<p class="hint">Nikto zatiaľ nič nevložil ani neodpracoval, takže nie je podľa čoho deliť.</p></section>';
  if(!revenue)return head+table+note+'<p class="hint">Po predaji úrody tu uvidíš, kto komu koľko pošle. Kto predá, zapíše predaj na tejto farme.</p></section>';
  const transferRows=list=>list.length?list.map(t=>`<div class="transfer">${farmer(t.from,26,playerName(t.from))}<span><strong>${E(playerName(t.from))}</strong> pošle <strong>${E(playerName(t.to))}</strong></span>${farmer(t.to,26,playerName(t.to))}<b>${money(t.amount)}</b></div>`).join(''):'<p class="hint">Peniaze sú už rozdelené správne, nikto nikomu nič neposiela.</p>';
  if(closed){
    const changed=cents(closed.revenue)!==cents(revenue)||cents(closed.invested)!==cents(invested)||cents(closed.labor||0)!==cents(labor);
    return head+table+note+'<h4 class="settle-sub">Poslané pri uzavretí</h4>'+transferRows(closed.transfers||[])+
      `<p class="settle-done">${ic('check')}Uzavreté ${date(closed.closedAt)} · ${E(playerName(closed.closedBy))}</p>`+
      (changed?'<p class="auth-msg">Po uzavretí pribudli alebo sa zmenili platby či práce v tomto nájme. Otvor vyúčtovanie znova a uzavri ho s novými číslami.</p>':'')+
      '<div class="actiongrid">'+btn('Otvoriť znova','settlereopen:'+f.id,'history')+'</div></section>';
  }
  return head+table+note+'<h4 class="settle-sub">Kto komu pošle</h4>'+transferRows(transfers)+'<div class="actiongrid">'+btn('Uzavrieť vyúčtovanie','settle:'+f.id,'check','primary')+'</div></section>';
}
function settlementHistory(f){
  const list=[...(f.settlements||[])].sort((a,b)=>b.end-a.end);
  if(!list.length)return '';
  const one=st=>{
    const profit=cents((st.revenue||0)-(st.invested||0));
    const tr=(st.transfers||[]).length?(st.transfers||[]).map(t=>E(playerName(t.from))+' → '+E(playerName(t.to))+' <b>'+money(t.amount)+'</b>').join('<br>'):'Bez prevodov';
    return '<details class="settle-old"><summary><span><strong>'+date(st.start).split(' ')[0]+' – '+date(st.end).split(' ')[0]+'</strong><small>Tržba '+money(st.revenue||0)+' · vklad '+money((st.invested||0)+(st.labor||0))+'</small></span><em class="'+(profit<0?'loss':'gain')+'">'+money(profit)+'</em></summary>'+
      '<div class="tablewrap"><table><thead><tr><th>Hráč</th><th>Vložil</th><th>Práca</th><th>Dostal</th></tr></thead><tbody>'+(st.shares||[]).map(p=>'<tr><th scope="row">'+E(playerName(p.uid))+'</th><td>'+money(p.invested||0)+'</td><td>'+money(p.labor||0)+'</td><td>'+money(p.due||0)+'</td></tr>').join('')+'</tbody></table></div>'+
      '<p class="hint">'+tr+'<br>Uzavrel '+E(playerName(st.closedBy))+' · '+date(st.closedAt)+'</p></details>';
  };
  return '<section class="contract-box settle-history"><h3>Staršie vyúčtovania <span class="total">'+list.length+'</span></h3>'+list.map(one).join('')+'</section>';
}
function deleteFarm(f){
  const ids=new Set([f.id]);
  db.farms=db.farms.filter(x=>x.id!==f.id);
  db.tx=db.tx.filter(x=>!ids.has(x.farm));
  db.logs=db.logs.filter(x=>!ids.has(x.farm));
  db.ongoing=(db.ongoing||[]).filter(x=>!ids.has(x.farm));
}
function closeSettlement(f){
  const st=settlementFor(f);
  if(!st||!st.revenue||!st.stakes||st.closed)return;
  f.settlements=[...(f.settlements||[]),{start:st.period.start,end:st.period.end,closedAt:now(),closedBy:me?.user_id||null,invested:cents(st.invested),labor:cents(st.labor),revenue:cents(st.revenue),
    shares:st.people.map(p=>({uid:p.uid,invested:cents(p.invested),labor:cents(p.labor),received:cents(p.received),due:p.due})),transfers:st.transfers}];
}
// ---- Push notifications to this device (sent by the farmdesk-notify Edge Function) ----
const pushCategories=[
  ['water','Polievanie','Farma má pod 25 % vody alebo vyschla.'],
  ['harvest','Zber','Úroda je zrelá.'],
  ['rent','Nájmy','2 dni a deň pred termínom a keď termín uplynie.'],
  ['work','Práce','Niekto poslal ľudí na farmu alebo prácu dokončil.'],
  ['money','Predaje','Niekto predal úrodu.'],
  ['players','Noví hráči','Hráč čaká na schválenie (len leader).']
];
const defaultPushPrefs=()=>Object.fromEntries(pushCategories.map(([k])=>[k,true]));
let pushState={loaded:false,endpoint:null,prefs:defaultPushPrefs(),devices:0,busy:false};
const pushSupported=()=>'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
const b64url=s=>{const b=atob((s+'='.repeat((4-s.length%4)%4)).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(b,c=>c.charCodeAt(0))};
async function pushRegistration(){return (await navigator.serviceWorker.getRegistration())||navigator.serviceWorker.register('sw.js')}
async function loadPushState(){
  if(!CLOUD||!pushSupported())return;
  try{
    const reg=await navigator.serviceWorker.getRegistration(),sub=reg&&await reg.pushManager.getSubscription();
    const devices=await FarmCloud.pushDevices(),mine=sub&&devices.find(d=>d.endpoint===sub.endpoint);
    pushState={...pushState,loaded:true,endpoint:mine?sub.endpoint:null,prefs:{...defaultPushPrefs(),...(mine?.prefs||{})},devices:devices.length};
  }catch{pushState.loaded=true}
  if(page==='settings'&&settingsTab==='alerts'&&!$('#modal').open)render();
}
async function savePushPrefs(sub){
  const j=sub.toJSON();
  await FarmCloud.savePush(j.endpoint,j.keys.p256dh,j.keys.auth,pushState.prefs,navigator.userAgent);
  pushState.endpoint=j.endpoint;
}
async function enablePush(){
  if(!pushSupported())return toast('Tento prehliadač notifikácie nepodporuje.');
  if(isIOS()&&!isStandalone())return toast('Na iPhone najprv pridaj FarmDesk na plochu (Nastavenia → Appka) a notifikácie zapni v nej.');
  const permission=await Notification.requestPermission();
  if(permission!=='granted')return toast('Notifikácie sú zakázané. Povoľ ich pre túto stránku v nastaveniach prehliadača alebo telefónu.');
  const key=await FarmCloud.pushKey();
  if(!key)return toast('Server notifikácií sa ešte pripravuje. Skús to o minútu.');
  const reg=await pushRegistration();await navigator.serviceWorker.ready;
  let sub;
  // A device that cannot reach its push service would otherwise wait forever.
  const timeout=new Promise((_,no)=>setTimeout(()=>no(new Error('push timeout')),20000));
  try{sub=(await reg.pushManager.getSubscription())||await Promise.race([reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64url(key)}),timeout])}
  catch(err){console.warn('push subscribe',err);return toast('Prehliadač nedovolil zapnúť notifikácie na tomto zariadení. V anonymnom okne nefungujú; skús bežné okno alebo nainštalovanú appku.')}
  await savePushPrefs(sub);
  pushState.devices=(await FarmCloud.pushDevices()).length;
  toast('Notifikácie sú zapnuté na tomto zariadení.');
}
async function disablePush(){
  const reg=await navigator.serviceWorker.getRegistration(),sub=reg&&await reg.pushManager.getSubscription();
  if(sub){await FarmCloud.deletePush(sub.endpoint).catch(()=>{});await sub.unsubscribe().catch(()=>{})}
  pushState.endpoint=null;pushState.devices=Math.max(0,pushState.devices-1);
  toast('Notifikácie sú na tomto zariadení vypnuté.');
}
async function togglePushCategory(cat){
  const reg=await navigator.serviceWorker.getRegistration(),sub=reg&&await reg.pushManager.getSubscription();
  if(!sub)return;
  pushState.prefs={...pushState.prefs,[cat]:!pushState.prefs[cat]};
  await savePushPrefs(sub);
}
function pushPanel(){
  if(!pushState.loaded){loadPushState();return '<section class="panel">'+section('Notifikácie do telefónu')+'<p class="hint">Načítavam…</p></section>'}
  const on=!!pushState.endpoint;
  let intro;
  if(!pushSupported())intro='<p>Tento prehliadač notifikácie nepodporuje. Na Androide použi Chrome, na iPhone appku pridanú na plochu (iOS 16.4 a novší).</p>';
  else if(isIOS()&&!isStandalone())intro='<p>Na iPhone chodia notifikácie len do appky pridanej na plochu. Najprv ju nainštaluj v záložke <button class="btnlink" data-a="settab:app">Appka</button> a notifikácie zapni v nej.</p>';
  else if(Notification.permission==='denied')intro='<p class="auth-msg">Notifikácie sú pre FarmDesk zakázané. Povoľ ich v nastaveniach prehliadača alebo telefónu (Upozornenia → FarmDesk) a vráť sa sem.</p>';
  else intro='<p>Upozornenia ti prídu ako bežná notifikácia aj pri zavretej appke a zamknutom telefóne. Ťukni na tlačidlo nižšie: zariadenie sa prihlási na notifikácie a hneď ti príde skúšobná. Keď niečo spravíš ty sám, upozornenie o tom nedostaneš.</p>';
  const canAct=pushSupported()&&!(isIOS()&&!isStandalone())&&Notification.permission!=='denied';
  // One button: it turns notifications on for this device when needed and sends a test.
  const actions=canAct?'<div class="actiongrid">'+btn('Poslať skúšobnú notifikáciu','pushtest','bell','primary')+'</div>':'';
  const cats=on?'<div class="push-cats">'+pushCategories.filter(([k])=>k!=='players'||isLeader()).map(([k,label,hint])=>'<label class="switch-row"><span><strong>'+label+'</strong><small>'+hint+'</small></span><input type="checkbox" class="switch" role="switch" data-pushcat="'+k+'" '+(pushState.prefs[k]!==false?'checked':'')+'></label>').join('')+'</div>':'';
  const status=on?'<p class="settle-done">'+ic('check')+'Zapnuté na tomto zariadení'+(pushState.devices>1?' · spolu '+pushState.devices+' tvoje zariadenia':'')+'</p>':'';
  return '<section class="panel">'+section('Notifikácie do telefónu')+intro+status+cats+actions+'</section>';
}
// ---- Install as a phone/desktop app (PWA) ----
let installPrompt=null;
const isStandalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const isIOS=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
if(CLOUD&&'serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('sw.js').catch(()=>{});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;if(page==='settings'&&!$('#modal').open)render()});
window.addEventListener('appinstalled',()=>{installPrompt=null;toast('FarmDesk je nainštalovaný. Nájdeš ho medzi aplikáciami.');if(page==='settings')render()});
function installPanel(){
  if(isStandalone())return '<section class="panel">'+section('Appka v telefóne')+'<p>FarmDesk beží ako nainštalovaná aplikácia.</p></section>';
  const how=installPrompt?'<div class="actiongrid">'+btn('Nainštalovať FarmDesk','install','plus','primary')+'</div>'
    :isIOS()?'<ol class="install-steps"><li>Otvor túto stránku v <strong>Safari</strong>.</li><li>Ťukni na <strong>Zdieľať</strong> (štvorec so šípkou hore).</li><li>Vyber <strong>Pridať na plochu</strong> a potvrď <strong>Pridať</strong>.</li></ol>'
    :'<ol class="install-steps"><li>Otvor stránku v <strong>Chrome</strong> (Android) alebo Chrome / Edge na počítači.</li><li>V menu <strong>⋮</strong> vyber <strong>Inštalovať aplikáciu</strong> alebo <strong>Pridať na plochu</strong>.</li></ol>';
  return '<section class="panel">'+section('Appka v telefóne')+'<p>FarmDesk si môžeš dať na plochu ako aplikáciu: vlastná ikona, celá obrazovka, bez panela prehliadača. Prihlásenie a údaje ostávajú rovnaké.</p>'+how+'</section>';
}
function cloudPanels(){
  const lead=isLeader(),status={active:'Aktívny',pending:'Čaká na schválenie',blocked:'Zablokovaný'};
  const list=members.map(m=>{
    const self=m.user_id===me?.user_id;
    const actions=!lead||self?'':m.status==='pending'?btn('Schváliť','member:'+m.user_id+':active','check','primary')+btn('Zamietnuť','member:'+m.user_id+':blocked','x')
      :m.status==='active'?btn('Nastaviť heslo','memberpw:'+m.user_id,'key')+btn('Zablokovať','member:'+m.user_id+':blocked','x','danger'):btn('Odblokovať','member:'+m.user_id+':active','check');
    return `<div class="agreement-row player-row">${farmer(m.user_id,38,m.name)}<div><strong>${E(m.name)}${self?' (ty)':''}</strong><small>${m.role==='leader'?'Leader · ':''}${status[m.status]}</small></div><div class="actiongrid">${actions}</div></div>`;
  }).join('');
  return '<section class="panel">'+section('Hráči',btn('Odhlásiť sa','logout','x'))+'<p>'+(lead?'Nových hráčov schvaľuješ ty. Kým ich neschváliš, nevidia žiadne údaje. ':'Nových hráčov schvaľuje leader. ')+'Každý sa prihlasuje vlastným menom a heslom.</p>'+list+'</section>';
}
function sharedDataPanel(){
  const lead=isLeader();
  return '<section class="panel">'+section('Spoločné údaje')+'<p>Farmy, financie, denník a pracovníci sú v spoločnej databáze a vidia ich všetci schválení hráči. Zvuk a oznámenia sa nastavujú pre každý prehliadač zvlášť.</p><div class="actiongrid">'+btn('Export zálohy','backup','log')+(lead?btn('Obnoviť zálohu','restore','history'):'')+'</div></section>';
}
function authScreen(state,msg='',name=''){
  let el=$('#auth');
  if(!el){el=document.createElement('div');el.id='auth';document.body.appendChild(el)}
  document.body.classList.add('auth-open');
  const err=msg?'<p class="auth-msg" role="alert">'+E(msg)+'</p>':'';
  const forms={
    loading:'<div class="auth-form"><p class="auth-wait">Načítavam spoločnú evidenciu…</p></div>',
    login:'<form id="loginform" class="auth-form"><h1>Prihlásenie</h1>'+err+field('Meno hráča','name','text',name,'required maxlength="60" autocomplete="username"')+field('Heslo','password','password','','required autocomplete="current-password"')+'<button class="btn primary" type="submit">Prihlásiť sa</button><p class="auth-switch">Ešte nemáš účet? <button type="button" class="btnlink" data-auth="signup">Zaregistruj sa</button></p></form>',
    signup:'<form id="signupform" class="auth-form"><h1>Nový hráč</h1>'+err+field('Meno hráča','name','text',name,'required minlength="2" maxlength="60" autocomplete="username"')+field('Heslo (aspoň 8 znakov)','password','password','','required minlength="8" maxlength="72" autocomplete="new-password"')+field('Heslo znova','password2','password','','required minlength="8" maxlength="72" autocomplete="new-password"')+'<p class="hint">Prvý registrovaný hráč je leader. Ďalších musí leader schváliť, až potom uvidia farmy.</p><button class="btn primary" type="submit">Vytvoriť účet</button><p class="auth-switch">Už máš účet? <button type="button" class="btnlink" data-auth="login">Prihlás sa</button></p></form>',
    pending:'<div class="auth-form"><h1>Čakáš na schválenie</h1>'+err+'<p>Účet <strong>'+E(me?.name||'')+'</strong> je vytvorený. Leader ťa musí schváliť v Nastaveniach, potom uvidíš spoločné farmy.</p><div class="actiongrid"><button class="btn primary" type="button" data-auth="recheck">Skontrolovať znova</button><button class="btn" type="button" data-auth="logout">Odhlásiť sa</button></div></div>',
    offline:'<div class="auth-form"><h1>Bez pripojenia</h1><p>Si stále prihlásený, len sa teraz nedá spojiť so spoločnou databázou. Skontroluj internet, appka to skúsi znova sama, keď sa spojenie vráti.</p><div class="actiongrid"><button class="btn primary" type="button" data-auth="recheck">Skúsiť znova</button></div></div>',
    blocked:'<div class="auth-form"><h1>Prístup zablokovaný</h1><p>Leader ti zablokoval prístup k spoločnej evidencii.</p><div class="actiongrid"><button class="btn" type="button" data-auth="logout">Odhlásiť sa</button></div></div>'
  };
  el.innerHTML='<div class="auth-brand"><span class="rail-logo">'+ic('brand')+'</span><strong>FarmDesk</strong><span>SeeRPG · spoločná evidencia</span></div>'+forms[state];
  el.querySelector('input:not([value]),input[value=""]')?.focus();
}
function hideAuth(){$('#auth')?.remove();document.body.classList.remove('auth-open')}
async function enterWorkspace(session,name){
  authScreen('loading');
  me=await FarmCloud.join(name||session.user.user_metadata?.name||'Hráč');
  if(me.status!=='active')return authScreen(me.status==='blocked'?'blocked':'pending');
  await refreshInner();
  if(!me||me.status!=='active')return;
  cloudReady=true;hideAuth();render();check();openFromHash();
  pushState.loaded=false;
  stopLive??=FarmCloud.subscribe(()=>scheduleRefresh(400));
  cloudTimer??=setInterval(()=>scheduleRefresh(0),30000);
}
function leaveWorkspace(msg=''){
  stopLive?.();stopLive=null;clearInterval(cloudTimer);cloudTimer=null;
  cloudReady=false;me=null;members=[];lastSynced.clear();meta.clear();db=sharedEmpty();
  if($('#modal').open)$('#modal').close();
  authScreen('login',msg);
}
async function cloudStart(){
  authScreen('loading');
  FarmCloud.onAuth(event=>{if(event==='SIGNED_OUT'&&cloudReady)leaveWorkspace('Bol si odhlásený.')});
  try{
    const session=await FarmCloud.session();
    if(!session)return authScreen('login');
    await enterWorkspace(session);
  }catch(e){if(isOffline(e))authScreen('offline');else authScreen('login',cloudError(e))}
}
// A dropped connection must never look like being signed out: the saved session stays and is retried.
const isOffline=e=>navigator.onLine===false||/Failed to fetch|NetworkError|Load failed|network|timed? ?out|fetch/i.test(String(e?.message||e||''));
window.addEventListener('online',()=>{if(CLOUD&&$('#auth .auth-form h1')?.textContent==='Bez pripojenia')FarmCloud.session().then(s=>s?enterWorkspace(s):authScreen('login')).catch(()=>{});else if(CLOUD&&cloudReady)scheduleRefresh(0)});
document.addEventListener('click',async e=>{
  if(!CLOUD)return;
  const b=e.target.closest('[data-auth],[data-a]');if(!b)return;
  const [a,id,extra]=(b.dataset.auth||b.dataset.a).split(':');
  try{
    if(a==='logout'){await FarmCloud.signOut();leaveWorkspace()}
    else if(a==='signup'||a==='login')authScreen(a,'',$('#auth [name="name"]')?.value||'');
    else if(a==='recheck'){const s=await FarmCloud.session();if(s)await enterWorkspace(s);else authScreen('login')}
    else if(a==='member'&&isLeader()){await FarmCloud.setMember(id,extra);members=await FarmCloud.members();render();toast(extra==='active'?playerName(id)+' má prístup k spoločnej evidencii.':playerName(id)+' je zablokovaný.')}
    else if(a==='memberpw'&&isLeader())modal('Nové heslo pre hráča',form('pwform','<input type="hidden" name="user" value="'+E(id)+'"><p class="wide">'+E(playerName(id))+' sa po zmene odhlási na všetkých zariadeniach. Nové heslo mu povedz osobne.</p><div class="wide">'+field('Nové heslo (aspoň 8 znakov)','password','text','','required minlength="8" maxlength="72" autocomplete="new-password"')+'</div>','Nastaviť heslo'));
  }catch(err){if(b.dataset.auth)authScreen(isOffline(err)&&a==='recheck'?'offline':'login',isOffline(err)&&a==='recheck'?'':cloudError(err));else toast(cloudError(err))}
});
document.addEventListener('submit',async e=>{
  if(!CLOUD)return;
  const id=e.target.id;if(!['loginform','signupform','pwform'].includes(id))return;
  e.preventDefault();
  const d=Object.fromEntries(new FormData(e.target)),button=e.target.querySelector('button[type="submit"],button.primary');
  if(button)button.disabled=true;
  try{
    if(id==='pwform'){
      if(String(d.password||'').length<8)throw new Error('SHORT');
      await FarmCloud.setPassword(d.user,d.password);close();toast('Heslo pre '+playerName(d.user)+' je nastavené.');return;
    }
    if(id==='signupform'){
      if(String(d.password||'').length<8)throw new Error('SHORT');
      if(d.password!==d.password2)throw new Error('MISMATCH');
      await enterWorkspace(await FarmCloud.signUp(d.name,d.password),FarmCloud.cleanName(d.name));
    }else await enterWorkspace(await FarmCloud.signIn(d.name,d.password));
  }catch(err){
    if(id==='pwform'){toast(cloudError(err));if(button)button.disabled=false}
    else authScreen(id==='signupform'?'signup':'login',cloudError(err),d.name);
  }
});
document.body.insertAdjacentHTML('beforeend','<div class="mobileShade" data-a="menu"></div>');if(CLOUD)cloudStart();else{render();check();openFromHash()}
window.addEventListener('hashchange',()=>{if(!CLOUD||cloudReady)openFromHash()});document.addEventListener('visibilitychange',()=>{if(!document.hidden&&(!CLOUD||cloudReady)){check();refreshDuePanel();if(CLOUD)scheduleRefresh(100)}});setInterval(()=>{if(CLOUD&&!cloudReady)return;check();refreshDuePanel();if(!$('#modal').open&&!document.activeElement.matches('input,select,button')&&page!=='settings')render()},30000);
