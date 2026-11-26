const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');const {lessons,byId}=require('../.test-build/content/catalog');const {newAttempt}=require('../.test-build/core/learning');
test('Supabase migrations enforce ownership and grade submissions in PostgreSQL',async t=>{
 const db=new PGlite(),a='10000000-0000-4000-8000-000000000001',b='20000000-0000-4000-8000-000000000002';
 t.after(()=>db.close());
 await db.exec(`create role anon;create role authenticated;create schema auth;
 create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid',true),'')::uuid $$;
 create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('test.jwt',true),''),'{}')::jsonb $$;
 grant usage on schema auth to anon,authenticated;
 insert into auth.users values('${a}'),('${b}');`);
 for(const name of fs.readdirSync('supabase/migrations').filter(name=>name.endsWith('.sql')).sort()){
  await db.exec(fs.readFileSync('supabase/migrations/'+name,'utf8'));
 }
 await t.test('server answer keys match every released exercise definition',async()=>{
  const {rows}=await db.query('select * from tf_private.assessments');assert.equal(rows.length,lessons.length*3);
  for(const row of rows)assert.deepEqual(row.solutions,byId[row.concept_id].checks[row.step].answer.map(s=>s.trim().toLowerCase().replace(/\s+/g,' ')));
 });
 async function as(role,id,anonymous=false){await db.exec('reset role');await db.query("select set_config('test.uid',$1,false),set_config('test.jwt',$2,false)",[id,JSON.stringify({is_anonymous:anonymous})]);await db.exec('set role '+role);}
 const send=(events,owner=a)=>db.query('select public.tf_submit_attempts($1::jsonb,$2::uuid)',[JSON.stringify(events),owner]);const read=async()=> (await db.query('select * from public.tf_attempts')).rows;
 const good=newAttempt('api',0,[byId.api.checks[0].answer[0]],false),bad={...newAttempt('api',0,['wrong'],false),correct:true,user_id:b};
 await t.test('guest and anonymous-account submissions are rejected',async()=>{await as('anon','');await assert.rejects(send([good]));await as('authenticated',a,true);await assert.rejects(send([good]));});
 await t.test('direct writes and forged user claims fail; RPC ignores a forged grade',async()=>{
  await as('authenticated',a);await assert.rejects(db.exec('delete from public.tf_attempts'));await assert.rejects(db.exec('select * from tf_private.assessments'));await assert.rejects(send([good],b));
  await send([good,bad]);const rows=await read();assert.equal(rows.length,2);assert.ok(rows.every(v=>v.user_id===a));assert.equal(rows.find(v=>v.event_id===bad.id).correct,false);assert.equal(rows.find(v=>v.event_id===good.id).correct,true);
 });
 await t.test('another account sees no rows and replay cannot overwrite the first event',async()=>{
  await as('authenticated',b);assert.equal((await read()).length,0);await as('authenticated',a);
  await send([{...good,response:['incorrect']}]);assert.equal((await read()).length,2);assert.equal((await read()).find(r=>r.event_id===good.id).correct,true);
 });
 await t.test('invalid evidence rolls back its entire batch',async()=>{
  const fresh=newAttempt('dns',0,['A'],false);await assert.rejects(send([fresh,{...fresh,id:newAttempt('dns',0,['A'],false).id,at:Date.now()+1e8}]));
  assert.equal((await read()).length,2);await assert.rejects(send([{...fresh,concept:'missing'}]));await assert.rejects(send([{...fresh,response:[{}]}]));
 });
 await t.test('account deletion cascades to learning evidence',async()=>{await db.exec('reset role');await db.query('delete from auth.users where id=$1',[a]);assert.equal((await read()).length,0);});
});
