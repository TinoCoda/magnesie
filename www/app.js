(function(){
'use strict';

/* ---------- dates ---------- */
var pad=function(n){return String(n).padStart(2,'0')};
var ymd=function(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
var parse=function(s){var a=s.split('-').map(Number);return new Date(a[0],a[1]-1,a[2])};
var addDays=function(s,n){var d=parse(s);d.setDate(d.getDate()+n);return ymd(d)};
var dow=function(s){return parse(s).getDay()};
var weekStart=function(s){return addDays(s,-((dow(s)+6)%7))};
var diffDays=function(a,b){return Math.round((parse(a)-parse(b))/864e5)};
var MONTHS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
var DAYS=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
var DL=['Di','Lu','Ma','Me','Je','Ve','Sa'];
var fmtShort=function(s){var d=parse(s);return d.getDate()+' '+MONTHS[d.getMonth()]};
var fmtLong=function(s){return DAYS[dow(s)]+' '+fmtShort(s)};
var fmt1=function(n){return n.toFixed(1).replace('.',',')};
var clamp=function(n,a,b){return Math.min(b,Math.max(a,n))};
var $=function(id){return document.getElementById(id)};

var today=ymd(new Date());
var defaultStart=dow(today)===1?today:addDays(weekStart(today),7);

/* ---------- programme ---------- */
var EX={
  hs:{n:'Handstand contre le mur',k:'s',lo:20,hi:30,rest:90,tip:'Doigts écartés, poussée active dans les épaules, abdos serrés, regard entre les mains.',hint:'Quand tu tiens 30 s sur toutes les séries, rapproche les hanches du mur, puis essaie de décoller un pied.'},
  pompes:{n:'Pompes',k:'r',lo:8,hi:12,rest:75,load:1,tip:'Corps gainé comme une planche, coudes à 45°, poitrine proche du sol.',hint:'Passe aux pompes pieds surélevés, ou ajoute un sac à dos lesté.'},
  pike:{n:'Pike push-ups',k:'r',lo:6,hi:10,rest:90,tip:'Hanches hautes, tête entre les bras, descends le front vers le sol.',hint:'Surélève les pieds sur une chaise pour te rapprocher du handstand push-up.'},
  dips:{n:'Dips',k:'r',lo:6,hi:10,rest:90,load:1,tip:'Épaules basses, coudes près du corps, descends jusqu\'à 90° aux coudes.',hint:'Ajoute une pause de 2 s en bas, puis du lest.'},
  tri:{n:'Extensions triceps',k:'r',lo:10,hi:12,rest:60,load:1,tip:'Coudes serrés et pointés vers le haut, seul l\'avant-bras bouge.',hint:'Ajoute 1 à 2 kg quand tu atteins 12 sur toutes les séries.'},
  trac:{n:'Tractions',k:'r',lo:5,hi:8,rest:120,load:1,tip:'Épaules basses, menton au-dessus de la barre, descente contrôlée.',hint:'Ajoute 2 s de pause en haut, puis du lest.'},
  rowing:{n:'Rowing inversé',k:'r',lo:8,hi:12,rest:75,tip:'Corps rigide, tire la poitrine vers la barre, omoplates serrées.',hint:'Place les pieds plus haut, puis tends une jambe.'},
  lsit:{n:'L-sit',k:'s',lo:10,hi:20,up:15,rest:75,tip:'Bras tendus, épaules abaissées, jambes tendues et serrées, pointes de pieds tendues.',hint:'Tuck, puis une jambe tendue, puis les deux jambes tendues. Change de niveau quand tu tiens 15 s proprement.'},
  hollow:{n:'Hollow body',k:'s',lo:20,hi:30,rest:45,tip:'Bas du dos plaqué au sol, bras et jambes tendus, menton rentré.',hint:'Bras tendus au-dessus de la tête, puis un lest léger aux chevilles.'},
  curl:{n:'Curl biceps',k:'r',lo:10,hi:12,rest:60,load:1,tip:'Coudes collés au corps, ne balance pas le buste.',hint:'Ajoute 1 à 2 kg quand tu atteins 12 sur toutes les séries.'},
  bulg:{n:'Squat bulgare',k:'r',lo:8,hi:10,rest:90,load:1,tip:'Buste droit, genou avant dans l\'axe du pied, descends sous contrôle.',hint:'Ajoute 2 kg, ou éloigne le pied avant pour plus d\'amplitude.'},
  pistol:{n:'Pistol squat assisté',k:'r',lo:4,hi:6,rest:90,tip:'Talon au sol, genou dans l\'axe du pied, appuie-toi le moins possible.',hint:'Réduis l\'assistance : moins d\'appui sur la main ou le support.'},
  rdl:{n:'Soulevé de terre, une jambe',k:'r',lo:6,hi:8,rest:75,load:1,tip:'Dos plat, hanches vers l\'arrière, jambe arrière dans le prolongement du dos.',hint:'Ajoute 2 kg quand tu fais 8 reps propres sur toutes les séries.'},
  mollets:{n:'Mollets',k:'r',lo:12,hi:15,rest:45,load:1,tip:'Monte haut sur la pointe, marque une pause en haut, descends lentement.',hint:'Fais-les sur une marche, puis sur une seule jambe.'},
  planche:{n:'Planche',k:'s',lo:30,hi:45,rest:45,tip:'Fessiers et abdos serrés, bassin dans l\'axe, ne creuse pas le dos.',hint:'Allonge la planche (bras plus avancés) ou ajoute 10 s.'}
};
/* [exercice, séries, min, max] */
var SESS={
  push:{name:'Push + handstand',prep:1,ex:[['hs',5],['pompes',4],['pike',3],['dips',3],['tri',2]]},
  pull:{name:'Pull + L-sit',ex:[['trac',5],['rowing',3],['lsit',5],['hollow',3],['curl',2]]},
  legs:{name:'Jambes + gainage',ex:[['bulg',4],['pistol',3],['rdl',3],['mollets',3],['planche',3]]},
  full:{name:'Full body + skills',prep:1,note:'Tractions et dips en superset : une série de chacun, puis repos court.',ex:[['hs',5],['trac',4],['dips',4,5,8],['lsit',5],['hollow',3],['planche',3]]}
};
var WEEK={0:{},1:{f:'push',m:'short'},2:{f:'pull',m:'short'},3:{m:'mid'},4:{f:'legs',m:'short'},5:{f:'full',m:'short'},6:{m:'long'}};

var CR='Tiens la position, pousse 5 s contre le sol, relâche et va plus loin.';
var MOB={
  short:{n:'Courte',items:[
    {n:'Chat-vache + cercles de hanches',secs:60,sides:1,cue:'Mobilise le bassin et le dos avant les tenues.'},
    {n:'Fente basse (psoas)',secs:90,sides:2,cue:'Genou arrière au sol, bassin sous le buste, sans cambrer le dos.'},
    {n:'Couch stretch',secs:90,sides:2,cue:'Genou au sol contre un mur, pied contre le mur, fessier serré.'},
    {n:'Ischios, jambe tendue',secs:90,sides:2,cue:'Talon posé, dos long, penche-toi depuis les hanches.'},
    {n:'Grenouille (frog)',secs:120,sides:1,cue:'Genoux écartés, chevilles alignées, recule le bassin vers les talons et pousse activement.'},
    {n:'Papillon',secs:90,sides:1,cue:'Plantes de pieds jointes, dos long, coudes sur les cuisses.'},
    {n:'Compression assise',secs:90,sides:1,cue:'Assis jambes tendues, mains au sol, soulève les talons de quelques centimètres. Prépare le L-sit.'}
  ]},
  mid:{n:'Moyenne',items:[
    {n:'Chat-vache + cercles de hanches',secs:120,sides:1,cue:'Mobilise le bassin et le dos avant les tenues.'},
    {n:'Fente basse + élévation de la jambe arrière',secs:120,sides:2,cue:'Soulève le genou arrière du sol quelques secondes, jambe active.'},
    {n:'Couch stretch',secs:120,sides:2,cue:'Genou au sol contre un mur, pied contre le mur, fessier serré.'},
    {n:'Ischios en contract-relax',secs:120,sides:2,cue:CR},
    {n:'Pigeon',secs:90,sides:2,cue:'Tibia devant, bassin carré, buste vers l\'avant.'},
    {n:'Pike assis',secs:120,sides:1,cue:'Jambes jointes tendues, penche le buste vers les pieds.'},
    {n:'Grenouille en contract-relax',secs:180,sides:1,cue:CR},
    {n:'Papillon',secs:120,sides:1,cue:'Plantes de pieds jointes, dos long, coudes sur les cuisses.'},
    {n:'Pancake',secs:150,sides:1,cue:'Jambes écartées assis, penche le buste vers l\'avant, dos long.'},
    {n:'Cossack squats lents',secs:60,sides:2,cue:'Descends sur une jambe, l\'autre tendue, talon au sol.'},
    {n:'Compression assise',secs:120,sides:1,cue:'Assis jambes tendues, mains au sol, soulève les talons de quelques centimètres.'}
  ]},
  long:{n:'Longue',items:[
    {n:'Chat-vache + cercles de hanches',secs:180,sides:1,cue:'Mobilise le bassin et le dos avant les tenues.'},
    {n:'Fente basse + élévation de la jambe arrière',secs:150,sides:2,cue:'Soulève le genou arrière du sol quelques secondes, jambe active.'},
    {n:'Couch stretch',secs:150,sides:2,cue:'Genou au sol contre un mur, pied contre le mur, fessier serré.'},
    {n:'Ischios en contract-relax',secs:150,sides:2,cue:CR},
    {n:'Demi-grand écart facial',secs:120,sides:2,cue:'Jambe avant tendue, blocs sous les mains, hanches carrées.'},
    {n:'Pigeon',secs:120,sides:2,cue:'Tibia devant, bassin carré, buste vers l\'avant.'},
    {n:'Pike assis',secs:150,sides:1,cue:'Jambes jointes tendues, penche le buste vers les pieds.'},
    {n:'Grenouille en contract-relax',secs:240,sides:1,cue:CR},
    {n:'Papillon',secs:120,sides:1,cue:'Plantes de pieds jointes, dos long, coudes sur les cuisses.'},
    {n:'Pancake',secs:180,sides:1,cue:'Jambes écartées assis, penche le buste vers l\'avant, dos long.'},
    {n:'Cossack squats lents',secs:60,sides:2,cue:'Descends sur une jambe, l\'autre tendue, talon au sol.'},
    {n:'Compression assise',secs:150,sides:1,cue:'Assis jambes tendues, mains au sol, soulève les talons de quelques centimètres.'}
  ]}
};
Object.keys(MOB).forEach(function(k){MOB[k].total=MOB[k].items.reduce(function(a,it){return a+it.secs*it.sides},0)});
var dur=function(s){var m=Math.floor(s/60),r=s%60;return m?(r?m+' min '+r+' s':m+' min'):r+' s'};
var mmss=function(sec){var s=Math.max(0,Math.ceil(sec));return Math.floor(s/60)+':'+pad(s%60)};
var animOf=function(name){return window.Anim&&Anim.alias[name]};

/* ---------- état et stockage (sur le téléphone) ---------- */
var KEY='magnesie-v1';
var S={start:defaultStart,days:{},sound:true,vib:true};
try{
  var raw=localStorage.getItem(KEY);
  if(raw){
    var o=JSON.parse(raw);
    if(o&&o.days&&typeof o.days==='object')S.days=o.days;
    if(o&&/^\d{4}-\d{2}-\d{2}$/.test(o.start||''))S.start=o.start;
    if(o&&o.sound===false)S.sound=false;
    if(o&&o.vib===false)S.vib=false;
  }
}catch(e){}
var sel=today,tab='seance',mobSel=null,impArm=false;

function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('Sauvegarde impossible : stockage plein ou bloqué.')}}
function dayObj(date){return S.days[date]||(S.days[date]={})}
function touch(){save()}

/* ---------- son et vibration ---------- */
var ac=null;
function audioInit(){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume()}catch(e){}}
function beep(f,ms){
  if(!S.sound||!ac)return;
  try{
    var o=ac.createOscillator(),g=ac.createGain();
    o.frequency.value=f;g.gain.value=0.09;o.connect(g);g.connect(ac.destination);
    o.start();o.stop(ac.currentTime+ms/1000);
  }catch(e){}
}
function buzz(ms){try{if(S.vib&&navigator.vibrate)navigator.vibrate(ms)}catch(e){}}
var wake=null;
async function lockWake(){try{if(navigator.wakeLock&&!wake)wake=await navigator.wakeLock.request('screen')}catch(e){}}
function unlockWake(){try{if(wake)wake.release()}catch(e){}wake=null}
var toastT=null;
function toast(msg){
  var t=$('toast');t.textContent=msg;t.classList.add('show');
  clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove('show')},2600);
}

