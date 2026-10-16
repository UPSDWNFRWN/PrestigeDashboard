import React from 'react';
import {useLS} from './useLS.js';
import {TRADER_TASKS,TRADERS,TASK_REQ,PREREQ} from './data.js';
import ImportShots from './ImportShots.jsx';
import {HID,slug,stName,maxLvl} from './hideout.js';
import {Thin,Pips,Empty,PlayerChip,FACTION,Done,CheckGlyph,NewPip,playName,Pill} from './ui.jsx';
import {useSetupNew} from './setupNew.js';

const STEPS=['Profile','Level','Traders','Maps','Tasks','Review','Hideout'];
const MAPS=['Ground Zero','Factory','Customs','Woods','Shoreline','Interchange','Reserve','Lighthouse','Streets','The Lab','Labyrinth'];
const wiki=n=>'https://escapefromtarkov.fandom.com/wiki/'+encodeURIComponent(n.replace(/ /g,'_'));
const tracked=k=>{const i=k.indexOf('|');return !!TRADER_TASKS[k.slice(0,i)]&&TRADER_TASKS[k.slice(0,i)].includes(k.slice(i+1))};
const ck=k=>'tk:'+k.replace('|',':');
const REV={};
Object.entries(TRADER_TASKS).forEach(([t,l])=>l.forEach(x=>(PREREQ[t+'|'+x]||[]).forEach(p=>{if(tracked(p))(REV[p]=REV[p]||[]).push(t+'|'+x)})));

// Ticking a task also ticks everything it needs; unticking a task also unticks everything that needs it.
const mark=(setS,key,on)=>setS(o=>{const c={...o.c},seen=new Set();
  const walk=k=>{if(seen.has(k))return;seen.add(k);c[ck(k)]=on;(on?(PREREQ[k]||[]).filter(tracked):(REV[k]||[])).forEach(walk)};
  walk(key);return {...o,c}});

const Btn=({on,children,...p})=><button {...p} className={'rounded-xl border px-4 py-3 text-left transition flex flex-col justify-start items-stretch '+(on?'border-amber-500 bg-amber-500/10':'border-zinc-700 hover:border-zinc-500')+' '+(p.className||'')}>{children}</button>;

// Big choice card for the first setup question: icon, title, what it means, and how many steps it takes.
const ICON={fresh:<><path d="M5 21V4"/><path d="M5 5h11l-2 3.5 2 3.5H5"/></>,going:<><path d="M4 20V13"/><path d="M10 20V8"/><path d="M16 20V11"/><path d="M22 20H2"/><path d="M13 5.5l3-3 3 3"/></>};
const Choice=({icon,title,desc,steps,onClick})=><button onClick={onClick} className="choice group rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-left flex flex-col gap-3 transition duration-200">
  <span className="flex items-center justify-between gap-3">
    <span className="grid place-items-center size-11 rounded-full border border-amber-500/50 bg-amber-500/10 text-amber-500"><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICON[icon]}</svg></span>
    <span className="rounded-full border border-zinc-700 px-2.5 py-0.5 text-xs text-zinc-400">{steps}</span></span>
  <span className="grid gap-1"><span className="text-lg font-bold" style={{fontFamily:"'Oxanium',ui-sans-serif,system-ui,sans-serif"}}>{title}</span><span className="text-sm text-zinc-400">{desc}</span></span>
  <span className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition group-hover:text-amber-500">Choose this <svg viewBox="0 0 16 16" className="size-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg></span></button>;


function ImportBanner({cy,s,setS,title,text,className=''}){
  return <div className={'rounded-xl border border-sky-500/40 bg-sky-500/5 p-4 flex flex-wrap items-center justify-between gap-3 '+className}>
    <div className="min-w-0 flex-1 basis-64"><div className="font-semibold text-sky-300">{title}</div><div className="text-xs text-zinc-400 mt-0.5">{text}</div></div>
    <ImportShots cy={cy} s={s} setS={setS} big/></div>;
}

