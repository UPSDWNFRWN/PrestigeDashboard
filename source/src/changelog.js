import {stName} from './hideout.js';
import {STORY} from './story.js';
import {NB_TEMPLATE} from './nb.js';
import {CQUESTS} from './data.js';

const SKIP=/^(wizDone|wizSkip|wizRe|start|faction|name|skipIgnore|logFrom|prev:.*)$/;
const stepOf=id=>{for(const n in STORY){const x=STORY[n].steps.find(y=>y.id===id);if(x)return x.t}return id};
// Plain-English name for a saved key, and whether it is a number or a tick.
export function describe(k,cy){
  const nbl=id=>(((NB_TEMPLATE[cy.p]||{}).list||[]).find(o=>o.id===id)||{}).label||id;
  if(k==='lvl')return {l:'PMC level',num:1};
  if(k==='rub')return {l:'Roubles (millions)',num:1};
  if(k==='karma')return {l:'Fence karma',num:1};
  if(k.startsWith('ll:'))return {l:k.slice(3)+' loyalty level',num:1,def:1};
  if(k.startsWith('k:'))return {l:k.slice(2)+' skill',num:1};
  if(k.startsWith('hl:'))return {l:stName(k.slice(3))+' built level',num:1};
  if(k.startsWith('ht:'))return {l:stName(k.slice(3))+' target level',num:1};
  if(k.startsWith('hi:'))return {l:'Stash count of '+k.slice(3),num:1};
  if(k.startsWith('nbn:'))return {l:'New Beginning: '+nbl(k.slice(4)),num:1};
  if(k.startsWith('nb:'))return {l:'New Beginning: '+nbl(k.slice(3))};
  if(k.startsWith('tk:')){const [t,...r]=k.slice(3).split(':');return {l:r.join(':')+' ('+t+')'}}
  if(k.startsWith('t:'))return {l:k.slice(2)};
  if(k.startsWith('s:'))return {l:'Story chapter '+k.slice(2)};
  if(k.startsWith('sp:'))return {l:'Story step: '+stepOf(k.slice(3))};
  if(k.startsWith('nm:'))return {l:k.slice(3)+' marked as not accessible',inv:1};
  if(k.startsWith('key:'))return {l:'Key: '+k.slice(4)};
  if(k.startsWith('cq:')){const q=CQUESTS.find(x=>x.id===k.slice(3));return {l:q?q.name+' ('+q.giver+')':k.slice(3)}}
  if(k.startsWith('cs:')){const [id,i]=k.slice(3).includes(':')?k.slice(3).split(':'):['sbih',k.slice(3)];const q=CQUESTS.find(x=>x.id===id),pr=q&&q.subs&&q.subs[+i];return {l:'Shooter Born in Heaven: '+(pr?pr.join(' or '):'map pair '+(+i+1))}}
  if(k.startsWith('ci:'))return {l:'Collector item: '+k.slice(3)};
  return {l:k};
}
export const entryText=(e,cy)=>{
  if(e.bulk)return e.x;
  const d=describe(e.k,cy);
  if(d.num)return `${d.l}: ${e.f??d.def??0} → ${e.v}`;
  return (e.v?(d.inv?'Marked ':'Ticked '):(d.inv?'Cleared ':'Unticked '))+d.l;
};
// Compare two saved states and return new log entries (older state first).
export function diffState(a,b,cy,now=Date.now()){
  const out=[];
  ['n','c'].forEach(g=>{
    const A=a[g]||{},B=b[g]||{};
    new Set([...Object.keys(A),...Object.keys(B)]).forEach(k=>{
      if(g==='n'&&SKIP.test(k))return;
      const x=A[k],y=B[k];
      if(g==='c'){if(!!x===!!y)return;out.push({t:now,k,v:!!y});return}
      if(x===y)return;
      const d=describe(k,cy);
      if((x??d.def??0)===(y??d.def??0))return;
      out.push({t:now,k,f:x,v:y??0});
    });
  });
  if(out.length>12){
    const ticks=out.filter(e=>typeof e.v==='boolean').length;
    return [{t:now,k:'bulk',bulk:1,x:`Bulk change: ${ticks} tick${ticks===1?'':'s'}, ${out.length-ticks} value${out.length-ticks===1?'':'s'} changed (import or Tick all)`}];
  }
  return out;
}
// Add entries to a log, merging rapid edits to the same field so typing a number does not flood it.
export function addEntries(log,entries,cap=300){
  let L=[...log];
  entries.forEach(e=>{
    const last=L[0];
    if(!e.bulk&&last&&last.k===e.k&&e.t-last.t<10000){
      const merged={...last,t:e.t,v:e.v};
      const same=typeof merged.v==='boolean'?false:(merged.f??describe(e.k,{p:0}).def??0)===merged.v;
      L=same?L.slice(1):[merged,...L.slice(1)];
    }else L=[e,...L];
  });
  return L.slice(0,cap);
}
