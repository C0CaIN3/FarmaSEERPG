// Moderný prehľad (demo): hlavná karta farmy s listovaním, hospodárenie s pruhmi nákladov,
// farmy ako karty, graf tržieb a úlohy. Prepisuje iba home(); ostatné stránky ostávajú.
let heroIdx = 0;
paths.left = paths.left || 'M15 6l-6 6 6 6';
paths.people = paths.people || 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 10v-1a6 6 0 0 1 12 0v1M16 3.5a4 4 0 0 1 0 7.5M18 15a5 5 0 0 1 4 5v1';

function heroFarms(){
  return activeFarms().map((f,i)=>({f,i,u:urgency(f)})).sort((a,b)=>a.u-b.u||a.i-b.i).map(x=>x.f);
}
function farmArt(f,size){
  return CATALOG.some(c=>c.name===f.crop) ? cropPicture(cropInfo(f.crop),size) : capacityGraphic(f.size,true);
}
function stateBadge(f){
  const [state,tone]=stage(f);
  return `<span class="m-badge ${tone||'grow'}">${state}</span>`;
}
function heroCard(list){
  if(!list.length)return `<section class="m-hero m-empty"><div><h2>Zatiaľ žiadna farma</h2><p>Pridaj prvú farmu v kategórii Farmy.</p>${btn('Prejsť na Farmy','go:farms','arrow','primary')}</div></section>`;
  heroIdx=(heroIdx+list.length)%list.length;
  const f=list[heroIdx],t=now(),{g,w}=progress(f,t);
  const ripe=f.planted?growthStart(f)+growthHours(f)*H:null;
  const at=p=>f.watered+dryingHours(f)*H*(1-p/100);
  const big=!f.planted?'Nezasadená':g>=100?'Na zber':'o '+timeLeft(ripe,t);
  const dots=list.map((x,i)=>`<button type="button" class="m-dot ${i===heroIdx?'on':''}" data-a="hero:${i}" aria-label="Farma ${E(x.name)}"></button>`).join('');
  const notes=[f.planted&&f.watered?'Voda 10 % '+whenText(at(10),t):'Pôda: '+soil(f)[0], f.due?(f.term||'Termín')+' · '+countdown(f.due):'Bez termínu nájmu'];
  return `<section class="m-hero" aria-label="Farma ${E(f.name)}">
    <div class="m-arrows"><button type="button" class="m-arrow" data-a="hero:prev" aria-label="Predošlá farma">${ic('left')}</button><button type="button" class="m-arrow" data-a="hero:next" aria-label="Ďalšia farma">${ic('right')}</button></div>
    <div class="m-spec"><span>Voda</span><b>${f.planted?w+' %':'—'}</b><span>Rast</span><b>${f.planted?g+' %':'—'}</b><div class="m-dots">${dots}</div></div>
    <div class="m-art">${farmArt(f,170)}</div>
    <div class="m-info">${stateBadge(f)}<h2>${E(f.name)}</h2><p>${E(cropName(f.crop))}, ${f.size} polí. ${placeText(f)}</p>
      <div class="m-cta">${btn('Otvoriť farmu','farm:'+f.id,'arrow','primary')}<div class="m-price"><small>${f.planted?'Zber':'Stav'}</small><b>${big}</b></div></div></div>
    <div class="m-foot"><span>${E(notes[0])}</span><span>${E(notes[1])}</span></div>
  </section>`;
}
function moneyPanel(){
  const farmTx=db.tx.filter(x=>x.farm&&db.farms.some(f=>f.id===x.farm)),tot=totals(farmTx);
  const cats=Object.keys(categories).filter(k=>k!=='sale').map(k=>({k,sum:farmTx.filter(x=>x.category===k).reduce((n,x)=>n+x.amount,0)})).filter(c=>c.sum>0).sort((a,b)=>b.sum-a.sum);
  const bars=cats.length?cats.map(c=>{const p=Math.round(c.sum/Math.max(1,tot.cost)*100);return `<div class="m-barrow"><span>${categories[c.k]}</span><i><b style="width:${p}%"></b></i><em>${p} %</em></div>`}).join(''):'<p class="m-muted">Zatiaľ žiadne náklady.</p>';
  return `<section class="m-money"><div class="m-head"><h2>Kam idú peniaze</h2><span class="m-chip">Celé obdobie</span></div>
    <div class="m-score"><b class="cost">${money(tot.cost)}</b><span><small>Náklady spolu</small><em>${cats.length} ${cats.length===1?'položka':cats.length<5?'položky':'položiek'}</em></span></div>
    <div class="m-bars">${bars}</div>
    <div class="m-foot2"><span>Návratnosť <b>${tot.cost?Math.round(tot.profit/tot.cost*100)+' %':'—'}</b></span>${btn('Ekonomika','go:finance')}</div></section>`;
}
const ring=(v,k,l)=>`<span class="m-ring ${k} ${k==='w'&&v<=25?'low':''}" style="--v:${v}" role="img" aria-label="${l} ${v} %"><b>${v}</b></span>`;
function farmTile(f){
  const {g,w}=progress(f),{profit}=periodMoney(f);
  return `<article class="m-tile" data-a="farm:${f.id}" role="button" tabindex="0" aria-label="Otvoriť farmu ${E(f.name)}">
    <div class="m-tile-top">${stateBadge(f)}<button type="button" class="m-round" data-a="work:${f.id}" aria-label="Zapísať prácu na ${E(f.name)}">${ic('plus')}</button>${cropPhoto(f)?`<span class="m-tile-bg"><img src="${cropPhoto(f).replace('crops/','crops/sm/')}" alt="" decoding="sync"><i class="fx-sun"></i><i class="fx-grain"></i></span>`:`<div class="m-tile-art">${farmArt(f,96)}</div>`}</div>
    <div class="m-tile-body"><strong>${E(f.name)}</strong><span class="m-tile-row"><b class="${profit<0?'neg':profit>0?'pos':''}">${profit>0?'+':''}${money(profit)}</b>
      ${f.planted?`<span class="m-levels">${ring(w,'w','Voda')}${ring(g,'g','Rast')}</span>`:'<span class="m-muted">nezasadená</span>'}</span></div></article>`;
}
// ---- Prehľad z widgetov: každý hráč si poskladá vlastnú plochu (uložené v prehliadači) ----
const WIDGETS={
  money:{t:'Peniaze',d:'Zisk, investície a tržby · Celkovo / Moje konto.',size:8},
  plant:{t:'Stav fariem',d:'Vysadené a neopracované, najsuchšie farmy a najbližší zber.',size:4,tall:true},
  costs:{t:'Kam idú peniaze',d:'Rozpis nákladov podľa druhu a návratnosť.',size:8},
  farms:{t:'Farmy',d:'Farmy ako karty s vodou, rastom a ziskom.',size:12},
  chart:{t:'Finančný prehľad',d:'Graf tržieb a nákladov za 7, 14 alebo 30 dní.',size:8},
  tasks:{t:'Najbližšie úlohy',d:'Nájmy, zber a polievanie, ktoré sa blížia.',size:4},
  working:{t:'Práve sa pracuje',d:'Kto je práve na ktorej farme.',size:6},
  crops:{t:'Stav pestovania',d:'Farmy podľa stavu v kruhovom grafe.',size:6},
  hero:{t:'Karta farmy',d:'Veľká karta jednej farmy s listovaním medzi farmami.',size:8,off:true},
  log:{t:'Posledné práce',d:'Päť posledných záznamov z denníka prác.',size:4,off:true},
  table:{t:'Tabuľka fariem',d:'Všetky farmy v tabuľke so ziskom, stavom, rastom a vodou.',size:12,off:true}
};
const SIZES=[3,4,6,8,12],SIZE_NAME={3:'¼',4:'⅓',6:'½',8:'⅔',12:'Celá'},LAYOUT_KEY='farmdesk-home-layout-v2';
let homeEdit=false,dragW=null;
function defaultLayout(){const ids=Object.keys(WIDGETS);return {order:ids,hidden:ids.filter(id=>WIDGETS[id].off),size:{}}}
function homeLayout(){
  let l;try{l=JSON.parse(localStorage.getItem(LAYOUT_KEY))}catch{}
  if(!l||!Array.isArray(l.order))return defaultLayout();
  const ids=Object.keys(WIDGETS);
  for(const id of ids)if(!l.order.includes(id)){l.order.push(id);if(WIDGETS[id].off)(l.hidden=l.hidden||[]).push(id)}
  return {order:l.order.filter(id=>ids.includes(id)),hidden:(l.hidden||[]).filter(id=>ids.includes(id)),size:l.size||{}};
}
function saveLayout(l){try{localStorage.setItem(LAYOUT_KEY,JSON.stringify(l))}catch{toast('Prehliadač nedokázal uložiť rozloženie.')}render()}
function widgetHtml(id,fs,items){
  const tasks=items.slice(0,5).map(a=>row(a.icon,a.f.name,a.title,a.detail,a.kind,'farm:'+a.f.id)).join('');
  switch(id){
    case 'money':return moneyStrip();
    case 'plant':return plantCard();
    case 'costs':return moneyPanel();
    case 'farms':return `<section class="w-farms"><div class="m-section"><h2>Farmy</h2><button type="button" class="m-chip m-link" data-a="go:farms">Všetky farmy</button></div><div class="m-tiles">${fs.map(farmTile).join('')||empty('Zatiaľ nemáš žiadnu farmu.')}</div></section>`;
    case 'chart':return reportChart(chartDays);
    case 'tasks':return `<section class="task-pane m-tasks"><div class="work-head"><h2>Najbližšie úlohy <span class="total">${items.length}</span></h2><button class="minor-arrow" data-a="bell" aria-label="Upozornenia">${ic('arrow')}</button></div><div class="queue-body">${tasks||empty('Žiadna farma teraz nevyžaduje pozornosť.')}</div></section>`;
    case 'working':return workingPane();
    case 'crops':return fieldSummary(fs);
    case 'hero':return heroCard(heroFarms());
    case 'log':return `<section class="task-pane"><div class="work-head"><h2>Posledné práce</h2><button class="minor-arrow" data-a="go:history" aria-label="Denník prác">${ic('arrow')}</button></div><div class="queue-body">${logrows(5)}</div></section>`;
    case 'table':return `<section class="portfolio"><div class="work-head"><h2>Farmy <span class="total">${fs.length}</span></h2><button class="btnlink" data-a="map">${ic('pin')}Lokality</button></div>${tabs()}${propertyTable(fs)}</section>`;
  }
  return '';
}
home=function(){
  const fs=activeFarms(),items=alerts();
  const hour=new Date().getHours(),hello=hour<10?'Dobré ráno':hour<18?'Dobrý deň':'Dobrý večer';
  const lay=homeLayout(),shown=lay.order.filter(id=>!lay.hidden.includes(id));
  const hiddenN=Object.keys(WIDGETS).length-shown.length;
  const tiles=shown.map((id,k)=>{
    const w=WIDGETS[id],size=lay.size[id]||w.size;
    const tools=homeEdit?`<div class="wg-edit"><span class="wg-name">${ic('grid')}${w.t}</span><span class="wg-tools">
      <button type="button" data-a="wg:left:${id}" aria-label="Posunúť ${w.t} dopredu" ${k?'':'disabled'}>${ic('left')}</button>
      <button type="button" data-a="wg:right:${id}" aria-label="Posunúť ${w.t} dozadu" ${k<shown.length-1?'':'disabled'}>${ic('right')}</button>
      <button type="button" class="wg-size" data-a="wg:size:${id}" aria-label="Zmeniť šírku ${w.t}">${SIZE_NAME[size]}</button>
      <button type="button" class="wg-del" data-a="wg:hide:${id}" aria-label="Odstrániť ${w.t}">${ic('x')}</button></span></div>`:'';
    return `<div class="wg wg-${size} ${w.tall&&size<12?'wg-tall':''}" data-w="${id}" ${homeEdit?'draggable="true"':''}>${widgetHtml(id,fs,items)}${tools}</div>`;
  }).join('');
  const bar=homeEdit?`<div class="wg-bar"><span>${ic('grid')}<span><b>Upravuješ plochu.</b> Chyť widget a presuň ho, alebo použi šípky. Šírku meníš tlačidlom so zlomkom.</span></span><span class="wg-actions">${btn('Pridať widget'+(hiddenN?' ('+hiddenN+')':''),'wg:add','plus')}${btn('Pôvodné rozloženie','wg:reset','history')}${btn('Hotovo','wg:done','check','primary')}</span></div>`:'';
  const add=homeEdit&&hiddenN?`<button type="button" class="wg wg-4 wg-addtile" data-a="wg:add">${ic('plus')}<span>Pridať widget</span></button>`:'';
  return `<div class="m-title"><div><h1>Prehľad</h1><p>${(d=>d.charAt(0).toUpperCase()+d.slice(1))(new Date().toLocaleDateString('sk-SK',{weekday:'long',day:'numeric',month:'long'}))}. ${items.length?(items.length===1?'Jedna úloha čaká.':items.length+(items.length<5?' úlohy čakajú.':' úloh čaká.')):'Na farmách je všetko v poriadku.'}</p></div>${homeEdit?'':btn('Upraviť plochu','wg:edit','grid')}</div>
  ${bar}<div class="wgrid ${homeEdit?'editing':''}">${tiles||(homeEdit?'':'<div class="wg wg-12">'+empty('Plocha je prázdna. Klikni na „Upraviť plochu“ a pridaj si widgety.')+'</div>')}${add}</div>`;
};
function widgetAction(cmd,id){
  const l=homeLayout(),vis=l.order.filter(x=>!l.hidden.includes(x));
  if(cmd==='edit'){homeEdit=true;render();return}
  if(cmd==='done'){homeEdit=false;render();toast('Rozloženie prehľadu je uložené.');return}
  if(cmd==='reset'){try{localStorage.removeItem(LAYOUT_KEY)}catch{}render();toast('Prehľad má pôvodné rozloženie.');return}
  if(cmd==='add'){const off=Object.keys(WIDGETS).filter(x=>!vis.includes(x));
    modal('Pridať widget',off.length?'<div class="wg-pick">'+off.map(x=>`<button type="button" class="wg-option" data-a="wg:show:${x}">${ic('plus')}<span><strong>${WIDGETS[x].t}</strong><small>${WIDGETS[x].d}</small></span></button>`).join('')+'</div>':empty('Na ploche už máš všetky widgety.'));return}
  if(!WIDGETS[id])return;
  if(cmd==='show'){l.hidden=l.hidden.filter(x=>x!==id);l.order=l.order.filter(x=>x!==id).concat(id);close();saveLayout(l);toast(WIDGETS[id].t+' je na ploche.');return}
  if(cmd==='hide'){l.hidden.push(id);saveLayout(l);toast(WIDGETS[id].t+' je odstránený. Vrátiš ho cez „Pridať widget“.');return}
  if(cmd==='size'){const cur=l.size[id]||WIDGETS[id].size;l.size[id]=SIZES[(SIZES.indexOf(cur)+1)%SIZES.length];saveLayout(l);document.querySelector('[data-a="wg:size:'+id+'"]')?.focus();return}
  if(cmd==='left'||cmd==='right'){const k=vis.indexOf(id),to=vis[k+(cmd==='left'?-1:1)];if(!to)return;
    const a=l.order.indexOf(id),b=l.order.indexOf(to);[l.order[a],l.order[b]]=[l.order[b],l.order[a]];saveLayout(l);document.querySelector('[data-a="wg:'+cmd+':'+id+'"]')?.focus();}
}
function moveWidget(id,before){const l=homeLayout();if(id===before)return;l.order=l.order.filter(x=>x!==id);const k=l.order.indexOf(before);k<0?l.order.push(id):l.order.splice(k,0,id);saveLayout(l)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a^="wg:"]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();const [,cmd,id]=b.dataset.a.split(':');widgetAction(cmd,id)},true);
// v režime úprav nič vnútri widgetu neotvára stránky
document.addEventListener('click',e=>{if(homeEdit&&e.target.closest('.wgrid.editing .wg')&&!e.target.closest('.wg-edit')){e.stopImmediatePropagation();e.preventDefault()}},true);
document.addEventListener('dragstart',e=>{const w=e.target.closest?.('.wgrid.editing .wg[data-w]');if(!w)return;dragW=w.dataset.w;w.classList.add('dragging');e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain',dragW)}catch{}});
document.addEventListener('dragover',e=>{if(!dragW)return;const w=e.target.closest?.('.wgrid.editing .wg[data-w]');if(!w)return;e.preventDefault();document.querySelectorAll('.wg.drop').forEach(x=>x!==w&&x.classList.remove('drop'));w.classList.add('drop')});
document.addEventListener('drop',e=>{if(!dragW)return;e.preventDefault();const w=e.target.closest?.('.wgrid.editing .wg[data-w]'),id=dragW;dragW=null;if(w)moveWidget(id,w.dataset.w)});
document.addEventListener('dragend',()=>{dragW=null;document.querySelectorAll('.wg.dragging,.wg.drop').forEach(x=>x.classList.remove('dragging','drop'))});
document.addEventListener('click',e=>{
  const k=e.target.closest('[data-a^="kview:"]');if(!k)return;
  e.stopImmediatePropagation();
  moneyView=k.dataset.a.slice(6)==='me'?'me':'all';try{localStorage.setItem('farmdesk-money-view',moneyView)}catch{}
  const card=document.querySelector('.k-money');if(!card)return render();
  const me=moneyView==='me';card.classList.toggle('is-me',me);
  card.querySelectorAll('.k-seg button').forEach(b=>{const on=(b.dataset.a==='kview:me')===me;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
  card.querySelectorAll('.k-face').forEach(f=>f.toggleAttribute('aria-hidden',f.classList.contains('k-me')!==me));
},true);
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-a^="hero:"]');if(!b)return;
  e.stopImmediatePropagation();
  const v=b.dataset.a.slice(5);
  heroIdx=v==='prev'?heroIdx-1:v==='next'?heroIdx+1:+v;
  render();
  document.querySelector('[data-a="'+b.dataset.a+'"]')?.focus({preventScroll:true});
},true);


// ---- Stav rastliny: nový vzhľad líšt Voda / Rast / Stav (plnenie ostáva presne podľa hry) ----
gameBars=function(f,t=now()){
  const clamp=x=>Math.max(0,Math.min(1,x));
  const grow=f.planted?clamp((t-growthStart(f))/(growthHours(f)*H)):0,water=f.watered?clamp(1-(t-f.watered)/(dryingHours(f)*H)):0;
  const {g,w}=progress(f,t);
  const dry=f.watered?f.watered+dryingHours(f)*H:null,ripe=f.planted?growthStart(f)+growthHours(f)*H:null;
  const at=p=>f.watered+dryingHours(f)*H*(1-p/100);
  if(!f.planted)return `<div class="pb pb-empty"><span class="pb-ico">${ic('sprout')}</span><div><strong>Nič nie je zasadené</strong><small>Pôda: ${E(soil(f)[0])}</small></div></div>`;
  const tone=w<=10?'crit':w<=25?'low':'';
  const chip=(label,stamp,cls,past=false)=>`<span class="pb-chip ${cls}"><b>${label}</b>${!past&&stamp<=t?'už prešlo':whenText(stamp,t)}</span>`;
  const waterChips=!f.watered?'<span class="pb-chip crit"><b>Bez vody</b>nezapísané poliatie</span>':dry<=t?chip('Bez vody od',dry,'crit',true):[[25,'low'],[10,'warn'],[0,'crit']].filter(([p])=>at(p)>t).map(([p,c])=>chip(p+' %',at(p),c)).join('');
  const growChips=ripe<=t?chip('Zrelé od',ripe,'ready',true):chip('Zber',ripe,'ready')+(dry&&dry<ripe?'<span class="pb-chip crit"><b>Pozor</b>voda dôjde pred zberom</span>':'');
  const pct=v=>(Math.round(v*246)/246*100).toFixed(2);
  const c=CATALOG.find(x=>x.name===f.crop);
  return `<div class="pb">
    <div class="pb-head">${c?`<span class="pb-art">${cropPicture(cropInfo(f.crop),34)}</span>`:`<span class="pb-ico">${ic('sprout')}</span>`}<div><strong>${E(cropName(f.crop))}</strong><small>${huCrop[f.crop]||'Stav rastliny'}</small></div><span class="pb-state">${E(stage(f)[0])}</span></div>
    <div class="pb-row water ${tone}"><div class="pb-label"><span>${ic('water')}Voda <small>Nedvesség</small></span><b>${w}<i>%</i></b></div>
      <div class="pb-track" role="img" aria-label="Voda ${w} %"><i style="width:${pct(water)}%"></i><em style="left:25%"></em><em style="left:10%"></em></div><div class="pb-chips">${waterChips}</div></div>
    <div class="pb-row growth"><div class="pb-label"><span>${ic('sprout')}Rast <small>Növekedés</small></span><b>${g}<i>%</i></b></div>
      <div class="pb-track" role="img" aria-label="Rast ${g} %"><i style="width:${pct(grow)}%"></i></div><div class="pb-chips">${growChips}</div></div>
  </div>`;
};


// ---- Peniaze hore na Prehľade: Investície, Tržby, Zisk · Všetci / Ja ----
function myRows(){
  if(CLOUD)return null;
  const ids=new Set(db.farms.filter(f=>!f.owner||f.owner==='Ja').map(f=>f.id));
  return db.tx.filter(x=>ids.has(x.farm));
}
function spark(vals,cls){
  const max=Math.max(1,...vals.map(Math.abs)),n=vals.length;
  const pts=vals.map((v,i)=>[i*100/(n-1),30-(v/max)*26]);
  const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join('');
  return `<svg class="k-spark ${cls}" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true"><path class="area" d="${d}L100 32L0 32Z"/><path class="line" d="${d}"/></svg>`;
}
function moneyStrip(){
  const farmTx=db.tx.filter(x=>x.farm&&db.farms.some(f=>f.id===x.farm));
  const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-6+i);return d.getTime()});
  const daily=rows=>days.map(s=>totals(rows.filter(x=>x.at>=s&&x.at<s+D)).profit);
  const team=totals(farmTx),mineRows=myRows()||[];
  let mine;if(CLOUD){const m=myMoney();mine={cost:m.cost,rev:m.rev,profit:m.profit,adj:m.adj}}else mine={...totals(mineRows),adj:0};
  const share=team.profit>0&&mine.profit>0&&mine.profit<=team.profit?Math.round(mine.profit/team.profit*100):null;
  const who=CLOUD?myName():'Farmár',isMe=moneyView==='me';
  const face=(k,sub,t,vals,extra)=>`<div class="k-face k-${k}" ${(k==='me')===isMe?'':'aria-hidden="true"'}>
    <span class="k-sub">${sub}</span>
    <span class="k-main"><span><small>Zisk</small><b class="k-val ${t.profit<0?'neg':''}">${money(t.profit)}</b></span>${spark(vals,k)}</span>
    <span class="k-split"><span><small>Investície</small><b>${money(t.cost)}</b></span><span><small>Tržby</small><b>${money(t.rev)}</b></span>${extra}</span></div>`;
  const seg=`<div class="k-seg" role="group" aria-label="Zobraziť">${[['all','Celkovo','people'],['me','Moje konto','user']].map(([k,l,i])=>`<button type="button" class="${(k==='me')===isMe?'on':''}" aria-pressed="${(k==='me')===isMe}" data-a="kview:${k}">${ic(i)}<span>${l}</span></button>`).join('')}<i class="k-thumb"></i></div>`;
  const moneyCard=`<section class="k-card k-money ${isMe?'is-me':''}"><div class="k-top"><div><h2>Peniaze</h2></div>${seg}</div>
    <div class="k-faces">${face('team','Celý tím, všetky farmy',team,daily(farmTx),`<span><small>Farmy</small><b>${activeFarms().length}</b></span>`)}
    ${face('me',E(who)+(CLOUD?', iba moje platby a príjmy':', ukážka bez účtu'),mine,daily(mineRows),mine.adj?`<span><small>Vyúčtovania</small><b>${(mine.adj>0?'+':'')+money(mine.adj)}</b></span>`:`<span><small>Podiel na zisku</small><b>${share!==null?share+' %':'—'}</b></span>`)}</div>
    <button type="button" class="k-more" data-a="go:finance">Ekonomika</button></section>`;
  return moneyCard;
}
// Stav fariem: rýchly náhľad – vysadené / neopracované, najsuchšie farmy a najbližší zber
function plantCard(){
  const fs=activeFarms(),st=fs.map(f=>({f,s:farmStatus(f)}));
  const act=st.filter(x=>x.s==='active').length,off=st.filter(x=>x.s!=='active'),lapsed=off.filter(x=>x.s==='lapsed').length;
  const t=now();
  const water=waterList(fs).slice(0,3).map(({f,w})=>{const at=f.watered?f.watered+dryingHours(f)*H*.75:0;const k=w<=10?'crit':w<=25?'low':'';
    return `<button type="button" class="q-row ${k}" data-a="farm:${f.id}"><span class="q-name">${E(f.name)}</span><span class="q-bar w"><i style="width:${w}%"></i></span><b>${w} %</b><em>${w<=25?'poliať teraz':'25 % '+whenText(at,t)}</em></button>`}).join('');
  const harvest=harvestList(fs).slice(0,3).map(x=>{const k=x.g>=100?'ripe':x.g>=75?'near':'';
    return `<button type="button" class="q-row ${k}" data-a="farm:${x.f.id}"><span class="q-name">${E(x.f.name)}</span><span class="q-bar g"><i style="width:${x.g}%"></i></span><b>${x.g} %</b><em>${x.g>=100?'zrelé':whenText(x.at,t)}</em></button>`}).join('');
  const offList=off.slice(0,2).map(x=>`<button type="button" class="q-chip ${x.s}" data-a="farm:${x.f.id}">${E(x.f.name)}<em>${x.s==='lapsed'?'po nájme':E(soil(x.f)[0])}</em></button>`).join('');
  const dry=waterList(fs).filter(x=>x.w<=25).length,ripe=harvestList(fs).filter(x=>x.g>=100).length;
  return `<section class="k-card k-plant"><div class="k-top"><div><h2>Stav fariem</h2></div><button type="button" class="k-link" data-a="go:farms" aria-label="Všetky farmy">${ic('arrow')}</button></div>
    <div class="k-counts"><div class="on"><b>${act}</b><span><i></i>Vysadené</span></div><div class="off ${off.length?'':'zero'}"><b>${off.length}</b><span><i></i>Neopracované</span></div></div>
    ${off.length?`<div class="q-chips">${offList}${off.length>2?'<span class="q-more">+'+(off.length-2)+'</span>':''}</div>`:''}${lapsed?`<p class="k-warn">${lapsed===1?'1 farma je':lapsed+' farmy sú'} po skončení alebo nezaplatení nájmu</p>`:''}
    <div class="q-sec"><div class="q-head"><span>${ic('water')}Polievanie</span>${dry?`<em class="q-badge crit">${dry} treba poliať</em>`:'<em class="q-badge">v poriadku</em>'}<button type="button" data-a="go:water">Rozpis</button></div>${water||'<p class="m-muted">Nič nie je zasadené.</p>'}</div>
    <div class="q-sec"><div class="q-head"><span>${ic('basket')}Zber</span>${ripe?`<em class="q-badge ripe">${ripe} na zber</em>`:''}<button type="button" data-a="harvestview">Všetko</button></div>${harvest||'<p class="m-muted">Nič nie je zasadené.</p>'}</div>
  </section>`;
}




