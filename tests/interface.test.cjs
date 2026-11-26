const {before,after,test}=require('node:test');
const assert=require('node:assert/strict');const fs=require('node:fs');const {JSDOM,VirtualConsole}=require('jsdom');

const html=()=>fs.readFileSync('dist/TechFluent.html','utf8');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let dom,errors=[];
function load(hash='',stored={},width=390){
 if(dom)dom.window.close();
 const out=new VirtualConsole();out.on('jsdomError',e=>{if(!/Not implemented:.*scroll/i.test(e.message))errors.push(e.message);});out.on('error',e=>errors.push(String(e)));
 dom=new JSDOM(html(),{url:'https://techfluent.test/'+hash,runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:out,beforeParse(w){
  Object.assign(w,{TextEncoder,TextDecoder,structuredClone,innerWidth:width,fetch:async()=>{throw Error('Network disabled in UI test');},
   matchMedia:()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}),
   ResizeObserver:class{observe(){}unobserve(){}disconnect(){}}});
  Object.defineProperty(w.document.documentElement??w.HTMLElement.prototype,'clientWidth',{configurable:true,get:()=>width});
  Object.entries(stored).forEach(([k,v])=>w.localStorage.setItem(k,v));
 }});
}
const doc=()=>dom.window.document;
const body=()=>doc().getElementById('root').textContent;
const buttons=()=>[...doc().querySelectorAll('button,[role="tab"],[role="checkbox"]')];
const findButton=(s,starts=false)=>buttons().find(e=>{const labels=[e.getAttribute('aria-label')??'',e.textContent];return labels.some(v=>starts?v.startsWith(s):v===s);});
async function wait(check,desc){for(let i=0;i<120;i++){if(check())return;await pause(10);}assert.fail('Missing '+desc+' · '+body().slice(0,200));}
async function has(s){await wait(()=>body().includes(s),s);}
async function press(s,starts=false){await wait(()=>!!findButton(s,starts),'button '+s);const el=findButton(s,starts);assert.ok(!el.disabled,s);el.click();await pause(12);}
async function type(label,value){const el=doc().querySelector('[aria-label="'+label+'"]');assert.ok(el,label);const p=el.tagName==='TEXTAREA'?dom.window.HTMLTextAreaElement:dom.window.HTMLInputElement;
 Object.getOwnPropertyDescriptor(p.prototype,'value').set.call(el,value);el.dispatchEvent(new dom.window.Event('input',{bubbles:true}));await pause(15);}
function disk(){return Object.fromEntries(Array.from({length:dom.window.localStorage.length},(_,i)=>{const k=dom.window.localStorage.key(i);return [k,dom.window.localStorage.getItem(k)];}));}
before(()=>assert.ok(fs.existsSync('dist/TechFluent.html'),'Run npm run export:web before the UI suite.'));
after(()=>{dom?.window.close();assert.deepEqual(errors,[],'Export emitted unexpected rendering errors.');});

test('guest completes the network lesson through the exported interface and resumes offline',async()=>{
 load();await has('Your learning space');assert.ok(body().includes('0 of 30 concepts assessed'));
 await press('Start lesson');await has('How does the internet work?');await press('Send request');await has('Routers forward the request');
 await press('Receive response');await has('The server responds');await press('Save');await press('Start knowledge check');
 await press('Keyboard');await press('Check answer');await has('Try another approach');await press('Try again');await press('Router');await press('Check answer');await has('That’s right');await press('Next question');
 await press('The phone has a local wireless link');await press('Check answer');await press('Next question');
 for(const s of ['Your browser sends a request','The server returns a forecast','The browser displays the forecast'])await press(s);
 await press('Check answer');await press('See lesson result');await has('Lesson complete');await press('See my progress');await has('1 / 30');
 await press('Home');await has('1 of 30 concepts assessed');const saved=disk();load('',saved);await has('1 of 30 concepts assessed');
 await press('Open encyclopedia');await press('Saved');await has('1 term');await press('Internet',true);await has('Open full lesson');
});
test('career selection, interview rehearsal and role-level answers preserve score boundaries',async()=>{
 load('#careers');await has('Your career knowledge');await press('Software Engineer',true);await has('Foundation mastery');await press('Add career goal');
 await press('Open role practice');await has('Interview studio');await press('Variable',true);await press('Senior');await has('How would you investigate an unexpected value');
 await type('Your explanation','Trace bindings and inspect object mutation.');await press('Compare with a worked answer');await has('One strong answer');await press('Trace the right side first.');await has('Follow-up');
 const saved=disk();const record=JSON.parse(Object.values(saved)[0]);assert.ok(record.prefs.interests.includes('software'));assert.equal(record.events.length,0);assert.equal(record.notes['variables.Senior'],'Trace bindings and inspect object mutation.');
 load('#lesson/variables/Interview',saved);await has('Interview rehearsal');await press('Senior');assert.equal(doc().querySelector('textarea').value,record.notes['variables.Senior']);
});
test('all tabs, glossary lookup, theme, preferences and empty results work offline',async()=>{
 load('',{},1200);await has('Your learning space');await press('Learn');await has('Technology domains');await type('Search lessons','RAG');await has('Ground an answer in relevant documents');await type('Search lessons','zzznomatch');await has('No matching lessons');
 await press('Careers');await has('32 career maps');await press('Progress');await has('Curriculum completion');await press('30 days');await has('distinct tasks solved');
 await press('Profile');await press('Dark');await press('15 min');await press('Reduce motion');await press('Experience and career goals',true);await press('Career changer');await press('Prepare for interviews');await press('Continue');await press('AI Engineer');await press('Continue');await press('Save my plan');await has('Your learning space');await has('15 min goal');
 const state=JSON.parse(Object.values(disk())[0]);assert.equal(state.prefs.theme,'Dark');assert.equal(state.prefs.reduceMotion,true);assert.ok(state.prefs.interests.includes('ai'));
});
test('every lesson and every career detail opens through a supported route',async()=>{
 const {lessons}=require('../.test-build/content/catalog');const {careers}=require('../.test-build/content/careers');
 load();await has('Your learning space');
 for(const c of lessons){dom.window.location.hash='lesson/'+c.id;await has(c.title);assert.ok(findButton('Start knowledge check'), 'Knowledge check not reachable for '+c.id);}
 for(const r of careers){dom.window.location.hash='career/'+r.id;await has(r.focus);assert.ok(findButton('Open role practice'));}
});
