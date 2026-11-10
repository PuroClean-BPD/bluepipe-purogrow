export const hex = (b: ArrayBuffer | Uint8Array) => Array.from(new Uint8Array(b instanceof Uint8Array ? b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength) : b), x=>x.toString(16).padStart(2,'0')).join('');
export const digest = async (s:string) => hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
export const opaque = () => hex(crypto.getRandomValues(new Uint8Array(32)));
export async function verifier(secret:string,salt:string,iterations=600000){
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),'PBKDF2',false,['deriveBits']);
 return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:Uint8Array.from(salt.match(/../g)??[],x=>parseInt(x,16)),iterations},key,256));
}
export function equal(a:string,b:string){let n=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)n|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return n===0;}
