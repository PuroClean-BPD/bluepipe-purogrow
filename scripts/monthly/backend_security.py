"""Email-free, local admin fixture harness. Never deploy as an endpoint.
Uses only synthetic manifest IDs. Credentials and sessions stay in /tmp, never output.
"""
import os,json,secrets,uuid,hashlib,html,time
from pathlib import Path
import requests
ROOT=Path('/tmp/monthly-fixtures');ROOT.mkdir(mode=0o700,exist_ok=True)
URL=os.environ['SUPABASE_URL']; SERVICE=os.environ['SUPABASE_SERVICE_ROLE_KEY']
values={}
for line in Path('.env').read_text().splitlines():
 if '=' in line:
  k,v=line.split('=',1);values[k]=v.strip().strip('"')
ANON=values['VITE_SUPABASE_PUBLISHABLE_KEY']
TABLES=['organizations','clients','memberships','staff','reports','report_versions','audit_log','settings']
results=[]
def api(path,token=SERVICE,method='GET',body=None,headers=None):
 h={'apikey':ANON if token!=SERVICE else SERVICE,'Authorization':'Bearer '+token,'Content-Type':'application/json'}
 if headers:h.update(headers)
 return requests.request(method,URL+path,headers=h,json=body,timeout=30)
def rest(table,token=SERVICE,method='GET',body=None,query=''):
 return api('/rest/v1/monthly_'+table+query,token,method,body,{'Prefer':'return=representation'})
def check(name,expected,actual,ok):
 results.append({'test':name,'expected':expected,'actual':actual,'pass':bool(ok)});print(name, 'PASS' if ok else 'FAIL',str(actual))
def require(r):
 if not r.ok:raise RuntimeError('Fixture operation failed HTTP '+str(r.status_code))
 return r.json() if r.content else None
manifest_path=ROOT/'manifest.json'
resume=manifest_path.exists()
m=json.loads(manifest_path.read_text()) if resume else {'users':{},'clients':{},'orgs':{},'reports':{},'versions':{},'sessions':{},'run':uuid.uuid4().hex}
manifest_path.write_text(json.dumps(m));manifest_path.chmod(0o600)
for name in ['ua','ub','ur','admin','editor']:
 if name in m['users']:continue
 password=secrets.token_urlsafe(32);email=f'bluepipe-monthly-{m["run"]}-{name}@example.invalid'
 user=require(api('/auth/v1/admin/users',method='POST',body={'email':email,'password':password,'email_confirm':True,'user_metadata':{'monthly_fixture':m['run']}}))
 uid=user['id'];m['users'][name]=uid
 session=require(api('/auth/v1/token?grant_type=password',ANON,'POST',{'email':email,'password':password}))
 m['sessions'][name]=session
 manifest_path.write_text(json.dumps(m))
for org in ['OrgA','OrgB']:
 if org in m['orgs']:continue
 oid=str(uuid.uuid4());require(rest('organizations',method='POST',body={'id':oid,'name':org+' · SYNTHETIC FIXTURE'}));m['orgs'][org]=oid
for slug,org in [('test-a1','OrgA'),('test-a2','OrgA'),('test-b1','OrgB')]:
 if slug in m['clients']:continue
 cid=str(uuid.uuid4());require(rest('clients',method='POST',body={'id':cid,'org_id':m['orgs'][org],'slug':slug,'display_name':slug+' · Synthetic location','package':None}));m['clients'][slug]=cid
for name,role in [('admin','admin'),('editor','editor')]:
 if not require(rest('staff',query='?user_id=eq.'+m['users'][name])):require(rest('staff',method='POST',body={'user_id':m['users'][name],'role':role}))
if not require(rest('settings')):require(rest('settings',method='POST',body={'id':True,'auth_sending_enabled':False}))
admin=m['sessions']['admin']['access_token']
for name,slugs in [('ua',['test-a1','test-a2']),('ub',['test-b1']),('ur',['test-a1'])]:
 for slug in slugs:
  existing=require(rest('memberships',query='?user_id=eq.'+m['users'][name]+'&client_id=eq.'+m['clients'][slug]))
  mid=existing[0]['id'] if existing else require(api('/rest/v1/rpc/monthly_grant',admin,'POST',{'uid':m['users'][name],'cid':m['clients'][slug],'mrole':'client_viewer','source':'synthetic-fixture:'+m['run']}))
  if name=='ur':m['revoked_membership']=mid
