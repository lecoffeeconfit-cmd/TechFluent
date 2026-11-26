import {byId, lessons} from '../content/catalog';
import {careers,requirementsThroughLevel,type Requirement} from '../content/careers';
import {curriculumVersion, type Exercise, type Level} from '../content/model';

export const dayMs = 86_400_000;
export const intervals = [1, 3, 7, 14, 30] as const;
export type Step = 0 | 1 | 2;
export interface Attempt { id: string; concept: string; step: Step; response: string[]; hinted: boolean; at: number; version: string }
export interface Preferences {
  minutes: 5 | 10 | 15 | 30; interests: string[]; experience: string; goal: string;
  explanation: 'Simple' | 'Technical'; level: Level; theme: 'System' | 'Light' | 'Dark';
  reduceMotion: boolean; onboarding: boolean;
}
export interface Learner {
  schema: 1; events: Attempt[]; prefs: Preferences; bookmarks: string[];
  resume: {id: string; section: 'Learn'|'Practice'|'Interview'; step: Step} | null;
  notes: Record<string, string>;
}
export const initial = (): Learner => ({schema:1, events:[], bookmarks:[], resume:null, notes:{},
  prefs:{minutes:5,interests:[],experience:'New to tech',goal:'Everyday fluency',explanation:'Simple',level:'Entry',theme:'System',reduceMotion:false,onboarding:false}});