// ---- Ikony plodín (priehľadné obrázky z hry) namiesto kreslených emoji ----
const CROP_ICON={'Tekvica':'tekvica','Uhorka':'uhorka','TV paprika':'tv-paprika','Žltý melón':'zlty-melon','Vodný melón':'vodny-melon','Čili paprika':'cili-paprika','Jablková paprika':'jablkova-paprika','Jahoda':'jahoda','Malina':'malina','Paradajka':'paradajka'};
cropPicture=function(c,size){
  const src=c.image||(CROP_ICON[c.name]?'crops/icons/'+CROP_ICON[c.name]+'.png':null);
  return src?`<img class="crop-art crop-icon" src="${E(src)}" alt="" width="${size}" height="${size}" style="width:${size}px;height:${size}px">`:cropArt(c.art,size);
};

// ---- Fotky plodín z hry namiesto grafiky veľkosti farmy ----
const CROP_PHOTO={'Paradajka':'paradajka','Jablková paprika':'jablkova-paprika','Žltý melón':'sietovany-melon','TV paprika':'tv-paprika','Tekvica':'tekvica','Malina':'malina','Vodný melón':'vodny-melon','Uhorka':'uhorka','Jahoda':'jahoda','Čili paprika':'cili-paprika'};
const cropPhoto=f=>!f.planted?'crops/nezasadene.jpg':CROP_PHOTO[f.crop]?'crops/'+CROP_PHOTO[f.crop]+'.jpg':null;
const SIZE_LABEL={40:'Malá farma',80:'Stredná farma',120:'Veľká farma'};
function farmBanner(f,cls='farm-photo'){
  const src=cropPhoto(f),sz=`<span class="fp-size s${f.size}">${ic('barn')}<b>${f.size}</b> polí<em>${SIZE_LABEL[f.size]||''}</em></span>`;
  if(!src)return `<div class="farm-size-banner size-${f.size}">${capacityGraphic(f.size)}</div>`;
  return `<div class="${cls}"><img src="${src}" srcset="${src.replace('crops/','crops/sm/')} 1024w, ${src} 2048w" sizes="(max-width: 640px) 100vw, 480px" alt="${E(cropName(f.crop))} na farme ${E(f.name)}" decoding="sync"><i class="fx-sun" aria-hidden="true"></i><i class="fx-grain" aria-hidden="true"></i>${sz}<span class="fp-crop">${f.planted?E(cropName(f.crop)):'Nezasadené'}</span></div>`;
}
// v ukážke dostanú farmy plodiny, aby bolo vidno fotky
if(db.demo)['Tekvica','Malina','Vodný melón'].forEach((c,i)=>{const f=db.farms.find(x=>x.id==='ex'+i);if(f&&(!f.crop||f.crop==='Úroda'))f.crop=c});

