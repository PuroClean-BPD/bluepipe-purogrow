# Hosted synthetic-only smoke. Existing approved JWT only. No mint/email, no printed secrets/URLs.
import json,uuid,secrets,hashlib,datetime,time,concurrent.futures
from pathlib import Path
import requests
ROOT=Path('/dev-server')
ENV=dict(line.strip().split('=',1) for line in (ROOT/'.env').read_text().splitlines() if '=' in line and not line.startswith('#'))
URL=ENV['VITE_SUPABASE_URL'].strip('"');KEY=ENV['VITE_SUPABASE_PUBLISHABLE_KEY'].strip('"')
S=json.loads(Path('/tmp/monthly-admin-session.json').read_text())['session']
assert S['user']['id']=='76a43a8c-0fc9-4a59-9bfc-7b7b7efb89d5'
JWT=S['access_token']; TAG='syn-code-'+uuid.uuid4().hex[:10]; rows=[]; fixtures={'tag':TAG,'admin_id':S['user']['id'],'credentials':[],'clients':[]}
def result(name,expected,actual,status):
 rows.append(dict(test=name,expected=expected,actual=actual,status=status));print(status,name)
def rpc(name,args):return requests.post(URL+'/rest/v1/rpc/'+name,headers={'apikey':KEY,'Authorization':'Bearer '+JWT},json=args,timeout=35)
def edge(body,headers=None):return requests.post(URL+'/functions/v1/monthly-code',headers=headers or {},json=body,timeout=35)
def scalar(name,args):
 r=rpc(name,args);assert r.ok, f'{name}: HTTP {r.status_code}';return r.json()
def manage(action,id=None,clients=None):return scalar('monthly_code_manage',dict(p_action=action,p_id=id,p_clients=clients))
def make(clients):
 selector=secrets.token_hex(16);salt=secrets.token_hex(16);secret=secrets.token_hex(32)
 verifier=hashlib.pbkdf2_hmac('sha256',secret.encode(),bytes.fromhex(salt),600000).hex()
 cid=scalar('monthly_code_manage',dict(p_action='create_synthetic',p_selector=selector,p_salt=salt,p_verifier=verifier,p_clients=clients))
 return cid,selector+'.'+secret
