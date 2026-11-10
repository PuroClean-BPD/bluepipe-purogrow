# Signed-in synthetic hosted suite. Session tokens/signed URLs never printed or saved.
import json,os,uuid,hashlib,base64,time,threading,datetime,requests
from zoneinfo import ZoneInfo
CT=ZoneInfo('America/Chicago')
env={l.split('=',1)[0]:l.split('=',1)[1].strip().strip('"') for l in open('/dev-server/.env') if '=' in l}
URL=env['VITE_SUPABASE_URL'];ANON=env['VITE_SUPABASE_PUBLISHABLE_KEY']
S=json.load(open('/tmp/monthly-admin-session.json'))['session'];ADMIN=S['access_token'];AID=S['user']['id']
assert AID=='76a43a8c-0fc9-4a59-9bfc-7b7b7efb89d5'
REPORT='a141ba75-e4f0-476c-80d4-574a215b9cf0'
rows=[]
def now():return datetime.datetime.now(CT).isoformat(timespec='seconds')
def row(tid,name,expected,actual,status,**ids):
  rows.append(dict(id=tid,test=name,at_ct=now(),expected=expected,actual=actual,status=status,**ids));print(tid,status,name,'|',actual)
def H(tok=None):
  return {'apikey':ANON,'Authorization':'Bearer '+(tok or ANON),'Content-Type':'application/json'}
def fn(name,body,tok=None):return requests.post(f'{URL}/functions/v1/{name}',headers=H(tok),json=body,timeout=60)
def rpc(name,args,tok=None):return requests.post(f'{URL}/rest/v1/rpc/{name}',headers=H(tok),json=args,timeout=30)
def rest(t,tok=None,method='GET',q='',body=None):return requests.request(method,f'{URL}/rest/v1/{t}{q}',headers={**H(tok),'Prefer':'return=representation'},json=body,timeout=30)
TABLES=['organizations','clients','memberships','staff','reports','report_versions','audit_log','settings','provisioning','staging']
# 1/9 anonymous
for t in TABLES:
  r=rest('monthly_'+t);body=r.text[:60]
  ok=(r.status_code in(401,403,404))or(r.ok and r.json()==[])
  row('T1-anon-select-'+t,'anon select monthly_'+t,'denied or 0 rows',f'HTTP {r.status_code} rows={len(r.json()) if r.ok else "-"}','PASS' if ok else 'FAIL')
  r=rest('monthly_'+t,method='POST',body={})
  row('T1-anon-insert-'+t,'anon insert monthly_'+t,'denied',f'HTTP {r.status_code}','PASS' if r.status_code in(401,403) else 'FAIL')
for f in ['monthly-admin','get-report-file']:
  r=requests.post(f'{URL}/functions/v1/{f}',json={},timeout=30);row('T1-anon-edge-'+f,'no-auth '+f,'401',f'HTTP {r.status_code}','PASS' if r.status_code==401 else 'FAIL')
  r=fn(f,{});row('T1-anonkey-edge-'+f,'anon-key bearer '+f,'401',f'HTTP {r.status_code}','PASS' if r.status_code==401 else 'FAIL')
P='monthly/7046f021ec8a4bb088af17801db9b456/test-a1/v3.html'
for kind,u in [('authenticated',f'{URL}/storage/v1/object/authenticated/reports-private/{P}'),('public',f'{URL}/storage/v1/object/public/reports-private/{P}')]:
  r=requests.get(u,headers={'apikey':ANON,'Authorization':'Bearer '+ANON},timeout=30)
  row('T2-anon-storage-'+kind,'anon direct object read '+kind,'4xx',f'HTTP {r.status_code}','PASS' if 400<=r.status_code<500 else 'FAIL',path=P)
r=requests.post(f'{URL}/storage/v1/object/list/reports-private',headers=H(),json={'prefix':'monthly/'},timeout=30)
row('T2-anon-storage-list','anon list bucket','empty/denied',f'HTTP {r.status_code} n={len(r.json()) if r.ok else "-"}','PASS' if (not r.ok) or r.json()==[] else 'FAIL')
# admin non-fixture gate sanity (admin is staff, sees fixtures)
r=rest('monthly_clients',ADMIN);row('T9-admin-read-clients','synthetic admin reads clients','3 synthetic',f'HTTP {r.status_code} slugs={sorted(x["slug"] for x in r.json())}','PASS' if r.ok and sorted(x['slug'] for x in r.json())==['test-a1','test-a2','test-b1'] else 'FAIL')
# 6 audit immutability under admin JWT
r=rest('monthly_audit_log',ADMIN,'PATCH','?action=eq.grant',{'action':'tamper'});row('T6-audit-update','admin JWT update audit_log','denied/0 rows',f'HTTP {r.status_code} body={r.text[:40]}','PASS' if r.status_code in(401,403) or r.text.strip()=='[]' else 'FAIL')
r=rest('monthly_audit_log',ADMIN,'DELETE','?action=eq.grant');row('T6-audit-delete','admin JWT delete audit_log','denied/0 rows',f'HTTP {r.status_code} body={r.text[:40]}','PASS' if r.status_code in(401,403) or r.text.strip()=='[]' else 'FAIL')
r=rest('monthly_memberships',ADMIN,'POST',body={'user_id':AID,'client_id':'6617128f-8f64-4331-a345-237753d25acd','role':'client_viewer','granted_by':AID,'grant_source':'x'});row('T6-direct-membership-insert','admin direct table insert bypassing RPC','denied',f'HTTP {r.status_code}','PASS' if r.status_code in(401,403) else 'FAIL')
for f,a in [('monthly_transition',{'vid':'88be33e3-9739-49e9-adce-be749837fe1a','next_state':'approved'}),('monthly_grant',{'uid':AID,'cid':'6617128f-8f64-4331-a345-237753d25acd','mrole':'client_viewer','source':'anon'})]:
  r=rpc(f,a);row('T6-anon-rpc-'+f,'anon '+f,'denied',f'HTTP {r.status_code}','PASS' if not r.ok else 'FAIL')