/* ---------- logique du programme ---------- */
var weekNum=function(date){return Math.floor(diffDays(weekStart(date),weekStart(S.start))/7)+1};
var isDeload=function(date){var w=weekNum(date);return w>=7&&w%7===0};
var setsFor=function(date,base){return isDeload(date)?Math.max(1,Math.ceil(base/2)):base};

function progressOf(date){
  var cfg=WEEK[dow(date)];if(!cfg.f)return{tot:0,done:0};
  var d=S.days[date]||{},tot=0,done=0;
  SESS[cfg.f].ex.forEach(function(r){
    var n=setsFor(date,r[1]);tot+=n;
    var v=(d.ex&&d.ex[r[0]]&&d.ex[r[0]].v)||[];
    for(var i=0;i<n;i++)if(v[i]>0)done++;
  });
  return{tot:tot,done:done};
}
function dayState(date){
  var cfg=WEEK[dow(date)],d=S.days[date]||{};
  var mobDone=!!(d.mob&&d.mob.done);
  if(!cfg.f&&!cfg.m)return mobDone?'done':'rest';
  var pr=progressOf(date);
  var forceOk=!cfg.f||pr.done>=pr.tot;
  var mobOk=!cfg.m||mobDone;
  if(forceOk&&mobOk)return 'done';
  if(pr.done>0||mobDone)return 'part';
  return 'none';
}
function prevLog(id,date){
  var ks=Object.keys(S.days).filter(function(k){return k<date}).sort().reverse();
  for(var i=0;i<ks.length;i++){
    var x=S.days[ks[i]]&&S.days[ks[i]].ex&&S.days[ks[i]].ex[id];
    if(x&&x.v){
      var v=x.v.filter(function(n){return n>0});
      if(v.length)return{date:ks[i],v:v,l:x.l};
    }
  }
  return null;
}
function suggest(id,date,n,lo,hi){
  var e=EX[id],step=e.k==='s'?5:1,u=e.k==='s'?' s':'';
  var p=prevLog(id,date);
  if(!p)return{target:lo,up:false,text:'Première fois : vise '+lo+u+' par série et garde de la marge.'};
  var up=e.up||hi;
  var load=p.l?' à '+String(p.l).replace('.',',')+' kg':'';
  if(p.v.length>=n&&p.v.every(function(x){return x>=up})){
    return{target:lo,up:true,text:'Palier atteint ('+p.v.join(' · ')+u+load+'). Passe à la suite : '+e.hint};
  }
  var low=Math.min.apply(null,p.v),t=Math.min(hi,low+step);
  return{target:t,up:false,text:'Le '+fmtShort(p.date)+' : '+p.v.join(' · ')+u+load+'. Vise '+t+u+' sur chaque série.'};
}
function logSet(date,id,i,val,load){
  var o=dayObj(date);o.ex=o.ex||{};
  var x=o.ex[id]=o.ex[id]||{v:[]};
  while(x.v.length<=i)x.v.push(0);
  x.v[i]=clamp(Math.round(val)||0,0,999);
  if(load!=null){if(load>0)x.l=load;else delete x.l}
  touch();
}

