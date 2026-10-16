import React from 'react';
import {ExpTag} from './ui.jsx';
// Extra "About and help" content. Experimental feature: shown whether or not experimental features are switched on, in the same pink card style as the Experimental window.
export default function AboutExtra({go,Go}){
  return <section className="relative overflow-hidden rounded-xl border border-pink-400/25 bg-pink-400/5 p-4 pl-5 grid gap-1.5 content-start">
    <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-pink-500"/>
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><div className="font-semibold text-pink-300">What are experimental features?</div><ExpTag/></div>
    <div className="text-pink-100/90">These features are still in heavy development and may change a lot, or be removed, before they join the main site. They are off until you turn them on with the pink <Go go={go} ev="pd-open-experimental" tone="text-pink-300 hover:text-pink-200">Experimental</Go> button at the top.</div>
    <div className="text-xs leading-5 text-pink-300/80">They may change or be removed.</div>
  </section>;
}
