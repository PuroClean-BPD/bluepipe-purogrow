import { createClient } from '@supabase/supabase-js';
// Separate PKCE storage and bundle: no legacy audit reader or brokered auth imports.
export const monthlyClient = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, {
 auth: {flowType:'pkce',storageKey:'bluepipe-monthly-auth',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false},
});
export const AUTH_RESPONSE='If access is available, follow the instructions provided.';
export const PERIOD_START='2026-10-05T00:00:00-05:00';
export const PERIOD_END='2026-11-05T23:59:59.999999-06:00';
export const PERIOD_EXCLUSIVE_END='2026-11-06T00:00:00-06:00';
export function inReportingPeriod(value:string) {const t=Date.parse(value);return t>=Date.parse(PERIOD_START)&&t<Date.parse(PERIOD_EXCLUSIVE_END);}
export async function requestMonthlyAccess(email:string){
 const {data:flag,error}=await monthlyClient.functions.invoke('monthly-auth',{method:'GET'});
 if(error||flag?.enabled!==true)return {enabled:false,message:AUTH_RESPONSE};
 // Standard PKCE verifier format, server-side send gate. Never a fixture login bypass.
 const bytes=crypto.getRandomValues(new Uint8Array(32));
 const verifier=btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier));
 const challenge=btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
 localStorage.setItem('bluepipe-monthly-auth-code-verifier',JSON.stringify(verifier));
 await monthlyClient.functions.invoke('monthly-auth',{body:{email,redirect:`${window.location.origin}/portal/callback`,code_challenge:challenge}});
 return {enabled:true,message:AUTH_RESPONSE};
}
