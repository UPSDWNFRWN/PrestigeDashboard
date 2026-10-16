import React from 'react';
import AccentCard from './AccentCard.jsx';

// Backup code. Version 3 writes finished tasks as one bit each in a fixed numbered list (taskorder.json, append-only, never reorder).
// Version 2 keeps only the progress for each cycle (not view settings or the change log), writes finished
// tasks as 3-byte ids instead of names, compresses with raw deflate, then base64url. Version 1 codes can still be read.
import {TRADER_TASKS} from './data.js';
import ORDER from './taskorder.json';
import {Modal,ModalFoot,CloseBtn,HowTo,Bk} from './ui.jsx';
import {DATA_VERSION,migrateMap} from './migrate.js';
const PFX='tpp2_',CYC=/^tpp2_cycle_(\d+)$/;
const b64=u8=>{let s='';u8.forEach(b=>s+=String.fromCharCode(b));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const unb64=t=>{const s=atob(t.replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(s,c=>c.charCodeAt(0))};
const pipe=async(u8,Stream,fmt)=>new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new Stream(fmt))).arrayBuffer());
const hid=str=>{let h=0x811c9dc5;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,0x01000193)}h^=h>>>15;h=Math.imul(h,0x2c1b3c6d);h^=h>>>12;return h&0xffffff};
const taskKeys=()=>{const m={};Object.entries(TRADER_TASKS).forEach(([t,l])=>l.forEach(x=>{const k='tk:'+t+':'+x;m[k]=hid(k)}));return m};
const IDX=Object.fromEntries(ORDER.map((k,i)=>[k,i]));
const snapshot=()=>{const o={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith(PFX))o[k]=localStorage.getItem(k)}}catch{}return o};
export async function makeCode(){
  const all=snapshot(),ys=[],maps=[];
  Object.keys(all).sort().forEach(k=>{const m=CYC.exec(k);if(!m)return;let o;try{o=JSON.parse(all[k])||{}}catch{return}
    const {n={},c={},...rest}=o,keep={},bits=new Uint8Array(Math.ceil(ORDER.length/8));
    Object.entries(c).forEach(([ck,v])=>{if(!v)return;const i=IDX[ck];if(i!==undefined)bits[i>>3]|=1<<(i&7);else keep[ck]=v});
    let len=bits.length;while(len>0&&bits[len-1]===0)len--;maps.push(bits.slice(0,len));
    const y={p:+m[1],n,c:keep,b:len};if(Object.keys(rest).length)y.x=rest;ys.push(y)});
  const head=new TextEncoder().encode(JSON.stringify({v:3,dv:DATA_VERSION,y:ys}));
  const raw=new Uint8Array(4+head.length+maps.reduce((a,m)=>a+m.length,0));
  new DataView(raw.buffer).setUint32(0,head.length);raw.set(head,4);
  let at=4+head.length;maps.forEach(m=>{raw.set(m,at);at+=m.length});
  if(typeof CompressionStream!=='undefined'){try{return 'PD3z.'+b64(await pipe(raw,CompressionStream,'deflate-raw'))}catch{}}
  return 'PD3p.'+b64(raw);
}
export async function readCode(code){
  try{return await readCode0(code)}catch(e){const m=String(e&&e.message||'');if(/JSON|Unexpected|offset|out of bounds|Invalid|DataView/i.test(m))throw new Error('The code is damaged or cut short. Copy the whole code again and try again.');throw e}
}
async function readCode0(code){
  const m=/^PD([123])([zp])\.([A-Za-z0-9_-]+)$/.exec(code.replace(/\s+/g,''));
  if(!m)throw new Error('That does not look like a backup code.');
  let u8=unb64(m[3]);
  if(m[2]==='z'){if(typeof DecompressionStream==='undefined')throw new Error('This browser cannot read compressed codes.');try{u8=await pipe(u8,DecompressionStream,m[1]==='1'?'gzip':'deflate-raw')}catch{throw new Error('The code is damaged or cut short. Copy the whole code again and try again.')}}
  if(m[1]==='1'){
    const o=JSON.parse(new TextDecoder().decode(u8));
    if(!o||o.v!==1||typeof o.d!=='object')throw new Error('The code is damaged or from a different version.');
    const d=o.d;for(const k of Object.keys(d))if(!k.startsWith(PFX)||typeof d[k]!=='string')throw new Error('The code contains unexpected data.');
    return migrateMap(d,1);
  }
  const hl=new DataView(u8.buffer,u8.byteOffset,u8.byteLength).getUint32(0);
  const o=JSON.parse(new TextDecoder().decode(u8.slice(4,4+hl)));
  if(!o||o.v!==+m[1]||!Array.isArray(o.y))throw new Error('The code is damaged or from a different version.');
  const rev={};if(m[1]==='2')Object.entries(taskKeys()).forEach(([k,v])=>{rev[v]=k});
  let pos=4+hl;const d={};
  for(const y of o.y){
    if(!y||!Number.isInteger(y.p)||typeof y.n!=='object'||typeof y.c!=='object')throw new Error('The code contains unexpected data.');
    const c={...y.c};
    if(m[1]==='3'){
      if(!Number.isInteger(y.b)||y.b<0||pos+y.b>u8.length)throw new Error('The code is damaged or cut short.');
      for(let i=0;i<Math.min(ORDER.length,y.b*8);i++)if(u8[pos+(i>>3)]&(1<<(i&7)))c[ORDER[i]]=true;
      pos+=y.b;
    }else{
      if(!Number.isInteger(y.h))throw new Error('The code contains unexpected data.');
      for(let i=0;i<y.h;i++){if(pos+3>u8.length)throw new Error('The code is damaged or cut short.');const v=(u8[pos]<<16)|(u8[pos+1]<<8)|u8[pos+2];pos+=3;if(rev[v])c[rev[v]]=true}
    }
    d['tpp2_cycle_'+y.p]=JSON.stringify({...(y.x||{}),n:y.n,c});
  }
  const dv=o.dv||1;
  if(dv>DATA_VERSION)throw new Error('This code was made with a newer version of the dashboard. Refresh this page to load the latest version, then try again.');
  return dv<DATA_VERSION?migrateMap(d,dv):d;
}
const cycles=d=>Object.keys(d).filter(k=>/^tpp2_cycle_\d+$/.test(k)).map(k=>k.slice(11)).sort();

