import React,{useState} from 'react';
import {useWindowDimensions,View} from 'react-native';
import {byId,lessons,lessonsForDomain,lessonsForTopic,publicRelease,searchLessons} from '../content/catalog';
import {careers} from '../content/careers';
import {domains,groupFor,type Domain,type GroupId,type Lesson} from '../content/model';
import {reviewStep,streak,summary} from '../core/learning';
import {useLearning} from '../core/state';
import {useNav} from '../core/navigation';
import {Bar,between,Button,Chips,ExpandableList,Field,flex,Icon,LinkRow,Panel,Ring,row,Rule,Section,Tap,Tile,Txt,useTheme,useTone} from '../ui/design';
import {Disclosure} from './Lesson';

function DomainCard({d,width}:{d:Domain;width:`${number}%`}){const {map}=useLearning(),{go}=useNav(),t=useTheme(),tone=useTone(d.id),s=summary(map,lessonsForDomain(d.id).map(c=>({id:c.id,weight:1})));
  return <Tap accessibilityLabel={`${d.name}, ${s.count} lessons, ${s.mastery===null?'unassessed':s.mastery+' percent mastery'}`} onPress={()=>go({page:'Domain',id:d.id})} style={{width,backgroundColor:t.surface,borderColor:t.line,borderWidth:1,borderRadius:18,padding:15,gap:11,minHeight:157,justifyContent:'space-between'}}>
    <View style={between}><Tile group={d.id} size={39}/><Icon name="right" size={15} color={t.muted}/></View><Txt kind="h3">{d.name}</Txt><View style={{gap:6}}><Bar pct={s.mastery} color={tone.ink} label={d.name+' mastery'}/><Txt kind="meta">{s.mastery===null?`${s.count} lessons · Unassessed`:`${s.mastery}% mastery · ${s.coverage}% coverage`}</Txt></View></Tap>;
}
function DomainGrid({items}:{items:Domain[]}){const {width}=useWindowDimensions(),columns=width>=1150?3:width>=365?2:1,w=columns===3?'32.25%':columns===2?'48.8%':'100%';return <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:12}}>{items.map(d=><DomainCard key={d.id} d={d} width={w}/>)}{columns===3&&items.length%3===2&&<View style={{width:w}}/>}</View>;}
export function ConceptRow({c,detail,openInterview=false}:{c:Lesson;detail?:string;openInterview?:boolean}){
  const {map}=useLearning(),{go}=useNav(),t=useTheme();return <Tap onPress={()=>go({page:'Lesson',id:c.id,section:openInterview?'Interview':'Learn'})} style={{...row,minHeight:62,paddingVertical:9}}><Tile group={c.group} size={39}/><View style={flex}><Txt kind="h3">{c.title}</Txt><Txt kind="small">{detail??(c.minutes+' min · '+map[c.id].state)}</Txt></View><Icon name="right" size={17} color={t.muted}/></Tap>;
}
export function HomeScreen(){
  const {model,map,plan,now}=useLearning(),{go}=useNav(),t=useTheme(),s=summary(map),resume=model.resume;
  const next=resume?{id:resume.id,reason:'Continue learning',mode:resume.section,step:resume.step,minutes:byId[resume.id].minutes}:plan[0];
  const c=next&&byId[next.id],count=streak(model.events,now),recent=[...new Set([...model.events].reverse().filter(e=>map[e.concept]?.complete).map(e=>e.concept))].slice(0,3);
  const chosen=careers.filter(c=>model.prefs.interests.includes(c.id));
  return <><View style={between}><View style={flex}><Txt kind="title">Your learning space</Txt><Txt kind="small">Understand technology. Build your future.</Txt></View><Tap onPress={()=>go({page:'Progress'})} accessibilityLabel={count+' day learning streak'} style={{...row,gap:5,minHeight:44,borderRadius:20,paddingHorizontal:11,backgroundColor:t.warnBg}}><Icon name="flame" color={t.warn} size={18}/><Txt kind="small" color={t.warn} style={{fontWeight:'700'}}>{count}d</Txt></Tap></View>
    <Tap onPress={()=>go({page:'Progress'})} accessibilityLabel="Open your technology journey progress" style={{...between,backgroundColor:'#594AC7',borderRadius:23,paddingVertical:22,paddingHorizontal:22,gap:9}}>
      <View style={{...flex,gap:7}}><Txt kind="label" color="#EEEAFF">TECHNOLOGY MASTERY</Txt><Txt kind="display" color="white">{s.mastery===null?'Build your foundation.':s.mastery+'% mastery'}</Txt><Txt kind="small" color="#F4F1FF">{s.assessed} of {s.count} concepts assessed</Txt></View><Ring pct={s.mastery}/></Tap>
    {c&&next&&<View style={{gap:10}}><Section title="Today’s learning" action={model.prefs.minutes+' min goal'} onPress={()=>go({page:'Profile'})}/><Panel style={{padding:19}}><View style={row}><Tile group={c.group} icon={c.id==='internet'?'globe':undefined} size={54}/><View style={flex}><Txt kind="meta" color={t.primary}>{next.reason} · {next.minutes} min</Txt><Txt kind="h2">{c.title}</Txt></View></View><Txt kind="small">{c.why}</Txt><Button label={resume?'Continue lesson':next.mode==='Practice'?'Start practice':'Start lesson'} icon="play" onPress={()=>go({page:'Lesson',id:c.id,section:next.mode,step:next.step})}/>
    {plan.filter(p=>p.id!==next.id).length>0&&<Disclosure title="Rest of today’s plan">{plan.filter(p=>p.id!==next.id).map(p=><LinkRow key={p.id} title={byId[p.id].title} detail={p.reason+' · '+p.minutes+' min'} onPress={()=>go({page:'Lesson',id:p.id,section:p.mode,step:p.step})}/>)}</Disclosure>}</Panel></View>}
    <View style={{gap:10}}><Section title="Explore technology" action="All domains" onPress={()=>go({page:'Learn'})}/><DomainGrid items={domains.slice(0,6)}/></View>
    <Panel><LinkRow title="Technology encyclopedia" detail="Look up a term, acronym, or tool." icon="search" onPress={()=>go({page:'Encyclopedia'})}/><Rule/><LinkRow title={chosen.length?'Your career goals':'Choose a career goal'} detail={chosen.length?chosen.map(g=>g.name).join(' · '):'Personalize your learning plan and interview practice.'} icon="career" onPress={()=>go({page:'Careers'})}/>{!model.prefs.onboarding&&<><Rule/><LinkRow title="Personalize your learning" detail="Choose your experience, interests, and daily goal." icon="settings" onPress={()=>go({page:'Setup'})}/></>}</Panel>
    {!!recent.length&&<Panel><Txt kind="h2">Recently learned</Txt>{recent.map(id=><ConceptRow key={id} c={byId[id]}/>)}</Panel>}{s.due>0&&<Panel><Txt kind="h2">Ready for a review</Txt>{lessons.filter(c=>map[c.id].review).slice(0,3).map(c=><LinkRow key={c.id} title={c.term} detail="Recall it from memory" onPress={()=>go({page:'Lesson',id:c.id,section:'Practice',step:reviewStep(map[c.id])})}/>)}</Panel>}</>;
}
export function LearnScreen(){
  const {go}=useNav(),[q,set]=useState(''),results=q.trim()?searchLessons(q):[];
  return <>
    <Txt kind="title">Learn</Txt>
    <Field label="Search lessons" placeholder="Try APIs, SQL, or binary search" value={q} onChangeText={set}/>
    {q.trim()?<Panel>
      <Txt kind="h2">{results.length} {results.length===1?'lesson':'lessons'} found</Txt>
      <ExpandableList key={q} items={results} render={c=><ConceptRow key={c.id} c={c} detail={c.term+' · '+c.stage}/>}/>
      {!results.length&&<Txt kind="small">No matching lessons. Try a shorter term.</Txt>}
    </Panel>:<>
      <View style={{gap:10}}><Section title="Technology domains"/><DomainGrid items={domains}/></View>
      <Panel><LinkRow title="Interview studio" detail="Practice by concept, role, and experience level." icon="message" onPress={()=>go({page:'Interview'})}/>
        <Rule/><LinkRow title="Best practices" detail="Explore decisions, tradeoffs, and common mistakes." icon="shield" onPress={()=>go({page:'Practices'})}/>
        <Rule/><LinkRow title="Technology encyclopedia" detail="Find definitions and saved concepts." icon="book" onPress={()=>go({page:'Encyclopedia'})}/>
      </Panel>
      <Txt kind="meta">{lessons.length} lessons · {publicRelease?'Reviewed curriculum':'Source-linked curriculum preview'}</Txt>
    </>}
  </>;
}
const stages=['All stages','Foundational','Intermediate','Advanced','Specialized'] as const;
export function DomainScreen({id}:{id:GroupId}){
  const domain=groupFor(id),{map}=useLearning(),{go}=useNav(),tone=useTone(id);
  const [stage,selectStage]=useState<(typeof stages)[number]>('All stages'),[topic,selectTopic]=useState('');
  const items=lessonsForDomain(id),score=summary(map,items.map(c=>({id:c.id,weight:1})));
  const found=(topic?lessonsForTopic(topic):items).filter(c=>stage==='All stages'||c.stage===stage);
  return <>
    <View style={row}><Tile group={id} size={58}/><Txt kind="title" style={flex}>{domain.name}</Txt></View>
    <Panel>
      <Txt kind="h3">{score.mastery===null?'Unassessed':score.mastery+'% demonstrated mastery'}</Txt>
      <Bar pct={score.mastery} color={tone.ink} label="Domain mastery"/>
      <Txt kind="small">{score.assessed} of {score.count} concepts assessed · {score.coverage}% assessment coverage</Txt>
    </Panel>
    <Panel>
      <Disclosure title={topic||'Choose a topic'} initial={!topic}>
        <Chips label="Curriculum topic" values={['All topics',...domain.topics]} selected={topic||'All topics'}
          onSelect={value=>{selectTopic(value==='All topics'?'':value);selectStage('All stages');}}/>
      </Disclosure>
      <Chips label="Lesson difficulty" values={stages} selected={stage} onSelect={selectStage}/>
    </Panel>
    <Panel>
      <Txt kind="h2">Available lessons</Txt>
      <Txt kind="meta" live>{found.length} {found.length===1?'lesson':'lessons'}</Txt>
      <ExpandableList key={topic+stage} items={found} render={c=><ConceptRow key={c.id} c={c}
        detail={c.stage+' · '+c.minutes+' min · '+map[c.id].state}/>}/>
      {!found.length&&<Txt kind="small">{items.length?'No lessons match this selection.':'Lessons in this domain are awaiting editorial release.'}</Txt>}
    </Panel>
    <Button label="Practice interview questions" variant="secondary" onPress={()=>go({page:'Interview',id})}/>
  </>;
}
export function EncyclopediaScreen(){
  const {model,update}=useLearning(),{go}=useNav(),[q,set]=useState(''),[filter,choose]=useState('All terms'),[term,select]=useState<string|null>(null);
  const c=term?byId[term]:null,results=searchLessons(q).filter(c=>filter==='All terms'||model.bookmarks.includes(c.id)).sort((a,b)=>a.term.localeCompare(b.term));
  return <><Txt kind="title">Technology encyclopedia</Txt><Field label="Search terms and acronyms" placeholder="Try TTL, API, hash map…" value={q} onChangeText={s=>{set(s);select(null);}}/><Chips values={['All terms','Saved']} selected={filter} onSelect={v=>{choose(v);select(null);}}/>{c?<Panel><Tile group={c.group}/><Txt kind="h2">{c.term}</Txt><Txt>{c.simple}</Txt><Txt kind="small">{c.example}</Txt><Txt kind="meta">{c.stage} · {groupFor(c.group).name}</Txt><Disclosure title="Career applications">{careers.filter(r=>r.requirements.some(v=>v.id===c.id)).map(r=><LinkRow key={r.id} title={r.name} onPress={()=>go({page:'Career',id:r.id})}/>)}</Disclosure><View style={{...row,flexWrap:'wrap'}}><Button label="Open full lesson" onPress={()=>go({page:'Lesson',id:c.id})}/><Button label={model.bookmarks.includes(c.id)?'Remove bookmark':'Bookmark'} variant="secondary" onPress={()=>update(s=>({...s,bookmarks:s.bookmarks.includes(c.id)?s.bookmarks.filter(v=>v!==c.id):[...s.bookmarks,c.id]}))}/></View><Button label="Back to results" variant="quiet" onPress={()=>select(null)}/></Panel>:<Panel><Txt kind="h2">{results.length} {results.length===1?'term':'terms'}</Txt>{results.map(c=><LinkRow key={c.id} title={c.term} detail={c.simple} onPress={()=>select(c.id)}/>)}{!results.length&&<Txt kind="small">{filter==='Saved'?'Saved concepts will appear here. Open a lesson and choose Save.':'No matching terms. Try a concept or acronym.'}</Txt>}</Panel>}</>;
}
export function PracticesScreen(){
  const [query,setQuery]=useState(''),[domain,select]=useState('All domains');
  const selected=domains.find(d=>d.name===domain);
  const allowed=selected?new Set(lessonsForDomain(selected.id).map(c=>c.id)):null;
  const found=searchLessons(query).filter(c=>!allowed||allowed.has(c.id));
  return <>
    <Txt kind="title">Best practices</Txt>
    <Field label="Search practices" value={query} onChangeText={setQuery} placeholder="Try code review, accessibility, or deployment"/>
    <Disclosure title={domain}><Chips values={['All domains',...domains.map(d=>d.name)]} selected={domain} onSelect={select}/></Disclosure>
    <Panel>
      <Txt kind="h2">{found.length} {found.length===1?'practice':'practices'}</Txt>
      <ExpandableList key={query+domain} items={found} render={c=><View key={c.id}>
        <Disclosure title={c.term}>
          <Txt>{c.practice}</Txt><Txt kind="small">{c.tradeoff}</Txt><ConceptRow c={c}/>
        </Disclosure><Rule/>
      </View>}/>
      {!found.length&&<Txt kind="small">No matching practices. Try another search or domain.</Txt>}
    </Panel>
  </>;
}
