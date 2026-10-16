import React from 'react';
import AccentCard from './AccentCard.jsx';
import {StepHead} from './Wizard.jsx';
import {ExpTag} from './ui.jsx';
import {useExp,setExp} from './expOptIn.js';
// Experimental feature. Shown once, right after Setup is finished: an optional, clearly marked opt-in. The Enable button works the same way as the one in the Experimental window.
export default function ExpAfterSetup({onDone}){
  const exp=useExp();
  return <div className="grid gap-4">
    <StepHead eyebrow={<span className="text-pink-400">One last thing</span>} title="Experimental features" hint="Setup is finished. Before you go to the dashboard, you can choose whether to try the experimental features. This is optional, and you can change your mind at any time."/>
    <AccentCard tone="pink" title={<span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-pink-300">What are experimental features?<ExpTag/></span>} c="grid gap-3">
      <div className="text-sm text-pink-100/90">New tools that are still in heavy development. They may change a lot, stop working on some setups, or be removed before they join the main site.</div>
      <ul className="grid gap-2 rounded-lg border border-pink-400/15 bg-pink-400/[0.05] px-3 py-3 text-sm text-zinc-200">{['Some read files from your game folder, and only read what the game has already written.','Nothing changes your progress without showing you first, and a backup is taken before anything is applied.','Everything stays in your browser. Nothing is uploaded.'].map(m=><li key={m} className="flex gap-2"><svg viewBox="0 0 24 24" className="size-4 mt-0.5 shrink-0 text-pink-400" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>{m}</li>)}</ul>
      <div className="flex justify-center"><button onClick={()=>setExp(!exp)} className={'rounded-lg px-5 py-2 text-sm font-semibold transition max-sm:w-full '+(exp?'border border-pink-400/60 text-pink-200 hover:bg-pink-400/10':'bg-pink-500 text-black hover:bg-pink-400')}>{exp?'Disable experimental features':'Enable experimental features'}</button></div>
      <div className="text-xs text-center text-pink-300/80">Not sure? Leave it off. You can find them later with the pink Experimental button at the top of the dashboard.</div>
    </AccentCard>
    <div className="sticky bottom-3 z-20 flex items-center justify-end gap-3 rounded-xl border border-zinc-800 bg-[#0e0f11]/90 backdrop-blur px-3 py-2.5 shadow-lg shadow-black/40">
      <button autoFocus onClick={onDone} className="rounded-lg bg-green-500 text-black font-semibold px-5 py-2 text-sm">Go to the dashboard</button></div>
  </div>;
}