// Remember when you last copied a code, and a fingerprint of your progress at that moment, so the button can nudge when it has been a while.
const BK='tpp2_ui_backup',RK='tpp2_ui_bkremind_off',DAY=864e5,REMIND=4*60*60*1000;
const sigNow=()=>{let h=0,n=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/^tpp2_cycle_\d+$/.test(k)){const v=localStorage.getItem(k);n+=v.length;for(let j=0;j<v.length;j++)h=(h*31+v.charCodeAt(j))|0}}}catch{}return h+':'+n};
const setCount=()=>{let c=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/^tpp2_cycle_\d+$/.test(k)){const o=JSON.parse(localStorage.getItem(k))||{};c+=Object.values(o.c||{}).filter(Boolean).length+Object.keys(o.n||{}).filter(x=>!/^(wizDone|wizSkip|start|faction|name|skipIgnore)$/.test(x)).length}}}catch{}return c};
const lastBackup=()=>{try{return JSON.parse(localStorage.getItem(BK))}catch{return null}};
const ago=t=>{const m=Math.round((Date.now()-t)/6e4);if(m<2)return 'just now';if(m<60)return m+' minutes ago';const h=Math.round(m/60);if(h<36)return h+(h===1?' hour':' hours')+' ago';return Math.round(h/24)+' days ago'};
const needsBackup=()=>{const b=lastBackup();if(setCount()<10)return false;if(!b)return true;return b.sig!==sigNow()&&Date.now()-b.t>3*DAY};