/* ---------- rendu ---------- */
var app=$('app'),strip=$('strip');
var mounted=[];
function stopAnims(){mounted.forEach(function(h){h.stop()});mounted=[]}
function mountAnim(el,key){if(!el||!window.Anim||!Anim.has(key))return;var h=Anim.mount(el,key);mounted.push(h);return h}

function renderStrip(){
  var ws=weekStart(sel);
  strip.innerHTML=[0,1,2,3,4,5,6].map(function(i){
    var d=addDays(ws,i),st=dayState(d);
    return '<button class="pill st-'+st+(d===sel?' sel':'')+(d===today?' today':'')+'" data-act="day" data-d="'+d+'" aria-pressed="'+(d===sel)+'" aria-label="'+fmtLong(d)+'"><b>'+DL[dow(d)]+'</b><i>'+parse(d).getDate()+'</i><u></u></button>';
  }).join('');
}
function renderHeader(){
  var ws=weekStart(sel),we=addDays(ws,6),wn=weekNum(sel);
  $('weeklabel').textContent=(wn>=1?'Semaine '+wn+' · ':'')+fmtShort(ws)+' – '+fmtShort(we);
  $('todaybtn').hidden=(sel===today);
  document.querySelectorAll('#nav button').forEach(function(b){
    b.classList.toggle('on',b.dataset.t===tab);
    b.classList.toggle('live',b.dataset.t==='mob'&&!!P);
    if(b.dataset.t===tab)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
  });
}
function render(){
  stopAnims();
  renderStrip();renderHeader();
  app.innerHTML=tab==='seance'?viewSeance():tab==='mob'?viewMob():tab==='corps'?viewCorps():viewBilan();
  if(tab==='corps')paintBody();
  if(tab==='mob'&&P)mountAnim($('panim'),P.steps[P.i].anim);
}

function targetLabel(id,n,lo,hi){return n+' × '+(lo===hi?lo:lo+'–'+hi)+(EX[id].k==='s'?' s':'')}

