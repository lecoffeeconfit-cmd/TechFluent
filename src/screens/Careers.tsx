import React,{useState} from 'react';
import {Linking,View} from 'react-native';
import {byId,lessons,lessonsForDomain,searchLessons} from '../content/catalog';
import {careers,levelGoal,levels,requirementsThroughLevel,stageLevels,type Career} from '../content/careers';
import {domains,groupFor,type Level} from '../content/model';
import {summary} from '../core/learning';
import {useLearning} from '../core/state';
import {useNav} from '../core/navigation';
import {
  Bar,between,Button,Chips,ExpandableList,Field,flex,LinkRow,Panel,row,Rule,Tile,Txt,useTheme,useTone,
} from '../ui/design';
import {Disclosure,InterviewCard} from './Lesson';
import {ConceptRow} from './Library';

function CareerRow({career}:{career:Career}){
  const {map,model}=useLearning(),{go}=useNav(),tone=useTone(career.group);
  const requirements=requirementsThroughLevel(career,model.prefs.level);
  const score=summary(map,requirements);
  const next=requirements.filter(r=>map[r.id].score<1||map[r.id].review).slice(0,2).map(r=>byId[r.id].term);
  return <View style={{gap:6,paddingBottom:8}}>
    <LinkRow title={career.name} detail={model.prefs.interests.includes(career.id)?'Your career goal':undefined}
      onPress={()=>go({page:'Career',id:career.id})}/>
    <View style={row}>
      <Tile group={career.group} size={36}/>
      <View style={{...flex,gap:6}}>
        <View style={{...between,flexWrap:'wrap'}}>
          <Txt kind="meta">{model.prefs.level} · {score.coverage}% coverage</Txt>
          <Txt kind="small" color={tone.ink} style={{fontWeight:'700'}}>{score.mastery===null?'Unassessed':score.mastery+'% mastery'}</Txt>
        </View>
        <Bar pct={score.mastery} color={tone.ink} label={career.name+' mastery'}/>
      </View>
    </View>
    {next.length>0&&<Txt kind="small">Next · {next.join(', ')}</Txt>}
    <Rule/>
  </View>;
}

export function CareersScreen(){
  const {model}=useLearning(),{go}=useNav(),[query,setQuery]=useState(''),[filter,choose]=useState('All careers');
  const filtered=careers.filter(c=>c.name.toLowerCase().includes(query.trim().toLowerCase())
    &&(filter==='All careers'||model.prefs.interests.includes(c.id)));
  return <>
    <Txt kind="title">Your career knowledge</Txt>
    <Txt>Explore the skills, practice questions, and projects for the roles you care about.</Txt>
    <Field label="Find a career" value={query} onChangeText={setQuery} placeholder="Software engineer, IT support…"/>
    <Chips values={['All careers','My goals']} selected={filter} onSelect={choose}/>
    <Panel>
      <Txt kind="h2">{filtered.length} career {filtered.length===1?'map':'maps'}</Txt>
      <ExpandableList key={filter+query} items={filtered} render={career=><CareerRow key={career.id} career={career}/>}/>
      {!filtered.length&&<Txt kind="small">{filter==='My goals'?'Open a career and choose Add career goal.':'Try a broader job title.'}</Txt>}
    </Panel>
    <Button label="Open interview studio" icon="message" variant="secondary" onPress={()=>go({page:'Interview'})}/>
  </>;
}

const requirementGroups=['Core','Supporting','Specialization'] as const;
const groupTitles={Core:'Core skills',Supporting:'Supporting skills',Specialization:'Specializations'};

