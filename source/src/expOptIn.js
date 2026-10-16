import {useState,useEffect} from 'react';
// Experimental features are off until the user opts in (Welcome window). The choice is remembered in this browser.
const KEY='tpp2_ui_exp';
const read=()=>{try{return localStorage.getItem(KEY)==='1'}catch{return false}};
export const setExp=on=>{try{on?localStorage.setItem(KEY,'1'):localStorage.removeItem(KEY)}catch{}window.dispatchEvent(new Event('pd-exp-change'))};
export const useExp=()=>{const [on,set]=useState(read);useEffect(()=>{const h=()=>set(read());window.addEventListener('pd-exp-change',h);return()=>window.removeEventListener('pd-exp-change',h)},[]);return on};
