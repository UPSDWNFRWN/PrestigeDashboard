import React from 'react';
// A soft fade along the bottom edge of the screen while the page has more below it, the same cue the windows use.
// It never takes clicks and sits under the windows, the sticky Setup bars and the update notice.
export default function PageFade(){
  const r=React.useRef(null);
  React.useEffect(()=>{
    const el=r.current;if(!el)return;
    let q=0,ro,mo;
    const f=()=>{q=0;const d=document.documentElement;if(d.scrollHeight-window.scrollY-window.innerHeight>6)el.setAttribute('data-on','1');else el.removeAttribute('data-on')};
    const s=()=>{if(!q)q=requestAnimationFrame(f)};
    f();window.addEventListener('scroll',s,{passive:true});window.addEventListener('resize',s);
    try{ro=new ResizeObserver(s);ro.observe(document.documentElement);ro.observe(document.body)}catch(e){}
    try{mo=new MutationObserver(s);mo.observe(document.body,{childList:true,subtree:true})}catch(e){}
    return()=>{window.removeEventListener('scroll',s);window.removeEventListener('resize',s);ro&&ro.disconnect();mo&&mo.disconnect();if(q)cancelAnimationFrame(q)};
  },[]);
  return <div ref={r} aria-hidden="true" className="pg-fade"/>;
}
