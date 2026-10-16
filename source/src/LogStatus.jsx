import React from 'react';
import {useExp} from './expOptIn.js';
import {dependantKeys} from './chain.js';

// What the game logs say about tasks that are not finished: accepted (in progress) or failed. Display only, kept in this browser. Nothing here changes your ticks.
const KEY='tpp2_ui_logstate',EV='pd-logstate';
const read=()=>{try{const o=JSON.parse(localStorage.getItem(KEY));return {open:o&&o.open||[],failed:o&&o.failed||[],at:o&&o.at||0}}catch{return {open:[],failed:[],at:0}}};
// A new prestige starts with no log history: what the logs said about the last prestige's tasks no longer applies (hotfix 1.22.1).
export function resetLogHistory(){
  try{localStorage.removeItem(KEY);localStorage.removeItem('tpp2_ui_logslast');localStorage.setItem('tpp2_ui_logfix','1')}catch{}
  window.dispatchEvent(new Event(EV));
}
// Prestiges set up before 1.22.1 have no start time. The first time one is opened in 1.22.1 or later, it counts as starting then,
// and the old log history is cleared once for everyone (user decision, 16 Oct 2026), so the last prestige's messages stop being offered.
export function fixOldLogHistory(){
  try{if(localStorage.getItem('tpp2_ui_logfix'))return;localStorage.setItem('tpp2_ui_logfix','1')}catch{return}
  resetLogHistory();
}
// merge a fresh import into what is already known: the new logs win for tasks they mention, older knowledge is kept for the rest
export function saveLogState(res){
  const old=read(),seen=new Set([...res.done,...res.open,...res.failed]);
  const open=new Set([...old.open.filter(k=>!seen.has(k)),...res.open]),failed=new Set([...old.failed.filter(k=>!seen.has(k)),...res.failed]);
  try{localStorage.setItem(KEY,JSON.stringify({open:[...open],failed:[...failed],at:Date.now()}))}catch{}
  window.dispatchEvent(new Event(EV));
}
// open and failed lists with finished tasks removed. Empty unless experimental features are on.
export function useLogStatus(s){
  const on=useExp(),[st,set]=React.useState(read);
  React.useEffect(()=>{const h=()=>set(read());window.addEventListener(EV,h);return()=>window.removeEventListener(EV,h)},[]);
  if(!on)return {open:new Set(),failed:[],at:0};
  const tk=k=>'tk:'+k.replace('|',':');
  return {open:new Set(st.open.filter(k=>!s.c[tk(k)])),failed:st.failed.filter(k=>!s.c[tk(k)]),at:st.at};
}
export const InProgressChip=()=><span title="Accepted in game, according to your logs" className="inline-flex items-center rounded-full border border-pink-400/50 bg-pink-400/10 px-2 py-0.5 text-xs leading-4 text-pink-300">In progress</span>;

export function FailedNotice({failed,s}){
  if(!failed.length)return null;
  const rows=failed.map(k=>{const [t,...x]=k.split('|'),name=x.join('|');
    const later=dependantKeys(t,name).filter(d=>!s.c[d]).length;return {k,t,name,later}});
  return <div role="note" className="rounded-xl border border-pink-400/25 bg-pink-400/5 px-4 py-3 text-sm text-pink-200 grid gap-2">
    <div className="font-semibold text-pink-300">Failed in game ({rows.length})</div>
    <div className="text-xs leading-5 text-pink-300/90">Your logs say these tasks failed, so they are not counted as done. Check in the game whether you can still do them.</div>
    <div className="grid gap-1">{rows.map(r=><div key={r.k} className="flex flex-wrap items-baseline gap-x-2"><b className="text-pink-100">{r.name}</b><span className="text-xs text-pink-300/80">{r.t}{r.later>0?` · ${r.later} later task${r.later===1?'':'s'} depend${r.later===1?'s':''} on it`:''}</span></div>)}</div>
  </div>;
}

// When the logs were last read (0 if never), refreshed every minute so the label under the Experimental button stays current.
export function useLogAge(){
  const [st,set]=React.useState(()=>read().at),[,tick]=React.useState(0);
  React.useEffect(()=>{const h=()=>set(read().at);window.addEventListener(EV,h);const id=setInterval(()=>tick(x=>x+1),60000);return()=>{window.removeEventListener(EV,h);clearInterval(id)}},[]);
  return st;
}
export const logAgo=t=>{const m=Math.round((Date.now()-t)/6e4);if(m<2)return 'just now';if(m<60)return m+' minutes ago';const h=Math.round(m/60);if(h<36)return h+(h===1?' hour':' hours')+' ago';return Math.round(h/24)+' days ago'};
export const LOG_STALE=3*864e5;
