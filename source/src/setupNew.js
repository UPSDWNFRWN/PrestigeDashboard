import React from 'react';

// Marks changes to the setup. When an update changes or adds a setup step, raise SETUP_VERSION by one and list the step
// names (as they appear in the setup, e.g. 'Profile', 'Level', 'Traders', 'Maps', 'Hideout', 'Tasks', 'Review') under that version.
// People who set up before the change then see the purple new pip on Run Setup and on those steps until they have looked at them.
export const SETUP_VERSION=1;
export const SETUP_CHANGES={1:[]};
const KEY='tpp2_ui_setupnew';

const load=()=>{
  try{
    const v=JSON.parse(localStorage.getItem(KEY));
    if(v&&typeof v.v==='number'){
      if(v.v>=SETUP_VERSION)return v;
      const n={v:SETUP_VERSION,seen:[]};localStorage.setItem(KEY,JSON.stringify(n));return n; // an update changed the setup
    }
    const n={v:SETUP_VERSION,seen:SETUP_CHANGES[SETUP_VERSION]||[]}; // first visit: nothing is new yet
    localStorage.setItem(KEY,JSON.stringify(n));return n;
  }catch{return {v:SETUP_VERSION,seen:SETUP_CHANGES[SETUP_VERSION]||[]}}
};

// Which setup steps are new to you (not looked at yet), and a way to mark one as looked at.
export function useSetupNew(){
  const [st,setSt]=React.useState(load);
  React.useEffect(()=>{const h=()=>setSt(load());window.addEventListener('pd-setupnew',h);return()=>window.removeEventListener('pd-setupnew',h)},[]);
  const all=SETUP_CHANGES[SETUP_VERSION]||[];
  const fresh=all.filter(n=>!st.seen.includes(n));
  const seen=name=>{if(!fresh.includes(name))return;try{localStorage.setItem(KEY,JSON.stringify({v:SETUP_VERSION,seen:[...st.seen,name]}))}catch{}window.dispatchEvent(new Event('pd-setupnew'))};
  return {fresh,any:fresh.length>0,seen};
}
