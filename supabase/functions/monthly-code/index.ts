import {createClient} from 'npm:@supabase/supabase-js@2';
import {z} from 'npm:zod@3';
import {digest,opaque,verifier,equal} from './crypto.ts';
const Input=z.discriminatedUnion('action',[
 z.object({action:z.literal('login'),code:z.string().max(100)}).strict(),
 z.object({action:z.enum(['archive','logout']),session:z.string().regex(/^[a-f0-9]{64}$/)}).strict(),
 z.object({action:z.literal('file'),session:z.string().regex(/^[a-f0-9]{64}$/),version_id:z.string().uuid(),format:z.enum(['html','pdf','content'])}).strict(),
]);
Deno.serve(async req=>{
 const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'}});
 const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!url||!key)return reply({error:'Unavailable'},503);
 const db=createClient(url,key,{auth:{persistSession:false}});
 const audit=async(action:string)=>{const r=await db.rpc('monthly_code_audit',{p_action:action});if(r.error)throw Error('Audit unavailable');};
 try{
  const gate=await db.rpc('monthly_code_request_gate');
  if(gate.error)throw Error('Unavailable');
  if(gate.data!==true)return reply({error:'Access unavailable'},429);
  if(req.method!=='POST'){await audit('code_method_denied');return reply({error:'Denied'},405);}
  const raw=await req.text();if(raw.length>2048){await audit('code_input_denied');return reply({error:'Denied'},400);}
  let parsed;try{parsed=Input.safeParse(JSON.parse(raw));}catch{await audit('code_input_denied');return reply({error:'Denied'},400);}
  if(!parsed.success){await audit('code_input_denied');return reply({error:'Denied'},400);}
  const p=parsed.data;
  if(p.action==='login'){
   const match=/^([a-f0-9]{32})\.([a-f0-9]{64})$/.exec(p.code);
   const b=await db.rpc('monthly_code_begin',{p_selector:match?.[1]??''});
   if(b.error)throw Error('Unavailable');
   if(!b.data?.allowed)return reply({error:'Access unavailable'},401);
   const token=opaque();
   const sum=await verifier(match?.[2]??'',b.data.salt,b.data.iterations);
   const f=await db.rpc('monthly_code_finish',{p_attempt:b.data.attempt,p_match:equal(sum,b.data.verifier),p_digest:await digest(token)});
   if(f.error)throw Error('Unavailable');
   return f.data?.ok?reply({session:token,expires_at:f.data.expires_at}):reply({error:'Access unavailable'},401);
  }
  const args={p_digest:await digest(p.session),p_action:p.action,p_version:p.action==='file'?p.version_id:null,p_format:p.action==='file'?p.format:null};
  const a=await db.rpc('monthly_code_access',args);if(a.error)throw Error('Unavailable');
  if(!a.data?.ok)return reply({error:'Access unavailable'},401);
  if(p.action!=='file')return reply(a.data);
  const s=await db.storage.from('reports-private').createSignedUrl(a.data.path,60,{download:p.format==='pdf'?'BluePipe-Monthly-Report.pdf':false});
  if(s.error||!s.data?.signedUrl){await audit('code_signing_failed');return reply({error:'Unavailable'},503);}
  // Revalidate after signing: concurrent revoke/state change never returns a newly issued URL.
  const confirm=await db.rpc('monthly_code_access',{...args,p_action:'file_confirm'});
  if(confirm.error)throw Error('Unavailable');
  if(!confirm.data?.ok||confirm.data.path!==a.data.path)return reply({error:'Access unavailable'},401);
  return reply({url:s.data.signedUrl,sha256:a.data.sha256,expires_in:60});
 }catch{return reply({error:'Unavailable'},503);}
});
