// Offline text recognition: tesseract.js with its engine and English data embedded in the page, so nothing is downloaded or uploaded.
import {createWorker} from 'tesseract.js';
import workerSrc from 'tesseract.js/dist/worker.min.js?raw';
import coreSrc from 'tesseract.js-core/tesseract-core-lstm.wasm.js?raw';
import dataUrl from '@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz?inline';

let workerP=null;
const blobUrl=(txt,type)=>URL.createObjectURL(new Blob([txt],{type}));
export function getWorker(onStatus){
  if(!workerP)workerP=(async()=>{
    onStatus&&onStatus('Starting the recognition engine');
    const bytes=new Uint8Array(await (await fetch(dataUrl)).arrayBuffer());
    // tesseract.js 6.0.1 joins language objects by .data when initialising; use .code
    const patched=workerSrc.replace(':t.data})).join("+")',':t.code})).join("+")');
    return createWorker([{code:'eng',data:bytes}],1,{
      // the engine core goes in the same script as the worker, so the worker finds it already loaded and never fetches anything
      workerPath:blobUrl(coreSrc+'\n;'+patched,'text/javascript'),workerBlobURL:false,
      cacheMethod:'none',gzip:true,logger:()=>{}});
  })().catch(e=>{workerP=null;throw e});
  return workerP;
}

const loadImg=file=>new Promise((res,rej)=>{const u=URL.createObjectURL(file),i=new Image();i.onload=()=>res({i,u});i.onerror=()=>rej(new Error('Could not open '+file.name));i.src=u});

// Returns recognised lines (in original-image pixels) plus a canvas of the original for colour sampling.
export async function readImage(file,onStatus){
  const {i,u}=await loadImg(file);
  const W=i.naturalWidth,H=i.naturalHeight;
  const orig=document.createElement('canvas');orig.width=W;orig.height=H;orig.getContext('2d',{willReadFrequently:true}).drawImage(i,0,0);
  // small screenshots read better when enlarged, and grayscale avoids colour confusing the engine
  const scale=Math.max(1,Math.min(3,1600/Math.max(W,H)));
  const c=document.createElement('canvas');c.width=Math.round(W*scale);c.height=Math.round(H*scale);
  const g=c.getContext('2d');g.filter='grayscale(1)';g.drawImage(i,0,0,c.width,c.height);URL.revokeObjectURL(u);
  const w=await getWorker(onStatus);
  onStatus&&onStatus('Reading '+file.name);
  await w.setParameters({tessedit_pageseg_mode:'6'});
  const {data}=await w.recognize(c,{},{blocks:true});
  const lines=[];
  (data.blocks||[]).forEach(b=>(b.paragraphs||[]).forEach(p=>(p.lines||[]).forEach(l=>{
    const t=(l.text||'').trim();if(!t)return;
    lines.push({text:t,x0:l.bbox.x0/scale,y0:l.bbox.y0/scale,x1:l.bbox.x1/scale,y1:l.bbox.y1/scale,
      words:(l.words||[]).map(x=>({text:x.text,x0:x.bbox.x0/scale,y0:x.bbox.y0/scale,x1:x.bbox.x1/scale,y1:x.bbox.y1/scale}))});
  })));
  return {name:file.name,W,H,lines,canvas:orig};
}