// ---- Karta farmy vo Farmách: stav, pôda a nájom ako výrazné dlaždice ----
function shortLeft(ms){const m=Math.ceil(ms/60000),d=Math.floor(m/1440),h=Math.floor(m%1440/60);return d?d+' d'+(h?' '+h+' h':''):h?h+' h'+(m%60?' '+m%60+' min':''):m%60+' min'}
function farmFacts(f){
  const t=now(),[state,tone]=stage(f),[soilL,soilK]=soil(f);
  const due=f.due,late=due&&due<=t,soon=due&&!late&&t>=shiftDays(due,-2);
  const term=f.term===weeklyTerm?'Nájom':f.term==='Koniec nájmu'?'Koniec nájmu':(f.term||'Termín');
  const stIcon={ready:'basket',warn:'water',idle:'sprout'}[tone]||'sprout';
  const fact=(cls,icon,label,value,sub)=>`<div class="ff ${cls}"><span class="ff-ico">${ic(icon)}</span><span class="ff-txt"><small>${label}</small><b>${value}</b>${sub?'<em>'+sub+'</em>':''}</span></div>`;
  return `<div class="farm-facts">
    ${fact('st-'+(tone||'grow'),stIcon,'Stav',E(state),'')}
    ${fact('soil-'+soilK,'barn','Pôda',E(soilL),'')}
    ${fact(late?'due-late':soon?'due-soon':'due-ok','calendar',E(term),!due?'Bez termínu':late?'Po termíne':'o '+shortLeft(due-t),due?(late?'od ':'')+whenText(due,t):'')}
  </div>${ongoingOn(f).length?'<div class="ff-working">'+ic('work')+'Práve sa tu pracuje</div>':''}`;
}
card=function(f){
  return `<article class="farmcard" role="button" tabindex="0" data-a="farm:${f.id}" aria-label="Otvoriť farmu ${E(f.name)}, ${f.size} polí">
    ${farmBanner(f)}
    <div class="cardbody"><div class="cardheading"><h3>${E(f.name)}</h3>${ic('arrow')}</div>
    <div class="cardmeta">${ic('pin')}${(placeText(f)+', '+types[f.type]).replace(/ · /g,', ')}</div>
    <div class="cardmeters">${gameBars(f)}</div>
    ${farmFacts(f)}</div></article>`;
};

