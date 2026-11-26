const {test}=require('node:test');
const assert=require('node:assert/strict');
const {lessons,byId,searchLessons}=require('../.test-build/content/catalog');
const {careers}=require('../.test-build/content/careers');
const {domains,isPublished,curriculumVersion}=require('../.test-build/content/model');
const {correct,newAttempt,evidence,summary,initial,mergeEvents,readLearner,mergeGuest,dailyPlan,dayMs,streak,recentDays}=require('../.test-build/core/learning');
const base=new Date(2026,10,10,12).getTime();
function attempt(id,step,at=base,hinted=false,right=true){const q=byId[id].checks[step];return newAttempt(id,step,right?(q.kind==='order'?q.answer:[q.answer[0]]):['incorrect'],hinted,at);}
test('every concept has complete teaching, application, and interview material',()=>{
 assert.equal(new Set(lessons.map(c=>c.id)).size,lessons.length);assert.ok(lessons.length>=30);
 for(const c of lessons){for(const key of ['simple','technical','why','analogy','example','mistake','practice','tradeoff','security'])assert.ok(c[key].length>24,c.id+' '+key);
  assert.equal(c.checks.length,3);assert.ok(c.refs.length);assert.ok(careers.some(r=>r.requirements.some(v=>v.id===c.id)),c.id);
  for(const level of ['Entry','Intermediate','Senior']){assert.ok(c.interview[level][0].includes('?')||c.interview[level][0].endsWith('.'));assert.ok(c.interview[level][1].length>35);}
  assert.ok(c.interview.rubric.length>=3);assert.equal(isPublished(c),false);
 }
 assert.ok(domains.every(d=>lessons.some(c=>c.group===d.id)));
});
test('the prerequisite graph is acyclic and every link resolves',()=>{
 const done=new Set();function walk(id,path){assert.ok(byId[id],id);assert.ok(!path.includes(id),'cycle '+path.join('/'));if(done.has(id))return;
  byId[id].related.forEach(v=>assert.ok(byId[v]));byId[id].prerequisites.forEach(v=>walk(v,[...path,id]));done.add(id);}
 lessons.forEach(c=>walk(c.id,[]));
});
test('all 32 career maps have unique, weighted requirements and an occupational reference',()=>{
 assert.equal(careers.length,32);assert.equal(new Set(careers.map(r=>r.id)).size,32);
 for(const r of careers){assert.match(r.occupation,/^\d{2}-\d{4}\.\d{2}$/);assert.equal(new Set(r.requirements.map(v=>v.id)).size,r.requirements.length);
 assert.ok(r.requirements.every(v=>byId[v.id]&&v.weight>0));assert.ok(r.advanced.length>=3&&r.project.length>25);}
});
test('all exercises grade their documented solution and explain the decision',()=>{
 for(const c of lessons)for(const ex of c.checks){assert.ok(ex.explanation&&ex.hint);assert.ok(correct(ex,ex.kind==='order'?ex.answer:[ex.answer[0]]),c.id);
 assert.equal(correct(ex,['not a valid answer']),false);if(ex.kind==='order')assert.equal(correct(ex,[...ex.answer].reverse()),false);
 if(ex.kind==='choice')assert.ok(ex.options.includes(ex.answer[0]));}
 assert.ok(correct(byId.query.checks[1],['  orDer    BY ']));
});
test('fresh learners, bookmarks, notes, and lesson views have no mastery evidence',()=>{
 const s=initial();s.resume={id:'api',step:0,section:'Interview'};s.notes['api.Entry']='I can explain this.';s.bookmarks=['api'];
 const x=summary(evidence(s.events,base));assert.equal(x.mastery,null);assert.equal(x.coverage,0);assert.equal(x.unknown,lessons.length);assert.equal(x.practicalPct,null);
});
test('career formula uses total required weight and updates every shared map once',()=>{
 const m=evidence([attempt('http',0),attempt('http',1)],base);for(const r of careers){const w=r.requirements.find(v=>v.id==='http')?.weight??0;const total=r.requirements.reduce((v,x)=>v+x.weight,0);assert.equal(summary(m,r.requirements).mastery,w?Math.round(100*w/total):null,r.id);}
 const partial=summary(evidence([attempt('http',0)],base),[{id:'http',weight:2},{id:'query',weight:1}]);assert.equal(partial.mastery,33);assert.equal(partial.coverage,33);assert.equal(partial.unknown,1);
});
test('a practical task records separate competency and cannot raise conceptual mastery',()=>{
 const m=evidence([attempt('api',2)],base);assert.equal(m.api.practical,1);assert.equal(m.api.assessed,false);assert.equal(m.api.complete,false);
});
test('completion needs all tasks, while assisted answers contribute half-credit',()=>{
 const e=evidence([attempt('api',0,base,true),attempt('api',1),attempt('api',2)],base).api;assert.equal(e.complete,true);assert.equal(e.score,.75);
});
test('reloading or resubmitting after a mistake preserves same-day correction credit',()=>{
 const s=initial();s.events=[attempt('http',0,base,false,false),attempt('http',0,base+10)];const restored=readLearner(JSON.stringify(s));
 assert.equal(evidence(restored.events,base+20).http.items[0].score,.5);assert.equal(summary(evidence(restored.events,base+20)).assessed,1);
});
test('spaced repetition uses due retrieval, ignores early repeats, and lapses on a miss',()=>{
 let events=[attempt('api',0),attempt('api',1)];let m=evidence(events,base);assert.equal(m.api.due,base+dayMs);assert.equal(m.api.retained,false);
 events.push(attempt('api',0,base+8000));assert.equal(evidence(events,base+8000).api.due,base+dayMs);
 assert.equal(evidence(events,base+dayMs).api.review,true);
 events=events.concat(attempt('api',0,base+dayMs),attempt('api',1,base+dayMs));m=evidence(events,base+dayMs);assert.equal(m.api.retained,true);assert.equal(m.api.due,base+4*dayMs);
 assert.equal(evidence(events,base+4*dayMs).api.retained,false);
 events.push(attempt('api',0,base+2*dayMs,false,false));assert.equal(evidence(events,base+2*dayMs).api.review,true);
});
test('event replay, out-of-order imports, and account migration are idempotent',()=>{
 const guest=initial(),account=initial();guest.events=[attempt('variables',0),attempt('variables',1,base+15)];account.events=[guest.events[1]];
 guest.prefs.interests=['ml'];account.prefs.interests=['software'];guest.bookmarks=['api'];account.notes={'api.Entry':'My private answer'};
 const v=mergeGuest(account,guest);assert.equal(v.events.length,2);assert.deepEqual(mergeGuest(v,guest),v);assert.deepEqual(v.prefs.interests,['software','ml']);assert.deepEqual(v.events,mergeEvents([...v.events].reverse()));assert.ok(v.notes['api.Entry']);
});
test('planner promotes missing prerequisites, career foundations, and later reviews',()=>{
 const s=initial();assert.equal(dailyPlan(s,evidence([],base))[0].id,'internet');
 s.prefs.interests=['ai'];let plan=dailyPlan(s,evidence([],base));assert.equal(plan[0].id,'holdout');
 s.events=[attempt('variables',0,base-dayMs*2)];plan=dailyPlan(s,evidence(s.events,base));assert.equal(plan[0].reason,'Review due');assert.equal(plan[0].id,'variables');
 s.prefs.minutes=30;assert.ok(dailyPlan(s,evidence(s.events,base)).length>2);
});
test('a streak counts successful local calendar days and preserves yesterday’s streak',()=>{
 const events=[attempt('api',0,base-2*dayMs),attempt('api',0,base-dayMs),attempt('api',0,base-dayMs+1000)];
 assert.equal(streak(events,base),2);assert.equal(recentDays(events,7,base).at(-2).hits,1);assert.equal(streak(events,base+dayMs),0);
});
test('search recognizes aliases, terms and multiword queries',()=>{assert.ok(searchLessons('TTL').some(c=>c.id==='dns'));assert.ok(searchLessons('graph BFS').some(c=>c.id==='graph'));assert.equal(searchLessons('unfindable-term').length,0);});
test('corrupt input is recoverable and unverified content cannot pass the release gate',()=>{
 assert.throws(()=>readLearner('bad'));assert.throws(()=>readLearner('{"schema":7}'));
 assert.equal(isPublished({...byId.http,editorial:{status:'expert-reviewed',reviewer:'',version:curriculumVersion,reviewedOn:'2026-11-26'}}),false);
 const {spawnSync}=require('node:child_process');const res=spawnSync(process.execPath,['-e',"console.log(require('./.test-build/content/catalog').lessons.length)"],{env:{...process.env,EXPO_PUBLIC_APP_ENV:'production'},encoding:'utf8'});assert.equal(res.stdout.trim(),'0');
});