function viewSeance(){
  var cfg=WEEK[dow(sel)],d=S.days[sel]||{},wn=weekNum(sel),h='';
  var title=cfg.f?SESS[cfg.f].name:cfg.m==='mid'?'Mobilité moyenne':cfg.m==='long'?'Mobilité longue':'Repos';
  var pr=progressOf(sel);
  h+='<section class="head"><p class="eyebrow">'+(wn>=1?'Semaine '+wn+' · ':'')+fmtLong(sel)+'</p><h1>'+title+'</h1>';
  if(cfg.f){
    h+='<div class="bar'+(pr.done>=pr.tot&&pr.tot?' full':'')+'" id="pbar"><i style="width:'+(pr.tot?Math.round(pr.done/pr.tot*100):0)+'%"></i></div><p class="count" id="pcount">'+pr.done+' séries sur '+pr.tot+'</p>';
    h+='<button class="btn big" data-act="guide">'+(pr.done>0&&pr.done<pr.tot?'Reprendre la séance guidée':pr.done>=pr.tot?'Refaire la séance guidée':'Démarrer la séance guidée')+'</button>';
  }
  h+='</section>';
  if(wn<1)h+='<p class="note">Le programme démarre le '+fmtLong(S.start)+'. Tu peux déjà noter des séances avant.</p>';
  if(isDeload(sel))h+='<div class="banner"><b>Semaine allégée.</b> Mêmes exercices, moitié des séries, mêmes charges. C\'est là que le corps rattrape son retard.</div>';
  if(cfg.f){
    var S0=SESS[cfg.f];
    if(S0.note)h+='<p class="note">'+S0.note+'</p>';
    h+='<div class="stack">';
    if(S0.prep){
      h+='<label class="card chk"><input type="checkbox" data-prep'+(d.prep?' checked':'')+'><span>Échauffement poignets · 5 min<br><small style="font-weight:400;color:var(--muted)">Rotations, appui sur le dos des mains, flexions</small></span></label>';
    }
    S0.ex.forEach(function(r){
      var id=r[0],e=EX[id],lo=r[2]||e.lo,hi=r[3]||e.hi,n=setsFor(sel,r[1]);
      var x=(d.ex&&d.ex[id])||{v:[]},sg=suggest(id,sel,n,lo,hi),pl=prevLog(id,sel);
      h+='<article class="card" data-card="'+id+'"><div class="ex-head"><h3>'+e.n+'</h3><span class="tgt">'+targetLabel(id,n,lo,hi)+'</span></div>';
      h+='<p class="sug'+(sg.up?' up':'')+'">'+sg.text+'</p><div class="sets">';
      for(var i=0;i<n;i++){
        var val=x.v[i]>0?x.v[i]:'';
        h+='<label class="set"><span>'+(i+1)+'</span><input type="number" inputmode="numeric" min="0" max="999" data-set data-ex="'+id+'" data-i="'+i+'" data-t="'+sg.target+'" placeholder="'+sg.target+'" value="'+val+'"'+(val!==''?' class="done"':'')+' aria-label="'+e.n+', série '+(i+1)+'"></label>';
      }
      h+='</div><div class="row"><button class="btn small" data-act="fill" data-ex="'+id+'" data-n="'+n+'">Fait comme prévu</button>';
      if(e.load)h+='<label class="load">Charge <input type="number" inputmode="decimal" step="0.5" min="0" data-load data-ex="'+id+'" placeholder="'+(pl&&pl.l?pl.l:'kg')+'" value="'+(x.l||'')+'"> kg</label>';
      h+='</div><details class="geste" data-anim="'+id+'"><summary>Voir le geste</summary><div class="animhost"></div><p>'+e.tip+'</p></details>';
      h+='<details><summary>Niveau suivant</summary><p>'+e.hint+'</p></details></article>';
    });
    h+=mobCard('short',d);
    h+='</div>';
  }else if(cfg.m){
    h+='<div class="stack">'+mobCard(cfg.m,d)+'</div>';
  }else{
    h+='<p class="note">Jour de repos. Dors 7 à 8 h et marche un peu. Une mobilité courte reste possible si tu en as envie.</p><div class="stack">'+mobCard('short',d)+'</div>';
  }
  return h;
}
function mobCard(r,d){
  var R=MOB[r],done=!!(d.mob&&d.mob.done);
  return '<article class="card mobcard"><div><h3>Mobilité '+R.n.toLowerCase()+'</h3><p>'+Math.round(R.total/60)+' min · '+R.items.length+' positions guidées avec minuteur</p></div><div class="row"><button class="btn small" data-act="openmob" data-r="'+r+'">Ouvrir la routine</button><label class="chk"><input type="checkbox" data-mobdone data-r="'+r+'"'+(done?' checked':'')+'> Faite</label></div></article>';
}

function viewMob(){
  var cfg=WEEK[dow(sel)],eff=mobSel||cfg.m||'short',d=S.days[sel]||{};
  if(P)return playerHTML();
  var h='<section class="head"><p class="eyebrow">'+fmtLong(sel)+'</p><h1>Mobilité</h1></section>';
  h+='<div class="tabs" role="group" aria-label="Routine">'+['short','mid','long'].map(function(k){
    return '<button data-act="mobsel" data-r="'+k+'" class="'+(k===eff?'on':'')+'" aria-pressed="'+(k===eff)+'">'+MOB[k].n+'<small>'+Math.round(MOB[k].total/60)+' min</small></button>';
  }).join('')+'</div>';
  h+='<p class="note">Étire-toi chaud, après la séance ou après 5 min de mouvement. Chaque position dure environ 2 min. Les routines moyenne et longue utilisent le contract-relax.</p>';
  h+='<div class="row" style="margin-bottom:14px"><button class="btn" data-act="mobstart" data-r="'+eff+'">Lancer la routine</button><label class="chk"><input type="checkbox" data-mobdone data-r="'+eff+'"'+(d.mob&&d.mob.done?' checked':'')+'> Marquer comme faite</label></div>';
  h+='<ol class="steps">'+MOB[eff].items.map(function(it){
    var a=animOf(it.n);
    return '<li class="step"><div><b>'+it.n+'</b><span>'+(it.sides===2?dur(it.secs)+' par côté':dur(it.secs))+'</span></div><p>'+it.cue+'</p>'+(a?'<details class="geste" data-anim="'+a+'"><summary>Voir le geste</summary><div class="animhost"></div></details>':'')+'</li>';
  }).join('')+'</ol>';
  return h;
}

