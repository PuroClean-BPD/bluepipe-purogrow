export async function ownerRequest(body:Record<string,unknown>){
 const r=await fetch('/portal/api/owner',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-BluePipe-Request':'1'},body:JSON.stringify(body)});
 if(!r.ok)throw Error(r.status===401?'Access unavailable.':'Secure access is unavailable.');
 return r.json();
}
