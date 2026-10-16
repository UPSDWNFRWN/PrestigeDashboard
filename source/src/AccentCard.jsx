import React from 'react';
// The card style used across the windows: dark card, a coloured edge in the window's own colour, a heading, then content.
const BAR={amber:'bg-amber-500',sky:'bg-sky-500',green:'bg-green-500',pink:'bg-pink-500'};
const BOX={pink:'border-pink-400/25 bg-pink-400/5'}; // experimental things are always in a pink-tinted box
export default function AccentCard({tone='amber',title,c='grid gap-1.5',children}){
  return <section className={'relative overflow-hidden rounded-xl border p-4 '+(BOX[tone]||'border-zinc-800 bg-zinc-900')+' pl-5 grid gap-2 content-start'}>
    <span aria-hidden="true" className={'absolute inset-y-0 left-0 w-1 '+BAR[tone]}/>
    {title&&<div className="font-semibold text-zinc-100">{title}</div>}
    <div className={c}>{children}</div></section>;
}