function viewCorps(){
  var d=S.days[sel]||{};
  return '<section class="head"><p class="eyebrow">'+fmtLong(sel)+'</p><h1>Corps</h1></section>'+
  '<div class="stack"><div class="card"><div class="two"><div class="field"><label for="w">Poids (kg)</label><input id="w" type="number" inputmode="decimal" step="0.1" min="0" max="300" placeholder="79,0" value="'+(d.w||'')+'"></div>'+
  '<div class="field"><label for="p">Protéines (g)</label><input id="p" type="number" inputmode="numeric" min="0" max="999" placeholder="0" value="'+(d.p||'')+'"></div></div>'+
  '<div class="row"><button class="btn ghost small" data-act="padd" data-n="20">+ 20 g</button><button class="btn ghost small" data-act="padd" data-n="30">+ 30 g</button><button class="btn ghost small" data-act="padd" data-n="40">+ 40 g</button><button class="link" data-act="pzero">Remettre à zéro</button></div>'+
  '<div><div class="pbar" id="pbarp"><i id="pfill"></i><em title="130 g"></em></div><p class="count" id="plabel" style="margin-top:8px"></p></div></div>'+
  '<div class="card" id="bstats"></div></div>';
}
function avgW(ws){
  var s=0,n=0;
  for(var i=0;i<7;i++){var d=S.days[addDays(ws,i)];if(d&&d.w>0){s+=d.w;n++}}
  return n?{avg:s/n,n:n}:null;
}
function bstatsHTML(){
  var ws=weekStart(sel),a=avgW(ws),b=avgW(addDays(ws,-7)),c=avgW(addDays(ws,-14));
  var h='<h3>Poids moyen</h3>';
  h+='<div class="stat"><span>Cette semaine</span><b>'+(a?fmt1(a.avg)+' kg ('+a.n+' pesée'+(a.n>1?'s':'')+')':'—')+'</b></div>';
  h+='<div class="stat"><span>Semaine précédente</span><b>'+(b?fmt1(b.avg)+' kg':'—')+'</b></div>';
  if(a&&b){var df=a.avg-b.avg;h+='<div class="stat"><span>Écart</span><b>'+(df>0?'+':'')+fmt1(df)+' kg</b></div>'}
  if(a&&b&&c){
    var t=a.avg-c.avg;
    if(t<0.15)h+='<p class="sug up">Le poids bouge à peine depuis 3 semaines. Ajoute environ 150 kcal par jour.</p>';
    else if(t>0.7)h+='<p class="sug up">Tu prends vite. Vise plutôt 0,25 à 0,5 kg par mois : retire environ 150 kcal par jour.</p>';
  }
  h+='<p class="count">Pèse-toi le matin, 3 fois par semaine. Regarde la moyenne, pas un jour isolé.</p>';
  return h;
}
function paintBody(){
  var d=S.days[sel]||{},p=d.p||0;
  var f=$('pfill');if(!f)return;
  f.style.width=Math.min(100,p/160*100)+'%';
  $('pbarp').classList.toggle('ok',p>=130);
  $('plabel').textContent=p+' g aujourd\'hui · objectif 130 à 160 g';
  $('bstats').innerHTML=bstatsHTML();
}

function weekHasData(ws){for(var i=0;i<7;i++){var d=S.days[addDays(ws,i)];if(d&&Object.keys(d).length)return true}return false}
function viewBilan(){
  var cur=weekStart(today),rows='',k;
  for(k=0;k<8;k++){
    var ws=addDays(cur,-7*k),we=addDays(ws,6);
    if(k>0&&we<S.start&&!weekHasData(ws))break;
    var fd=0,mb=0,pn=0,ps=0;
    for(var i=0;i<7;i++){
      var date=addDays(ws,i),dd=S.days[date]||{},cfg=WEEK[dow(date)];
      if(cfg.f){var pr=progressOf(date);if(pr.tot&&pr.done>=pr.tot)fd++}
      if(dd.mob&&dd.mob.done)mb++;
      if(dd.p>0){ps+=dd.p;pn++}
    }
    var w=avgW(ws),wn=weekNum(ws);
    rows+='<tr><th scope="row">'+(wn>=1?'Semaine '+wn:'Avant départ')+'<small>'+fmtShort(ws)+'</small></th><td>'+fd+' / 4</td><td>'+mb+' / 6</td><td>'+(w?fmt1(w.avg)+' kg':'—')+'</td><td>'+(pn?Math.round(ps/pn)+' g':'—')+'</td></tr>';
  }
  var allF=0,allM=0;
  Object.keys(S.days).forEach(function(date){
    var cfg=WEEK[dow(date)],dd=S.days[date];
    if(cfg.f){var pr=progressOf(date);if(pr.tot&&pr.done>=pr.tot)allF++}
    if(dd.mob&&dd.mob.done)allM++;
  });
  return '<section class="head"><p class="eyebrow">Depuis le '+fmtShort(S.start)+'</p><h1>Bilan</h1><p>'+allF+' séance'+(allF>1?'s':'')+' de force complète'+(allF>1?'s':'')+' · '+allM+' routine'+(allM>1?'s':'')+' de mobilité</p></section>'+
  '<div class="tablewrap"><table><thead><tr><th>Semaine</th><th>Force</th><th>Mobilité</th><th>Poids</th><th>Protéines</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
  '<h2 class="sectitle">Réglages</h2><div class="stack"><div class="card"><div class="field"><label for="start">Date de départ du programme</label><input id="start" type="date" value="'+S.start+'"></div><p class="count">Choisis un lundi. Une semaine allégée est proposée toutes les 7 semaines.</p>'+
  '<label class="chk"><input type="checkbox" id="optsound"'+(S.sound?' checked':'')+'> Sons des minuteurs</label><label class="chk"><input type="checkbox" id="optvib"'+(S.vib?' checked':'')+'> Vibrations</label></div>'+
  '<div class="card"><h3>Sauvegarde</h3><p class="count">Tes données restent sur ce téléphone. Copie la sauvegarde avant de désinstaller l\'app ou de changer de téléphone.</p>'+
  '<div class="field"><label for="bk">Sauvegarde</label><textarea id="bk" spellcheck="false" placeholder="Colle ici une sauvegarde pour la restaurer"></textarea></div>'+
  '<div class="row"><button class="btn small" data-act="bkcopy">Copier ma sauvegarde</button><button class="btn ghost small" data-act="bkimport">'+(impArm?'Confirmer le remplacement':'Restaurer')+'</button></div></div></div>';
}