# 3 signed URL on published synthetic fixture (admin caller; owner-caller variant blocked)
V='38a7b48f-b0cf-484f-afdd-b3dfd9e401df'
r=fn('get-report-file',{'version_id':V,'format':'html'},ADMIN)
if r.ok:
  su=r.json()['url'];g=requests.get(su,timeout=30);b=g.content;sha=hashlib.sha256(b).hexdigest();t0=time.time()
  row('T3-signed-initial','signed URL works initially (admin caller)','200',f'HTTP {g.status_code} bytes={len(b)} sha256={sha}','PASS' if g.ok else 'FAIL',version_id=V,path=P)
  forged=su.split('token=')[0]+'token=AAAA';g2=requests.get(forged,timeout=30)
  row('T4-forged-token','tampered signed token','4xx',f'HTTP {g2.status_code}','PASS' if g2.status_code>=400 else 'FAIL')
  time.sleep(max(0,66-(time.time()-t0)));g=requests.get(su,timeout=30)
  row('T3-signed-expired','same URL after >=65s','4xx',f'HTTP {g.status_code} elapsed={int(time.time()-t0)}s','PASS' if g.status_code>=400 else 'FAIL',version_id=V)
  del su
else: row('T3-signed-initial','issue signed URL','200',f'HTTP {r.status_code}','FAIL')
r=fn('get-report-file',{'version_id':str(uuid.uuid4()),'format':'pdf'},ADMIN);row('T2-guessed-version','unknown version id','403',f'HTTP {r.status_code}','PASS' if r.status_code==403 else 'FAIL')
r=fn('get-report-file',{'version_id':V,'format':'html','path':'monthly/x'},ADMIN);row('T2-path-injection','extra path field','400',f'HTTP {r.status_code}','PASS' if r.status_code==400 else 'FAIL')
# 5 unknown email, sender OFF
g=requests.get(f'{URL}/functions/v1/monthly-auth',headers=H(),timeout=30)
row('T5-flag','sender flag','enabled=false',g.text,'PASS' if g.ok and g.json().get('enabled') is False else 'FAIL')
unk=f'bluepipe-monthly-unknown-{uuid.uuid4().hex[:8]}@example.invalid'
r=fn('monthly-auth',{'email':unk,'redirect':'https://puroclean.bluepipedigital.com/portal/callback','code_challenge':'a'*43})
row('T5-unknown-generic','unknown reserved email via OFF flow','generic 200, no auth call',f'HTTP {r.status_code} {r.json().get("message")}','PASS' if r.ok and 'If access' in r.json().get('message','') else 'FAIL',email_redacted='bluepipe-monthly-unknown-*@example.invalid')
# 7/8 staging
def files(tag):
  h=f'<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src \'none\'"><title>SYNTHETIC</title></head><body>SYNTHETIC FIXTURE {tag} Powered by BluePipe Digital</body></html>'.encode()
  pdf=(b'%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\n%SYNTHETIC '+tag.encode()+b'\ntrailer<</Root 1 0 R>>\n%%EOF\n')
  c=json.dumps({'synthetic':True,'tag':tag},sort_keys=True).encode()
  return h,pdf,c
def body(rid,tag,bad=False):
  h,p,c=files(tag);s=lambda x:hashlib.sha256(x).hexdigest()
  return {'action':'stage_version','request_id':rid,'report_id':REPORT,'html_b64':base64.b64encode(h).decode(),'pdf_b64':base64.b64encode(p).decode(),'content_b64':base64.b64encode(c).decode(),'expected':{'html_sha256':('0'*64) if bad else s(h),'pdf_sha256':s(p),'content_sha256':s(c)},'notes':'SYNTHETIC hosted suite'},{'html':(s(h),len(h)),'pdf':(s(p),len(p)),'content':(s(c),len(c))}