export function CareerScreen({id}:{id:string}){
  const career=careers.find(c=>c.id===id)!;
  const {model,map,patch,update}=useLearning(),{go}=useNav(),[level,choose]=useState<Level>(model.prefs.level);
  const t=useTheme(),tone=useTone(career.group),added=model.prefs.interests.includes(id);
  const requirements=requirementsThroughLevel(career,level),score=summary(map,requirements);
  const levelDetail=level==='Entry'?'Foundational skills':level==='Intermediate'?'Foundational and intermediate skills':'All mapped skills';
  const metrics=[
    ['Assessment coverage',score.coverage+'%',score.unknown+' concepts unassessed'],
    ['Lesson completion',score.completed+' / '+score.count,'All three tasks solved'],
    ['Practical tasks',score.practicalPct===null?'Unassessed':score.practicalPct+'%',score.practiceSeen+' of '+score.count+' assessed'],
    ['Retained concepts',score.retained+' / '+score.assessed,'Recalled in a later review'],
  ];
  const draftKey='project.'+id;
  return <>
    <View style={row}><Tile group={career.group} size={54}/><Txt kind="title" style={flex}>{career.name}</Txt></View>
    <Txt>{career.focus}</Txt>
    <Button label={added?'Remove career goal':'Add career goal'} variant={added?'secondary':'primary'} icon={added?'check':'target'}
      onPress={()=>patch({interests:added?model.prefs.interests.filter(v=>v!==id):[...model.prefs.interests,id]})}/>
    <Panel>
      <Txt kind="h2">Career map level</Txt>
      <Chips label="Career map level" values={levels} selected={level} onSelect={choose}/>
      <Txt kind="small" live>{levelDetail} · {requirements.length} concepts</Txt>
      <Rule/>
      <View style={between}>
        <Txt kind="h3" style={flex}>Demonstrated mastery</Txt>
        <Txt kind="h2" color={tone.ink}>{score.mastery===null?'Unassessed':score.mastery+'%'}</Txt>
      </View>
      <Bar pct={score.mastery} color={tone.ink} label={level+' conceptual mastery'}/>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
        {metrics.map(([label,value,description])=><View key={label}
          style={{flexBasis:'46%',flexGrow:1,minWidth:110,padding:10,gap:3,backgroundColor:t.soft,borderRadius:12}}>
          <Txt kind="meta">{label}</Txt><Txt kind="h3">{value}</Txt><Txt kind="meta">{description}</Txt>
        </View>)}
      </View>
      <Disclosure title="How this score works">
        <Txt kind="small">Each concept has two scored questions. Core skills count twice. Supporting and specialization skills count once. The score uses the total weight at the selected level. Unassessed skills remain visible in the breakdown.</Txt>
        <Txt kind="small">Career maps guide your study. Each employer sets its own requirements.</Txt>
      </Disclosure>
    </Panel>
    <Panel>
      <Txt kind="h2">Interview preparation</Txt>
      <Txt>{levelGoal[level]}</Txt>
      <Button label="Open role practice" variant="secondary" icon="message" disabled={!requirements.length}
        onPress={()=>go({page:'Interview',id:career.id,level})}/>
    </Panel>
    <Panel>
      <Txt kind="h2">Concept breakdown</Txt>
      {requirementGroups.map(category=>{
        const items=requirements.filter(r=>r.category===category);
        if(!items.length)return null;
        return <Disclosure key={category} title={groupTitles[category]+' · '+items.length} initial={category==='Core'}>
          {items.map(r=><ConceptRow key={r.id} c={byId[r.id]}
            detail={byId[r.id].stage+' · weight '+r.weight+' · '+map[r.id].state}/>)}
        </Disclosure>;
      })}
      {!requirements.length&&<Txt kind="small">Lessons for this level are awaiting editorial release.</Txt>}
    </Panel>
    <Panel>
      <Txt kind="h2">Practical project</Txt><Txt>{career.project}</Txt><Txt kind="small">{career.deliverable}</Txt>
      <Field label="Project approach" multiline maxLength={4000} value={model.notes[draftKey]??''}
        onChangeText={value=>update(s=>({...s,notes:{...s.notes,[draftKey]:value}}))}/>
      <Txt kind="meta">Your plan stays on this device. The lesson practical tasks contribute to your competency score.</Txt>
    </Panel>
    <Button label="Occupational framework · O*NET" variant="quiet" icon="external"
      onPress={()=>{void Linking.openURL('https://www.onetonline.org/link/summary/'+career.occupation);}}/>
  </>;
}

