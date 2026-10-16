import React from 'react';
import {Modal,ModalFoot,CloseBtn,ExpTag} from './ui.jsx';
import AccentCard from './AccentCard.jsx';
import ImportLogs from './ImportLogs.jsx';
import {useExp,setExp} from './expOptIn.js';
import {useLogAge,logAgo,LOG_STALE} from './LogStatus.jsx';

// Header button and window for experimental features. Add a card to FEATURES to add another experiment.
export default function Experiments({s,setS}){
  const [open,setOpen]=React.useState(false);
  const [which,setWhich]=React.useState('');
  const on=useExp();const logAt=useLogAge();const stale=logAt>0&&Date.now()-logAt>LOG_STALE;
  // the About and help window links here: always open the Experimental window, where the enable and disable button lives
  React.useEffect(()=>{const h=()=>setOpen(true);window.addEventListener('pd-open-experimental',h);return()=>window.removeEventListener('pd-open-experimental',h)},[]);
  const FEATURES=[{id:'logs',name:'Import game logs',desc:'Pick your game\'s Logs folder and the dashboard ticks the tasks you have completed.',meta:['Works on PC only','Read in your browser','Backed up first','Read-only'],icon:<path d="M3.5 7.2A1.7 1.7 0 015.2 5.5h4l1.8 2h7.8a1.7 1.7 0 011.7 1.7v7.6a1.7 1.7 0 01-1.7 1.7H5.2a1.7 1.7 0 01-1.7-1.7z"/>}];
  const Tick=()=><svg viewBox="0 0 24 24" className="size-4 shrink-0 text-pink-400" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>;
  const card=f=><div key={f.id} className="relative overflow-hidden rounded-xl border border-pink-400/20 bg-zinc-900 p-4 pl-5 grid gap-3">
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-pink-500"/>
        <div className="flex items-start gap-3">
          <span className="grid place-items-center shrink-0 size-10 rounded-lg border border-pink-400/30 bg-pink-400/10 text-pink-300"><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{f.icon}</svg></span>
          <div className="grid gap-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><div className="text-base font-bold text-zinc-100">{f.name}</div><ExpTag/></div>
            <div className="text-sm leading-5 text-zinc-400">{f.desc}</div></div></div>
        <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 rounded-lg border border-pink-400/15 bg-pink-400/[0.05] px-3 py-2.5 text-sm text-zinc-300">{f.meta.map(m=><li key={m} className="flex items-center gap-2"><Tick/>{m}</li>)}</ul>
        <button onClick={()=>setWhich(f.id)} className="w-full rounded-lg bg-pink-500 py-2 text-sm font-semibold text-black transition hover:bg-pink-400">Open</button></div>;
  return <>
    <span className="relative inline-flex"><button onClick={()=>setOpen(true)} title={on?undefined:'Experimental features are off. Press to open the Experimental window and turn them on.'} className={'rounded-lg px-3 py-1.5 text-sm font-semibold transition '+(on?'bg-pink-500 text-black hover:bg-pink-400':'border border-pink-400/60 text-pink-300 hover:bg-pink-400/10')}>Experimental</button>{on&&logAt>0&&<span className={"absolute left-1/2 -translate-x-1/2 top-full mt-0.5 whitespace-nowrap text-xs leading-3 pointer-events-none "+(stale?"text-pink-300":"text-pink-400/60")}>Logs {logAgo(logAt)}</span>}</span>
    {open&&!which&&<Modal label="Experimental" title="Experimental" tone="pink" wide="max-w-3xl" onClose={()=>setOpen(false)} dismiss>
      <AccentCard tone="pink" title={<span className="text-pink-300">About experimental features</span>} c="grid gap-2 text-sm leading-6 text-zinc-300">
        <p>Experimental features are new tools that are still in heavy development. They may change a lot, stop working on some setups, or be removed before they join the main site.</p>
        <p>They are switched off until you turn them on, and they always appear in pink so you can tell them apart from the rest of the dashboard. Every experimental feature lives in this window until it is rolled into the main release.</p>
        <p>Features that read your game files only read what the game has already written, and never change, move or delete anything. Your progress is backed up first, and everything stays in your browser. Using them is your choice, and you can switch them off at any time.</p></AccentCard>
      <div className="flex justify-center"><button onClick={()=>setExp(!on)} className={'rounded-lg px-5 py-2 text-sm font-semibold transition max-sm:w-full '+(on?'border border-pink-400/60 text-pink-200 hover:bg-pink-400/10':'bg-pink-500 text-black hover:bg-pink-400')}>{on?'Disable experimental features':'Enable experimental features'}</button></div>
      {on
        ?<div className="grid gap-3">{FEATURES.map(card)}</div>
        :<div className="rounded-xl border border-dashed border-pink-400/30 p-4 grid gap-3">
          <div aria-hidden="true" className="grid gap-3 opacity-60">{[0,1].map(i=><div key={i} className="flex items-center gap-3"><span className="size-10 rounded-lg bg-pink-400/10 border border-pink-400/20"/><div className="grid gap-2 flex-1"><span className="h-3 rounded bg-zinc-700/70" style={{width:i?'38%':'52%'}}/><span className="h-2.5 rounded bg-zinc-800" style={{width:i?'64%':'78%'}}/></div><span className="h-7 w-16 rounded-lg bg-pink-400/10"/></div>)}</div>
          <div className="flex items-center justify-center gap-2 text-center text-sm text-pink-200"><svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 3h6M10 3v6l-5 9a2 2 0 001.8 3h10.4A2 2 0 0019 18l-5-9V3M7.5 14h9"/></svg>Enable Experimental features to see what we are working on</div></div>}
      <ModalFoot><CloseBtn tone="pink" onClick={()=>setOpen(false)}/></ModalFoot>
    </Modal>}
    <ImportLogs open={on&&open&&which==='logs'} onClose={()=>{setWhich('');setOpen(false)}} s={s} setS={setS}/>
  </>;
}