function ResetAll(){
  const [ask,setAsk]=React.useState(false);
  const go=()=>{try{Object.keys(localStorage).filter(k=>k.startsWith('tpp2_')).forEach(k=>localStorage.removeItem(k))}catch(e){}window.location.reload()};
  return <div className={'rounded-xl border text-sm '+(ask?'border-red-400/40 bg-red-400/10 p-3':'border-zinc-800 px-3 py-2')}>
    {!ask?<div className="flex flex-wrap items-center justify-between gap-2"><div className="text-xs text-zinc-500">Want a clean slate? Reset everything and start as a brand new user.</div>
      <button onClick={()=>setAsk(true)} className="rounded-lg border border-zinc-700 text-zinc-400 px-2.5 py-1 text-xs transition hover:border-red-400/50 hover:text-red-300">Reset all</button></div>
    :<div role="alert" className="grid gap-2"><div className="text-red-300"><b>Delete all saved data?</b> This erases every prestige: setup, levels, loyalty, ticked tasks, hideout progress, stash counts and maps. It cannot be undone.</div>
      <div className="flex gap-2"><button onClick={go} className="rounded-lg bg-red-500 text-white font-semibold px-3 py-1.5 text-sm">Yes, erase everything</button><button onClick={()=>setAsk(false)} className="rounded-lg border border-zinc-600 px-4 py-1.5 text-xs hover:bg-white/5">Cancel</button></div></div>}</div>;
}

// The step row at the top of the setup. The first step is always the prestige picker.
// onStep(i): steps already passed are buttons you can go back to. With allDone (someone who has already been through setup) every other step is a button and counts as done, so they can jump to any page.
// Slim keycard at the top of the setup pages, so you can see which prestige you are setting up.
const SetupCard=({p,name,faction})=><div className={'kc kc-prog kc-p'+p+' border relative flex overflow-hidden min-h-[4.25rem]'}>
  <div className="relative z-[1] flex flex-1 items-stretch"><div className="flex-1 min-w-0 pl-4 pr-3 py-2.5 flex items-center gap-3.5">
    <span className="kc-slot" aria-hidden="true"/>
    <div className="min-w-0 flex flex-col justify-center gap-1"><span className="kc-eyebrow leading-none">Setting up</span><span className="kc-title text-base font-bold uppercase tracking-wider whitespace-nowrap">{playName(p)}</span></div>
    <span className="ml-auto"><PlayerChip name={name} faction={faction}/></span></div>
    <span className="kc-band" aria-hidden="true"><span>Setup</span></span></div></div>;

// Heading above each setup page: which step you are on, what it asks, and why.
export const StepHead=({n,of,eyebrow,title,hint,right})=><div className="px-1 flex flex-wrap items-start justify-between gap-x-4 gap-y-2"><div className="grid gap-1 min-w-0"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-500">{eyebrow||`Step ${n} of ${of}`}</div><h2 className="text-xl font-bold">{title}</h2>{hint&&<div className="text-sm text-zinc-400 max-w-3xl">{hint}</div>}</div>{right}</div>;
// The one card above every setup page: the step row, with a short line about the setup. Same on the prestige picker, the "Where are you?" page and every step.
export const SetupHead=({line,names,pos,fresh,onFirst,onStep,allDone})=><div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
  <div className="text-lg font-bold">Set up your tracker</div>
  <div className="text-xs text-zinc-400">{line}</div>
  <SetupSteps names={names} pos={pos} fresh={fresh} onFirst={onFirst} onStep={onStep} allDone={allDone}/>
</div>;
const PANEL="rounded-xl border border-zinc-800 bg-zinc-900 p-5";

export function SetupSteps({names,pos,fresh=[],onFirst,onStep,allDone}){
  const all=['Prestige',...names];
  const frac=allDone?100:(pos+1)/all.length*100;
  return <div className="mt-3 grid gap-2"><div className="flex items-center justify-between gap-2">{all.map((n,i)=>{const on=i===pos,done=allDone?!on:i<pos;
    const inner=<><span className={'relative grid place-items-center size-5 rounded-full border text-xs '+(on?'border-amber-500':done?'border-amber-500 bg-amber-500 text-black':'border-zinc-600')}>{done?<CheckGlyph/>:i+1}{fresh.includes(n)&&<NewPip label={n+' is new or changed'} className="-top-1.5 -right-1.5"/>}</span><span className="hidden sm:inline">{n}</span></>;
    const cls='flex items-center gap-1.5 text-xs '+(on?'text-amber-500 font-semibold':done?'text-zinc-300':'text-zinc-500');
    return <React.Fragment key={n}>
      {i===0&&onFirst&&!on?<button onClick={onFirst} title="Choose a different prestige" className={cls+' hover:text-amber-400'}>{inner}</button>:onStep&&!on&&(allDone||i<pos)?<button onClick={()=>onStep(i)} title={'Go to '+n} aria-label={'Go to '+n} className={cls+' hover:text-amber-400 rounded'}>{inner}</button>:<div className={cls}>{inner}</div>}
      </React.Fragment>})}</div><Thin p={frac} tone="bg-amber-500" sm/></div>;
}

