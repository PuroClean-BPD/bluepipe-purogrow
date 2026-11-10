import json,secrets,hashlib,datetime,concurrent.futures
from pathlib import Path
from zoneinfo import ZoneInfo
import requests
root=Path('/dev-server');e=dict(x.split('=',1) for x in (root/'.env').read_text().splitlines() if '=' in x);url=e['VITE_SUPABASE_URL'].strip('"');key=e['VITE_SUPABASE_PUBLISHABLE_KEY'].strip('"');s=json.loads(Path('/tmp/monthly-admin-session.json').read_text())['session'];assert s['user']['id']=='76a43a8c-0fc9-4a59-9bfc-7b7b7efb89d5';h={'apikey':key,'Authorization':'Bearer '+s['access_token']}
def rpc(a):
 r=requests.post(url+'/rest/v1/rpc/monthly_code_manage',headers=h,json=a,timeout=40);assert r.ok;return r.json()
r=requests.get(url+'/rest/v1/monthly_clients?slug=like.syn-review-*&select=id&order=created_at.desc&limit=1',headers=h,timeout=30);assert r.ok;client=r.json()[0]['id']
selector,salt,secret=secrets.token_hex(16),secrets.token_hex(16),secrets.token_hex(32);verifier=hashlib.pbkdf2_hmac('sha256',secret.encode(),bytes.fromhex(salt),600000).hex();cid=rpc({'p_action':'create_synthetic','p_selector':selector,'p_salt':salt,'p_verifier':verifier,'p_clients':[client]});good=selector+'.'+secret;bad=selector+'.'+'0'*64
# No codes/tokens/responses are persisted or printed.
def attempt(value):return requests.post(url+'/functions/v1/monthly-code',json={'action':'login','code':value},timeout=40).status_code
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:statuses=list(pool.map(attempt,[good,good,bad,bad]))
assert statuses==[200,200,401,401];assert attempt(good)==200
for _ in range(3):assert attempt(bad)==401
assert attempt(good)==401
rpc({'p_action':'unlock','p_id':cid});assert attempt(good)==200
out={'test':'mixed concurrent success/failure and true five-failure lockout','status':'PASS','mode':'HOSTED','at_chicago':datetime.datetime.now(ZoneInfo('America/Chicago')).isoformat(),'expected':'two successes release own reservations; two failures remain; three extra failures lock; audited unlock succeeds','actual':{'mixed_http':statuses,'five_failure_lock':True,'unlock_login_http':200},'synthetic_credential_id':cid,'synthetic_client_id':client};Path('/tmp/code-correction/mixed-result.json').write_text(json.dumps(out));print('PASS mixed hosted logins, true five-failure lockout and audited unlock')
