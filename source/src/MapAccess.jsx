import React from 'react';
import {Chip,Chev,Done} from './ui.jsx';
import {useLS} from './useLS.js';
export const MAPS=['Ground Zero','Factory','Customs','Woods','Shoreline','Interchange','Reserve','Lighthouse','Streets','The Lab','Labyrinth'];
// Which maps you can run. The Planning tab only suggests ticked maps. Lives under the map picker on Planning.
export default function MapAccess({s,tg}){
  const [open,setOpen]=useLS('tpp2_ui_other_open',false);
  const can=m=>!s.c['nm:'+m],nMaps=MAPS.filter(can).length;
  return <div className="rounded-xl border border-zinc-800 bg-zinc-900/60">
    <button onClick={()=>setOpen(o=>!o)} aria-expanded={open} className="w-full text-left px-3 py-2 flex flex-wrap items-center justify-between gap-2">
      <span className="text-sm font-semibold flex items-center gap-2"><span className={'text-zinc-500 text-xs inline-block transition-transform '+(open?'rotate-90':'')}><Chev/></span>Maps you can access</span>
      <Chip tone="map">{nMaps}/{MAPS.length} maps</Chip></button>
    {open&&<div className="border-t border-zinc-800 p-3 grid gap-2">
      <div className="flex items-center justify-between gap-2"><div className="text-xs text-zinc-500">Untick maps you cannot or will not run (locked, wrong gear, no keys). Suggestions only use ticked maps.</div>
        <div className="flex gap-3 text-xs shrink-0"><button onClick={()=>MAPS.forEach(m=>{if(!can(m))tg('nm:'+m)})} className="text-zinc-400 hover:text-amber-400">All</button><button onClick={()=>MAPS.forEach(m=>{if(can(m))tg('nm:'+m)})} className="text-zinc-400 hover:text-amber-400">None</button></div></div>
      <div className="flex flex-wrap gap-2">{MAPS.map(m=>{const on=can(m);return <button key={m} onClick={()=>tg('nm:'+m)} aria-pressed={on} className={'rounded-full border px-3 py-1 text-xs transition '+(on?'border-green-400 bg-green-400/15 text-green-200':'border-zinc-700 text-zinc-500 line-through hover:border-zinc-500')}>{on&&<Done/>}{m}</button>})}</div>
    </div>}
  </div>;
}
