import {PREREQ,TASK_LL,TASK_REQ,TRADER_TASKS,FENCE_REP,FAILED_ONLY,HIDDEN_REQ} from './data.js';
// Decides whether a trader task can be started with the stats the user has entered.
// Returns {st:'ok'|'locked'|'unknown', why:[...]}. 'unknown' = depends on something this planner cannot check.
export const taskStatus=(s,t,x)=>{
  const lvl=s.n.lvl||1,ll=tr=>s.n['ll:'+tr]||1,why=[],unk=[];
  const done=(tt,n)=>!!s.c['tk:'+tt+':'+n];
  const r=TASK_REQ[t+'|'+x];
  if(r&&r[0]>lvl)why.push('level '+r[0]);
  (r&&r[1]?r[1].split(','):[]).forEach(e=>{const m=e.match(/^(\D+)(\d)$/);if(m&&ll(m[1])<+m[2])why.push(m[1]+' LL'+m[2])});
  if(t!=='Fence'&&(TASK_LL[t+'|'+x]||1)>ll(t))why.push(t+' LL'+(TASK_LL[t+'|'+x]||1));
  if(t==='Fence'&&FENCE_REP[x]){const [op,v]=FENCE_REP[x],k=s.n.karma;
    if(k===undefined||k===''||k===null)unk.push('scav karma not entered');
    else{const ok=op==='>='?k>=v:op==='>'?k>v:op==='<='?k<=v:k<v;if(!ok)why.push('karma '+op+' '+v)}}
  if(FAILED_ONLY.includes(t+'|'+x))unk.push('needs an earlier task to be failed');
  if(HIDDEN_REQ.has(t+'|'+x))unk.push('hidden game-state requirement');
  for(const p of (PREREQ[t+'|'+x]||[])){const i=p.indexOf('|'),pt=p.slice(0,i),pn=p.slice(i+1);
    if(TRADER_TASKS[pt]&&TRADER_TASKS[pt].includes(pn)){if(!done(pt,pn))why.push('task: '+pn)}else unk.push('untracked task: '+pn)}
  return {st:why.length?'locked':unk.length?'unknown':'ok',why:why.concat(unk)};
};
