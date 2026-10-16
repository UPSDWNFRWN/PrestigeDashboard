// Saved-data version. Bump DATA_VERSION and add a step to STEPS whenever the shape of the saved progress changes
// (a renamed key, a restructured value). STEPS[n] converts version n data into version n+1. It receives and returns a
// map of storage key -> JSON string for the cycle progress keys (tpp2_cycle_N). Nothing is needed while the format stays the same.
export const DATA_VERSION=1;
const STEPS={
  // 1:d=>{ ...return converted d },
};
const VK='tpp2_dataver';
export const migrateMap=(d,from)=>{let v=from||1;while(v<DATA_VERSION){if(STEPS[v])d=STEPS[v](d);v++}return d};
// Run once at startup. Data saved before versions existed counts as version 1.
export function migrateStorage(){
  try{
    const raw=localStorage.getItem(VK),v=raw===null?1:(+raw||1);
    if(v>DATA_VERSION)return; // saved by a newer copy of the page: leave it alone
    if(v<DATA_VERSION){
      const d={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/^tpp2_cycle_\d+$/.test(k))d[k]=localStorage.getItem(k)}
      const out=migrateMap(d,v);Object.entries(out).forEach(([k,val])=>localStorage.setItem(k,val));
    }
    localStorage.setItem(VK,String(DATA_VERSION));
  }catch{}
}
