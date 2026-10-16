import React from 'react';
import {VERSION} from './releases.js';
import {REV,BUILD_ID} from './build.js';

// Looks at the hosted copy of this page now and then. If it carries a newer version number, shows a banner.
// Only reads the first couple of KB, so it costs almost no data. Does nothing when opened as a local file or offline.
async function hostedVersion(){
  const u=location.href.split('#')[0].split('?')[0]+'?pdcheck='+Date.now();
  const r=await fetch(u,{cache:'no-store',headers:{Range:'bytes=0-4095'}});
  if(!r.ok&&r.status!==206)return null;
  const rd=r.body.getReader();let txt='';const dec=new TextDecoder();
  while(txt.length<8192){const {done,value}=await rd.read();if(done)break;txt+=dec.decode(value,{stream:true});if(/name="pd-version" content="[^"]+"\/><meta name="pd-rev" content="\d+"/.test(txt)||(/name="pd-version"/.test(txt)&&txt.length>2048))break}
  try{rd.cancel()}catch(e){}
  const m=/name="pd-version" content="([^"]+)"/.exec(txt);if(!m)return null;
  const q=/name="pd-rev" content="(\d+)"/.exec(txt);return {v:m[1],rev:q?+q[1]:0};
}
const newer=(a,b)=>{if(a.v===b.v)return a.rev>b.rev;a=a.v;b=b.v;const x=a.split('.').map(Number),y=b.split('.').map(Number);for(let i=0;i<Math.max(x.length,y.length);i++){if((x[i]||0)!==(y[i]||0))return(x[i]||0)>(y[i]||0)}return false};

export default function UpdateBanner(){
  const [nv,setNv]=React.useState(null),[hide,setHide]=React.useState(false);
  React.useEffect(()=>{
    if(!/^https?:$/.test(location.protocol))return;
    let last=0,dead=false;
    const check=async()=>{if(Date.now()-last<5*60*1000)return;last=Date.now();
      try{const v=await hostedVersion();if(!dead&&v&&newer(v,{v:VERSION,rev:REV})){setNv(BUILD_ID(v.v,v.rev));setHide(false)}}catch(e){}};
    check();const iv=setInterval(check,10*60*1000);
    const vis=()=>{if(!document.hidden)check()};document.addEventListener('visibilitychange',vis);
    return()=>{dead=true;clearInterval(iv);document.removeEventListener('visibilitychange',vis)};
  },[]);
  if(!nv||hide)return null;
  return <div role="status" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-2rem)] rounded-xl border border-amber-500/60 bg-zinc-900 shadow-2xl px-4 py-3 flex flex-wrap items-center gap-3">
    <div className="text-sm"><span className="font-semibold text-amber-400">Version {nv} is available.</span> <span className="text-zinc-300">Make a backup code first if you have not lately, then refresh. Your progress stays in this browser.</span></div>
    <div className="flex gap-2 ml-auto"><button onClick={()=>setHide(true)} className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/5">Later</button>
      <button onClick={()=>location.reload()} className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-black hover:bg-amber-400">Refresh now</button></div></div>;
}
