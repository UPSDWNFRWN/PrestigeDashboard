import {TRADER_TASKS,PREREQ} from './data.js';
// Every task that must be done before this one, across all traders (only tasks the tracker lists).
const tracked=k=>{const i=k.indexOf('|'),t=k.slice(0,i);return !!TRADER_TASKS[t]&&TRADER_TASKS[t].includes(k.slice(i+1))};
export const taskKey=k=>'tk:'+k.replace('|',':');
export const prereqKeys=(t,x)=>{const out=[],seen=new Set([t+'|'+x]);
  const walk=k=>(PREREQ[k]||[]).filter(tracked).forEach(p=>{if(seen.has(p))return;seen.add(p);out.push(taskKey(p));walk(p)});
  walk(t+'|'+x);return out};
export const prereqsOf=ck=>{const m=ck.match(/^tk:([^:]+):(.*)$/);return m?prereqKeys(m[1],m[2]):[]};
const REV={};
Object.entries(TRADER_TASKS).forEach(([t,l])=>l.forEach(x=>(PREREQ[t+'|'+x]||[]).forEach(p=>{if(tracked(p))(REV[p]=REV[p]||[]).push(t+'|'+x)})));
// Every task that needs this one, directly or not.
export const dependantKeys=(t,x)=>{const out=[],seen=new Set([t+'|'+x]);
  const walk=k=>(REV[k]||[]).forEach(d=>{if(seen.has(d))return;seen.add(d);out.push(taskKey(d));walk(d)});
  walk(t+'|'+x);return out};
export const dependantsOf=ck=>{const m=ck.match(/^tk:([^:]+):(.*)$/);return m?dependantKeys(m[1],m[2]):[]};
