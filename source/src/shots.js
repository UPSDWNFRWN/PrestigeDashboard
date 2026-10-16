// Turns recognised screenshot text into task ticks and Prestige panel values. Pure functions, no UI.
import {TRADER_TASKS,TRADERS} from './data.js';
import {slug} from './hideout.js';

const norm=s=>s.toLowerCase().replace(/[’'`]/g,'').replace(/[^a-z0-9]+/g,'');
const lev=(a,b)=>{const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let p=Array.from({length:n+1},(_,j)=>j);for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[n]};
const sim=(a,b)=>1-lev(a,b)/Math.max(a.length,b.length,1);
// drop icon noise that the engine reads as stray characters at the start of a row
const variants=text=>{const t=text.replace(/[|_~=*]+/g,' ').replace(/^[^A-Za-z0-9]+/,'').trim();const out=[t];
  const parts=t.split(/\s+/);if(parts.length>2&&parts[0].length<=2)out.push(parts.slice(1).join(' '));
  if(parts.length>2&&parts[0].length<=2&&parts[1].length<=2)out.push(parts.slice(2).join(' '));return out};
function bestMatch(text,cands,min=0.84){ // cands: [{n,ref}]
  let best=null,second=0;
  variants(text).forEach(v=>{const n=norm(v);if(n.length<3)return;cands.forEach(c=>{const s=sim(n,c.n);if(!best||s>best.s){if(best&&best.ref!==c.ref)second=Math.max(second,best.s);best={s,ref:c.ref}}else if(c.ref!==best.ref)second=Math.max(second,s)})});
  return best&&best.s>=min&&best.s-second>=0.02?best:null}
const TASKS=[];Object.entries(TRADER_TASKS).forEach(([t,l])=>l.forEach(x=>TASKS.push({n:norm(x),ref:{t,x}})));

// ---- colour sampling
const px=(cv,x,y)=>{const W=cv.width,H=cv.height;const d=cv.getContext('2d',{willReadFrequently:true}).getImageData(Math.max(0,Math.min(W-1,Math.round(x))),Math.max(0,Math.min(H-1,Math.round(y))),1,1).data;return [d[0],d[1],d[2]]};
const hue=([r,g,b])=>b-r>8?'blue':r-b>8?'brown':'none';
// row background: blue = completed, brown = in progress (per the player)
export function rowState(img,line){
  const y=(line.y0+line.y1)/2,votes={blue:0,brown:0,none:0};
  [0.015,0.02,0.025,0.93,0.96].forEach(f=>votes[hue(px(img.canvas,img.W*f,y))]++);
  if(votes.blue>votes.brown&&votes.blue>=2)return 'done';
  if(votes.brown>votes.blue&&votes.brown>=2)return 'active';
  return 'other'}
// text colour: brightest pixels inside the line box; met conditions in the Prestige panel are drawn in blue
export function textIsBlue(img,line){
  const x0=Math.max(0,Math.floor(line.x0)),y0=Math.max(0,Math.floor(line.y0)),w=Math.max(1,Math.min(img.W-x0,Math.ceil(line.x1-line.x0))),h=Math.max(1,Math.min(img.H-y0,Math.ceil(line.y1-line.y0)));
  const d=img.canvas.getContext('2d',{willReadFrequently:true}).getImageData(x0,y0,w,h).data,px_=[];
  for(let i=0;i<d.length;i+=4)px_.push([d[i],d[i+1],d[i+2],d[i]+d[i+1]+d[i+2]]);
  px_.sort((a,b)=>b[3]-a[3]);const top=px_.slice(0,Math.max(3,Math.floor(px_.length*0.12)));
  const m=top.reduce((a,p)=>[a[0]+p[0],a[1]+p[1],a[2]+p[2]],[0,0,0]).map(v=>v/top.length);
  return m[2]-m[0]>25}

// ---- task list screenshot
export function parseTaskList(img){
  const rows=[],un=[],seen=new Set();
  img.lines.forEach(l=>{
    if(/^\W*loyalty\s*level/i.test(l.text))return;
    const m=bestMatch(l.text,TASKS);
    if(!m){if(/[A-Za-z]{4,}/.test(l.text))un.push(l.text);return}
    const k=m.ref.t+'|'+m.ref.x;if(seen.has(k))return;seen.add(k);
    rows.push({t:m.ref.t,x:m.ref.x,state:rowState(img,l),raw:l.text,score:m.s})});
  return {rows,unmatched:un}}

// ---- Prestige unlock panel
const fixDigits=s=>s.replace(/[Oo]/g,'0').replace(/[lI|]/g,'1');
const toNum=s=>{const d=fixDigits(s).replace(/[^\d]/g,'');return d?+d:NaN};
// Only the current value matters: the target is already known from the prestige, and it is the small grey half that gets misread.
// unsure = true when the slash was lost or the value looks wrong, so the review screen flags it.
export function parseFrac(str,expNeed){
  const s=str.trim();
  const m=/^(\d[\d\s.,OolI]*?)\s*[\/\\]/.exec(s);
  if(m){const cur=toNum(m[1]);return {cur,unsure:!(Number.isFinite(cur)&&cur<=expNeed*1.0001)}}
  const d=(/(\d[\d\s]*)$/.exec(s)||[])[1];if(!d)return null;
  const t=d.replace(/\s/g,''),e=String(expNeed),n=e.length;
  const cands=[t.slice(0,-n),t.slice(0,-n-1)].filter(x=>x&&t.endsWith(e)&&+x<=expNeed);
  if(cands.length)return {cur:+cands[0],unsure:true};
  return +t<=expNeed?{cur:+t,unsure:true}:null}
const labelOf=t=>t.match(/^\D*/)[0].replace(/\s+$/,'');
const ALIAS={'obtaintheticketfromtarkov':'The Ticket from Tarkov'};
export function parsePanel(img,cy){
  const L=img.lines,out={level:null,skills:[],hideout:[],rub:null,tasks:[],warnings:[]};
  let sec=null,started=false;
  const gate=[...cy.tasks.map(n=>({n:norm(n),ref:{k:'t:'+n,name:n}})),...cy.story.map(n=>({n:norm(n),ref:{k:'s:'+n,name:n}}))];
  Object.entries(ALIAS).forEach(([a,n])=>{const g=gate.find(x=>x.ref.name===n);if(g)gate.push({n:a,ref:g.ref})});
  const skillNames=Object.keys(cy.skills),modNames=Object.keys(cy.hideout);
  for(const l of L){
    const t=l.text.replace(/^[^A-Za-z0-9]+/,'');
    if(/character\s*level/i.test(t)){if(started)break;started=true;sec='level';const f=parseFrac(t.replace(/character\s*level/i,''),cy.lvl);out.level={cur:f?f.cur:NaN,unsure:!f||f.unsure,raw:l.text};continue}
    if(!started)continue;
    if(/^tasks?\s*:?$/i.test(t)){sec='tasks';continue}
    if(/^skills?\s*:?$/i.test(t)){sec='skills';continue}
    if(/^hideout\s*upgrades?\s*:?$/i.test(t)){sec='hideout';continue}
    if(/^obtain\s*items?\s*:?$/i.test(t)){sec='items';continue}
    if(sec==='tasks'){const m=bestMatch(t,gate,0.8);if(m)out.tasks.push({...m.ref,met:textIsBlue(img,l),raw:l.text});continue}
    if(sec==='skills'){const lb=labelOf(t),m=bestMatch(lb,skillNames.map(n=>({n:norm(n),ref:n})),0.7);if(m){const nm=m.ref,f=parseFrac(t.slice(lb.length),cy.skills[nm]);out.skills.push({name:nm,cur:f?f.cur:NaN,unsure:!f||f.unsure,exp:cy.skills[nm],raw:l.text})}continue}
    if(sec==='hideout'){const lb=labelOf(t),m=bestMatch(lb,modNames.map(n=>({n:norm(n),ref:n})),0.7);if(m){const nm=m.ref,f=parseFrac(t.slice(lb.length),cy.hideout[nm]);out.hideout.push({name:nm,cur:f?f.cur:NaN,unsure:!f||f.unsure,exp:cy.hideout[nm],raw:l.text})}continue}
    if(sec==='items'&&/rou?bles?/i.test(t)){const lb=labelOf(t),f=parseFrac(t.slice(lb.length),cy.rub*1e6);out.rub={cur:f?f.cur:NaN,unsure:!f||f.unsure,exp:cy.rub*1e6,raw:l.text}}
  }
  
  return out}

export const isPanel=img=>img.lines.some(l=>/unlock\s*conditions|character\s*level/i.test(l.text));
export {slug};

// ---- Traders screen: each portrait has a roman numeral badge (I to IV) in its top-left corner
const dark=(d,i)=>(d[i]+d[i+1]+d[i+2])/3<115;
const runs=(row)=>{const o=[];let s=-1;row.forEach((v,x)=>{if(v&&s<0)s=x;if(!v&&s>=0){o.push([s,x-1]);s=-1}});if(s>=0)o.push([s,row.length-1]);return o};
// Read one badge numeral from a crop of its inside. Returns {ll,unsure} or null.
function readNumeral(cv,bx,by,bs){
  const m=Math.round(bs*0.14),x0=Math.round(bx+m),y0=Math.round(by+m),w=Math.round(bs-2*m),h=Math.round(bs-2*m);
  if(w<6||h<6)return null;
  const ctx=cv.getContext('2d',{willReadFrequently:true});
  const d=ctx.getImageData(Math.max(0,x0),Math.max(0,y0),Math.min(w,cv.width-x0),Math.min(h,cv.height-y0)).data;
  const W=Math.min(w,cv.width-x0),H=Math.min(h,cv.height-y0);
  const grid=[];for(let y=0;y<H;y++){const r=[];for(let x=0;x<W;x++)r.push(dark(d,(y*W+x)*4));grid.push(r)}
  const rowsWith=grid.map((r,y)=>r.some(Boolean)?y:-1).filter(y=>y>=0);
  if(!rowsWith.length)return null;
  const top=rowsWith[0],bot=rowsWith[rowsWith.length-1],gh=bot-top+1;
  if(gh<H*0.3||gh>H*0.98)return null;                       // too small to be a numeral, or it is the badge border
  const at=f=>runs(grid[Math.round(top+gh*f)]);
  const a=at(0.3),b=at(0.7);
  const vertical=a.length===b.length&&a.every((r,i)=>Math.abs((r[0]+r[1])/2-(b[i][0]+b[i][1])/2)<=Math.max(1.5,W*0.05));
  if(vertical&&a.length>=1&&a.length<=3)return {ll:a.length,unsure:false};
  if(a.length>=2||b.length>=2){ // an I next to a V: strokes lean, so the runs differ between the two heights
    return {ll:4,unsure:!(Math.abs(a.length-b.length)>0||!vertical)};}
  return null;
}
// Find the light grey square badge near where it should be (name text centres vary, so search a window)
function findBadge(cv,cx,cy,p){
  const wx0=Math.max(0,Math.round(cx-p*0.75)),wy0=Math.max(0,Math.round(cy-p*0.95));
  const ww=Math.min(cv.width-wx0,Math.round(p*0.55)),wh=Math.min(cv.height-wy0,Math.round(p*0.5));
  if(ww<10||wh<10)return null;
  const d=cv.getContext('2d',{willReadFrequently:true}).getImageData(wx0,wy0,ww,wh).data;
  const ok=new Uint8Array(ww*wh);
  for(let i=0;i<ww*wh;i++){const r=d[i*4],g=d[i*4+1],b=d[i*4+2],m=(r+g+b)/3;ok[i]=m>165&&Math.max(r,g,b)-Math.min(r,g,b)<50?1:0}
  // erode so thin bridges to bright portrait areas break, then grow the box back after
  const er=(src)=>{const o=new Uint8Array(ww*wh);for(let y=1;y<wh-1;y++)for(let x=1;x<ww-1;x++){const i=y*ww+x;o[i]=src[i]&&src[i-1]&&src[i+1]&&src[i-ww]&&src[i+ww]&&src[i-ww-1]&&src[i-ww+1]&&src[i+ww-1]&&src[i+ww+1]?1:0}return o};
  const E=er(er(ok));const E0=ok;ok.set(E);
  const seen=new Uint8Array(ww*wh);let best=null;
  for(let s=0;s<ww*wh;s++){if(!ok[s]||seen[s])continue;
    let x0=ww,y0=wh,x1=0,y1=0,n=0;const st=[s];seen[s]=1;
    while(st.length){const q=st.pop(),x=q%ww,y=(q-x)/ww;n++;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=ww||ny>=wh)return;const k=ny*ww+nx;if(ok[k]&&!seen[k]){seen[k]=1;st.push(k)}})}
    x0-=2;y0-=2;x1+=2;y1+=2;n+=0;const bw=x1-x0+1,bh=y1-y0+1;
    if(bw<p*0.13||bw>p*0.26||bh<p*0.13||bh>p*0.26||Math.abs(bw-bh)>Math.max(bw,bh)*0.25||n<bw*bh*0.25)continue;
    if(!best||n>best.n)best={n,x:wx0+x0,y:wy0+y0,s:Math.max(bw,bh)}}
  return best}
