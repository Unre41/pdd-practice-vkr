'use client';
import { useSyncExternalStore } from 'react';

export type CityProgress = { played: boolean; stars: Record<string,number>; completed: number; updatedAt: string };
const key='pdd-city-progress-v1';
const eventName='pdd-city-progress-changed';
const empty='{"played":false,"stars":{},"completed":0,"updatedAt":""}';
function read() { if(typeof window==='undefined')return empty; try{return window.localStorage.getItem(key)??empty;}catch{return empty;} }
function subscribe(callback:()=>void) { window.addEventListener(eventName,callback); window.addEventListener('storage',callback);return()=>{window.removeEventListener(eventName,callback);window.removeEventListener('storage',callback);}; }
function parseProgress(snapshot:string): CityProgress {
  try {
    const value=JSON.parse(snapshot);
    const stars:Record<string,number>={};
    for(const [id,count] of Object.entries(value.stars??{})) {
      if(/^(traffic|signal|speed|route)-[0-2]$/.test(id)&&typeof count==='number'&&Number.isInteger(count)&&count>=1&&count<=3)stars[id]=count;
    }
    return {played:value.played===true,stars,completed:Object.keys(stars).length,updatedAt:typeof value.updatedAt==='string'?value.updatedAt:''};
  }catch{return JSON.parse(empty);}
}
export function getCityProgress(): CityProgress { return parseProgress(read()); }
export function useCityProgress() { const snapshot=useSyncExternalStore(subscribe,read,()=>empty);return parseProgress(snapshot); }
function write(value:CityProgress) { try{window.localStorage.setItem(key,JSON.stringify(value));window.dispatchEvent(new Event(eventName));}catch{/* Игра остаётся доступной при запрете локального хранения. */} }
export function markFreePlay() { const value=getCityProgress();if(!value.played)write({...value,played:true,updatedAt:new Date().toISOString()}); }
export function recordCityLevel(id:string,stars:number) {if(!/^(traffic|signal|speed|route)-[0-2]$/.test(id)||!Number.isInteger(stars)||stars<1||stars>3)return;const value=getCityProgress();const best=Math.max(value.stars[id]??0,stars);if(best===(value.stars[id]??0))return;const next={...value.stars,[id]:best};write({played:true,stars:next,completed:Object.keys(next).length,updatedAt:new Date().toISOString()});}
