import React from 'react';
import {Card,Section,Stat,Chip,Pill,Done,Pin,Empty} from './ui.jsx';
import {useLS} from './useLS.js';
import {taskStatus} from './access.js';
;
import KEYS from './taskKeys.json';

const MAPS=['Ground Zero','Factory','Customs','Woods','Shoreline','Interchange','Reserve','Lighthouse','Streets','The Lab','Labyrinth'];
const wiki=n=>'https://escapefromtarkov.fandom.com/wiki/'+encodeURIComponent(n.replace(/ /g,'_'));
export const keysFor=(t,x)=>KEYS[t+'|'+x]||[];
export const hasKey=(s,n)=>!!s.c['key:'+n];
// a task's key requirement is met when you hold any one of the keys listed for its map
export const keyReady=(s,t,x)=>keysFor(t,x).every(([,alts])=>alts.some(k=>hasKey(s,k)));

export default function KeysTab({cy,s,tg}){
  const [scope,setScope]=useLS('tpp2_ui_keys_scope','now');
  const [onlyMissing,setOnlyMissing]=useLS('tpp2_ui_keys_missing',false);
  const [incl]=useLS('tpp2_ui_incl_plan',false);
  const rows={};      // key name -> {n,map,tasks:[{t,x,st,alts}]}
  const done=(t,x)=>!!s.c['tk:'+t+':'+x];
  let doneTasks=0;
  Object.entries(KEYS).forEach(([k,list])=>{
    const i=k.indexOf('|'),t=k.slice(0,i),x=k.slice(i+1);
    if(done(t,x)){doneTasks++;return}
    const st=taskStatus(s,t,x).st;
    const startable=st==='ok'||(st==='unknown'&&incl);
    if(scope==='now'&&!startable)return;
    list.forEach(([map,alts])=>alts.forEach(n=>{
      const r=rows[n]=rows[n]||{n,map,tasks:[]};
      r.tasks.push({t,x,st,alts:alts.filter(a=>a!==n)});
    }));
  });
  const all=Object.values(rows);
  const owned=all.filter(r=>hasKey(s,r.n)).length;
  const shown=all.filter(r=>!onlyMissing||!hasKey(s,r.n));
  const maps=MAPS.filter(m=>shown.some(r=>r.map===m));
  const tasksNeeding=new Set(all.flatMap(r=>r.tasks.map(z=>z.t+'|'+z.x)));
  const tasksReady=[...tasksNeeding].filter(k=>{const i=k.indexOf('|');return keyReady(s,k.slice(0,i),k.slice(i+1))}).length;

  return <div className="grid gap-4">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <Stat label="Keys listed" value={all.length} sub={scope==='now'?'for tasks you can start':'for all remaining tasks'}/>
      <Stat label="You hold" value={owned} sub={`${all.length-owned} still to find`}/>
      <Stat label="Tasks unblocked" value={`${tasksReady}/${tasksNeeding.size}`} sub="have a usable key"/>
      <Stat label="Tasks done" value={doneTasks} sub="of the key tasks"/>
    </div>

    <Section title="Keys by map" sub="tick a key when it is in your stash">
      <div className="flex flex-wrap gap-2"><Pill on={scope==='now'} onClick={()=>setScope('now')}>Tasks I can start now</Pill><Pill on={scope==='all'} onClick={()=>setScope('all')}>All remaining tasks</Pill>
        <Pill on={onlyMissing} onClick={()=>setOnlyMissing(!onlyMissing)}>Only keys I still need</Pill></div>
      {maps.length===0?<Empty icon={all.length?'done':'empty'} title={all.length?'You hold every key listed here':'No keys needed right now'} hint={all.length?undefined:'No tasks you can start right now need a key. Switch to “All remaining tasks” to plan ahead.'}/>
        :maps.map(m=><Card key={m} c="!p-3"><div className="flex items-center gap-2 mb-1"><span className="font-semibold text-zinc-100"><Pin/>{m}</span><Chip>{shown.filter(r=>r.map===m).length} key{shown.filter(r=>r.map===m).length===1?'':'s'}</Chip></div>
          <div className="grid gap-0.5">{shown.filter(r=>r.map===m).sort((a,b)=>a.n.localeCompare(b.n)).map(r=>{const on=hasKey(s,r.n);
            return <label key={r.n} className="flex items-start gap-3 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-white/5">
              <input type="checkbox" checked={on} onChange={()=>tg('key:'+r.n)} className="accent-amber-500 mt-1 size-4 shrink-0"/>
              <div className="min-w-0 flex-1"><div className={'font-medium '+(on?'text-green-300':'')}>{on&&<Done/>}<a href={wiki(r.n)} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="hover:underline hover:text-amber-400">{r.n==='Unknown key'?'Unnamed key (check the task in game)':r.n}</a></div>
                <div className="flex flex-wrap gap-1 mt-1">{r.tasks.map(z=><Chip key={z.t+z.x} tone={z.st==='ok'?'ok':z.st==='unknown'?'warn':'mute'} title={z.alts.length?'Any one of: '+[r.n,...z.alts].join(', '):undefined}>{z.x} · {z.t}{z.alts.length?' · or '+z.alts.length+' other':''}</Chip>)}</div></div></label>})}</div></Card>)}
      <div className="text-xs text-zinc-500">Where a task lists several keys, any one of them is enough. Keys the game data does not name show as unnamed. Tasks you tick off elsewhere drop out of this list; once a key is no longer needed by any task it is safe to sell. Your key ticks are saved per prestige.</div>
    </Section>
  </div>;
}
