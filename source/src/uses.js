import CB from './cb.json';
// Crafts and barters from tarkov.dev PvE data (patch 1.2.0.0, 11 Oct 2026). Ref barters (arena coins) are left out.
const TRADER_BY_CODE=['Prapor','Therapist','Fence','Skier','Peacekeeper','Mechanic','Ragman','Jaeger'];
const U={};
const slot=n=>U[n]||(U[n]={crafts:[],barters:[]});
CB.C.forEach(([st,lv,req,prod])=>{
  const ing=req.map(r=>({n:CB.N[r[0]],c:r[1],tool:!!r[2]})),out={n:CB.N[prod[0]],c:prod[1]};
  ing.forEach(i=>slot(i.n).crafts.push({st,lv,ing,out,tool:i.tool}));
});
CB.B.forEach(([tr,ll,req,off,un])=>{
  const ing=req.map(r=>({n:CB.N[r[0]],c:r[1]})),out={n:CB.N[off[0]],c:off[1]};
  ing.forEach(i=>slot(i.n).barters.push({tr:TRADER_BY_CODE[tr],ll,ing,out,unlock:un>=0?CB.N[un]:null}));
});
export const usesOf=n=>U[n]||{crafts:[],barters:[]};
export const INGREDIENTS=Object.keys(U);
