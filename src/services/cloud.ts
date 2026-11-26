import 'react-native-url-polyfill/auto';
import {createClient} from '@supabase/supabase-js';
import {sessionStorageAdapter} from './sessionStorage';
import {curriculumVersion} from '../content/model';
import {mergeEvents, type Attempt} from '../core/learning';

const url=process.env.EXPO_PUBLIC_SUPABASE_URL, key=process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const environment=process.env.EXPO_PUBLIC_APP_ENV??'development';
const expected=process.env.EXPO_PUBLIC_SUPABASE_ENV;
const enabled=!!url && /^https:\/\/[^/@?#]+\/?$/.test(url) && !!key && !key.startsWith('sb_secret_') &&
  ['development','staging','production'].includes(environment) && expected===environment;
export const cloud=enabled?createClient(url!,key!,{auth:{storage:sessionStorageAdapter,storageKey:`techfluent-${environment}-auth`,autoRefreshToken:true,persistSession:true,detectSessionInUrl:false}}):null;

export async function synchronize(userId:string, local:Attempt[]):Promise<Attempt[]>{
  if(!cloud) throw Error('Cloud learning is unavailable.');
  const remote:Attempt[]=[]; let after=0;
  for(;;){
    const {data,error}=await cloud.from('tf_attempts').select('sequence,event_id,concept_id,step,response,hinted,occurred_ms,curriculum').eq('user_id',userId).eq('curriculum',curriculumVersion).gt('sequence',after).order('sequence').limit(400);
    if(error) throw Error('Could not read cloud progress.');
    for(const r of data)remote.push({id:r.event_id,concept:r.concept_id,step:r.step,response:r.response,hinted:r.hinted,at:Number(r.occurred_ms),version:r.curriculum});
    if(data.length<400)break;after=Number(data[data.length-1].sequence);
  }
  const known=new Set(remote.map(e=>e.id)),missing=local.filter(e=>!known.has(e.id));
  for(let i=0;i<missing.length;i+=40){
    const {error}=await cloud.rpc('tf_submit_attempts',{batch:missing.slice(i,i+40),expected_owner:userId});
    if(error)throw Error('Your work is on this device. Sync can be retried.');
  }
  return mergeEvents(remote,local);
}