/* ---------- minuteur de mobilité ---------- */
var P=null,tickT=null;
function stepsOf(r){
  var out=[],first=MOB[r].items[0];
  out.push({n:'Prépare-toi',secs:5,cue:'Installe-toi pour : '+first.n+'.',side:'',anim:animOf(first.n),ready:true});
  MOB[r].items.forEach(function(it){
    var a=animOf(it.n);
    if(it.sides===2){
      out.push({n:it.n,secs:it.secs,cue:it.cue,side:'Côté gauche',anim:a});
      out.push({n:it.n,secs:it.secs,cue:it.cue,side:'Côté droit',anim:a});
    }else out.push({n:it.n,secs:it.secs,cue:it.cue,side:'',anim:a});
  });
  return out;
}
function startPlayer(r){
  audioInit();
  var steps=stepsOf(r);
  P={r:r,date:sel,steps:steps,i:0,end:Date.now()+steps[0].secs*1000,paused:false,left:0,lastBeep:-1};
  clearInterval(tickT);tickT=setInterval(tick,200);
  lockWake();beep(660,120);buzz(40);render();
}
function tick(){
  if(!P||P.paused)return;
  var left=P.end-Date.now();
  if(left<=0){goStep(P.i+1,true);return}
  var s=Math.ceil(left/1000);
  if(s<=3&&s>=1&&P.lastBeep!==s){P.lastBeep=s;beep(600,80)}
  paintTimer(left);
}
function goStep(i,auto){
  if(i>=P.steps.length){finishPlayer();return}
  P.i=Math.max(0,i);P.end=Date.now()+P.steps[P.i].secs*1000;P.paused=false;P.lastBeep=-1;
  beep(auto?880:660,auto?260:100);buzz(auto?120:30);
  if(tab==='mob')render();
}
function paintTimer(left){
  var t=$('ptime');if(!t||!P)return;
  t.textContent=mmss(left/1000);
  var b=document.querySelector('#pbar2 i');
  if(b)b.style.width=(100-clamp(left/(P.steps[P.i].secs*1000),0,1)*100)+'%';
}
function togglePause(){
  if(!P)return;
  if(P.paused){P.end=Date.now()+P.left;P.paused=false}
  else{P.left=Math.max(0,P.end-Date.now());P.paused=true}
  var b=$('ppause');if(b)b.textContent=P.paused?'Reprendre':'Pause';
}
function finishPlayer(){
  clearInterval(tickT);unlockWake();
  var r=P.r,date=P.date;P=null;
  dayObj(date).mob={r:r,done:true};touch();
  beep(660,150);setTimeout(function(){beep(880,150)},220);setTimeout(function(){beep(1100,260)},440);buzz(250);
  toast('Routine terminée, bien joué.');
  render();
}
function quitPlayer(){clearInterval(tickT);unlockWake();P=null;render()}
function playerHTML(){
  var s=P.steps[P.i],nx=P.steps[P.i+1];
  var left=P.paused?P.left:P.end-Date.now();
  var idx=P.i,tot=P.steps.length-1;
  var head=s.ready?'Prépare-toi':'Étape '+idx+' sur '+tot+(s.side?' · '+s.side:'');
  return '<section class="player"><p class="eyebrow">'+head+'</p><h2>'+s.n+'</h2>'+
  '<div class="animhost" id="panim"></div>'+
  '<div class="clock" id="ptime">'+mmss(left/1000)+'</div><div class="bar" id="pbar2"><i style="width:'+(100-clamp(left/(s.secs*1000),0,1)*100)+'%"></i></div>'+
  '<p class="cue">'+s.cue+'</p><p class="next">'+(nx?'Ensuite : '+nx.n+(nx.side?' · '+nx.side:''):'Dernière position')+'</p>'+
  '<div class="row"><button class="btn ghost" data-act="pprev">Précédent</button><button class="btn" id="ppause" data-act="ppause">'+(P.paused?'Reprendre':'Pause')+'</button><button class="btn ghost" data-act="pnext">Suivant</button></div>'+
  '<button class="link" data-act="pquit">Arrêter la routine</button></section>';
}