// ---- Shell: menu v kategóriách, horná lišta, spodná lišta na mobile ----
const GROUPS=[['Hospodárstvo',[['overview','grid'],['farms','barn'],['crops','sprout']]],['Práca',[['water','water'],['history','log']]],['Peniaze',[['finance','chart']]],['Systém',[['settings','settings']]]];
const groupOf=p=>(GROUPS.find(([,items])=>items.some(([k])=>k===p))||GROUPS[0])[0];
function shell(){
  const cur=page==='farm'?'farms':page,count=alerts().length,fresh=unseenCount(),who=CLOUD?myName():'Farmár';
  document.body.dataset.page=page;
  const link=([p,i])=>`<button class="s-link ${cur===p?'on':''}" data-a="go:${p}" aria-current="${cur===p?'page':'false'}">${ic(i)}<span>${names[p]}</span>${p==='alerts'&&count?'<em>'+count+'</em>':''}</button>`;
  $('#sidebar').innerHTML=`<button class="s-brand" data-a="go:overview" aria-label="FarmDesk"><img src="assets/mark-96.png" alt=""><span><strong>FarmDesk</strong><small>SeeRPG</small></span></button>
    <nav>${GROUPS.map(([g,items])=>`<div class="s-group"><p>${g}</p>${items.map(link).join('')}</div>`).join('')}</nav>
    <button class="s-user" data-a="go:settings">${farmer(CLOUD?me?.user_id:'farmdesk',36,who)}<span><strong>${E(who)}</strong><small>${CLOUD?(isLeader()?'Leader':'Hráč'):'Ukážka na tomto zariadení'}</small></span></button>`;
  $('#top').innerHTML=`<div class="t-left"><button class="iconbtn menu" data-a="menu" aria-label="Menu">${ic('menu')}</button><div class="t-crumb"><small>${groupOf(cur)}</small><strong>${page==='farm'?'Detail farmy':names[cur]}</strong></div></div>
    <div class="t-right"><button class="t-search" data-a="searchfarm">${ic('search')}<span>Vyhľadať farmu</span></button>${db.demo?'<button class="demo" data-a="go:settings">Ukážkové údaje</button>':''}${CLOUD?cloudTopbar():''}<button class="iconbtn bell ${count?'has':''}" aria-label="Upozornenia${fresh?', '+fresh+' nových':''}" aria-haspopup="dialog" aria-expanded="false" data-a="bell">${ic('bell')}${fresh?'<i class="bell-n">'+fresh+'</i>':count?'<i class="bell-dot"></i>':''}</button><button class="btn primary t-add" data-a="work">${ic('plus')}<span>Zapísať prácu</span></button></div>`;
  let bar=$('#tabbar');if(!bar){bar=document.createElement('nav');guardHtml(bar);bar.id='tabbar';bar.setAttribute('aria-label','Rýchla navigácia');document.body.appendChild(bar)}
  const tab=(p,i,l)=>`<button class="${cur===p?'on':''}" data-a="go:${p}">${ic(i)}<span>${l}</span></button>`;
  bar.innerHTML=tab('overview','grid','Prehľad')+tab('farms','barn','Farmy')+`<button class="tab-add" data-a="work" aria-label="Zapísať prácu">${ic('plus')}</button>`+tab('water','water','Voda')+`<button data-a="menu">${ic('menu')}<span>Viac</span></button>`;
}
// ---- Upozornenia iba v zvončeku ----
// Každé upozornenie má typ (nájom po termíne, voda, zber, blížiaci sa termín), poradie podľa naliehavosti a rýchlu akciu.
const SEEN_KEY='farmdesk-bell-seen';
function bellItems(){
  const t=now();
  return alerts().map(a=>{
    const f=a.f,{w}=progress(f,t);
    const type=a.kind==='overdue'?'late':a.icon==='water'?'water':a.icon==='basket'?'harvest':'due';
    const urgent=type==='late'||type==='harvest'||(type==='water'&&w<=10);
    const rank={late:0,water:w<=10?1:3,harvest:2,due:4}[type];
    const action=type==='water'?['Zapísať poliatie','work:'+f.id]:type==='harvest'?['Zapísať zber','work:'+f.id]:['Otvoriť farmu','farm:'+f.id];
    const title=type==='late'?(a.title||'Nájom')+' je po termíne':type==='due'?(a.title||'Nájom')+' sa blíži':type==='water'?(w<=10?'Pole takmer bez vody':'Farma potrebuje vodu'):'Úroda je pripravená na zber';
    const detail=type==='water'?'Voda '+w+' %':type==='harvest'?'Rast 100 %':String(a.detail).replace(/^O /,'o ');
    return {key:f.id+':'+type,f,type,urgent,rank,action,title,detail};
  }).sort((a,b)=>a.rank-b.rank);
}
const seenKeys=()=>{try{return new Set(JSON.parse(localStorage.getItem(SEEN_KEY)||'[]'))}catch{return new Set()}};
function markSeen(items){try{localStorage.setItem(SEEN_KEY,JSON.stringify(items.map(x=>x.key)))}catch{}}
const unseenCount=()=>{const s=seenKeys();return bellItems().filter(x=>!s.has(x.key)).length};
function bellPanel(){
  const items=bellItems(),seen=seenKeys();
  const ico={late:'calendar',water:'water',harvest:'basket',due:'calendar'};
  const row=x=>{const c=CATALOG.find(c=>c.name===x.f.crop);
    return `<div class="bp-row t-${x.type} ${seen.has(x.key)?'':'is-new'}">
      <button type="button" class="bp-main" data-a="farm:${x.f.id}"><span class="bp-ico">${ic(ico[x.type])}</span>
        <span class="bp-txt"><strong>${E(x.title)}</strong><small>${c?cropPicture(cropInfo(c.name),14):''}${E(x.f.name)}</small></span>
        <em class="bp-val">${E(x.detail)}</em></button>
      <button type="button" class="bp-act" data-a="${x.action[1]}">${E(x.action[0])}</button></div>`};
  const now_=items.filter(x=>x.urgent),soon=items.filter(x=>!x.urgent);
  const group=(label,list)=>list.length?`<p class="bp-group">${label}<span>${list.length}</span></p>`+list.map(row).join(''):'';
  const newN=items.filter(x=>!seen.has(x.key)).length;
  return `<div class="bp-head"><div><strong>Upozornenia</strong><span>${items.length?(newN?newN+(newN===1?' nové':newN<5?' nové':' nových'):'Všetky si už videl'):'Nič nečaká'}</span></div></div>
    <div class="bp-list">${items.length?group('Treba hneď',now_)+group('Čoskoro',soon):`<div class="bp-empty"><span>${ic('check')}</span><strong>Všetko je v poriadku</strong><small>Žiadna farma teraz nepotrebuje vodu, zber ani platbu.</small></div>`}</div>
    <button type="button" class="bp-foot" data-a="settab:alerts">${ic('bell')}Notifikácie do telefónu</button>`;
}
function closeBell(){document.getElementById('bellpop')?.remove();document.querySelectorAll('[data-a="bell"]').forEach(b=>b.setAttribute('aria-expanded','false'))}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-a="bell"]');
  if(b){e.stopImmediatePropagation();e.preventDefault();if(document.getElementById('bellpop')){closeBell();return}
    const pop=document.createElement('div');pop.id='bellpop';pop.setAttribute('role','dialog');pop.setAttribute('aria-label','Upozornenia');pop.innerHTML=bellPanel();document.body.appendChild(pop);markSeen(bellItems());document.querySelectorAll('.bell-n').forEach(n=>n.remove());
    const top=document.querySelector('#top .bell')||b,r=top.getBoundingClientRect();pop.style.top=(r.bottom+8)+'px';pop.style.right=Math.max(10,innerWidth-r.right)+'px';
    top.setAttribute('aria-expanded','true');pop.querySelector('button')?.focus({preventScroll:true});return}
  if(!e.target.closest('#bellpop'))closeBell();else if(e.target.closest('[data-a^="farm:"],[data-a^="work:"],[data-a^="settab:"]'))setTimeout(closeBell);
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('bellpop')){closeBell();document.querySelector('#top .bell')?.focus()}});
// Fotky polí sa pri prekreslení (každých 30 s) nevymieňajú: použije sa ten istý, už vykreslený obrázok, takže nebliká.
const photoPool=()=>{const m=new Map();document.querySelectorAll('main img[src^="crops/"]').forEach(i=>{const k=i.getAttribute('src');(m.get(k)||m.set(k,[]).get(k)).push(i)});return m};
function keepPhotos(pool){document.querySelectorAll('main img[src^="crops/"]').forEach(n=>{const old=pool.get(n.getAttribute('src'))?.shift();if(old&&old!==n){old.alt=n.alt;old.className=n.className;n.replaceWith(old)}})}
// Menu, horná lišta a spodná lišta sa prepíšu len vtedy, keď sa naozaj zmenili.
// Inak by sa pri automatickom prekreslení (každých 30 s) vymenili prvky pod myšou a blikali.
const innerDesc=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
function guardHtml(el){if(!el||el.__guard)return;el.__guard=true;let last=null;
  Object.defineProperty(el,'innerHTML',{configurable:true,get(){return innerDesc.get.call(this)},set(v){if(el.__lock||v===last)return;last=v;innerDesc.set.call(this,v)}})}
const shellRender=render;
render=function(){document.documentElement.classList.add('no-anim');requestAnimationFrame(()=>requestAnimationFrame(()=>document.documentElement.classList.remove('no-anim')));if(page!=='overview')homeEdit=false;if(page==='alerts')page='overview';closeBell();const pool=photoPool();const side=$('#sidebar'),top=$('#top');guardHtml(side);guardHtml(top);side.__lock=top.__lock=true;try{shellRender()}finally{side.__lock=top.__lock=false}shell();
  if(page==='farm'){const f=db.farms.find(x=>x.id===farmPageId),b=document.querySelector('main .detail-size-banner');if(f&&b&&cropPhoto(f))b.outerHTML=farmBanner(f,'farm-photo detail-photo')}
  keepPhotos(pool)};
render();