export default function Wizard({cy,s,set,setS,tg,finish,skip,changePrestige}){
  const fresh=s.n.start==='fresh';
  const re=!!s.n.wizRe||s.n.wizSkip!==undefined; // finished (or skipped) setup before and came back to change something
  const order=fresh?[0]:[0,1,2,3,6,4,5];
  const wk='tpp2_ui_wiz_'+cy.p;
  const [W,setW]=useLS(wk,{pos:0,seen:{},sure:false});
  const pos=Math.min(W.pos||0,order.length-1),setPos=v=>setW(o=>({...o,pos:v}));
  const sn=useSetupNew();React.useEffect(()=>{sn.seen(STEPS[order[pos]])},[pos,sn.fresh.join('|')]); // looking at a step clears its new pip
  const seen=W.seen||{},setSeen=f=>setW(o=>({...o,seen:typeof f==='function'?f(o.seen||{}):f}));
  const sure=!!W.sure,setSure=v=>setW(o=>({...o,sure:v}));
  const clearW=()=>{try{localStorage.removeItem(wk)}catch{}};
  const step=order[pos];
  const reqK={};Object.entries(cy.hideout).forEach(([n,l])=>{reqK[slug(n)]=l});
  const [trader,setTrader]=React.useState(Object.keys(TRADER_TASKS)[0]);
  const [q,setQ]=React.useState('');
  const [warn,setWarn]=React.useState(false);
  const names=Object.keys(TRADER_TASKS);
  const done=(t,x)=>!!s.c['tk:'+t+':'+x];
  const cnt=t=>TRADER_TASKS[t].filter(x=>done(t,x)).length;
  const total=names.reduce((n,t)=>n+cnt(t),0);
  const lvl=s.n.lvl||0;
  const allSeen=names.every(t=>seen[t]);
  const canGo=m=>!s.c['nm:'+m],nMaps=MAPS.filter(canGo).length;
  const can=[!!s.n.faction&&!!(s.n.name||'').trim(),lvl>=1&&lvl<=79,true,nMaps>0,re||(allSeen&&sure),true,true][step];
  const pick=t=>{setTrader(t);setSeen(o=>({...o,[t]:true}));setQ('')};
  React.useEffect(()=>{if(step===4)setSeen(o=>({...o,[trader]:true}))},[step]);

  const list=TRADER_TASKS[trader].filter(x=>!q||x.toLowerCase().includes(q.toLowerCase()));
  const begin=mode=>setS(o=>{const n={...o.n,start:mode},c={...o.c};
    if(mode==='fresh'){n.lvl=1;Object.keys(n).forEach(k=>{if(k.startsWith('hl:'))delete n[k]});TRADERS.forEach(t=>{n['ll:'+t]=1});Object.keys(c).forEach(k=>{if(k.startsWith('tk:'))delete c[k]})}
    return {...o,n,c}});
  if(!s.n.start)return <div className="grid gap-3">
    <SetupCard p={cy.p} name={s.n.name} faction={s.n.faction}/>
    <SetupHead line="Everything the planner suggests depends on these answers, so each step is required." names={['Profile','Level','Traders','Maps','Hideout','Tasks','Review']} pos={0.5} fresh={sn.fresh} onFirst={changePrestige}/>
    <StepHead eyebrow="Choose your setup" title="Where are you?" hint="This decides how much setup you need. You can change any answer later."/>
    {sn.any&&<div className="relative rounded-xl border border-purple-400/30 bg-purple-400/5 pl-9 pr-4 py-3 text-sm text-zinc-300"><NewPip label="New or changed in setup" className="left-4 top-4"/>Setup has changed since you last went through it: <b className="text-purple-300">{sn.fresh.join(', ')}</b>. Look for the purple dot on those steps.</div>}
    <div className="grid sm:grid-cols-2 gap-3">
      <Choice icon="fresh" title="I am just starting this prestige" desc="Level 1, trader loyalty level 1 and no tasks done are assumed. You only enter your name and faction." steps="Quick setup" onClick={()=>begin('fresh')}/>
      <Choice icon="going" title="I am already in progress" desc="Enter your level, trader loyalty levels, maps and the tasks you have finished." steps="Full setup" onClick={()=>begin('going')}/></div><ResetAll/></div>;
  return <div className="grid gap-3">
    <SetupCard p={cy.p} name={s.n.name} faction={s.n.faction}/>
    <SetupHead line={<>{fresh?'You are starting this prestige now, so level 1, loyalty level 1, an empty hideout and no finished tasks are assumed. Every map starts as accessible, and you can change that later on the Planning tab. Just your name and faction to enter.':'Everything the planner suggests depends on these answers, so each step is required.'} <button onClick={()=>set('start',undefined)} className="lnk">Change</button></>} names={order.map(o=>STEPS[o])} pos={pos+1} fresh={sn.fresh} onFirst={changePrestige} onStep={i=>setPos(i-1)} allDone={re}/>

    {step===0&&<>
      <StepHead n={pos+2} of={order.length+1} title="Your profile" hint="Your PMC name and faction. Both are required, and both are only shown on this dashboard."/>
      <div className={PANEL+' grid gap-6'}>
        <label className="grid gap-1.5"><span className="font-semibold">PMC name</span>
          <input type="text" value={s.n.name||''} maxLength={24} onChange={e=>set('name',e.target.value)} placeholder="Your in-game name" aria-label="PMC name" required className="w-full sm:w-80 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"/>
          <span className="text-xs text-zinc-500">Saved with your profile, nowhere else.</span></label>
        <div className="grid gap-2"><div><div className="font-semibold">Faction</div><div className="text-xs text-zinc-500">BEAR and USEC share the same task names in the data, so this does not change any lists.</div></div>
          <div className="grid grid-cols-2 gap-3">{['BEAR','USEC'].map(f=>{const c=FACTION[f],on=s.n.faction===f;return <button key={f} onClick={()=>set('faction',f)} aria-pressed={on} style={{backgroundColor:c.bg,color:c.fg,borderColor:on?c.fg:'#3f3f46',opacity:on?1:0.75,boxShadow:on?'0 0 0 1px '+c.fg:'none'}} className="rounded-xl border px-4 py-4 text-left transition hover:!opacity-100 flex items-center justify-between"><span className="patch-font text-lg tracking-widest">{f}</span>{on&&<span className="size-5"><CheckGlyph className="size-5"/></span>}</button>})}</div></div>
      </div></>}

    {step===1&&<>
      <StepHead n={pos+2} of={order.length+1} title="What is your current PMC level?" hint="Used to hide tasks you cannot start yet and to work out how many levels you still need."/>
      <div className={PANEL+' grid gap-4'}>
        <div className="flex items-center gap-3">
          <button onClick={()=>set('lvl',Math.max(1,lvl-1))} aria-label="Lower level by one" className="size-11 rounded-full border border-zinc-700 text-xl text-zinc-300 transition hover:border-zinc-500 hover:bg-white/5">−</button>
          <input type="number" min="1" max="79" autoFocus value={s.n.lvl??''} onChange={e=>set('lvl',+e.target.value)} className="no-spin patch-font !w-28 !text-center !text-3xl !py-2 !rounded-xl" placeholder="1 to 79" aria-label="PMC level"/>
          <button onClick={()=>set('lvl',Math.min(79,lvl+1))} aria-label="Raise level by one" className="size-11 rounded-full border border-zinc-700 text-xl text-zinc-300 transition hover:border-zinc-500 hover:bg-white/5">+</button></div>
        {s.n.lvl!==undefined&&s.n.lvl!==''&&!(lvl>=1&&lvl<=79)&&<div className="text-xs text-red-300">Enter a level between 1 and 79.</div>}
        <div className="grid gap-1.5"><Thin p={lvl/cy.lvl*100} sm/><div className="text-xs text-zinc-400">{lvl>=cy.lvl?'You have reached the level '+playName(cy.p)+' needs ('+cy.lvl+').':'Goal for '+playName(cy.p)+': level '+cy.lvl+'. '+(lvl>0?(cy.lvl-lvl)+' to go.':'')}</div></div>
      </div></>}

    {step===2&&<>
      <StepHead n={pos+2} of={order.length+1} title="Your trader loyalty levels" hint="Pick the loyalty level you have with each trader right now. Tasks locked behind a higher level will be hidden."/>
      <ImportBanner cy={cy} s={s} setS={setS} title="Import from a screenshot" text="Add a screenshot of the in-game Traders screen. Each trader's loyalty level is read from it, and you can check the result before it is applied."/>
      <div className={PANEL+' !p-0 overflow-hidden'}>
        <div className="divide-y divide-zinc-800">{TRADERS.map(t=><div key={t} className="flex items-center justify-between gap-3 px-5 py-2.5"><span className="font-medium">{t}</span>
          <div className="flex gap-1.5" role="group" aria-label={t+' loyalty level'}>{[1,2,3,4].map(n=>{const on=(s.n['ll:'+t]||1)===n;return <button key={n} onClick={()=>set('ll:'+t,n)} aria-pressed={on} className={'size-9 rounded-full border text-sm font-medium transition '+(on?'border-amber-500 bg-amber-500 text-black font-bold':'border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-white/5')}>{n}</button>})}</div></div>)}</div>
        <label className="flex items-center justify-between gap-3 px-5 py-3 border-t border-zinc-700 text-sm bg-black/20"><span>Scav karma <span className="text-xs text-zinc-500">(optional, used for Fence tasks)</span></span>
          <input type="number" step="0.1" value={s.n.karma??''} onChange={e=>set('karma',e.target.value===''?undefined:+e.target.value)} className="!w-24"/></label>
      </div></>}

    {step===3&&<>
      <StepHead n={pos+2} of={order.length+1} title="Which maps can you access?" hint="Tick the maps you can and will run right now. Map suggestions on the Planning tab only use these. All are ticked to start with, so untick any you cannot access."/>
      <div className={PANEL+' grid gap-4'}>
        <div className="flex flex-wrap gap-2">{MAPS.map(m=>{const on=canGo(m);return <Pill key={m} on={on} aria-pressed={on} onClick={()=>tg('nm:'+m)}>{on&&<CheckGlyph className="inline size-3.5 mr-1.5 align-[-2px]"/>}<span className={on?'':'line-through text-zinc-500'}>{m}</span></Pill>})}</div>
        <div className="flex items-center justify-between gap-3 text-xs border-t border-zinc-800 pt-3"><span className={nMaps?'text-zinc-400':'text-red-300'}>{nMaps?nMaps+' of '+MAPS.length+' maps selected':'Select at least one map to continue.'}</span>
          <span className="flex gap-2"><button onClick={()=>MAPS.forEach(m=>{if(!canGo(m))tg('nm:'+m)})} className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-300 transition hover:border-zinc-500 hover:bg-white/5">All</button><button onClick={()=>MAPS.forEach(m=>{if(canGo(m))tg('nm:'+m)})} className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-300 transition hover:border-zinc-500 hover:bg-white/5">None</button></span></div>
      </div></>}

    {step===4&&<>
      <StepHead n={pos+2} of={order.length+1} title="Your finished tasks" hint="Work through each trader below and tick everything you have finished. Ticking a task also ticks the tasks that lead up to it, and unticking one unticks the ones that come after it. Open every trader at least once to continue."/>
      <ImportBanner cy={cy} s={s} setS={setS} title="Import from screenshots" text="Add screenshots of your in-game task lists. Finished tasks are read from them and ticked for you, then you can check the result below."/>
      <div className="flex flex-wrap gap-2 max-sm:grid max-sm:grid-cols-3">{names.map(t=>{const on=t===trader,n=cnt(t),tot=TRADER_TASKS[t].length;return <button key={t} onClick={()=>pick(t)} aria-pressed={on} className={'rounded-xl border px-3 py-2 text-left min-w-[104px] max-sm:min-w-0 max-sm:w-full max-sm:px-2 transition '+(on?'border-amber-500 bg-amber-500/10':'border-zinc-800 bg-zinc-900 hover:border-zinc-600')}>
          <div className={'text-sm font-bold flex items-center justify-between gap-2 '+(on?'text-amber-500':'')}>{t}{seen[t]&&<Done className="!mr-0"/>}</div>
          <div className="text-xs text-zinc-400 mb-1">{n}/{tot}</div><Thin p={tot?n/tot*100:0} tone={n===tot?'bg-green-500':'bg-amber-500'} sm/></button>})}</div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <input type="text" value={q} onChange={e=>setQ(e.target.value)} placeholder={'Search '+trader+' tasks'} aria-label={'Search '+trader+' tasks'} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none"/>
          <div className="flex gap-2 text-xs"><button onClick={()=>TRADER_TASKS[trader].forEach(x=>mark(setS,trader+'|'+x,true))} className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-300 transition hover:border-zinc-500 hover:bg-white/5">Tick all</button><button onClick={()=>TRADER_TASKS[trader].forEach(x=>mark(setS,trader+'|'+x,false))} className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-300 transition hover:border-zinc-500 hover:bg-white/5">Clear all</button></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-0.5">{list.map(x=>{const r=TASK_REQ[trader+'|'+x],on=done(trader,x);return <label key={x} className="flex items-center gap-3 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-white/5">
          <input type="checkbox" checked={on} onChange={()=>mark(setS,trader+'|'+x,!on)} className="accent-amber-500 size-4"/>
          <a href={wiki(x)} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className={'hover:underline hover:text-amber-400 '+(on?'text-zinc-500':'')}>{x}</a>
          {r&&r[0]>0&&<span className="text-xs text-zinc-500">Lv {r[0]}</span>}</label>})}
          {list.length===0&&<div className="sm:col-span-2"><Empty icon="search" title="No tasks match" hint="Check the spelling or try part of the name." c="mt-2"/></div>}</div>
      </div>
      <label className={'flex items-start gap-3 text-sm rounded-xl border p-4 '+(allSeen?(sure?'border-green-400/50 bg-green-400/5 cursor-pointer':'border-zinc-700 cursor-pointer'):'border-zinc-800 opacity-60')}><input type="checkbox" disabled={!allSeen} checked={sure} onChange={e=>setSure(e.target.checked)} className="accent-amber-500 mt-0.5"/><span>I have ticked every task I have finished, on every trader{!allSeen&&<span className="block text-xs text-zinc-500 mt-0.5">Open all {names.length} traders first. Still to open: {names.filter(t=>!seen[t]).join(', ')}.</span>}</span></label>
    </>}

    {step===6&&(()=>{const need=Object.keys(reqK),met=need.filter(k=>(s.n['hl:'+k]||0)>=reqK[k]).length;return <>
      <StepHead n={pos+2} of={order.length+1} title="What have you built in your hideout?" hint="Pick the level each module is at, or 0 if it is not built. The hideout planner uses this to work out what you still need to build and gather."/>
      {need.length>0&&<div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 grid gap-2"><div className="flex items-center justify-between gap-3 text-sm"><span>Needed for {playName(cy.p)}</span><span className="font-semibold">{met} of {need.length} at the right level</span></div><Thin p={met/need.length*100} tone={met===need.length?'bg-green-500':'bg-amber-500'} sm/></div>}
      <div className="grid sm:grid-cols-2 gap-2">{Object.keys(HID).sort((a,b)=>(!!reqK[b]-!!reqK[a])||stName(a).localeCompare(stName(b))).map(k=>{const mx=maxLvl(k),c=s.n['hl:'+k]||0;return <div key={k} className={'rounded-xl border bg-zinc-900 p-3 '+(reqK[k]?'border-amber-500/40':'border-zinc-800')}>
        <div className="flex items-center justify-between gap-2 text-sm"><span className="font-medium">{stName(k)}</span><span className="flex items-center gap-2">{mx>0&&<Pips max={mx} built={c} need={reqK[k]||0}/>}{reqK[k]&&<span className="text-xs text-amber-500">needs {reqK[k]}</span>}</span></div>
        <div className="mt-2 inline-flex rounded-lg border border-zinc-700 overflow-hidden">{Array.from({length:mx+1},(_,n)=><button key={n} onClick={()=>set('hl:'+k,n)} className={'px-3 py-1 text-sm font-medium transition '+(c===n?'bg-amber-500 text-black font-semibold':'hover:bg-white/5')}>{n}</button>)}</div></div>})}</div>
    </>})()}

    {step===5&&(()=>{const T=({label,st,span,children})=><div className={'rounded-xl border border-zinc-800 bg-zinc-900 p-4 '+(span?'sm:col-span-2':'')}><div className="flex items-center justify-between gap-2"><div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</div>{order.includes(st)&&<button onClick={()=>setPos(order.indexOf(st))} className="text-xs text-zinc-400 underline underline-offset-2 transition hover:text-amber-500">Edit</button>}</div><div className="mt-1 text-sm">{children}</div></div>;
      return <>
      <StepHead n={pos+2} of={order.length+1} title="Check your setup" hint="This is what the planner will use. You can change any of it later: Edit jumps back to that page, and Run Setup at the top reopens all of this."/>
      <div className="grid sm:grid-cols-2 gap-2">
        <T label="PMC name" st={0}><b className="text-base">{s.n.name||'Not set'}</b></T>
        <T label="Faction" st={0}><b className="text-base">{s.n.faction}</b></T>
        <T label="Level" st={1}><b className="text-base">{lvl}</b> <span className="text-zinc-500">of {cy.lvl} needed</span></T>
        <T label="Tasks finished" st={4}><b className="text-base">{total}</b> <span className="text-zinc-500">of {names.reduce((n,t)=>n+TRADER_TASKS[t].length,0)}</span></T>
        <T label="Loyalty levels" st={2} span>{TRADERS.map(t=>t+' '+(s.n['ll:'+t]||1)).join(' · ')}</T>
        <T label="Maps you can access" st={3} span>{MAPS.filter(canGo).join(' · ')}</T>
        <T label="Hideout built" st={6} span>{Object.keys(HID).filter(k=>s.n['hl:'+k]>0).map(k=>stName(k)+' '+s.n['hl:'+k]).join(', ')||'Nothing built yet'}</T>
      </div></>})()}

    {warn&&<div role="alert" className="rounded-xl border border-amber-400/40 bg-amber-400/5 p-4 text-sm text-amber-200 grid gap-2">
      <div className="font-semibold">Skip setup?</div>
      <div>Anything you have entered so far is kept. But the dashboard will be <b>less accurate</b> until you fill in the rest: an unset level counts as level 1, unset loyalty levels count as LL1, and tasks you have not ticked count as not done, so the Planning tab may suggest tasks you cannot actually start or have already finished. You will need to add this information yourself in the Overview checklist and on Traders and Tasks, or reopen the wizard with “Run Setup”.</div>
      <div className="flex gap-2"><button onClick={()=>{clearW();skip()}} className="rounded-lg bg-amber-500 text-black font-semibold px-3 py-1.5 text-sm">Skip anyway</button><button onClick={()=>setWarn(false)} className="rounded-lg border border-zinc-600 px-4 py-1.5 text-sm hover:bg-white/5">Keep going</button></div></div>}

    <div className="sticky bottom-3 z-20 flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-[#0e0f11]/90 backdrop-blur px-3 py-2.5 shadow-lg shadow-black/40">
      <button disabled={pos===0} onClick={()=>setPos(pos-1)} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm disabled:opacity-30 hover:bg-white/5">Back</button>
      <span className="hidden sm:block text-xs text-zinc-500">Step {pos+2} of {order.length+1}</span>
      {pos<order.length-1
        ?<button disabled={!can} onClick={()=>setPos(pos+1)} className="rounded-lg bg-amber-500 text-black font-semibold px-5 py-2 text-sm disabled:opacity-30">Next</button>
        :<button onClick={()=>{clearW();finish()}} className="rounded-lg bg-green-500 text-black font-semibold px-5 py-2 text-sm">Finish setup</button>}
    </div>
    {re&&pos<order.length-1&&<div className="text-center"><button onClick={()=>{clearW();finish()}} className="lnk lnk-acc text-xs">Save and return to the dashboard</button></div>}
    {!re&&!warn&&pos<order.length-1&&<div className="text-center"><button onClick={()=>setWarn(true)} className="lnk text-xs">Skip setup for now</button></div>}
    <ResetAll/>
  </div>;
}