export const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g,' ');
export function correct(ex: Exercise, response: string[]): boolean {
  const values=response.map(normalize);
  if(ex.kind==='order') return ex.answer.length===values.length && ex.answer.every((s,i)=>normalize(s)===values[i]);
  return values.length===1 && ex.answer.some(x=>normalize(x)===values[0]);
}
export function newAttempt(concept: string, step: Step, response: string[], hinted: boolean, at=Date.now()): Attempt {
  const id=typeof globalThis.crypto?.randomUUID==='function' ? globalThis.crypto.randomUUID() :
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, x=>{const n=Math.floor(Math.random()*16);return (x==='x'?n:((n&3)|8)).toString(16);});
  return {id,concept,step,response,hinted,at,version:curriculumVersion};
}
export function validAttempt(e: unknown): e is Attempt {
  if(!e || typeof e!=='object') return false;
  const v=e as Attempt;
  return typeof v.id==='string' && /^[0-9a-f-]{36}$/i.test(v.id) && Object.hasOwn(byId,v.concept) &&
    [0,1,2].includes(v.step) && typeof v.hinted==='boolean' && Number.isSafeInteger(v.at) && v.at>0 &&
    v.version===curriculumVersion && Array.isArray(v.response) && v.response.length>0 && v.response.length<=8 && v.response.every(s=>typeof s==='string' && s.length<=300);
}
export function mergeEvents(...lists: Attempt[][]) {
  const unique=new Map<string,Attempt>();
  for(const list of lists) for(const e of list) if(validAttempt(e) && !unique.has(e.id)) unique.set(e.id,e);
  return [...unique.values()].sort((a,b)=>a.at-b.at || a.id.localeCompare(b.id));
}
export function readLearner(json: string|null): Learner {
  if(!json) return initial();
  const raw=JSON.parse(json) as Partial<Learner>;
  if(!raw || raw.schema!==1 || !Array.isArray(raw.events)) throw Error('This learning record could not be opened.');
  const base=initial(), p=raw.prefs??base.prefs;
  const pick=<T>(v:T, options:readonly T[], fallback:T) => options.includes(v)?v:fallback;
  const resume=raw.resume;
  return {...base, events: mergeEvents(raw.events), bookmarks:[...new Set((Array.isArray(raw.bookmarks)?raw.bookmarks:[]).filter(id=>Object.hasOwn(byId,id)))],
    prefs:{minutes:pick(p.minutes,[5,10,15,30],5), interests:careers.filter(c=>Array.isArray(p.interests)&&p.interests.includes(c.id)).map(c=>c.id),
      experience:typeof p.experience==='string'?p.experience.slice(0,70):base.prefs.experience,goal:typeof p.goal==='string'?p.goal.slice(0,80):base.prefs.goal,
      explanation:pick(p.explanation,['Simple','Technical'],'Simple'), level:pick(p.level,['Entry','Intermediate','Senior'],'Entry'),
      theme:pick(p.theme,['System','Light','Dark'],'System'),reduceMotion:p.reduceMotion===true,onboarding:p.onboarding===true},
    notes:Object.fromEntries(Object.entries(raw.notes??{}).filter(([k,v])=>typeof v==='string' && k.length<140).map(([k,v])=>[k,v.slice(0,4000)])),
    resume:resume && Object.hasOwn(byId,resume.id) && ['Learn','Practice','Interview'].includes(resume.section) && [0,1,2].includes(resume.step)?resume:null};
}
export function mergeGuest(account: Learner, guest: Learner): Learner {
  const hasAccountData=account.events.length>0||account.prefs.onboarding||account.bookmarks.length>0;
  return {...(hasAccountData?account:guest),events:mergeEvents(account.events,guest.events),bookmarks:[...new Set([...account.bookmarks,...guest.bookmarks])],
    prefs:{...(hasAccountData?account.prefs:guest.prefs),interests:[...new Set([...account.prefs.interests,...guest.prefs.interests])]},notes:{...guest.notes,...account.notes},resume:account.resume??guest.resume};
}
interface ItemEvidence {seen:boolean; score:number; solved:boolean; due:number; last:number; delayed:number}
export interface Evidence {
  score:number; assessed:boolean; coverage:number; complete:boolean; practical:number|null; retained:boolean; review:boolean; due:number;
  items:ItemEvidence[]; state:'Unassessed'|'Learning'|'Mastered'|'Due for review';
}
export type EvidenceMap = Record<string,Evidence>;
export function evidence(events: Attempt[], now=Date.now()): EvidenceMap {
  const map:EvidenceMap={};
  const attemptsByConcept=new Map<string,Attempt[]>();
  for(const event of events){
    if(event.version!==curriculumVersion||!byId[event.concept])continue;
    const attempts=attemptsByConcept.get(event.concept);
    if(attempts)attempts.push(event);
    else attemptsByConcept.set(event.concept,[event]);
  }
  for(const c of lessons){
    const items=Array.from({length:3},():ItemEvidence=>({seen:false,score:0,solved:false,due:0,last:0,delayed:0}));
    const misses=[-Infinity,-Infinity,-Infinity],credited=[0,0,0];
    const matched=attemptsByConcept.get(c.id)?.sort((a,b)=>a.at-b.at || a.id.localeCompare(b.id))??[];
    for(const e of matched){
      const i=e.step,it=items[i],right=correct(c.checks[i],e.response),aided=e.hinted||e.at-misses[i]<dayMs;
      it.seen=true; it.last=e.at; it.score=right?(aided?0.5:1):0; it.solved ||= right;
      if(!right || aided){
        misses[i]=e.at; it.delayed=0; credited[i]=0; it.due=right?e.at+dayMs:e.at;
      }else if(!credited[i] || e.at>=it.due){
        if(credited[i]) it.delayed++;
        credited[i]=e.at;it.due=e.at+intervals[Math.min(it.delayed,intervals.length-1)]*dayMs;
      }
    }
    const conceptual=items.slice(0,2),seen=conceptual.filter(i=>i.seen),score=(items[0].score+items[1].score)/2;
    const due=seen.length?Math.min(...seen.map(i=>i.due)):0, review=seen.length>0 && due<=now;
    map[c.id]={items,score,assessed:seen.length>0,coverage:seen.length/2,complete:items.every(i=>i.solved),practical:items[2].seen?items[2].score:null,
      retained:conceptual.every(i=>i.delayed>0&&i.due>now&&i.score===1),due,review,state:!seen.length?'Unassessed':review?'Due for review':score===1?'Mastered':'Learning'};
  }
  return map;
}
export function reviewStep(e:Evidence):Step {
  const [first,second]=e.items;
  return second.seen&&(!first.seen||second.due<first.due)?1:0;
}
export const curriculumRequirements=()=>lessons.map(c=>({id:c.id,weight:1}));
export function summary(map:EvidenceMap, requirements:Requirement[]=curriculumRequirements()){
  const req=requirements.filter(r=>!!map[r.id]), total=req.reduce((s,r)=>s+r.weight,0);
  let sum=0,assessedWeight=0, checks=0, assessed=0, mastered=0, completed=0, retained=0, due=0, practical=0, practiceSeen=0;
  for(const {id,weight} of req){
    const e=map[id];sum+=e.score*weight;checks+=e.coverage*weight;
    if(e.assessed){assessed++;assessedWeight+=weight;}
    if(e.score===1)mastered++;if(e.complete)completed++;if(e.retained)retained++;if(e.review)due++;
    if(e.practical!==null){practical+=e.practical; practiceSeen++;}
  }
  return {mastery:assessedWeight&&total?Math.round(100*sum/total):null, coverage:total?Math.round(100*checks/total):0,assessed,unknown:req.length-assessed,
    count:req.length, mastered,completed,retained,due,practical,practiceSeen,practicalPct:practiceSeen?Math.round(100*practical/practiceSeen):null};
}
export const localDate=(t:number)=>{const d=new Date(t);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
export function recentDays(events:Attempt[],count:number,now=Date.now()){
  const hits=new Map<string,Set<string>>();
  for(const e of events) if(byId[e.concept] && correct(byId[e.concept].checks[e.step],e.response)){
    const d=localDate(e.at);if(!hits.has(d))hits.set(d,new Set());hits.get(d)!.add(e.concept+'/'+e.step);
  }
  return Array.from({length:count},(_,i)=>{const date=new Date(now);date.setDate(date.getDate()-(count-1-i));const key=localDate(+date);return {key,date,hits:hits.get(key)?.size??0};});
}
export function streak(events:Attempt[],now=Date.now()){
  const dates=new Set(events.filter(e=>byId[e.concept] && correct(byId[e.concept].checks[e.step],e.response)).map(e=>localDate(e.at)));
  const d=new Date(now); if(!dates.has(localDate(+d)))d.setDate(d.getDate()-1);
  let count=0;while(dates.has(localDate(+d))){count++;d.setDate(d.getDate()-1);}return count;
}
export interface PlanItem {id:string; reason:string; minutes:number; mode:'Learn'|'Practice';step:Step}
export function dailyPlan(state:Learner,map:EvidenceMap):PlanItem[] {
  const p=state.prefs;
  const weights=new Map<string,number>();
  function include(id:string,weight:number){if((weights.get(id)??0)>=weight)return;weights.set(id,weight);byId[id]?.prerequisites.forEach(pre=>include(pre,weight/2));}
  for(const r of careers.filter(c=>p.interests.includes(c.id)))for(const req of requirementsThroughLevel(r,p.level))include(req.id,req.weight*10);
  const candidates=lessons.map((c,index)=>{
    const e=map[c.id],unmet=c.prerequisites.some(pre=>map[pre] && map[pre].score<0.5);
    const lab=e.score===1 && e.practical!==1;
    const partial=e.items[0].solved&&!e.items[1].solved;
    const mode:PlanItem['mode']=e.review||lab||partial?'Practice':'Learn';
    const step:Step=e.review?reviewStep(e):lab?2:partial?1:0;
    const preference=p.level!=='Entry'||['Working professional','Software engineer','AI professional'].includes(p.experience);
    let rank=(weights.get(c.id)??0)+(preference && c.stage==='Intermediate'?3:0)-index/100;
    if(unmet)rank-=100;if(e.complete&&!e.review&&!lab)rank-=150;
    if(e.review)rank+=230;else if(lab)rank+=100;else if(!e.complete&&e.items.some(i=>i.seen))rank+=75;
    const reason=e.review?'Review due':lab?'Apply your knowledge':unmet?'Build toward this topic':weights.has(c.id)?'Career goal':e.assessed?'Continue learning':'New concept';
    return {id:c.id,reason,minutes:mode==='Practice'?2:c.minutes,mode,step,rank,eligible:!e.complete||e.review||lab};
  }).filter(x=>x.eligible).sort((a,b)=>b.rank-a.rank);
  let left=p.minutes;const result:PlanItem[]=[];
  for(const item of candidates){if(item.minutes<=left||!result.length){result.push(item);left-=item.minutes;}if(left<=0)break;}
  return result;
}
