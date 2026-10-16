import HID from './hideout.json';
export {HID};

export const slug=n=>n.toLowerCase().replace(/ /g,'-');
export const stName=k=>k.split('-').map(w=>w==='of'?w:w[0].toUpperCase()+w.slice(1)).join(' ');
export const maxLvl=k=>HID[k].length;
export const skillName=n=>n.replace(/([a-z])([A-Z])/g,'$1 $2');
export const CURRENCY=['Roubles','Dollars','Euros'];
export const fmtTime=sec=>{if(!sec)return 'Instant';const d=Math.floor(sec/86400),h=Math.floor(sec%86400/3600),m=Math.round(sec%3600/60);return [d&&d+'d',h&&h+'h',!d&&m&&m+'m'].filter(Boolean).join(' ')||'1m'};

// Level you have built. A gate ticked in an older save counts as built to the required level.
export const curLevel=(s,cy,k)=>{
  let v=s.n['hl:'+k]||0;
  Object.entries(cy.hideout).forEach(([n,l])=>{if(slug(n)===k&&s.c['h:'+n])v=Math.max(v,l)});
  return v;
};

// Works out every upgrade still needed: the cycle's required levels, any extra targets you set,
// and every module those upgrades depend on, in an order you can build them.
export function planHideout(s,cy){
  const cur=k=>curLevel(s,cy,k);
  const T={},req={};
  Object.entries(cy.hideout).forEach(([n,l])=>{const k=slug(n);if(HID[k]){req[k]=Math.max(req[k]||0,l);T[k]=Math.max(T[k]||0,l)}});
  Object.keys(HID).forEach(k=>{const e=s.n['ht:'+k];if(e>0)T[k]=Math.max(T[k]||0,Math.min(e,maxLvl(k)))});
  let changed=true;
  while(changed){changed=false;
    for(const k of Object.keys(T))for(let l=cur(k)+1;l<=T[k];l++)for(const [ps,pl] of HID[k][l-1].s){
      if(ps===k||!HID[ps])continue;
      if(pl>cur(ps)&&pl>(T[ps]||0)){T[ps]=pl;changed=true}}}
  const steps=[];
  for(const k of Object.keys(T))for(let l=cur(k)+1;l<=T[k];l++){
    const d=HID[k][l-1];
    steps.push({key:k,l,t:d.t,s:d.s,r:d.r,sk:d.k,i:d.i,forPrestige:!!req[k]&&l<=req[k]});
  }
  // order: a step comes after everything it needs
  const built={};Object.keys(HID).forEach(k=>built[k]=cur(k));
  const rest=steps.slice(),ordered=[];
  while(rest.length){
    const ok=rest.filter(st=>built[st.key]>=st.l-1&&st.s.every(([ps,pl])=>ps===st.key||(built[ps]||0)>=pl));
    const pick=(ok.length?ok:rest).slice().sort((a,b)=>(b.forPrestige-a.forPrestige)||a.t-b.t||stName(a.key).localeCompare(stName(b.key)))[0];
    ordered.push(pick);rest.splice(rest.indexOf(pick),1);built[pick.key]=Math.max(built[pick.key],pick.l);
  }
  // status against what you have built right now
  const ll=t=>s.n['ll:'+t]||1;
  ordered.forEach(st=>{
    const mods=[];
    if(st.l>1&&cur(st.key)<st.l-1)mods.push({k:st.key,l:st.l-1});
    st.s.forEach(([ps,pl])=>{if(ps!==st.key&&cur(ps)<pl)mods.push({k:ps,l:pl})});
    st.blockMods=mods;
    st.blockTraders=st.r.filter(([t,l])=>ll(t)<l);
    st.ready=mods.length===0&&st.blockTraders.length===0;
  });
  return {steps:ordered,targets:T,req,cur};
}

// Total materials for a list of steps
export function materials(steps){
  const m={};
  steps.forEach(st=>st.i.forEach(([n,c,fir])=>{const o=m[n]=m[n]||{n,need:0,fir:0};o.need+=c;if(fir)o.fir+=c}));
  return Object.values(m);
}
