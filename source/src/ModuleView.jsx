import React from 'react';
import {Chip,Chev,FirTick,Done,Empty} from './ui.jsx';
import {planHideout,stName,CURRENCY} from './hideout.js';
const wiki=n=>'https://escapefromtarkov.fandom.com/wiki/'+encodeURIComponent(n.replace(/ /g,'_'));
const fmt=n=>n.toLocaleString();
const isMoney=n=>CURRENCY.includes(n);
export default function ModuleView({cy,s,set}){
  const {steps}=planHideout(s,cy);
  const pool={};const alloc=st=>st.i.map(([n,c,fir])=>{const have=s.n['hi:'+n]||0;const left=pool[n]===undefined?have:pool[n];const got=Math.min(c,left);pool[n]=left-got;const first=!seen[n];seen[n]=1;return {n,c,fir,got,first}});
  const seen={};const mods=[];steps.forEach(st=>{let m=mods.find(x=>x.key===st.key);if(!m){m={key:st.key,lv:[]};mods.push(m)}m.lv.push({st,rows:alloc(st)})});
  if(!mods.length)return <Empty icon="done" title="No hideout items needed" hint="There is nothing left to build, so there is nothing to gather."/>;
  return <div className="grid gap-3">{mods.map(m=>{const rows=m.lv.flatMap(l=>l.rows.filter(r=>!isMoney(r.n))),short=rows.filter(r=>r.got<r.c).length;
    return <details key={m.key} open className="group rounded-xl border border-zinc-800 bg-zinc-900">
      <summary className="cursor-pointer list-none flex items-center gap-2 p-3"><span className="text-zinc-500 text-xs transition-transform group-open:rotate-90"><Chev/></span><span className="font-semibold">{stName(m.key)}</span>
        <Chip>{m.lv.length} upgrade{m.lv.length>1?'s':''}</Chip><Chip tone={short?'bad':'ok'}>{short?short+' item'+(short>1?'s':'')+' short':'all covered'}</Chip></summary>
      <div className="grid gap-2 px-3 pb-3">{m.lv.map(({st,rows})=>{const items=rows.filter(r=>!isMoney(r.n)),money=rows.filter(r=>isMoney(r.n));
        return <div key={st.l} className="rounded-lg border border-zinc-800 bg-black/20 p-3">
          <div className="flex flex-wrap items-center gap-2"><span className="font-medium">Level {st.l}</span>{st.forPrestige&&<Chip tone="warn">Prestige</Chip>}<Chip tone={st.ready?'ok':'bad'}>{st.ready?'Ready':'Blocked'}</Chip>
            {money.map(r=><Chip key={r.n} tone="xp">{fmt(r.c)} {r.n}</Chip>)}</div>
          {items.length?<div className="mt-1.5 grid gap-0.5">{items.map(r=>{const ok=r.got>=r.c;return <div key={r.n} className="flex items-center justify-between gap-2 rounded px-2 py-1 text-sm hover:bg-white/5">
            <a href={wiki(r.n)} target="_blank" rel="noopener noreferrer" className={'hover:underline hover:text-amber-400 '+(ok?'line-through opacity-50':'')}>{r.n}</a>
            <span className="shrink-0 flex items-center gap-2">{r.fir?<FirTick/>:null}{r.first?<input type="number" min="0" value={s.n['hi:'+r.n]??''} onChange={e=>set('hi:'+r.n,+e.target.value)} placeholder="have" aria-label={'How many '+r.n+' you have'} className="bg-zinc-800 w-16 px-2 py-1 rounded text-xs text-right"/>:null}<span className={'w-12 text-right '+(ok?'text-green-300':'text-zinc-300')}>{ok&&<Done/>}{r.got}/{r.c}</span></span></div>})}</div>
            :<div className="text-sm text-zinc-500 mt-1">No items, only currency.</div>}</div>})}</div></details>})}
    <div className="text-xs text-zinc-500">Items you hold are handed out in build order, so an item needed by several upgrades fills the earliest one first. Type how many you hold on the first row an item appears in; the same count is used for every level.</div></div>;
}