export function parseLoyalty(img){
  const names=[];
  img.lines.forEach(l=>l.words.forEach(w=>{const n=norm(w.text);if(n.length<4)return;
    const m=TRADERS.map(t=>({t,s:sim(n,norm(t))})).sort((p,q)=>q.s-p.s)[0];
    if(m&&m.s>=0.75&&!names.some(x=>x.t===m.t))names.push({t:m.t,cx:(w.x0+w.x1)/2,cy:(w.y0+w.y1)/2,h:w.y1-w.y0})}));
  if(!names.length)return {rows:[]};
  const xs=names.map(n=>n.cx).sort((a,b)=>a-b),gaps=xs.slice(1).map((x,i)=>x-xs[i]).filter(g=>g>20).sort((a,b)=>a-b);
  const heightPitch=names.map(n=>n.h).sort((a,b)=>a-b)[Math.floor(names.length/2)]*9.2;
  const pitch=gaps.length?Math.min(gaps[0]*1.0,gaps[0]):heightPitch;
  const found=names.map(n=>({n,bd:findBadge(img.canvas,n.cx,n.cy,pitch)}));
  const got=found.filter(f=>f.bd);
  // Bright portraits can swallow a badge's edge. Tiles sit on a regular grid, so place a missed badge from one that was found.
  if(got.length){
    const ref=got[0],size=got.map(f=>f.bd.s).sort((x,y)=>x-y)[Math.floor(got.length/2)];
    let pt=pitch;
    if(got.length>1){const l=got[got.length-1],k=Math.round((l.n.cx-ref.n.cx)/pitch);if(k>0)pt=(l.bd.x-ref.bd.x)/k}
    found.forEach(f=>{if(!f.bd){const k=Math.round((f.n.cx-ref.n.cx)/pitch);f.bd={x:ref.bd.x+k*pt,y:ref.bd.y,s:size}}})}
  // No badge was found at all (bright portraits can hide every one of them, and the dark Fence tile is not a tracked trader).
  // Place each badge from its trader name using the usual layout, and mark every row to be checked.
  else found.forEach(f=>{f.bd={x:f.n.cx-pitch*0.43,y:f.n.cy-pitch*0.77,s:pitch*0.163,est:true}});
  const rows=found.map(({n,bd})=>{
    const r=bd?readNumeral(img.canvas,bd.x,bd.y,bd.s):null;
    return {t:n.t,ll:r?r.ll:null,unsure:!r||r.unsure||!!(bd&&bd.est)}});
  return {rows};
}
export const isTraders=img=>{const n=new Set();img.lines.forEach(l=>l.words.forEach(w=>{const v=norm(w.text);TRADERS.forEach(t=>{if(sim(v,norm(t))>=0.8)n.add(t)})}));return n.size>=3&&!img.lines.some(l=>/unlock\s*conditions|character\s*level/i.test(l.text))};
