import {createClient} from 'npm:@supabase/supabase-js@2.117.3';

const headers = {'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Cache-Control':'no-store'};
const reply=(status:number,message:string)=>new Response(JSON.stringify({message}),{status,headers});
Deno.serve(async request=>{
  if(request.method==='OPTIONS')return new Response(null,{headers});
  if(request.method!=='POST')return reply(405,'POST required.');
  const token=request.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if(!token)return reply(401,'Sign in required.');
  const url=Deno.env.get('SUPABASE_URL'),role=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!url||!role)return reply(503,'Account service unavailable.');
  const auth=createClient(url,role,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await auth.auth.getUser(token);
  if(error||!data.user||data.user.is_anonymous)return reply(401,'Sign in required.');
  const last=Date.parse(data.user.last_sign_in_at??'');
  if(!Number.isFinite(last)||Date.now()-last>600000)return reply(403,'Verify your email again before deleting.');
  const body=await request.json().catch(()=>null);
  if(body?.confirm!==true)return reply(400,'Confirmation required.');
  const result=await auth.auth.admin.deleteUser(data.user.id);
  return result.error?reply(503,'Account deletion could not finish.'):reply(200,'Account deleted.');
});
