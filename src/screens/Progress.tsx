import React,{useState} from 'react';
import {View} from 'react-native';
import {lessons,lessonsForDomain} from '../content/catalog';
import {careers,requirementsThroughLevel} from '../content/careers';
import {domains} from '../content/model';
import {recentDays,streak,summary} from '../core/learning';
import {useLearning} from '../core/state';
import {useNav} from '../core/navigation';
import {Bar,between,Chips,ExpandableList,flex,LinkRow,Panel,Rule,Tap,Txt,useTheme} from '../ui/design';
import {ConceptRow} from './Library';
import {Disclosure} from './Lesson';
export function ProgressScreen(){
  const {model,map,now}=useLearning(),{go}=useNav(),s=summary(map),t=useTheme(),[range,choose]=useState('7 days'),[day,select]=useState<string|null>(null),[scope,setScope]=useState('All concepts');
  const days=recentDays(model.events,range==='7 days'?7:30,now),max=Math.max(1,...days.map(d=>d.hits)),selected=days.find(d=>d.key===day)??days.at(-1)!;
  const rows=[['Curriculum completion',s.completed+' / '+s.count,'All three tasks solved'],['Conceptual mastery',s.mastery===null?'Unassessed':s.mastery+'%',s.coverage+'% assessment coverage'],['Practical competency',s.practicalPct===null?'Unassessed':s.practicalPct+'%',s.practiceSeen+' of '+s.count+' tasks assessed'],['Knowledge retention',s.retained+' / '+s.assessed,'Both questions recalled on a later review']];
  const filtered=lessons.filter(c=>scope==='All concepts'||(scope==='Needs review'?map[c.id].review:map[c.id].state===scope));
  const goals=careers.filter(c=>model.prefs.interests.includes(c.id));
  return <><Txt kind="title">Your progress</Txt><Txt>Follow the evidence from your first answer to your next review.</Txt><Panel><Txt kind="h2">Learning evidence</Txt>{rows.map(([name,value,sub])=><View key={name} style={{gap:2}}><View style={between}><Txt kind="h3" style={flex}>{name}</Txt><Txt kind="h3" color={t.primary}>{value}</Txt></View><Txt kind="meta">{sub}</Txt><Rule/></View>)}<Disclosure title="How learning is measured"><Txt kind="small">Each concept has two knowledge checks. The latest independent correct answer earns full credit. A hint or a correction within 24 hours earns half. Tasks you have never attempted stay unassessed. A lesson is complete after you solve both checks and its practical task.</Txt><Txt kind="small">Each unaided recall schedules another review after 1, 3, 7, 14, then 30 days. Early repeats do not advance the interval. A mistake makes the question due again. Retention requires both checks to be recalled after their due times and still be current.</Txt></Disclosure></Panel>
    <Panel><Txt kind="h2">Learning consistency</Txt><Chips values={['7 days','30 days']} selected={range} onSelect={v=>{choose(v);select(null);}}/><Txt kind="small">{days.filter(d=>d.hits>0).length} active days · {streak(model.events,now)} day streak</Txt>
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:4}}>{days.map(d=><Tap key={d.key} accessibilityLabel={`${d.key}, ${d.hits} successful tasks`} accessibilityState={{selected:selected.key===d.key}} onPress={()=>select(d.key)} style={{minWidth:40,minHeight:56,flexGrow:1,maxWidth:range==='7 days'?'14%':'16%',alignItems:'center',gap:4,paddingHorizontal:3,paddingTop:5,borderWidth:1,borderColor:selected.key===d.key?t.primary:t.line,borderRadius:8}}><View style={{height:27,justifyContent:'flex-end',width:14}}><View style={{height:d.hits?Math.max(4,Math.round(d.hits/max*27)):2,backgroundColor:d.hits?t.accent:t.line,borderRadius:4}}/></View><Txt kind="meta">{range==='7 days'?d.date.toLocaleDateString(undefined,{weekday:'narrow'}):d.date.getDate()}</Txt></Tap>)}</View><Txt kind="small" live>{selected.date.toLocaleDateString(undefined,{month:'short',day:'numeric'})} · {selected.hits} distinct tasks solved</Txt></Panel>
    <Panel><Txt kind="h2">Domain progress</Txt>{domains.map(d=>{const v=summary(map,lessonsForDomain(d.id).map(c=>({id:c.id,weight:1})));return <View key={d.id}><LinkRow title={d.name} detail={(v.mastery===null?'Unassessed':v.mastery+'% mastery')+' · '+v.coverage+'% coverage'} onPress={()=>go({page:'Domain',id:d.id})}/><Bar pct={v.mastery} label={d.name+' mastery'}/></View>;})}</Panel>
    <Panel>
      <Txt kind="h2">Career progress</Txt>
      {goals.map(c=>{
        const score=summary(map,requirementsThroughLevel(c,model.prefs.level));
        const evidence=score.mastery===null?'Unassessed':score.mastery+'% mastery';
        return <LinkRow key={c.id} title={c.name} detail={model.prefs.level+' · '+evidence+' · '+score.coverage+'% coverage'}
          onPress={()=>go({page:'Career',id:c.id})}/>;
      })}
      <LinkRow title={goals.length?'Explore all careers':'Choose a career goal'} icon="career" onPress={()=>go({page:'Careers'})}/>
    </Panel>
    <Panel>
      <Txt kind="h2">Concept evidence</Txt>
      <Chips values={['All concepts','Unassessed','Learning','Mastered','Needs review']} selected={scope} onSelect={setScope}/>
      <Txt kind="meta" live>{filtered.length} {filtered.length===1?'concept':'concepts'}</Txt>
      <ExpandableList key={scope} items={filtered} render={c=><ConceptRow key={c.id} c={c}
        detail={map[c.id].state+' · '+(map[c.id].assessed?Math.round(map[c.id].score*100)+'% earned':'No conceptual evidence')}/>}/>
      {!filtered.length&&<Txt kind="small">No concepts in this group yet.</Txt>}
    </Panel></>;
}
