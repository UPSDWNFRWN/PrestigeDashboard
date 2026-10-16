import React from 'react';
import {useLS} from './useLS.js';
import {taskStatus} from './access.js';
import RaidTab from './RaidTab.jsx';
import {useLogStatus,FailedNotice} from './LogStatus.jsx';
import {nbList} from './nb.js';
import {PageLine,Tiles,Star,Thin,toggleNum} from './ui.jsx';
import {storyProgress} from './story.js';
import {NbObj} from './NewBeginning.jsx';
import {slug,curLevel,planHideout,fmtTime,stName} from './hideout.js';
import {TASK_REWARD,TASK_MAP,TRADER_TASKS,TRADERS,TRADER_LL4,CQUESTS,COLLECTOR_ITEMS,cqKey} from './data.js';

const MAPS=['Ground Zero','Factory','Customs','Woods','Shoreline','Interchange','Reserve','Lighthouse','Streets','The Lab','Labyrinth'];
const wiki=n=>'https://escapefromtarkov.fandom.com/wiki/'+encodeURIComponent(n.replace(/ /g,'_'));
const REP_VALUE=40000; // planner weight: 1.00 reputation is treated as worth 40k XP when ranking

const Bar=({p,tone})=><Thin p={p} tone={tone} sm/>;

export default function PlanTab({cy,s,set,tg,go}){
  const [incl,setIncl]=useLS('tpp2_ui_incl_plan',false);
  const lvl=s.n.lvl||0,rub=s.n.rub||0,needCol=cy.tasks.includes('Collector');
  const llOf=t=>s.n['ll:'+t]||1;
  const [last,setLast]=React.useState(null);
  const ls=useLogStatus(s);
  const [fullAll,setFullAll]=useLS('tpp2_ui_plan_all',false);
  React.useEffect(()=>{if(!last)return;const h=setTimeout(()=>setLast(null),10000);return()=>clearTimeout(h)},[last]);
  const mark=(key,name)=>{tg(key);setLast({label:name,undo:()=>tg(key)})};
  const build=st=>{const prev=curLevel(s,cy,st.key);set('hl:'+st.key,st.l);setLast({label:stName(st.key)+' '+st.l,verb:'built',undo:()=>set('hl:'+st.key,prev)})};
  const Ctl=({c,full})=>{
    if(c.t==='done')return <button onClick={()=>mark(c.key,c.name)} className="rounded-lg border border-zinc-600 text-zinc-100 text-xs font-semibold px-3 py-1.5 whitespace-nowrap transition hover:border-green-400 hover:text-green-300">Mark done</button>;
    if(c.t==='num')return <span className="inline-flex flex-wrap sm:flex-nowrap items-center gap-2 max-w-full">{c.need!==undefined&&<button onClick={()=>{const prev=s.n[c.key]??0;toggleNum(s,set,c.key,c.need,prev);setLast({label:c.label+' '+c.need,verb:'reached',undo:()=>{set(c.key,prev||undefined);set('prev:'+c.key,undefined)}})}} className="rounded-lg border border-zinc-600 text-zinc-100 text-xs font-semibold px-3 py-1.5 whitespace-nowrap transition hover:border-green-400 hover:text-green-300">Mark reached</button>}<label className="text-xs text-zinc-400 inline-flex items-center gap-2 sm:whitespace-nowrap">{c.label}<input type="number" placeholder="0" min="0" max={c.max} step={c.step||1} value={s.n[c.key]??''} onChange={e=>set(c.key,e.target.value===''?undefined:+e.target.value)} className="bg-zinc-800 w-20 px-2 py-1 rounded text-sm text-zinc-100 text-right"/></label></span>;
    if(c.t==='ll')return <label className="text-xs text-zinc-400 inline-flex items-center gap-2">{c.tr} loyalty<select value={llOf(c.tr)} onChange={e=>set('ll:'+c.tr,+e.target.value)} className="bg-zinc-800 rounded px-1.5 py-1 text-zinc-100">{[1,2,3,4].map(n=><option key={n} value={n}>LL{n}</option>)}</select></label>;
    if(!full)return null;
    if(c.t==='nbobj')return <div className="w-full rounded-lg bg-black/20"><NbObj o={c.o} s={s} set={set} tg={tg}/></div>;
    if(c.t==='build')return c.list.length?<div className="grid gap-1 w-full">{c.list.map(st=><div key={st.key+st.l} className="flex items-center justify-between gap-2 rounded-lg bg-black/20 px-2 py-1.5 text-sm"><span>{stName(st.key)} <span className="text-zinc-500">→</span> Level {st.l}{st.forPrestige&&<span className="ml-2 text-xs text-amber-400">prestige</span>}<span className="ml-2 text-xs text-zinc-500">{fmtTime(st.t)}</span></span><button onClick={()=>build(st)} className="rounded-lg border border-zinc-600 text-zinc-100 text-xs font-semibold px-2.5 py-1 transition hover:border-green-400 hover:text-green-300">Mark built</button></div>)}</div>:<div className="text-xs text-zinc-400">Nothing is ready to build yet. Open the planner to see what each upgrade is waiting on.</div>;
    if(c.t==='cq')return <div className="grid gap-0.5 w-full">{CQUESTS.filter(q=>!s.c[cqKey(q)]).map(q=><label key={q.id} className="flex items-center gap-2 text-sm cursor-pointer rounded px-1 py-0.5 hover:bg-white/5"><input type="checkbox" checked={false} onChange={()=>mark(cqKey(q),q.name)} className="accent-amber-500 size-4"/>{q.name}<span className="text-xs text-zinc-500">{q.giver}</span></label>)}</div>;
    return null};
  const done=(t,x)=>!!s.c['tk:'+t+':'+x];

  // ---- which trader tasks can be started right now (same rules as the Available now view)
  const status=(t,x)=>taskStatus(s,t,x).st;
  const avail=[];let hiddenUnk=0;
  Object.entries(TRADER_TASKS).forEach(([t,l])=>l.forEach(x=>{if(done(t,x))return;const st=status(t,x);if(st==='ok'||(st==='unknown'&&incl))avail.push([t,x]);else if(st==='unknown')hiddenUnk++}));

  const lvlGap=Math.max(0,cy.lvl-lvl);
  const needLL4=needCol?TRADERS.filter(t=>llOf(t)<4):[];
  const taskScore=(t,x)=>{const [xp=0,rep=0]=TASK_REWARD[t+'|'+x]||[];return (lvlGap>0||!lvl?xp:0)+(needLL4.includes(t)?rep*REP_VALUE:0)};
  const mapsOf=(t,x)=>{const m=TASK_MAP[t+'|'+x];return !m?[]:m==='Any map'?['Any map']:m.split(', ')};
  const canGo=m=>!s.c['nm:'+m];
  const mapTasks=m=>avail.filter(([t,x])=>{const ms=mapsOf(t,x);return ms.includes(m)||ms.includes('Any map')});
  const byMap=MAPS.filter(canGo).map(m=>{
    const tasks=mapTasks(m).map(([t,x])=>({t,x,sc:taskScore(t,x),rw:TASK_REWARD[t+'|'+x]||[0,0]})).filter(o=>o.sc>0).sort((a,b)=>b.sc-a.sc);
    return {m,tasks,score:tasks.reduce((n,o)=>n+o.sc,0),xp:tasks.reduce((n,o)=>n+(o.rw[0]||0),0),rep:tasks.reduce((n,o)=>n+(o.rw[1]||0),0)};
  }).filter(o=>o.tasks.length).sort((a,b)=>b.score-a.score).slice(0,3);
  const nAccess=MAPS.filter(canGo).length;

  // ---- ordered list of everything still standing between you and the prestige
  const steps=[];
  cy.tasks.filter(t=>t!=='Collector'&&t!=='New Beginning'&&!s.c['t:'+t]).forEach(t=>steps.push({k:'t'+t,title:`Complete the task "${t}"`,why:'A prestige gate. It is not in the trader lists, so tick it in the readiness list on Overview once the game shows it done.',btn:['Overview','Overview'],ctl:[{t:'done',key:'t:'+t,name:t}]}));
  cy.story.filter(t=>!s.c['s:'+t]).forEach(t=>steps.push({k:'s'+t,title:`Finish the story chapter "${t}"`+(storyProgress(t,s)?` (${storyProgress(t,s).have}/${storyProgress(t,s).need} steps)`:''),why:'A prestige gate. Story chapters are fixed content, so they can run alongside your normal raids.',btn:['Overview','Overview'],ctl:[{t:'done',key:'s:'+t,name:t}]}));
  const hp=planHideout(s,cy),hdLeft=Object.entries(cy.hideout).filter(([k,m])=>hp.cur(slug(k))<m);
  if(hdLeft.length)steps.push({k:'hd',title:`Build ${hp.steps.length} hideout upgrade${hp.steps.length>1?'s':''} for the prestige`,why:`${hp.steps.filter(x=>x.ready).length} can be started now. Construction timers run in real time (about ${fmtTime(hp.steps.reduce((n,x)=>n+x.t,0))} in total), so start early and let them tick while you raid.`,list:hdLeft.map(([k,m])=>`${k} to level ${m} (now ${hp.cur(slug(k))})`),prog:[Object.keys(cy.hideout).length-hdLeft.length,Object.keys(cy.hideout).length],btn:['Hideout planner','Hideout'],btn2:['Materials','Hideout',{hsec:'mats'}],ctl:[{t:'build',list:hp.steps.filter(x=>x.ready).slice(0,5)}]});
  if(lvlGap>0)steps.push({k:'lvl',title:`Reach level ${cy.lvl}`,why:lvl?`${lvlGap} level${lvlGap>1?'s':''} to go. Quest XP is the steadiest source; the starred maps in the map picker below are the best for it.`:'Enter your current level on Overview so I can size this up.',prog:lvl?[lvl,cy.lvl]:null,btn:lvl?['Best maps for XP','Traders and Tasks',{view:'avail'}]:['Set level','Overview'],ctl:[{t:'num',key:'lvl',label:'Your level',max:79,need:cy.lvl}]});
  Object.entries(cy.skills).filter(([k,m])=>(s.n['k:'+k]||0)<m).forEach(([k,m])=>steps.push({k:'k'+k,title:`Train ${k} to ${m}`,why:k==='Endurance'?'Endurance trains by running while not overweight, so it builds up passively during raids.':'Skills build up as you play, so keep an eye on it but it rarely needs a dedicated raid.',prog:[s.n['k:'+k]||0,m],btn:['Update skills','Overview'],ctl:[{t:'num',key:'k:'+k,label:k+' level',max:51,need:m}]}));
  if(rub<cy.rub)steps.push({k:'rub',title:`Hold ${cy.rub}M roubles in your stash`,why:`${(cy.rub-rub).toFixed(1)}M to go. This builds up on its own as you sell loot, so leave it until the rest is close.`,prog:[rub,cy.rub],btn:['Loot guide','Loot'],ctl:[{t:'num',key:'rub',label:'Roubles (M)',max:999,step:0.1,need:cy.rub}]});
  if(needCol&&!s.c['t:Collector']){
    needLL4.forEach(t=>{const [l,r]=TRADER_LL4[t]||[];steps.push({k:'ll'+t,title:`${t} to loyalty level 4`,why:`Currently LL${llOf(t)}. Needs character level ${l} and reputation ${r?.toFixed(2)}. Rep tasks for ${t} are ranked in the maps below.`,prog:[llOf(t),4],btn:['Open '+t,'Traders and Tasks',{view:'trader',trader:t}],ctl:[{t:'ll',tr:t}]})});
    const q=CQUESTS.filter(q=>!s.c[cqKey(q)]);
    if(q.length)steps.push({k:'cq',title:`Collector gate quests (${CQUESTS.length-q.length}/${CQUESTS.length})`,why:'These feed into The Collector. See Traders and Tasks → Collector for the objectives.',list:q.map(x=>`${x.name}${(x.maps||[]).length?' (' + x.maps.join('/') + ')':''}`),btn:['Collector','Traders and Tasks',{view:'collector'}],ctl:[{t:'cq'}]});
    const it=COLLECTOR_ITEMS.filter(i=>!s.c['ci:'+i.n]).length;
    if(it)steps.push({k:'ci',title:`Find ${it} Collector item${it>1?'s':''} in raid`,why:'Only items Found in Raid count. Keep them in your stash when you pick one up.',prog:[COLLECTOR_ITEMS.length-it,COLLECTOR_ITEMS.length],btn:['Collector','Traders and Tasks',{view:'collector'}]});
  }

  if(cy.tasks.includes('New Beginning')&&!s.c['t:New Beginning']){
    const nb=nbList(cy,s),left=nb.filter(o=>!o.done),nbMaps=[...new Set(left.flatMap(o=>o.maps||[]))];
    steps.push({k:'tNew Beginning',title:left.length?`New Beginning: ${left.length} objective${left.length>1?'s':''} left`:'Complete the task "New Beginning"',
      why:left.length?(steps.length?'This task unlocks the prestige itself, so it comes last, but its kills and figurines can build up during normal raids.':'Every other gate is met. Finish these objectives, then tick New Beginning on Overview.')+(nbMaps.length?` Maps involved: ${nbMaps.join(', ')}.`:''):'Every objective is done. Complete the task in game, then tick it on Overview.',
      list:left.slice(0,6).map(o=>o.need>1?`${o.label} (${o.have}/${o.need})`:o.label),prog:nb.length?[nb.length-left.length,nb.length]:null,btn:['Overview','Overview'],
      ctl:[...left.slice(0,4).map(o=>({t:'nbobj',o})),{t:'done',key:'t:New Beginning',name:'New Beginning'}]});}

  const nxt=steps[0];
  return <div className="grid gap-3">
    <FailedNotice failed={ls.failed} s={s}/>
    {last&&<div role="status" className="rounded-xl border border-green-400/30 bg-green-400/5 px-3 py-2 text-sm text-green-200 flex items-center justify-between gap-2"><span>“{last.label}” {last.verb||'marked done'}.</span><span className="flex gap-3"><button onClick={()=>{last.undo();setLast(null)}} className="font-semibold underline underline-offset-2">Undo</button><button onClick={()=>setLast(null)} aria-label="Dismiss" className="text-zinc-400 hover:text-zinc-100">✕</button></span></div>}
    <PageLine>What to do next, in order. Suggestions use your level, loyalty levels, karma, accessible maps and ticked tasks. <button onClick={()=>go('Overview')} className="lnk">Edit your level and skills on Overview</button>. Loyalty levels and karma are on Traders and Tasks (under Available now, and on each trader's page), and map access is below.</PageLine>
    <Tiles items={[['Left to do',steps.length,'in suggested order'],['PMC level',(s.n.lvl||0)+'/'+cy.lvl,cy.lvl>(s.n.lvl||0)?(cy.lvl-(s.n.lvl||0))+' to go':'reached'],['Roubles',(s.n.rub||0)+'M',`goal ${cy.rub}M`],['Tasks done',Object.keys(s.c).filter(k=>k.startsWith('tk:')&&s.c[k]).length,'ticked so far']]}/>

    {steps.length===0
      ?<div className="rounded-xl border border-green-400/40 bg-green-400/5 p-4"><div className="font-bold text-green-300">Every gate is ticked off</div><div className="text-sm text-zinc-300 mt-1">Open the Prestige tab in game and confirm it lets you continue.</div></div>
      :<div className="rounded-xl border border-zinc-800 border-l-4 !border-l-amber-500 bg-zinc-900 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1 basis-80">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-500">Next best action</div>
            <div className="text-lg font-bold leading-6 mt-0.5">{nxt.title}</div>
            <div className="text-sm text-zinc-400 mt-1">{nxt.why}</div>
            {nxt.list&&<ul className="mt-2 text-sm text-zinc-300 list-disc ml-5">{nxt.list.slice(0,6).map(x=><li key={x}>{x}</li>)}{nxt.list.length>6&&<li>and {nxt.list.length-6} more</li>}</ul>}</div>
          <div className="flex flex-wrap items-center gap-2">{nxt.ctl&&nxt.ctl.map((c,i)=><React.Fragment key={i}>{Ctl({c,full:true})}</React.Fragment>)}
            {nxt.btn2&&<button onClick={()=>go(nxt.btn2[1],nxt.btn2[2])} className="rounded-lg border border-zinc-600 text-sm font-medium px-3 py-1.5 hover:bg-white/5">{nxt.btn2[0]}</button>}
            {nxt.btn&&<button onClick={()=>go(nxt.btn[1],nxt.btn[2])} className="rounded-lg bg-amber-500 text-black text-sm font-semibold px-3 py-1.5 hover:bg-amber-400">{nxt.btn[0]}</button>}</div>
        </div>
        {nxt.prog&&<div className="mt-3"><Bar p={nxt.prog[0]/nxt.prog[1]*100}/><div className="text-xs text-zinc-500 mt-1">{nxt.prog[0]} / {nxt.prog[1]}</div></div>}
      </div>}


    <section className="grid gap-2">
      <div className="flex items-baseline gap-2"><span className="text-xs text-zinc-500"><Star/> marks the best maps right now, ranked by {lvlGap>0||!lvl?'XP':''}{(lvlGap>0||!lvl)&&needLL4.length?' and ':''}{needLL4.length?'rep for traders still below LL4':''}</span></div>
      <RaidTab cy={cy} s={s} set={set} tg={tg} best={byMap.map(o=>o.m)}/>
    </section>

    {steps.length>1&&<section>
      <div className="flex items-baseline gap-2 mb-2"><h3 className="text-lg font-bold text-amber-500">Full plan</h3><span className="text-xs text-zinc-500">{steps.length} things left, in suggested order</span></div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 grid gap-2">{(fullAll?steps:steps.slice(0,8)).map((st,i)=><div key={st.k} className="flex items-center gap-3 rounded-lg px-1 py-0.5">
        <span className={'grid place-items-center size-6 shrink-0 rounded-full text-xs font-bold border '+(i===0?'border-amber-500 text-amber-400':'border-zinc-600 text-zinc-400')}>{i+1}</span>
        <div className="min-w-0 flex-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="font-medium min-w-0 flex-1 basis-60">{st.title}</span>
          <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap sm:shrink-0 max-w-full">
            <span className="w-24 sm:w-28 shrink-0">{st.prog&&<Bar p={st.prog[0]/st.prog[1]*100}/>}</span>
            <span className="sm:w-80 sm:shrink-0 flex flex-wrap sm:flex-nowrap items-center sm:justify-end gap-2">{st.ctl&&st.ctl.map((c,i)=><React.Fragment key={i}>{Ctl({c})}</React.Fragment>)}</span>
            <span className="sm:w-32 sm:shrink-0 sm:text-right">{st.btn&&<button onClick={()=>go(st.btn[1],st.btn[2])} className="lnk text-xs whitespace-nowrap">{st.btn[0]}</button>}</span></div>
        </div></div>)}
        {steps.length>8&&<button onClick={()=>setFullAll(a=>!a)} className="lnk text-sm justify-self-start">{fullAll?'Show fewer':`Show all ${steps.length} steps`}</button>}
        <div className="text-xs text-zinc-500">Order: other gate tasks and story chapters, hideout timers, level, skills, roubles, Collector steps, and finally New Beginning, which unlocks the prestige. Skills and roubles build up while you do the rest, so they sit later.</div>
      </div>
    </section>}
    <label className="flex items-start gap-2 text-xs text-zinc-400 cursor-pointer"><input type="checkbox" checked={incl} onChange={e=>setIncl(e.target.checked)} className="accent-amber-500 mt-0.5"/><span>Also suggest tasks the dashboard cannot fully check: ones with a hidden game-state requirement in the data (such as Escort), ones that need a task from an untracked trader (such as BTR Driver), a Fence task when karma is not entered, or a task that needs an earlier one to be failed{hiddenUnk>0&&!incl?` · ${hiddenUnk} hidden`:''}.</span></label>
    <div className="text-xs text-zinc-500">Only tasks you can start now are suggested: level, loyalty levels, scav karma (Fence) and earlier tasks (from your ticks) must all be met. Tasks the data gates behind something the dashboard cannot read are hidden unless you tick the box above. Suggestions are a planning heuristic, not game data. Task rewards are base values from the PvE data.</div>
  </div>;
}
