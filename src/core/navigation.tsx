import React,{createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {BackHandler,Platform} from 'react-native';
import {byId} from '../content/catalog';
import {careers,levels} from '../content/careers';
import {domains,type Level} from '../content/model';
import type {Step} from './learning';
export const tabs=['Home','Learn','Careers','Progress','Profile'] as const;
export type Tab=typeof tabs[number];
export type Page=Tab|'Domain'|'Career'|'Lesson'|'Encyclopedia'|'Setup'|'Placement'|'Practices'|'Interview'|'Guide';
export interface Route {page:Page;id?:string;section?:'Learn'|'Practice'|'Interview';step?:Step;level?:Level}
const home:Route={page:'Home'};
function readHash():Route{
  if(Platform.OS!=='web'||typeof location==='undefined')return home;
  const [p,id,section,rawStep]=location.hash.slice(1).split('/');
  const page=[...tabs,'Domain','Career','Lesson','Encyclopedia','Setup','Placement','Practices','Interview','Guide'].find(v=>v.toLowerCase()===p?.toLowerCase()) as Page|undefined;
  if(!page || (page==='Lesson'&&!byId[id]) ||(page==='Career'&&!careers.some(c=>c.id===id))||(page==='Domain'&&!domains.some(c=>c.id===id)))return home;
  if(page==='Interview')return {page,id:id||undefined,level:levels.find(level=>level===section)};
  return {page,id:id||undefined,section:['Learn','Practice','Interview'].includes(section)?section as Route['section']:undefined,step:['0','1','2'].includes(rawStep)?Number(rawStep) as Step:undefined};
}
const routeHash=(r:Route)=>'#'+[r.page.toLowerCase(),r.id??'',r.level??r.section??'',r.step??''].join('/').replace(/\/+$/,'');
function useRoutes(){
  const [route,show]=useState<Route>(readHash);const stack=useRef<Route[]>([route]);
  const go=useCallback((r:Route)=>{
    if(routeHash(r)===routeHash(stack.current.at(-1)!))return;
    stack.current.push(r);
    if(Platform.OS==='web')window.history.pushState({techfluent:true},'',routeHash(r));
    show(r);
  },[]);
  const back=useCallback(()=>{
    if(Platform.OS==='web'&&stack.current.length>1){window.history.back();return true;}
    if(stack.current.length>1){stack.current.pop();show(stack.current.at(-1)!);return true;}
    if(stack.current[0].page!=='Home'){stack.current=[home];if(Platform.OS==='web')window.history.replaceState(null,'',routeHash(home));show(home);return true;}return false;
  },[]);
  useEffect(()=>{
    if(Platform.OS!=='web'){const sub=BackHandler.addEventListener('hardwareBackPress',back);return()=>sub.remove();}
    const moved=()=>{const r=readHash();const prev=stack.current.at(-2);if(prev&&routeHash(prev)===routeHash(r))stack.current.pop();else if(routeHash(stack.current.at(-1)!)!==routeHash(r))stack.current.push(r);show(r);};
    window.addEventListener('hashchange',moved);return()=>window.removeEventListener('hashchange',moved);
  },[back]);return {route,go,back};
}
const Nav=createContext<ReturnType<typeof useRoutes>|null>(null);
export const useNav=()=>useContext(Nav)!;
export function Navigator({children}:{children:ReactNode}){const n=useRoutes();return <Nav.Provider value={n}>{children}</Nav.Provider>;}