/* ---------- séance guidée ---------- */
var G=null,gT=null,gAnim=null;
function buildSteps(date){
  var cfg=WEEK[dow(date)],sess=SESS[cfg.f],steps=[];
  if(sess.prep)steps.push({kind:'prep'});
  sess.ex.forEach(function(r,ei){
    var id=r[0],n=setsFor(date,r[1]),lo=r[2]||EX[id].lo,hi=r[3]||EX[id].hi;
    for(var i=0;i<n;i++){
      steps.push({kind:'work',ex:id,ei:ei,i:i,n:n,lo:lo,hi:hi});
      if(i<n-1)steps.push({kind:'rest',secs:EX[id].rest,nextEx:id,nextSet:i+2,n:n});
    }
    if(ei<sess.ex.length-1){
      var nid=sess.ex[ei+1][0];
      steps.push({kind:'rest',secs:60,nextEx:nid,nextSet:1,n:setsFor(date,sess.ex[ei+1][1]),change:true});
    }
  });
  return steps;
}
function openGuide(){
  var cfg=WEEK[dow(sel)];if(!cfg.f)return;
  var steps=buildSteps(sel),d=S.days[sel]||{},i=0;
  for(;i<steps.length;i++){
    var s=steps[i];
    if(s.kind==='prep'){if(!d.prep)break}
    else if(s.kind==='work'){var x=d.ex&&d.ex[s.ex];if(!(x&&x.v&&x.v[s.i]>0))break}
  }
  G={date:sel,steps:steps,i:i};
  audioInit();lockWake();
  $('guide').hidden=false;document.body.style.overflow='hidden';
  clearInterval(gT);gT=setInterval(gTick,200);
  enterStep();
}
function closeGuide(){
  clearInterval(gT);unlockWake();
  if(gAnim){gAnim.stop();gAnim=null}
  G=null;$('guide').hidden=true;document.body.style.overflow='';
  render();
}
function stepSug(s){return suggest(s.ex,G.date,s.n,s.lo,s.hi)}
function enterStep(){
  var s=G.steps[G.i];
  G.lastBeep=-1;G.beeped=0;G.ph='ready';
  if(!s){renderGuide();return}
  if(s.kind==='rest'){G.end=Date.now()+s.secs*1000}
  else if(s.kind==='prep'){G.end=Date.now()+300000}
  else if(s.kind==='work'){
    var x=((S.days[G.date]||{}).ex||{})[s.ex],logged=x&&x.v&&x.v[s.i]>0?x.v[s.i]:0;
    var pl=prevLog(s.ex,G.date);
    G.sug=stepSug(s);
    G.val=logged||G.sug.target;
    G.load=(x&&x.l)||(pl&&pl.l)||null;
  }
  renderGuide();
}
function nextStep(){G.i++;enterStep()}
function renderGuide(){
  var s=G.steps[G.i],body=$('gbody'),h='';
  if(gAnim){gAnim.stop();gAnim=null}
  $('gbar').style.width=Math.round(Math.min(G.i,G.steps.length)/G.steps.length*100)+'%';
  var animKey=null;
  if(!s){
    var pr=progressOf(G.date);
    $('gcrumb').textContent='Terminé';
    h='<div class="gdone"><h2>Séance terminée</h2><p class="gtarget">'+pr.done+' séries sur '+pr.tot+' notées</p><p class="gtip">Tout est enregistré. Pense à tes 15 minutes de mobilité et à tes protéines.</p><button class="btn big" data-g="finish">Fermer</button></div>';
  }else if(s.kind==='prep'){
    $('gcrumb').textContent='Échauffement';
    h='<h2>Poignets</h2><div class="clock" id="gclock">'+mmss(Math.max(0,G.end-Date.now())/1000)+'</div><p class="gtip">Rotations, appui sur le dos des mains, flexions, appui paumes à plat en poussant doucement vers l\'avant. Prends ton temps : les poignets sont la limite n°1 du handstand.</p><button class="btn big" data-g="prepdone">Échauffement terminé</button>';
  }else if(s.kind==='rest'){
    var e=EX[s.nextEx];
    $('gcrumb').textContent=s.change?'Changement d\'exercice':'Repos';
    h='<p class="glabel">'+(s.change?'Prépare-toi':'Récupère')+'</p><div class="clock" id="gclock">'+mmss(Math.max(0,G.end-Date.now())/1000)+'</div>'+
       '<p class="gtarget">Ensuite : '+e.n+(s.change?'':' · série '+s.nextSet+' sur '+s.n)+'</p><div class="animhost" id="ganim"></div>'+
       '<div class="row" style="justify-content:center"><button class="btn ghost" data-g="plus">+ 15 s</button><button class="btn" data-g="skiprest">Passer le repos</button></div>';
    animKey=s.nextEx;
  }else{
    var ex=EX[s.ex],isHold=ex.k==='s',lo=s.lo,hi=s.hi;
    $('gcrumb').textContent='Exercice '+(s.ei+1)+' sur '+SESS[WEEK[dow(G.date)].f].ex.length+' · série '+(s.i+1)+' sur '+s.n;
    h='<h2>'+ex.n+'</h2><p class="gtarget">Objectif : '+(lo===hi?lo:lo+'–'+hi)+(isHold?' s':' reps')+'</p>';
    h+='<div class="animhost" id="ganim"></div><p class="gtip">'+ex.tip+'</p><p class="gtip'+(G.sug.up?' sug up':'')+'" style="text-align:left">'+G.sug.text+'</p>';
    if(isHold){
      if(G.ph==='ready')h+='<button class="btn big" data-g="holdstart">Je suis en position, lancer</button>';
      else if(G.ph==='count')h+='<p class="glabel">Début dans</p><div class="clock" id="gclock">3</div>';
      else h+='<div class="clock" id="gclock">0</div><div class="bar"><i id="gholdbar"></i></div><p class="count">Objectif '+G.sug.target+' s · maximum du palier '+hi+' s</p><button class="btn big" data-g="holdstop">Terminer la tenue</button>';
    }else{
      h+='<p class="glabel">Répétitions réussies</p><div class="stepper"><button data-g="minus" aria-label="Moins une répétition">−</button><input id="gval" type="number" inputmode="numeric" min="0" max="999" value="'+G.val+'"><button data-g="plus1" aria-label="Plus une répétition">+</button></div>';
      if(ex.load)h+='<label class="gload">Charge <input id="gload" type="number" inputmode="decimal" step="0.5" min="0" value="'+(G.load||'')+'" placeholder="kg"> kg</label>';
      h+='<button class="btn big" data-g="validate">Valider la série</button>';
    }
    h+='<button class="link" data-g="skipset">Passer cette série</button>';
    animKey=s.ex;
  }
  body.innerHTML=h;
  if(animKey&&window.Anim&&Anim.has(animKey))gAnim=Anim.mount($('ganim'),animKey);
}
function gTick(){
  if(!G)return;
  var s=G.steps[G.i];if(!s)return;
  var now=Date.now();
  if(s.kind==='rest'||s.kind==='prep'){
    var left=G.end-now,c=$('gclock');
    if(c)c.textContent=mmss(left/1000);
    var sec=Math.ceil(left/1000);
    if(s.kind==='rest'&&sec<=3&&sec>=1&&G.lastBeep!==sec){G.lastBeep=sec;beep(600,80);buzz(20)}
    if(left<=0){
      if(s.kind==='rest'){beep(880,260);buzz(150);nextStep()}
      else if(G.lastBeep!==0){G.lastBeep=0;beep(880,260);buzz(150)}
    }
  }else if(s.kind==='work'&&EX[s.ex].k==='s'){
    var c2=$('gclock');
    if(G.ph==='count'){
      var l=Math.ceil((G.end-now)/1000);
      if(l<=0){G.ph='run';G.t0=now;G.beeped=0;beep(880,260);buzz(150);renderGuide();return}
      if(c2)c2.textContent=l;
      if(G.lastBeep!==l){G.lastBeep=l;beep(600,90)}
    }else if(G.ph==='run'){
      var el=(now-G.t0)/1000;
      if(c2)c2.textContent=Math.floor(el)+' s';
      var hb=$('gholdbar');if(hb)hb.style.width=Math.min(100,el/s.hi*100)+'%';
      if(G.beeped<1&&el>=G.sug.target){G.beeped=1;beep(880,200);buzz(100)}
      if(G.beeped<2&&el>=s.hi){G.beeped=2;beep(1100,350);buzz(200)}
    }
  }
}
function gAction(a){
  var s=G.steps[G.i];
  if(a==='quit'){closeGuide();return}
  if(a==='finish'){toast('Séance terminée, bien joué.');closeGuide();return}
  if(!s)return;
  if(a==='prepdone'){dayObj(G.date).prep=true;touch();nextStep();return}
  if(a==='skiprest'){nextStep();return}
  if(a==='plus'){G.end+=15000;G.lastBeep=-1;return}
  if(a==='skipset'){nextStep();return}
  if(a==='minus'||a==='plus1'){
    var inp=$('gval');G.val=clamp((parseInt(inp.value,10)||0)+(a==='plus1'?1:-1),0,999);inp.value=G.val;return;
  }
  if(a==='validate'){
    var v=parseInt($('gval').value,10)||0,ld=$('gload')?parseFloat(String($('gload').value).replace(',','.')):null;
    if(v<=0){toast('Note au moins 1 répétition, ou passe la série.');return}
    logSet(G.date,s.ex,s.i,v,ld==null||isNaN(ld)?null:ld);
    beep(660,120);buzz(40);nextStep();return;
  }
  if(a==='holdstart'){G.ph='count';G.end=Date.now()+3000;G.lastBeep=-1;renderGuide();return}
  if(a==='holdstop'){
    var secs=Math.round((Date.now()-G.t0)/1000);
    if(secs<1){nextStep();return}
    logSet(G.date,s.ex,s.i,secs,null);
    beep(660,120);buzz(40);toast(secs+' s notées');nextStep();return;
  }
}
$('guide').addEventListener('click',function(e){
  var b=e.target.closest('[data-g]');if(!b||!G)return;
  gAction(b.dataset.g);
});
$('guide').addEventListener('input',function(e){
  if(e.target.id==='gval'&&G)G.val=parseInt(e.target.value,10)||0;
});