export function InterviewScreen({id,initialLevel}:{id?:string;initialLevel?:Level}){
  const {model}=useLearning();
  const [role,chooseRole]=useState(careers.find(r=>r.id===id)?.id);
  const [domain,chooseDomain]=useState(domains.find(d=>d.id===id)?.id);
  const [level,chooseLevel]=useState<Level>(initialLevel??model.prefs.level);
  const [query,setQuery]=useState(''),[roleQuery,filterRoles]=useState('');
  const [active,select]=useState<string|null>(null),[show,showRoles]=useState(false);
  const career=careers.find(c=>c.id===role);
  const scope=career?requirementsThroughLevel(career,level).map(r=>byId[r.id]):domain?lessonsForDomain(domain):lessons;
  const allowed=new Set(scope.filter(c=>levels.indexOf(stageLevels[c.stage])<=levels.indexOf(level)).map(c=>c.id));
  const found=(query.trim()?searchLessons(query):scope).filter(c=>allowed.has(c.id));
  const concept=active?byId[active]:null;
  const visibleRoles=careers.filter(c=>c.name.toLowerCase().includes(roleQuery.trim().toLowerCase()));

  function changeRole(next?:string){
    chooseRole(next);chooseDomain(undefined);select(null);setQuery('');showRoles(false);
  }

  return <>
    <Txt kind="title">Interview studio</Txt>
    <Panel>
      <View style={{...between,flexWrap:'wrap'}}>
        <View style={flex}><Txt kind="meta">Practice set</Txt><Txt kind="h3">{career?.name??(domain?groupFor(domain).name:'All concepts')}</Txt></View>
        <Button label={show?'Close roles':'Choose role'} variant="quiet" onPress={()=>showRoles(!show)}/>
      </View>
      {show&&<>
        <Field label="Filter practice roles" value={roleQuery} onChangeText={filterRoles}/>
        <LinkRow title="All concepts" onPress={()=>changeRole()}/>
        <ExpandableList key={roleQuery} items={visibleRoles} render={r=><LinkRow key={r.id} title={r.name}
          detail={model.prefs.interests.includes(r.id)?'Your goal':undefined} onPress={()=>changeRole(r.id)}/>}/>
        <Rule/>
      </>}
      <Chips label="Interview level" values={levels} selected={level} onSelect={v=>{
        chooseLevel(v);
        if(concept&&levels.indexOf(stageLevels[concept.stage])>levels.indexOf(v))select(null);
      }}/>
      <Txt kind="small">{levelGoal[level]}</Txt>
    </Panel>
    {concept?<>
      <InterviewCard key={concept.id+'.'+level} c={concept} level={level}/>
      <Button label="Choose another concept" variant="secondary" onPress={()=>select(null)}/>
    </>:<>
      <Field label="Find an interview concept" value={query} onChangeText={setQuery} placeholder="Search terms or acronyms"/>
      <Panel>
        <Txt kind="h2">Practice questions</Txt>
        <Txt kind="meta" live>{found.length} {level.toLowerCase()} {found.length===1?'question':'questions'}</Txt>
        <ExpandableList key={query+level+(role??domain??'')} items={found} render={c=><LinkRow key={c.id}
          title={c.term} detail={c.interview[level][0]} onPress={()=>select(c.id)}/>}/>
        {!found.length&&<Txt kind="small">No matching concepts at this level. Try another search or level.</Txt>}
      </Panel>
    </>}
    {career&&<Panel><Txt kind="h3">Role project</Txt><Txt>{career.project}</Txt><Txt kind="small">{career.deliverable}</Txt></Panel>}
  </>;
}