rid=str(uuid.uuid4());b,exp=body(rid,'T7')
r=fn('monthly-admin',b,ADMIN);j=r.json() if r.content else {}
safe={k:v for k,v in j.items() if 'url' not in k.lower()}
row('T7-stage','admin stage benign synthetic triplet','200 + readback hashes match',f'HTTP {r.status_code} {json.dumps(safe)[:400]}','PASS' if r.ok and all(h in json.dumps(j) for h,_ in exp.values()) else 'FAIL',request_id=rid,expected_receipt={k:{'sha256':v[0],'bytes':v[1]} for k,v in exp.items()})
T7=j
vid=j.get('version_id')
if vid:
  v=rest('monthly_report_versions',ADMIN,q=f'?id=eq.{vid}&select=state,version,html_path,pdf_path').json()
  row('T7-draft-only','staged version state','draft',json.dumps(v),'PASS' if v and v[0]['state']=='draft' else 'FAIL',version_id=vid)
r2=fn('monthly-admin',b,ADMIN);j2=r2.json()
row('T8-commit-idempotent','same id same bytes retry','200 same version',f'HTTP {r2.status_code} version_id_same={j2.get("version_id")==vid}','PASS' if r2.ok and j2.get('version_id')==vid else 'FAIL',request_id=rid)
bx,_=body(rid,'T7-CHANGED');r3=fn('monthly-admin',bx,ADMIN)
row('T8-changed-payload','same id different bytes+new hashes','reject 409/4xx',f'HTTP {r3.status_code} {r3.text[:120]}','PASS' if 400<=r3.status_code<500 else 'FAIL',request_id=rid)
# distinct concurrent
res={}
def go(k,bb):res[k]=fn('monthly-admin',bb,ADMIN)
ids=[str(uuid.uuid4()) for _ in range(3)];th=[threading.Thread(target=go,args=(i,body(i,'C'+i[:4])[0])) for i in ids]
[t.start() for t in th];[t.join() for t in th]
vers=[res[i].json().get('version') for i in ids]
row('T8-distinct-concurrent','3 parallel distinct requests','all 200, unique versions',f'codes={[res[i].status_code for i in ids]} versions={vers}','PASS' if all(res[i].ok for i in ids) and len(set(vers))==3 and None not in vers else 'FAIL',request_ids=ids)
# same-id overlap
oid=str(uuid.uuid4());ob=body(oid,'OVL')[0];res={}
th=[threading.Thread(target=go,args=(k,ob)) for k in ('a','b')];[t.start() for t in th];[t.join() for t in th]
codes=sorted(res[k].status_code for k in res);vids={res[k].json().get('version_id') for k in res if res[k].ok}
row('T8-same-id-overlap','2 parallel same request_id','<=1 committed version; other 200-replay or 409',f'codes={codes} distinct_version_ids={len(vids)}','PASS' if len(vids)<=1 and 200 in codes else 'FAIL',request_id=oid)
# hash mismatch
mid=str(uuid.uuid4());r=fn('monthly-admin',body(mid,'BAD',bad=True)[0],ADMIN)
row('T8-hash-mismatch','wrong expected sha','reject, no version',f'HTTP {r.status_code} {r.text[:120]}','PASS' if not r.ok and 'version_id' not in r.text else 'FAIL',request_id=mid)
# lease guards direct RPC under admin JWT
lid=str(uuid.uuid4());_,e=body(lid,'LEASE')
sums={k:v[0] for k,v in e.items()};byts={k:v[1] for k,v in e.items()}
a=rpc('monthly_admin_stage_acquire',{'p_request':lid,'p_report':REPORT,'p_sums':sums,'p_bytes':byts,'p_lease_seconds':30},ADMIN)
row('T8-acquire','acquire 30s lease','200',f'HTTP {a.status_code}','PASS' if a.ok else 'FAIL',request_id=lid)
ds={'synthetic':True}
for nm,lease in [('null',None),('unknown',str(uuid.uuid4()))]:
  c=rpc('monthly_admin_stage_commit',{'p_request':lid,'p_lease':lease,'p_dataset':ds,'p_notes':'x'},ADMIN)
  row('T8-commit-'+nm+'-lease',nm+' lease commit','reject',f'HTTP {c.status_code}','PASS' if not c.ok else 'FAIL',request_id=lid)
time.sleep(35)
lease=(a.json()[0]['lease'] if a.ok and a.json() else None)
c=rpc('monthly_admin_stage_commit',{'p_request':lid,'p_lease':lease,'p_dataset':ds,'p_notes':'x'},ADMIN)
row('T8-commit-expired-lease','expired lease commit after 35s','reject',f'HTTP {c.status_code}','PASS' if not c.ok else 'FAIL',request_id=lid)
# provisioning intent (synthetic reserved address, no email)
pid=str(uuid.uuid4());pe=f'bluepipe-monthly-7046f021ec8a4bb088af17801db9b456-owner-{pid[:8]}@example.invalid'
r=fn('monthly-admin',{'action':'provision_owner','request_id':pid,'email':pe},ADMIN)
row('T8-provision','no-email synthetic owner provisioning','200 user id, audited intent',f'HTTP {r.status_code} keys={list(r.json().keys())}','PASS' if r.ok else 'FAIL',request_id=pid,email=pe,user_id=r.json().get('user_id'))
json.dump({'rows':rows,'T7_version':vid,'distinct_ids':ids,'overlap_id':oid,'mismatch_id':mid,'lease_id':lid,'provision_id':pid},open('/tmp/monthly-run/out.json','w'),indent=1)