// Automatic snapshots: the last few backup codes kept in this browser, so a bad import or restore can be undone.
// They live in the same browser storage as your progress, so they do not replace copying a code somewhere safe.
const SK='tpp2_snaps',KEEP=8;
const getSnaps=()=>{try{const a=JSON.parse(localStorage.getItem(SK));return Array.isArray(a)?a:[]}catch{return []}};
export async function autoSnap(why='Automatic'){
  try{
    if(setCount()<1)return;
    const sig=sigNow(),a=getSnaps();
    if(a[0]&&a[0].sig===sig)return;
    const code=await makeCode();
    localStorage.setItem(SK,JSON.stringify([{t:Date.now(),why,sig,code},...a].slice(0,KEEP)));
  }catch{}
}
export function useAutoSnap(){
  React.useEffect(()=>{
    const first=setTimeout(()=>autoSnap('Automatic'),3000),id=setInterval(()=>autoSnap('Automatic'),5*60*1000);
    const vis=()=>{if(document.visibilityState==='hidden')autoSnap('Automatic')};
    document.addEventListener('visibilitychange',vis);
    return()=>{clearTimeout(first);clearInterval(id);document.removeEventListener('visibilitychange',vis)};
  },[]);
}
export default function Backup({noGen}){
  const gen_=!noGen; // making a backup is hidden during setup and on the cycle picker; restoring is always there
  const [tab,setTab]=React.useState('make');
  const [open,setOpen]=React.useState(false);
  const [code,setCode]=React.useState('');
  const [txt,setTxt]=React.useState('');
  const [parsed,setParsed]=React.useState(null);
  const [msg,setMsg]=React.useState('');
  const gen=async()=>{setMsg('');setCode(await makeCode())};
  React.useEffect(()=>{if(!open)return;setTab(gen_?'make':'restore');setSnaps(getSnaps());setParsed(null);setTxt('');setMsg('');if(gen_)gen()},[open]);
  React.useEffect(()=>{const h=()=>setOpen(true);window.addEventListener('pd-open-backup',h);return()=>window.removeEventListener('pd-open-backup',h)},[]);
  const [rem,setRem]=React.useState(0); // 0 hidden, 1 reminder, 2 warning before turning reminders off
  const openRef=React.useRef(open);openRef.current=open;
  React.useEffect(()=>{if(!gen_)return;const id=setInterval(()=>{let off=false;try{off=localStorage.getItem(RK)==='1'}catch{}const b=lastBackup();
    if(off||openRef.current||(b&&Date.now()-b.t<REMIND))return;setRem(r=>r||1)},REMIND);return()=>clearInterval(id)},[gen_]);
  const [off,setOff]=React.useState(()=>{try{return localStorage.getItem(RK)==='1'}catch{return false}});
  React.useEffect(()=>{const h=()=>setOff(false);window.addEventListener('pd-restore-warnings',h);return()=>window.removeEventListener('pd-restore-warnings',h)},[]);
  const stopRemind=()=>{try{localStorage.setItem(RK,'1')}catch{}setOff(true);setRem(0)};
  const resumeRemind=()=>{try{localStorage.removeItem(RK)}catch{}setOff(false);setMsg('Reminders are back on. You will be reminded every 4 hours while this page is open.')};
  const [snaps,setSnaps]=React.useState([]);
  const [,bump]=React.useState(0);
  React.useEffect(()=>{if(!gen_)return;const id=setInterval(()=>bump(x=>x+1),30000);return()=>clearInterval(id)},[gen_]);
  const mark=()=>{try{localStorage.setItem(BK,JSON.stringify({t:Date.now(),sig:sigNow()}))}catch{}bump(x=>x+1)};
  const [copied,setCopied]=React.useState(false);
  const copy=async()=>{try{await navigator.clipboard.writeText(code);mark();setMsg('');setCopied(true);setTimeout(()=>setCopied(false),2000)}catch{setMsg('Copy failed: select the code and copy it by hand.')}};
  const loadSnap=async sn=>{setMsg('');setTxt('');try{setParsed(await readCode(sn.code))}catch(e){setParsed(null);setMsg(e.message)}};
  const check=async v=>{setTxt(v);setParsed(null);setMsg('');if(!v.trim())return;try{setParsed(await readCode(v))}catch(e){setMsg(e.message)}};
  const restore=async()=>{await autoSnap('Before restore');try{const old=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(CYC.test(k))old.push(k)}old.forEach(k=>localStorage.removeItem(k));Object.entries(parsed).forEach(([k,v])=>localStorage.setItem(k,v));location.reload()}catch{setMsg('Could not write to browser storage.')}};
  return <>
    {(()=>{const nudge=gen_&&needsBackup(),b=lastBackup();
      const btn=<button onClick={()=>setOpen(true)} title={nudge?(b?'Your progress has changed since your last backup ('+ago(b.t)+')':'You have progress but no backup yet'):undefined} className="relative rounded-lg bg-green-500 px-3 py-1.5 text-sm font-semibold text-black transition hover:bg-green-400">{gen_?'Backup & Restore':'Restore from code'}
        {nudge&&<span aria-label="Backup recommended" className="absolute -top-1 -right-1 size-2.5 rounded-full bg-amber-400 ring-2 ring-[#0e0f11]"/>}</button>;
      if(!gen_)return btn;
      const old=!b||Date.now()-b.t>DAY;
      return <span className="relative inline-flex">{btn}<span className={'absolute left-1/2 -translate-x-1/2 top-full mt-0.5 whitespace-nowrap text-xs leading-3 '+(old?'text-amber-400/80':'text-zinc-500')}>{b?'Last backup '+ago(b.t):'No backup made yet'}</span></span>})()}
    {rem>0&&!open&&(()=>{const b=lastBackup(),link=<button onClick={()=>setRem(2)} className="md-link">Do not show me this again</button>;
      return rem===1
        ?<Modal label="Backup reminder" title="Time for a backup?" tone="green" wide="max-w-lg">
          <div className="text-sm text-zinc-300">Your progress is only saved in this browser. It is a good idea to make a backup every so often, just in case something goes wrong. Press Backup now to open <Bk>Backup &amp; Restore</Bk>, copy the code and keep it somewhere safe.</div>
          <div className={'rounded-lg border px-3 py-2 text-xs '+(b?'border-zinc-700 bg-black/20 text-zinc-400':'border-amber-400/40 bg-amber-400/5 text-amber-200')}>{b?'Last backup on this device: '+ago(b.t)+'.':'You have not made a backup on this device yet.'}</div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-3 pt-1"><div className="text-xs">{link}</div><div className="ml-auto flex items-center justify-end gap-2"><button onClick={()=>setRem(0)} className="rounded-lg border border-green-500/50 text-green-300 text-sm px-4 py-2 hover:bg-green-500/10">Ask again later</button><button autoFocus onClick={()=>{setRem(0);setOpen(true)}} className="rounded-lg bg-green-500 text-black text-sm font-semibold px-5 py-2 hover:bg-green-400">Backup now</button></div></div></Modal>
        :<Modal label="Backup reminder" title="You may lose your progress" tone="amber" wide="max-w-md">
          <div className="text-sm text-zinc-300">Without a backup code, you <b>will lose your progress</b> if your browser storage is cleared or you switch browser or device, and nobody can recover it for you. Are you sure you want to stop these reminders?</div>
          <ModalFoot left={<button onClick={stopRemind} className="md-link">Yes, stop reminding me</button>}><button autoFocus onClick={()=>setRem(0)} className="rounded-lg bg-green-500 text-black text-sm font-semibold px-5 py-2 hover:bg-green-400">Keep reminders on</button></ModalFoot></Modal>})()}
    {open&&<Modal label="Backup & Restore" title={gen_?'Backup & Restore':'Restore from code'} tone="green" wide="max-w-4xl" onClose={()=>setOpen(false)} dismiss>
        {gen_&&<div role="tablist" className="flex gap-2">{[['make','Make a backup'],['restore','Restore']].map(([k,l])=><button key={k} role="tab" aria-selected={tab===k} onClick={()=>{setTab(k);setMsg('')}} className={'rounded-full px-3.5 py-1.5 text-sm font-medium transition '+(tab===k?'bg-green-500 text-black':'border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-white/5')}>{l}</button>)}</div>}
        {gen_&&tab==='make'&&<section className="grid gap-3"><div className="grid gap-1.5">
            <div className="text-sm text-zinc-200">Your backup code covers your progress in every prestige (not view settings or the change log). Keep it somewhere safe, then use the Restore tab on another browser or device.</div>
            <div className="text-xs leading-5 text-zinc-400">The code is made in your browser and nothing is uploaded.</div></div>
          <AccentCard tone="green" title="Your backup code" c="grid gap-3">
          {(()=>{const b=lastBackup();return <div className={'text-sm '+(needsBackup()?'text-amber-400':'text-zinc-400')}>{b?`Last backup on this device: ${ago(b.t)}${b.sig!==sigNow()?'. Your progress has changed since.':'. Nothing has changed since.'}`:'No backup has been made on this device yet.'}</div>})()}
          <textarea readOnly value={code} onCopy={mark} onFocus={e=>e.target.select()} aria-label="Backup code" rows={4} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-xs font-mono break-all"/>
          <div className="flex flex-wrap items-center gap-3"><button onClick={copy} className="rounded-lg bg-green-500 text-black text-sm font-semibold px-5 py-2 hover:bg-green-400">{copied?'Copied ✓':'Copy code'}</button><button onClick={gen} className="rounded-lg border border-green-500/50 text-green-300 text-sm px-4 py-2 hover:bg-green-500/10">Refresh</button>{code&&<span className="text-xs text-zinc-500">{code.length.toLocaleString()} characters</span>}</div></AccentCard>
          {off&&<div className="rounded-lg border border-amber-400/40 bg-amber-400/5 p-3 text-sm text-amber-200 flex flex-wrap items-center justify-between gap-2"><span>Backup reminders are off.</span><button onClick={resumeRemind} className="rounded-lg bg-green-500 text-black text-sm font-semibold px-4 py-1.5 hover:bg-green-400">Turn reminders back on</button></div>}</section>}
        {tab==='restore'&&<section className="grid gap-3"><HowTo tone="green" title="Moving your progress to another browser or device" steps={[<>On the browser that has your progress, open <Bk>Backup &amp; Restore</Bk> and press Make a backup.</>,<>Copy the code and keep it somewhere safe, such as a notes app or a message to yourself.</>,<>On the new browser or device, open the dashboard, then open <Bk>Backup &amp; Restore</Bk> and choose <Bk>Restore</Bk>.</>,<>Paste the code, check what it contains, then press Replace and restore.</>]}/><div className="grid gap-1.5">
            <div className="text-sm text-zinc-200">Paste a backup code to bring your progress back, for example after switching browser or device.</div>
            <div className="text-xs leading-5 text-zinc-400">The code is read in your browser and nothing is uploaded. You see what it contains before anything is replaced.</div></div>
          <AccentCard tone="green" title="Restore from code" c="grid gap-3">
          <textarea value={txt} onChange={e=>check(e.target.value)} placeholder="Paste a backup code here" aria-label="Paste backup code" rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-xs font-mono break-all"/>
          {parsed&&<div className="rounded-lg border border-amber-400/40 bg-amber-400/5 p-3 text-sm text-amber-200 grid gap-2">
            <div>Code is valid: {cycles(parsed).length?`progress for Prestige ${cycles(parsed).join(', ')}`:'settings only'}. Restoring <b>replaces the progress saved on this device</b>.</div>
            <div><button onClick={restore} className="rounded-lg bg-green-500 text-black text-sm font-semibold px-5 py-2 hover:bg-green-400">Replace and restore</button></div></div>}
          </AccentCard></section>}
        {tab==='restore'&&snaps.length>0&&<AccentCard tone="green" title="Automatic snapshots on this device">
          <div className="text-sm text-zinc-300">The dashboard keeps its own recent copies here, handy for undoing a bad import or restore. They are stored in this browser only, so they do not replace saving a code somewhere safe.</div>
          <div className="grid gap-1">{snaps.map(sn=><div key={sn.t} className="flex items-center justify-between gap-2 rounded-lg bg-zinc-800/60 px-3 py-1.5 text-sm"><span>{ago(sn.t)}<span className="ml-2 text-xs text-zinc-500">{sn.why}</span></span><button onClick={()=>loadSnap(sn)} className="rounded-lg border border-green-500/50 text-green-300 text-sm px-3 py-1 hover:bg-green-500/10">Restore</button></div>)}</div></AccentCard>}
        {msg&&<div role="status" className="text-sm text-zinc-300">{msg}</div>}
      <ModalFoot><CloseBtn tone="green" onClick={()=>setOpen(false)}/></ModalFoot>
    </Modal>}
  </>;
}
