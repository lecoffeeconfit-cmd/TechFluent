import React,{useState} from 'react';
import {Linking,View} from 'react-native';
import {byId} from '../content/catalog';
import {careers,levels} from '../content/careers';
import {curriculumVersion,groupFor,isPublished,sources,type Lesson as Concept,type Level} from '../content/model';
import {correct,mergeEvents,newAttempt,type Step} from '../core/learning';
import {useLearning} from '../core/state';
import {useNav} from '../core/navigation';
import {Bar,between,Button,Chips,Field,flex,Icon,LinkRow,Panel,row,Rule,Section,Tap,Tile,Txt,useTheme} from '../ui/design';
import {Flow} from '../ui/flow';

export function Disclosure({title,children,initial=false}:{title:string;children:React.ReactNode;initial?:boolean}){
  const [open,set]=useState(initial),t=useTheme();return <View style={{gap:open?8:0}}><Tap accessibilityState={{expanded:open}} onPress={()=>set(!open)} style={{...between,minHeight:45}}><Txt kind="h3" style={flex}>{title}</Txt><Icon name={open?'down':'right'} size={16} color={t.muted}/></Tap>{open&&children}</View>;
}
function Detail({title,text}:{title:string;text:string}){return <View style={{gap:3}}><Txt kind="h3">{title}</Txt><Txt kind="body">{text}</Txt></View>;}
export function Code({title,body}:{title:string;body:string}){return <View style={{backgroundColor:'#25253D',borderRadius:14,padding:16,gap:8}}><Txt kind="meta" color="#C5BFFF">{title}</Txt><Txt kind="code" color="#F4F1FF">{body}</Txt></View>;}
function ExampleCode({c}:{c:Concept}){
  const [language,choose]=useState(c.code?.[0]);
  const selected=language===c.alternateCode?.[0]?c.alternateCode:c.code;
  if(!selected)return null;
  return <>
    {c.code&&c.alternateCode&&<Chips label="Example language" values={[c.code[0],c.alternateCode[0]]} selected={selected[0]} onSelect={choose}/>}
    <Code title={selected[0]} body={selected[1]}/>
  </>;
}
function StudyContent({c,start}:{c:Concept;start:()=>void}){
  const {model,patch}=useLearning(),{go}=useNav(),t=useTheme();const [definition,define]=useState<string|null>(null);
  const related=[...new Set([...c.prerequisites,...c.related])].filter(id=>byId[id]);
  return <><Panel><Chips values={['Simple','Technical'] as const} selected={model.prefs.explanation} onSelect={explanation=>patch({explanation})}/><Txt kind="body">{model.prefs.explanation==='Simple'?c.simple:c.technical}</Txt></Panel>
    {c.diagram&&<Flow kind={c.diagram}/>}
    <Panel><Detail title="Real-world example" text={c.example}/><ExampleCode c={c}/><Rule/><Disclosure title="Why it matters"><Txt>{c.why}</Txt><Txt kind="small">{c.analogy}</Txt></Disclosure>
    <Rule/><Disclosure title="Mistakes, tradeoffs & best practice"><Detail title="Common mistake" text={c.mistake}/><Detail title="In practice" text={c.practice}/><Detail title="Tradeoff" text={c.tradeoff}/><Detail title="Security & privacy" text={c.security}/></Disclosure>
    <Rule/><Disclosure title="Terms & connections"><Txt kind="small">Tap a term to read its definition here.</Txt><View style={{...row,flexWrap:'wrap'}}>{[c.id,...related].map(id=><Button key={id} label={byId[id].term} variant="secondary" onPress={()=>define(id)}/>)}</View>{definition&&<View style={{padding:12,backgroundColor:t.soft,borderRadius:12,gap:5}}><Txt kind="h3">{byId[definition].term}</Txt><Txt>{byId[definition].simple}</Txt>{definition!==c.id&&<Button label="Open this lesson" variant="quiet" onPress={()=>go({page:'Lesson',id:definition})}/>}</View>}<Txt kind="small">Prerequisites · {c.prerequisites.map(id=>byId[id]?.term).filter(Boolean).join(', ')||'Start here'}</Txt></Disclosure>
    <Rule/><Disclosure title="Sources & curriculum"><Txt kind="small">{isPublished(c)?'Expert reviewed':'Source-linked editorial preview · independent review pending'} · {curriculumVersion}</Txt>{c.refs.map(key=><Button key={key} label={sources[key][0]} icon="external" variant="quiet" onPress={()=>{void Linking.openURL(sources[key][1]);}}/>)}</Disclosure></Panel>
    <Panel><Txt kind="h2">Quick knowledge check</Txt><Txt kind="small">Two concept questions and one practical task. You can use a hint or retry.</Txt><Button label="Start knowledge check" icon="play" onPress={start}/></Panel></>;
}
export function ExerciseCard({c,step,advance,compact=false}:{c:Concept;step:Step;advance:()=>void;compact?:boolean}){
  const {update}=useLearning(),t=useTheme(),ex=c.checks[step];
  const [answer,setAnswer]=useState<string[]>([]),[hint,setHint]=useState(false),[feedback,setFeedback]=useState<'right'|'wrong'|null>(null),[retried,retry]=useState(false);
  const ready=ex.kind==='order'?answer.length===ex.options.length:!!answer[0]?.trim();
  function check(){
    if(!ready||feedback)return;
    const attempt=newAttempt(c.id,step,answer,hint||retried);const right=correct(ex,answer);
    update(s=>({...s,events:mergeEvents(s.events,[attempt])}));setFeedback(right?'right':'wrong');
  }
  return <Panel><View style={between}><Txt kind="label" color={t.primary}>{step===2?'PRACTICAL TASK':'KNOWLEDGE CHECK'}</Txt><Txt kind="meta">{compact?c.term:`${step+1} of 3`}</Txt></View>
    {!compact&&<Bar pct={step/3*100} label={`On question ${step+1} of 3`}/>}<Txt kind="h2">{ex.prompt}</Txt>
    {ex.fixture&&<Code title="Practice data" body={ex.fixture}/>}
    {!ex.fixture && c.code&&<Code title={c.code[0]} body={c.code[1]}/>}
    {ex.kind==='input'?<Field label="Your answer" value={answer[0]??''} editable={!feedback} maxLength={300} autoCapitalize="none" onChangeText={s=>setAnswer([s])} onSubmitEditing={check}/>:
    <View style={{gap:8}}>{ex.kind==='order'&&<Txt kind="small">Choose each step in order. Tap a selected step to remove it.</Txt>}{ex.options.map((option,i)=>{const index=answer.indexOf(option),selected=index>=0;
      return <Tap key={option} disabled={!!feedback} accessibilityState={{selected}} accessibilityLabel={option} onPress={()=>setAnswer(ex.kind==='order'?(selected?answer.filter(v=>v!==option):[...answer,option]):[option])} style={{...row,minHeight:51,borderWidth:1,borderColor:selected?t.primary:t.line,borderRadius:13,padding:12,backgroundColor:selected?t.wash:t.surface}}><View style={{width:26,height:26,borderRadius:8,justifyContent:'center',alignItems:'center',backgroundColor:selected?t.accent:t.soft}}><Txt kind="meta" color={selected?'white':t.sub}>{ex.kind==='order'?(selected?index+1:'–'):String.fromCharCode(65+i)}</Txt></View><Txt style={flex}>{option}</Txt>{ex.kind!=='order'&&selected&&<Icon name="check" size={17}/>}</Tap>;})}</View>}
    {hint&&<Txt kind="small" live>Hint · {ex.hint}</Txt>}
    {feedback?<View style={{padding:14,gap:7,borderRadius:13,backgroundColor:feedback==='right'?t.positiveBg:t.warnBg}}><Txt kind="h3" live color={feedback==='right'?t.positive:t.warn}>{feedback==='right'?'That’s right':'Try another approach'}</Txt><Txt kind="small">{feedback==='right'?ex.explanation:ex.hint}</Txt><Button label={feedback==='wrong'?'Try again':compact?'Continue placement':step===2?'See lesson result':'Next question'} variant="secondary" onPress={()=>{if(feedback==='right')advance();else{retry(true);setAnswer([]);setFeedback(null);}}}/></View>:
    <View style={between}><Button label="Check answer" disabled={!ready} onPress={check}/>{!hint&&<Button label="Show hint" variant="quiet" icon="bulb" onPress={()=>setHint(true)}/>}</View>}</Panel>;
}
export function InterviewCard({c,level:chosenLevel}:{c:Concept;level?:Level}){
  const {model,update}=useLearning(),t=useTheme(),[preferredLevel,setLevel]=useState<Level>(model.prefs.level),[reveal,setReveal]=useState(false),[checked,setChecked]=useState<number[]>([]);
  const level=chosenLevel??preferredLevel;
  const key=c.id+'.'+level,[q,a]=c.interview[level];
  return <Panel><View style={row}><Tile group={c.group} icon="message"/><View style={flex}><Txt kind="h2">Interview rehearsal</Txt><Txt kind="small">{c.term} · {level}</Txt></View></View>{!chosenLevel&&<Chips values={levels} selected={level} onSelect={v=>{setLevel(v);setReveal(false);setChecked([]);}}/>}<Txt kind="h3">{q}</Txt>
    <Field label="Your explanation" multiline maxLength={4000} placeholder="Walk through an example in your own words…" value={model.notes[key]??''} onChangeText={s=>update(v=>({...v,notes:{...v.notes,[key]:s}}))}/>
    {!reveal?<Button label="Compare with a worked answer" icon="message" onPress={()=>setReveal(true)}/>:<><View style={{backgroundColor:t.wash,borderRadius:14,padding:15,gap:6}}><Txt kind="h3">One strong answer</Txt><Txt>{a}</Txt></View><Txt kind="h3">Check your reasoning</Txt>{c.interview.rubric.map((s,i)=><Tap key={s} accessibilityRole="checkbox" accessibilityState={{checked:checked.includes(i)}} onPress={()=>setChecked(checked.includes(i)?checked.filter(v=>v!==i):[...checked,i])} style={{...row,minHeight:44}}><Icon name={checked.includes(i)?'check':'clipboard'} size={18}/><Txt kind="small" style={flex}>{s}</Txt></Tap>)}<Rule/><Txt kind="h3">Follow-up</Txt><Txt>{c.interview[level==='Entry'?'Intermediate':level==='Intermediate'?'Senior':'Entry'][0]}</Txt></>}
    <Txt kind="meta">Your draft stays on this device. Self-review is separate from assessed mastery.</Txt></Panel>;
}
export function LessonScreen({id,initialSection,initialStep=0}:{id:string;initialSection?:'Learn'|'Practice'|'Interview';initialStep?:Step}){
  const c=byId[id],{model,update,map}=useLearning(),{go}=useNav(),t=useTheme(),[section,setSection]=useState(initialSection??'Learn'),[step,setStep]=useState<Step>(initialStep),[done,setDone]=useState(false);
  function move(s:typeof section,n:Step=step){setSection(s);setStep(n);setDone(false);update(v=>({...v,resume:{id,section:s,step:n}}));}
  const mark=model.bookmarks.includes(id),g=groupFor(c.group),roles=careers.filter(r=>r.requirements.some(x=>x.id===id));
  return <><View style={{gap:10}}><View style={between}><View style={{...row,...flex}}><Tile group={c.group} size={40}/><Txt kind="small" style={flex}>{g.name} · {c.minutes} min</Txt></View><Button label={mark?'Saved':'Save'} icon={mark?'check':'mark'} variant="quiet" onPress={()=>update(s=>({...s,bookmarks:mark?s.bookmarks.filter(x=>x!==id):[...s.bookmarks,id]}))}/></View><Txt kind="title">{c.title}</Txt></View>
    <Chips values={['Learn','Practice','Interview'] as const} selected={section} onSelect={s=>move(s)}/>
    {section==='Learn'?<StudyContent c={c} start={()=>move('Practice',0)}/>:section==='Interview'?<InterviewCard c={c}/>:done?
    <Panel><Tile group={c.group} icon="check"/><Txt kind="h2">{map[id].complete?'Lesson complete':'Practice recorded'}</Txt><Txt>{c.term} appears in {roles.length} career {roles.length===1?'map':'maps'}.</Txt><Txt kind="small">Concept evidence · {map[id].assessed?Math.round(map[id].score*100)+'%':'Unassessed'} · Practical task {map[id].practical===1?'independent':map[id].practical===.5?'with support':'recorded'}</Txt><Button label="See my progress" onPress={()=>go({page:'Progress'})}/><Button label="Rehearse the interview question" variant="quiet" onPress={()=>move('Interview')}/></Panel>:
    <ExerciseCard key={step} c={c} step={step} advance={()=>{if(step<2)move('Practice',(step+1) as Step);else {setDone(true);update(s=>({...s,resume:null}));}}}/>}
    <View style={{gap:5}}><Section title="Where this skill applies"/><Disclosure title={roles.length+' career '+(roles.length===1?'map':'maps')} initial={roles.length<=3}>{roles.map(r=><LinkRow key={r.id} title={r.name} detail={r.requirements.find(v=>v.id===id)?.category} onPress={()=>go({page:'Career',id:r.id})}/>)}</Disclosure><Txt kind="meta" color={t.muted}>{c.stage}</Txt></View></>;
}
