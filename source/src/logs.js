// Reads task events out of the game's own log files. Only the push-notifications log is parsed for tasks (trader messages),
// and the backend log is only searched to tell PvE sessions from PvP ones. Nothing else in any log is looked at or kept.
import IDS from './taskids.json';

const TS=/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d\.\d+\|/m;
const KIND={successMessageText:'done',description:'started',startedMessageText:'started',failMessageText:'failed'};

// text of one push-notifications log -> [{id, kind, dt}]
export function parseNotifications(text){
  const out=[];
  for(const blk of text.split(TS)){
    if(!blk.includes('ChatMessageReceived'))continue;
    const i=blk.indexOf('{');if(i<0)continue;
    let j;try{j=JSON.parse(blk.slice(i))}catch{continue}
    const m=j&&j.message;if(!m||typeof m.templateId!=='string')continue;
    const t=m.templateId.match(/^([0-9a-f]{24}) (\w+)$/);if(!t)continue;
    const kind=KIND[t[2]];if(!kind)continue;
    out.push({id:t[1],kind,dt:m.dt||0});
  }
  return out;
}
// backend log -> 'pve' | 'pvp' | ''
export function sessionMode(text){
  const pve=(text.match(/gw-pve\./g)||[]).length,pvp=(text.match(/gw-pvp\./g)||[]).length;
  return pve>pvp?'pve':pvp>pve?'pvp':'';
}
const dirOf=p=>{const i=p.lastIndexOf('/');return i<0?'':p.slice(0,i)};

// files: [{file, path}] -> summary
// since: unix seconds when the current prestige was set up (0 = read everything). Messages from before it belong to an earlier prestige and are skipped (hotfix 1.22.1).
export async function readLogs(files,since=0){
  const notif=files.filter(f=>/push-notifications.*\.log$/i.test(f.file.name));
  const back=files.filter(f=>/backend.*\.log$/i.test(f.file.name));
  const modeOf={};
  for(const b of back){const d=dirOf(b.path);if(modeOf[d])continue;modeOf[d]=sessionMode(await b.file.text())}
  const done=new Map(),last=new Map(),unknown=new Set();
  let nPve=0,nPvp=0,nUnk=0,minDt=0,maxDt=0,nOld=0;
  for(const n of notif){
    const mode=modeOf[dirOf(n.path)]||'';
    if(mode==='pvp'){nPvp++;continue}
    mode==='pve'?nPve++:nUnk++;
    for(const e of parseNotifications(await n.file.text())){
      if(since&&!(e.dt>=since)){nOld++;continue}
      const key=IDS[e.id];
      if(!key){unknown.add(e.id);continue}
      if(e.dt){minDt=minDt?Math.min(minDt,e.dt):e.dt;maxDt=Math.max(maxDt,e.dt)}
      if(e.kind==='done')done.set(key,Math.max(done.get(key)||0,e.dt));
      else{const o=last.get(key);if(!o||e.dt>=o.dt)last.set(key,{kind:e.kind,dt:e.dt})}
    }
  }
  // the most recent message about a task decides its state: accepted again after a fail means open, failed after accepting means failed, and finished beats both
  const open=[...last].filter(([k,v])=>v.kind==='started'&&!done.has(k)).map(([k])=>k);
  const failed=[...last].filter(([k,v])=>v.kind==='failed'&&!done.has(k)).map(([k])=>k);
  return {doneAt:Object.fromEntries(done),nFiles:notif.length,nPve,nPvp,nUnk,done:[...done.keys()],open,failed,unknown:unknown.size,from:minDt,to:maxDt,nOld};
}

// Walk a dropped folder, keeping each file's path so sessions can be told apart.
const walk=(e,base)=>new Promise(res=>{
  if(e.isFile){e.file(f=>res([{file:f,path:base+e.name}]),()=>res([]));return}
  const r=e.createReader(),all=[];
  const next=()=>r.readEntries(async es=>{if(!es.length){res((await Promise.all(all.map(x=>walk(x,base+e.name+'/')))).flat());return}all.push(...es);next()},()=>res([]));
  next();
});
export async function droppedLogs(dt){
  const items=[...(dt.items||[])].map(i=>i.webkitGetAsEntry&&i.webkitGetAsEntry()).filter(Boolean);
  if(!items.length)return [...dt.files].map(f=>({file:f,path:f.name}));
  return (await Promise.all(items.map(e=>walk(e,'')))).flat();
}
export const fromInput=files=>[...files].map(f=>({file:f,path:f.webkitRelativePath||f.name}));

// Remembering the Logs folder (Chrome/Edge only). The browser keeps a handle to the folder, never its contents, and asks permission each visit.
export const canWatch=typeof window!=='undefined'&&typeof window.showDirectoryPicker==='function'&&typeof indexedDB!=='undefined';
const DB=()=>new Promise((ok,no)=>{const r=indexedDB.open('tpp2_logs',1);r.onupgradeneeded=()=>r.result.createObjectStore('h');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
const idb=async(mode,fn)=>{const db=await DB();return new Promise((ok,no)=>{const tx=db.transaction('h',mode),q=fn(tx.objectStore('h'));tx.oncomplete=()=>ok(q&&q.result);tx.onerror=()=>no(tx.error)})};
export const savedHandle=async()=>{try{return canWatch?(await idb('readonly',s=>s.get('dir')))||null:null}catch{return null}};
export const forgetHandle=async()=>{try{await idb('readwrite',s=>s.delete('dir'))}catch{}};
export async function chooseHandle(){const h=await window.showDirectoryPicker({id:'tarkov-logs',mode:'read'});try{await idb('readwrite',s=>s.put(h,'dir'))}catch{}return h}
export async function openHandle(h){
  if(h.requestPermission&&(await h.requestPermission({mode:'read'}))!=='granted')throw new Error('Permission to read the folder was not given.');
  const out=[];
  const go=async(d,base)=>{for await(const [name,e] of d.entries()){
    if(e.kind==='directory')await go(e,base+name+'/');
    else if(/\.log$/i.test(name))out.push({file:await e.getFile(),path:base+name})}};
  await go(h,h.name+'/');
  return out;
}
