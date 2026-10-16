import {useState,useEffect} from 'react';
// useState that persists to localStorage (falls back to memory if storage is blocked)
export const useLS=(k,d)=>{const [v,s]=useState(()=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}});useEffect(()=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}},[k,v]);return [v,s]};