manifest_path.write_text(json.dumps(m))
for slug in m['clients']:
 existing_reports=require(rest('reports',query='?client_id=eq.'+m['clients'][slug]))
 if existing_reports:
  m['reports'][slug]=existing_reports[0]['id']
  existing_versions=require(rest('report_versions',query='?report_id=eq.'+existing_reports[0]['id']))
  if len(existing_versions)<4:
   # Resume only the partially created withdrawn v1; no deletions or real records.
   for row in existing_versions:
    if row['state']=='approved':require(api('/rest/v1/rpc/monthly_transition',admin,'POST',{'vid':row['id'],'next_state':'published'}));require(api('/rest/v1/rpc/monthly_transition',admin,'POST',{'vid':row['id'],'next_state':'withdrawn'}))
    m['versions'][slug+':withdrawn']=row['id']
  else:continue
 rid=existing_reports[0]['id'] if existing_reports else str(uuid.uuid4());
 if not existing_reports:require(rest('reports',method='POST',body={'id':rid,'client_id':m['clients'][slug],'period_start':'2026-10-05T00:00:00-05:00','period_end':'2026-11-05T23:59:59.999999-06:00','period_label':'Oct 5–Nov 5, 2026','kind':'monthly'}));m['reports'][slug]=rid
 for version,state in enumerate(['withdrawn','published','draft','approved'],1):
  if slug+':'+state in m['versions']:continue
  data={'synthetic':True,'location':slug,'period_start':'2026-10-05T00:00:00-05:00','period_end_exclusive':'2026-11-06T00:00:00-06:00','timezone':'America/Chicago','metrics':{'Search impressions':1250,'Website visits':84,'Phone enquiries':None},'authority':[{'label':'Local presence','value':45},{'label':'Content coverage','value':35},{'label':'Reputation','value':20}]}
  canonical=json.dumps(data,sort_keys=True,separators=(',',':'),ensure_ascii=False);sha=hashlib.sha256(canonical.encode()).hexdigest();vid=str(uuid.uuid4());base=f'monthly/{m["run"]}/{slug}/v{version}'
  content=f'<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; base-uri \'none\'; form-action \'none\'"><title>Synthetic Monthly Report</title></head><body><h1>BluePipe Digital</h1><h2>{html.escape(slug)} · SYNTHETIC FIXTURE</h2><p>Oct 5–Nov 5, 2026 inclusive · America/Chicago</p><p>Cutoff Nov 5 23:59:59 CST; Nov 6+ excluded.</p><h3>Authority Signal Distribution</h3><p>Search impressions: 1250 · Website visits: 84</p><p style="color:darkorange">Phone enquiries: Not available</p><p>Dataset SHA256: {sha}</p><pre>{html.escape(canonical)}</pre><footer>Powered by BluePipe Digital</footer></body></html>'
  (ROOT/(vid+'.html')).write_text(content)
  # Real PDF from identical frozen canonical dataset; no raster proxy.
  from reportlab.pdfgen.canvas import Canvas
  from reportlab.lib.pagesizes import letter
  pdf=ROOT/(vid+'.pdf');c=Canvas(str(pdf),pagesize=letter);c.setTitle('Synthetic Monthly Report');c.setSubject('Dataset SHA256 '+sha);y=750
  for line in ['BluePipe Digital',slug+' - SYNTHETIC FIXTURE','Oct 5-Nov 5, 2026 inclusive - America/Chicago','Cutoff Nov 5 23:59:59 CST; Nov 6+ excluded.','Authority Signal Distribution','Search impressions: 1250','Website visits: 84','Phone enquiries: Not available','Dataset SHA256:',sha,'Powered by BluePipe Digital']:
   c.drawString(40,y,line);y-=30
  for offset in range(0,len(canonical),85):c.setFont('Helvetica',6);c.drawString(40,y,canonical[offset:offset+85]);y-=10
  c.save()
  for ext,mime in [('html','text/html'),('pdf','application/pdf')]:
   response=requests.post(URL+'/storage/v1/object/reports-private/'+base+'.'+ext,headers={'apikey':SERVICE,'Authorization':'Bearer '+SERVICE,'Content-Type':mime,'x-upsert':'false'},data=(ROOT/(vid+'.'+ext)).read_bytes(),timeout=30)
   if not response.ok:raise RuntimeError('Fixture upload failed '+str(response.status_code))
  require(rest('report_versions',method='POST',body={'id':vid,'report_id':rid,'version':version,'state':'draft','dataset_sha256':sha,'dataset':data,'html_path':base+'.html','pdf_path':base+'.pdf','created_by':m['users']['admin'],'notes':'Synthetic fixture only'}))
  if state in ['approved','published','withdrawn']:require(api('/rest/v1/rpc/monthly_transition',admin,'POST',{'vid':vid,'next_state':'approved'}))
  if state in ['published','withdrawn']:
   require(api('/rest/v1/rpc/monthly_transition',admin,'POST',{'vid':vid,'next_state':'published'}))
  if state=='withdrawn':require(api('/rest/v1/rpc/monthly_transition',admin,'POST',{'vid':vid,'next_state':'withdrawn'}))
  m['versions'][slug+':'+state]=vid
manifest_path.write_text(json.dumps(m));manifest_path.chmod(0o600)
# Published fixture should be separate new version after withdrawal, not resurrected.
# Actual final states are queried, never inferred from seed intent.
(ROOT/'seed-complete').write_text('ok')
print('Synthetic fixture provisioning completed; no emails sent.')
