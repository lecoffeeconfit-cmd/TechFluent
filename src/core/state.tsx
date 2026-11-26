import React, {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppState} from 'react-native';
import {cloud,synchronize} from '../services/cloud';
import {dailyPlan,evidence,initial,mergeEvents,mergeGuest,readLearner,type Learner,type Preferences} from './learning';

const keyFor=(owner:string)=>'techfluent.v1.'+(process.env.EXPO_PUBLIC_APP_ENV??'development')+'.'+owner;
let pending=Promise.resolve();
function write<T>(op:()=>Promise<T>):Promise<T>{const work=pending.then(op);pending=work.then(()=>{},()=>{});return work;}
type Updater=(fn:(previous:Learner)=>Learner)=>void;
function useRecord(owner:string){
  const [model,setModel]=useState<Learner>(initial),[ready,setReady]=useState(false),[warning,setWarning]=useState('');
  const [blocked,setBlocked]=useState(false),[version,reload]=useState(0);
  const ref=useRef(model),alive=useRef(true),syncing=useRef(false);
  const [syncStatus,setSyncStatus]=useState(''),[syncNonce,trigger]=useState(0);
  const [now,tick]=useState(Date.now);
  useEffect(()=>{
    alive.current=true; let active=true;
    pending.then(()=>AsyncStorage.getItem(keyFor(owner))).then(raw=>{
      const value=readLearner(raw);if(active){ref.current=value;setModel(value);setReady(true);setBlocked(false);setWarning('');}
    }).catch(()=>{if(active){setBlocked(true);setWarning('Your saved record could not be opened. Retry to recover it.');}});
    return ()=>{active=false;alive.current=false;};
  },[owner,version]);
  const update=useCallback<Updater>(fn=>{
    const next=fn(ref.current);ref.current=next;setModel(next);
    write(()=>AsyncStorage.setItem(keyFor(owner),JSON.stringify(next))).then(()=>{if(alive.current)setWarning('');}).catch(()=>{
      if(alive.current)setWarning('This device could not save your latest changes. Export a copy from Profile or retry saving.');
    });
  },[owner]);
  const patch=useCallback((p:Partial<Preferences>)=>update(s=>({...s,prefs:{...s.prefs,...p}})),[update]);
  const sync=useCallback(async()=>{
    if(!cloud || owner==='guest'||syncing.current||!ready)return;
    syncing.current=true;setSyncStatus('Syncing…');
    try{
      const merged=await synchronize(owner,ref.current.events);
      if(alive.current){update(s=>({...s,events:mergeEvents(merged,s.events)}));setSyncStatus('Progress synced');}
    }catch{if(alive.current)setSyncStatus('Saved locally · sync pending');}finally{syncing.current=false;}
  },[owner,ready,update]);
  useEffect(()=>{if(!ready)return; const handle=setTimeout(()=>{void sync();},1000);return()=>clearTimeout(handle);},[syncNonce,model.events.length,sync,ready]);
  useEffect(()=>{
    const timer=setInterval(()=>tick(Date.now()),60000);
    const sub=AppState.addEventListener('change',s=>{if(s==='active'){tick(Date.now());trigger(i=>i+1);}});
    return()=>{clearInterval(timer);sub.remove();};
  },[]);
  const importGuest=async()=>{
    if(owner==='guest')return 'Sign in first.';
    return write(async()=>{
      const raw=await AsyncStorage.getItem(keyFor('guest'));
      if(!raw)return 'There is no guest record to import.';
      if(!alive.current)return 'The profile changed.';
      const merged=mergeGuest(ref.current,readLearner(raw));
      ref.current=merged;setModel(merged);
      await AsyncStorage.setItem(keyFor(owner),JSON.stringify(merged));
      await AsyncStorage.removeItem(keyFor('guest'));trigger(i=>i+1);return 'Guest learning added to your account.';
    });
  };
  const map=useMemo(()=>evidence(model.events,now),[model.events,now]);
  const plan=useMemo(()=>dailyPlan(model,map),[model,map]);
  const forget=async()=>{await write(()=>AsyncStorage.removeItem(keyFor(owner)));if(alive.current){ref.current=initial();setModel(ref.current);}};
  return {model,map,plan,now,update,patch,owner,ready,blocked,warning,sync,syncStatus,importGuest,forget,retry:()=>{if(blocked||!ready){setReady(false);reload(n=>n+1);}else update(s=>({...s}));}};
}
const Learning=createContext<ReturnType<typeof useRecord>|null>(null);
export const useLearning=()=>useContext(Learning)!;
export function LearningProvider({owner,children}:{owner:string;children:ReactNode}){const value=useRecord(owner);return <Learning.Provider value={value}>{children}</Learning.Provider>;}