/* ---------- interactions ---------- */
function paintProgress(){
  var pr=progressOf(sel),b=$('pbar'),c=$('pcount');
  if(b){b.firstChild.style.width=(pr.tot?Math.round(pr.done/pr.tot*100):0)+'%';b.classList.toggle('full',pr.tot>0&&pr.done>=pr.tot)}
  if(c)c.textContent=pr.done+' séries sur '+pr.tot;
  renderStrip();
}
app.addEventListener('input',function(e){
  var t=e.target;
  if(t.matches('input[data-set]')){
    var n=clamp(parseInt(t.value,10)||0,0,999);
    logSet(sel,t.dataset.ex,+t.dataset.i,n,null);
    t.classList.toggle('done',n>0);paintProgress();
  }else if(t.matches('input[data-load]')){
    var l=parseFloat(String(t.value).replace(',','.'));
    var o=dayObj(sel);o.ex=o.ex||{};
    var x=o.ex[t.dataset.ex]=o.ex[t.dataset.ex]||{v:[]};
    if(l>0)x.l=l;else delete x.l;
    touch();
  }else if(t.id==='w'){
    var o2=dayObj(sel),w=parseFloat(String(t.value).replace(',','.'));
    if(w>0)o2.w=w;else delete o2.w;
    touch();paintBody();
  }else if(t.id==='p'){
    var o3=dayObj(sel),p=parseInt(t.value,10);
    if(p>0)o3.p=p;else delete o3.p;
    touch();paintBody();
  }
});
app.addEventListener('change',function(e){
  var t=e.target;
  if(t.matches('input[data-prep]')){dayObj(sel).prep=t.checked;touch()}
  else if(t.matches('input[data-mobdone]')){dayObj(sel).mob={r:t.dataset.r,done:t.checked};touch();renderStrip()}
  else if(t.id==='start'&&/^\d{4}-\d{2}-\d{2}$/.test(t.value)){S.start=t.value;save();render()}
  else if(t.id==='optsound'){S.sound=t.checked;save();if(S.sound){audioInit();beep(660,100)}}
  else if(t.id==='optvib'){S.vib=t.checked;save();buzz(60)}
});
/* les <details> "Voir le geste" lancent l'animation à l'ouverture */
app.addEventListener('toggle',function(e){
  var d=e.target;
  if(!d.matches||!d.matches('details.geste'))return;
  var host=d.querySelector('.animhost');if(!host)return;
  if(d.open)mountAnim(host,d.dataset.anim);else host.innerHTML='';
},true);

document.addEventListener('click',function(e){
  if(!$('guide').hidden)return;
  var b=e.target.closest('[data-act]');if(!b)return;
  var a=b.dataset.act;
  if(a==='tab'){tab=b.dataset.t;render();window.scrollTo(0,0)}
  else if(a==='day'){sel=b.dataset.d;if(!P)mobSel=null;render()}
  else if(a==='wk'){sel=addDays(sel,+b.dataset.n);if(!P)mobSel=null;render()}
  else if(a==='today'){sel=today;if(!P)mobSel=null;render()}
  else if(a==='guide'){openGuide()}
  else if(a==='fill'){
    var id=b.dataset.ex;
    app.querySelectorAll('input[data-set][data-ex="'+id+'"]').forEach(function(inp){
      if(!(Number(inp.value)>0)){inp.value=inp.dataset.t;logSet(sel,id,+inp.dataset.i,+inp.dataset.t,null);inp.classList.add('done')}
    });
    paintProgress();
  }
  else if(a==='openmob'){tab='mob';mobSel=b.dataset.r;render();window.scrollTo(0,0)}
  else if(a==='mobsel'){mobSel=b.dataset.r;render()}
  else if(a==='mobstart'){startPlayer(b.dataset.r)}
  else if(a==='ppause'){togglePause()}
  else if(a==='pnext'){goStep(P.i+1,false)}
  else if(a==='pprev'){goStep(P.i-1,false)}
  else if(a==='pquit'){quitPlayer()}
  else if(a==='padd'){
    var o=dayObj(sel);o.p=(o.p||0)+(+b.dataset.n);touch();
    var pi=$('p');if(pi)pi.value=o.p;paintBody();
  }
  else if(a==='pzero'){
    var o4=dayObj(sel);delete o4.p;touch();
    var pj=$('p');if(pj)pj.value='';paintBody();
  }
  else if(a==='bkcopy'){
    var txt=JSON.stringify({v:1,start:S.start,days:S.days});
    var ta=$('bk');ta.value=txt;
    var ok=function(){toast('Sauvegarde copiée')};
    var ko=function(){ta.focus();ta.select();toast('Copie manuelle : sélectionne le texte')};
    try{navigator.clipboard.writeText(txt).then(ok,ko)}catch(err){ko()}
  }
  else if(a==='bkimport'){
    var ta2=$('bk'),txt2=ta2.value.trim();
    if(!txt2){toast('Colle d\'abord une sauvegarde dans la zone de texte.');return}
    var data;
    try{data=JSON.parse(txt2)}catch(err){toast('Sauvegarde illisible.');return}
    if(!data||typeof data.days!=='object'||data.days===null){toast('Sauvegarde invalide.');return}
    if(!impArm){impArm=true;render();$('bk').value=txt2;toast('Touche encore pour remplacer tes données actuelles.');return}
    S.days=data.days;if(/^\d{4}-\d{2}-\d{2}$/.test(data.start||''))S.start=data.start;
    impArm=false;save();render();toast('Données restaurées');
  }
});
document.addEventListener('visibilitychange',function(){
  if(document.visibilityState==='visible'&&(G||P))lockWake();
});

render();

if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)&&location.hostname!=='localhost'&&location.hostname!=='127.0.0.1'){
  navigator.serviceWorker.register('sw.js').catch(function(){});
}
})();
