import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
Deno.serve(async(req)=>{
 const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders,'Content-Type':'application/json','Cache-Control':'no-store'}});
 if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders});
 const url=Deno.env.get('SUPABASE_URL'),service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),key=Deno.env.get('SUPABASE_ANON_KEY');
 if(!url||!service||!key)return reply({error:'Unavailable'},503);
 const admin=createClient(url,service,{auth:{persistSession:false}});
 const {data:flag,error}=await admin.from('monthly_settings').select('auth_sending_enabled').eq('id',true).maybeSingle();
 // Fail closed. This flag is never client writable. No live auth calls unless separately approved.
 const enabled=!error&&flag?.auth_sending_enabled===true;
 if(req.method==='GET')return reply({enabled});
 if(req.method!=='POST')return reply({error:'Method not allowed'},405);
 const generic={message:'If access is available, follow the instructions provided.',enabled};
 if(!enabled)return reply(generic);
 let parsed;try{parsed=z.object({email:z.string().email().max(254),redirect:z.string().url(),code_challenge:z.string().regex(/^[A-Za-z0-9_-]{43}$/)}).strict().safeParse(await req.json());}catch{return reply(generic);}
 if(!parsed.success)return reply(generic);
 const allowed=(Deno.env.get('MONTHLY_AUTH_ORIGINS')??'').split(',').filter(Boolean);
 const redirect=new URL(parsed.data.redirect);
 if(!allowed.includes(redirect.origin)||redirect.pathname!=='/portal/callback'||redirect.search||redirect.hash)return reply(generic);
 // Auth server enforces no user creation. No lookup exposing account existence.
 await fetch(`${url}/auth/v1/otp?redirect_to=${encodeURIComponent(parsed.data.redirect)}`,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({email:parsed.data.email,create_user:false,code_challenge:parsed.data.code_challenge,code_challenge_method:'s256'})}).then(r=>r.text()).catch(()=>undefined);
 return reply(generic);
});
