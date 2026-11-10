// Unprivileged broker: no secret, no JWT trust, no forwarded-IP trust.
const ENDPOINT='https://zawxlalhmruzijnsdpcu.supabase.co/functions/v1/monthly-code';
const COOKIE='__Host-bluepipe-owner';
const BASE={'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'};
const cookie=(s:string,age:number)=>`${COOKIE}=${s}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
export default async function handler(req:Request){
 const reply=(body:unknown,status=200,extra:Record<string,string>={})=>Response.json(body,{status,headers:{...BASE,...extra}});
 if(req.method!=='POST')return reply({error:'Denied'},405);
 const u=new URL(req.url);
 if(req.headers.get('Origin')!==u.origin||req.headers.get('X-BluePipe-Request')!=='1')return reply({error:'Denied'},403);
 let p:Record<string,unknown>;try{const raw=await req.text();if(raw.length>2048)return reply({error:'Denied'},400);p=JSON.parse(raw);}catch{return reply({error:'Denied'},400);}
 if(!['login','archive','logout','file'].includes(String(p.action)))return reply({error:'Denied'},400);
 const session=req.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
 const body=p.action==='login'?{action:'login',code:p.code}:p.action==='file'?{action:'file',session:session??'',version_id:p.version_id,format:p.format}:{action:p.action,session:session??''};
 try{
  const r=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(25000)});
  const data=await r.json();
  if(p.action==='login'&&r.ok){if(typeof data.session!=='string'||!/^[a-f0-9]{64}$/.test(data.session))return reply({error:'Unavailable'},503);return reply({ok:true},200,{'Set-Cookie':cookie(data.session,2592000)});}
  if(p.action==='logout'&&r.ok)return reply({ok:true},200,{'Set-Cookie':cookie('',0)});
  return reply(data,r.status,r.status===401?{'Set-Cookie':cookie('',0)}:{});
 }catch{return reply({error:'Unavailable'},503);}
}
export const config={path:'/portal/api/owner',method:'POST'};