try:
 r=requests.get(URL+'/auth/v1/user',headers={'apikey':KEY,'Authorization':'Bearer '+JWT},timeout=30)
 if not r.ok:result('existing approved admin session','valid genuine admin',f'HTTP {r.status_code}','BLOCKED');raise RuntimeError('Existing session invalid; no retry/mint')
 r=rpc('monthly_staff_role',{});assert r.ok and r.json()=='admin'
 result('genuine existing admin JWT','admin','admin','PASS')
 for t in ['credentials','scopes','sessions','attempts','budget','request_budget']:
  r=requests.get(URL+'/rest/v1/monthly_code_'+t,headers={'apikey':KEY},timeout=30)
  result('anonymous table '+t,'denied',f'HTTP {r.status_code}','PASS' if r.status_code in [401,403] else 'FAIL')
 r=edge({'action':'archive','session':'0'*64});result('direct forged session','401',str(r.status_code),'PASS' if r.status_code==401 else 'FAIL')
 r=edge({'action':'login','code':'unknown'});result('unknown code generic denial','401 no account API',str(r.status_code),'PASS' if r.status_code==401 else 'FAIL')
 org=scalar('monthly_admin_create_org',{'p_name':TAG+' Synthetic ONLY'})
 # Reuse existing published synthetic location for genuine owner-file tests; 23 new synthetic locations.
 r=requests.get(URL+'/rest/v1/monthly_clients?slug=eq.test-a1',headers={'apikey':KEY,'Authorization':'Bearer '+JWT},timeout=30)
 assert r.ok and len(r.json())==1;clients=[r.json()[0]['id']]
 for i in range(1,24):clients.append(scalar('monthly_admin_create_client',{'p_org':org,'p_slug':TAG+'-'+str(i),'p_display':'SYNTHETIC Code '+str(i),'p_package':None}))
 fixtures['org_id']=org;fixtures['clients']=clients
 codes=[];sessions=[];offset=0
 for n in [3,3,2,2]+[1]*14:
  cid,code=make(clients[offset:offset+n]);fixtures['credentials'].append({'id':cid,'client_ids':clients[offset:offset+n]});codes.append(code);offset+=n
 for code in codes:
  r=edge({'action':'login','code':code});assert r.ok, f'Login HTTP {r.status_code}'
  token=r.json().get('session');assert isinstance(token,str) and len(token)==64;sessions.append(token)
 result('18 synthetic code logins direct backend','18 valid opaque sessions',str(len(sessions)),'PASS')
 offset=0;cells=0
 for i,n in enumerate([3,3,2,2]+[1]*14):
  r=edge({'action':'archive','session':sessions[i]});assert r.ok
  actual={x['id'] for x in r.json()['clients']};expected=set(clients[offset:offset+n]);assert actual==expected
  for c in clients:assert (c in actual)==(c in expected);cells+=1
  offset+=n
 result('18 x 24 scope matrix','432 exact cells, shapes 3/3/2/2/14 singles',str(cells),'PASS')
 archive=edge({'action':'archive','session':sessions[0]}).json();assert all(isinstance(x.get('id'),str) and uuid.UUID(x['id']) for x in archive['reports'])
 if archive['reports']:
  vid=archive['reports'][0]['id'];fixtures['published_version_id']=vid
  for fmt in ['html','pdf']:
   r=edge({'action':'file','session':sessions[0],'version_id':vid,'format':fmt});assert r.ok,f'file HTTP {r.status_code}'
   signed=r.json()['url'];g=requests.get(signed,timeout=30);assert g.ok
   result('owner '+fmt+' download','200 frozen bytes',{'http':g.status_code,'bytes':len(g.content),'sha256':hashlib.sha256(g.content).hexdigest()},'PASS')
   if fmt=='html':expiry_url=signed;expiry_start=time.monotonic()
  r=edge({'action':'file','session':sessions[1],'version_id':vid,'format':'html'});result('cross-owner known version','401',str(r.status_code),'PASS' if r.status_code==401 else 'FAIL')
 else:result('owner file and 60sec expiry','published synthetic fixture','none available','BLOCKED')
 r=edge({'action':'file','session':sessions[0],'version_id':str(uuid.uuid4()),'format':'html'});result('forged version','401',str(r.status_code),'PASS' if r.status_code==401 else 'FAIL')
 r=edge({'action':'file','session':sessions[0],'version_id':str(uuid.uuid4()),'format':'html','path':'arbitrary'});result('arbitrary path field','400',str(r.status_code),'PASS' if r.status_code==400 else 'FAIL')
 r=requests.post(URL+'/functions/v1/monthly-admin',headers={'Authorization':'Bearer '+sessions[0],'apikey':KEY},json={'action':'create_org','name':'DENIED'},timeout=30)
 result('owner opaque token never staff JWT','401',str(r.status_code),'PASS' if r.status_code==401 else 'FAIL')
 r=edge({'action':'logout','session':sessions[2]});assert r.ok;r=edge({'action':'archive','session':sessions[2]});result('logout replay denied instantly','401',str(r.status_code),'PASS' if r.status_code==401 else 'FAIL')
 manage('remove_scope',fixtures['credentials'][3]['id'],fixtures['credentials'][3]['client_ids'][:1]);r=edge({'action':'archive','session':sessions[3]});result('scope removal generation invalidation','401',str(r.status_code),'PASS' if r.status_code==401 else 'FAIL')
 # Rotation uses only synthetic newly generated salt/verifier and never logs their values.
 cid=fixtures['credentials'][4]['id'];scalar('monthly_code_manage',dict(p_action='rotate',p_id=cid,p_selector=secrets.token_hex(16),p_salt=secrets.token_hex(16),p_verifier=secrets.token_hex(32)))
 r=edge({'action':'archive','session':sessions[4]});result('rotation invalidates old session','401',str(r.status_code),'PASS' if r.status_code==401 else 'FAIL')
 manage('revoke',fixtures['credentials'][5]['id']);r=edge({'action':'archive','session':sessions[5]});result('revocation invalidates old session','401',str(r.status_code),'PASS' if r.status_code==401 else 'FAIL')
 # Reserve concurrent credential attempts before KDF. All IP headers intentionally forged, never trusted.
 cid=fixtures['credentials'][6]['id'];manage('unlock',cid);bad=codes[6].split('.')[0]+'.'+'0'*64
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:statuses=list(ex.map(lambda i:edge({'action':'login','code':bad},{'X-Forwarded-For':f'198.51.100.{i}'}).status_code,range(6)))
 r=edge({'action':'login','code':codes[6]});result('concurrent failed attempts and forged IP lockout','all 401, valid code now locked',{'statuses':statuses,'valid_code_http':r.status_code},'PASS' if statuses==[401]*6 and r.status_code==401 else 'FAIL')
 if 'expiry_url' in locals():
  time.sleep(max(0,66-(time.monotonic()-expiry_start)));r=requests.get(expiry_url,timeout=30);result('actual 60sec signed expiry','4xx after >=65sec',{'http':r.status_code,'elapsed_seconds':round(time.monotonic()-expiry_start)},'PASS' if r.status_code>=400 else 'FAIL');del expiry_url
 # These tests need no Auth-owner/editor identities; absence remains explicit.
 result('genuine editor JWT negative suite','approved editor session','no session requested or minted','BLOCKED')
 result('Netlify deployed cookie and Safari runtime','controlled frontend deploy','deployment prohibited at checkpoint','BLOCKED')
 result('real 30-day elapsed expiry','30 days elapsed','UNIT exact interval and hosted expiry receipt only','BLOCKED')
 r=rpc('monthly_code_manage',dict(p_action='unlock',p_id=fixtures['credentials'][0]['id']));assert r.ok
 r=requests.get(URL+'/rest/v1/monthly_audit_log?action=like.code_*&select=id,action,target_id&order=at.desc&limit=1000',headers={'apikey':KEY,'Authorization':'Bearer '+JWT},timeout=30);assert r.ok
 fixtures['audit_ids']=[x['id'] for x in r.json()];result('durable queryable code audit receipts','nonempty required actions',{'rows':len(r.json()),'actions':sorted(set(x['action'] for x in r.json()))},'PASS' if r.json() else 'FAIL')
except Exception as e:
 # Exception strings are intentionally not emitted: HTTP libraries can include sensitive URLs.
 result('suite completion','all runnable checks','stopped on '+type(e).__name__,'FAIL')
finally:
 out={'mode':'REAL hosted synthetic runtime','baseline':'532d08274c0c16f0284e2e9c8a4ac9e26e06e9a2','fixtures':fixtures,'tests':rows,'cost_credits':None,'no_real_access':True}
 (ROOT/'docs/test-results/code-hosted-checkpoint.json').write_text(json.dumps(out,indent=2))
 print('SUMMARY',json.dumps({s:sum(x['status']==s for x in rows) for s in ['PASS','FAIL','BLOCKED']}))
