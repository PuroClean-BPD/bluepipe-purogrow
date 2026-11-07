"""Run real tenant-isolation tests against the local-only synthetic manifest."""
import os,json,time,hashlib
from pathlib import Path
import requests
ROOT=Path('/tmp/monthly-fixtures');m=json.loads((ROOT/'manifest.json').read_text());U=os.environ['SUPABASE_URL'];S=os.environ['SUPABASE_SERVICE_ROLE_KEY']
values={k:v.strip().strip('"') for k,v in (line.split('=',1) for line in Path('.env').read_text().splitlines() if '=' in line)};A=values['VITE_SUPABASE_PUBLISHABLE_KEY'];results=[]
def req(path,token=A,method='GET',body=None):return requests.request(method,U+path,headers={'apikey':A,'Authorization':'Bearer '+token,'Content-Type':'application/json','Prefer':'return=representation'},json=body,timeout=30)
def record(name,expected,actual,ok):results.append({'test':name,'expected':expected,'actual':actual,'pass':bool(ok)});print(name, 'PASS' if ok else 'FAIL',str(actual))
def rows(r):return r.json() if r.ok and r.content else []
tokens={k:v['access_token'] for k,v in m['sessions'].items()};a1=m['clients']['test-a1'];vid=m['versions']['test-a1:published'];rid=m['reports']['test-a1']
for t in ['organizations','clients','memberships','staff','reports','report_versions','audit_log','settings']:
 for method in ['GET','POST']:
  r=req('/rest/v1/monthly_'+t,method=method,body={} if method=='POST' else None);record('anon '+method+' '+t,'401/403 permission denied',r.status_code,r.status_code in [401,403])
r=req('/functions/v1/get-report-file',method='POST',body={'version_id':vid,'format':'pdf'});record('anon file edge','401',r.status_code,r.status_code==401)
for q in ['/rest/v1/monthly_clients?id=eq.'+a1,'/rest/v1/monthly_clients?slug=eq.test-a1','/rest/v1/monthly_reports?id=eq.'+rid,'/rest/v1/monthly_report_versions?id=eq.'+vid]:
 r=req(q,tokens['ub']);record('ub forged '+q.split('?')[0].split('_')[-1],'0 rows',len(rows(r)),r.ok and rows(r)==[])
r=req('/functions/v1/get-report-file',tokens['ub'],'POST',{'version_id':vid,'format':'pdf'});record('cross tenant signed issuance','403',r.status_code,r.status_code==403)
r=req('/rest/v1/monthly_clients',tokens['ua']);slugs=sorted(x['slug'] for x in rows(r));record('ua locations','test-a1,test-a2',slugs,slugs==['test-a1','test-a2'])
r=req('/rest/v1/monthly_report_versions',tokens['ua']);states=[x['state'] for x in rows(r)];record('ua published versions only','2 published',states,len(states)==2 and all(x=='published' for x in states))
path=rows(req('/rest/v1/monthly_report_versions?id=eq.'+vid,S))[0]['pdf_path']
for who,token in [('anon',A),('ua',tokens['ua'])]:
 r=req('/storage/v1/object/authenticated/reports-private/'+path,token);record(who+' direct private storage','403 or masked 400/404',r.status_code,r.status_code in [400,403,404])
 r=req('/storage/v1/object/reports-private/'+path,token,'POST',{});record(who+' private storage write','403 or masked 400/404',r.status_code,r.status_code in [400,403,404])
r=req('/functions/v1/get-report-file',tokens['ua'],'POST',{'version_id':vid,'format':'pdf'});record('authorized issuance','200',r.status_code,r.status_code==200)
if r.ok:
 signed=r.json()['url'];issued=time.monotonic();response=requests.get(signed,timeout=30);record('actual signed PDF','200 PDF',{'status':response.status_code,'pdf':response.content.startswith(b'%PDF')},response.ok and response.content.startswith(b'%PDF'))
 deadline=issued+65
 while time.monotonic()<deadline:time.sleep(min(5,deadline-time.monotonic()))
 response=requests.get(signed,timeout=30);record('actual URL expiry after 65s','400/401/403 expired',response.status_code,response.status_code in [400,401,403])
# Revoke active ur grant through admin RPC, then test old token and real refreshed token.
r=req('/rest/v1/rpc/monthly_revoke',tokens['admin'],'POST',{'mid':m['revoked_membership']});record('admin revoke','200/204 or already revoked 403',r.status_code,r.ok or r.status_code==403)
for label,token in [('old token',tokens['ur'])]:
 r=req('/rest/v1/monthly_clients',token);record('ur revoked '+label,'0 rows',len(rows(r)),r.ok and not rows(r))
 r=req('/functions/v1/get-report-file',token,'POST',{'version_id':vid,'format':'pdf'});record('ur revoked issuance','403',r.status_code,r.status_code==403)
r=req('/auth/v1/token?grant_type=refresh_token',method='POST',body={'refresh_token':m['sessions']['ur']['refresh_token']})
if r.ok:
 session=r.json();m['sessions']['ur']=session;(ROOT/'manifest.json').write_text(json.dumps(m));r=req('/rest/v1/monthly_clients',session['access_token']);record('ur after refresh','0 rows',len(rows(r)),r.ok and not rows(r))
else:record('ur real token refresh','200',r.status_code,False)
for t in ['memberships','staff','report_versions','audit_log']:
 r=req('/rest/v1/monthly_'+t,tokens['ua'],'POST',{});record('client write '+t,'403',r.status_code,r.status_code==403)
for fn,body in [('monthly_transition',{'vid':vid,'next_state':'withdrawn'}),('monthly_grant',{'uid':m['users']['ua'],'cid':a1,'mrole':'client_manager','source':'forged'}),('monthly_revoke',{'mid':m['revoked_membership']})]:
 r=req('/rest/v1/rpc/'+fn,tokens['ua'],'POST',body);record('client RPC '+fn,'403',r.status_code,r.status_code==403)
approved=m['versions']['test-a1:approved'];r=req('/rest/v1/rpc/monthly_transition',tokens['editor'],'POST',{'vid':approved,'next_state':'published'});record('editor publish','403',r.status_code,r.status_code==403)
# Test admin transition on synthetic a2 draft, approval only retains ua published fixture.
draft=m['versions']['test-a2:draft'];r=req('/rest/v1/rpc/monthly_transition',tokens['admin'],'POST',{'vid':draft,'next_state':'approved'});record('admin approve transition','200/204 or already approved 403',r.status_code,r.ok or r.status_code==403)
logs=rows(req('/rest/v1/monthly_audit_log?target_id=eq.'+draft,tokens['admin']));record('transition logged','approved event', [x['action'] for x in logs],any(x['action']=='approved' for x in logs))
logid=logs[0]['id']
for method in ['PATCH','DELETE']:
 r=req('/rest/v1/monthly_audit_log?id=eq.'+logid,tokens['admin'],method,{'action':'tampered'} if method=='PATCH' else None);record('audit immutable '+method,'403',r.status_code,r.status_code==403)
for email in ['unknown-fixture@example.invalid',m['sessions']['ua']['user']['email']]:
 r=req('/functions/v1/monthly-auth',method='POST',body={'email':email,'redirect':'https://bluepipe-purogrow.lovable.app/portal/callback','code_challenge':'a'*43});body=r.json();record('disabled auth generic '+('unknown' if email.startswith('unknown') else 'known'),'200 generic enabled false',{'status':r.status_code,'enabled':body.get('enabled'),'message':body.get('message')},r.ok and body.get('enabled')==False and body.get('message')=='If access is available, follow the instructions provided.')
unknown=req('/auth/v1/admin/users?page=1&per_page=100',S);users=unknown.json().get('users',[]) if unknown.ok else [];record('unknown email no creation','0 matching users',sum(x.get('email')=='unknown-fixture@example.invalid' for x in users),unknown.ok and not any(x.get('email')=='unknown-fixture@example.invalid' for x in users))
# Verify frozen hash in both actual stored artifacts, using authorized edge issuance.
v=rows(req('/rest/v1/monthly_report_versions?id=eq.'+vid,tokens['ua']))[0];canonical=json.dumps(v['dataset'],sort_keys=True,separators=(',',':'),ensure_ascii=False);sha=hashlib.sha256(canonical.encode()).hexdigest()
record('dataset SHA256 frozen',v['dataset_sha256'],sha,sha==v['dataset_sha256'])
from pypdf import PdfReader
for fmt in ['html','pdf']:
 r=req('/functions/v1/get-report-file',tokens['ua'],'POST',{'version_id':vid,'format':fmt})
 if r.ok:
  b=requests.get(r.json()['url'],timeout=30).content
  if fmt=='html':text=b.decode()
  else:
   import io
   text=''.join(p.extract_text() for p in PdfReader(io.BytesIO(b)).pages)
  record(fmt+' matching frozen SHA256','same SHA256 in actual file',sha in text,sha in text)
 else:record(fmt+' matching SHA256','authorized download',r.status_code,False)
Path('SECURITY-TEST-RESULTS.md').write_text('# Real backend security evidence\n\nSynthetic fixtures only. No email, invitation, real-account grants or real metrics. Tested 2026-11-07 UTC.\n\n| Test | Expected | Actual | Result |\n|---|---|---|---|\n'+''.join('| '+x['test']+' | '+str(x['expected'])+' | '+str(x['actual'])+' | '+('PASS' if x['pass'] else 'FAIL')+' |\n' for x in results)+'\nReal email delivery: NOT RUN. Global signup settings unchanged; new monthly sender is OFF. Hosted six-digit OTP length and Netlify deployment linkage remain UNVERIFIED. Direct storage denial may be HTTP 400/404 (masked object absence) rather than 403; evidence records actual status.\n')
(ROOT/'results.json').write_text(json.dumps(results,indent=2))
if not all(x['pass'] for x in results):raise SystemExit(1)
