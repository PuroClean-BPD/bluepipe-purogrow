import json,uuid,concurrent.futures,datetime
from pathlib import Path
from zoneinfo import ZoneInfo
import requests
r=Path('/dev-server');e=dict(x.split('=',1) for x in (r/'.env').read_text().splitlines() if '=' in x);url=e['VITE_SUPABASE_URL'].strip('"');key=e['VITE_SUPABASE_PUBLISHABLE_KEY'].strip('"');s=json.loads(Path('/tmp/monthly-admin-session.json').read_text())['session'];assert s['user']['id']=='76a43a8c-0fc9-4a59-9bfc-7b7b7efb89d5';h={'apikey':key,'Authorization':'Bearer '+s['access_token']}
def rpc(name,args):return requests.post(url+'/rest/v1/rpc/'+name,headers=h,json=args,timeout=40)
c=requests.get(url+'/rest/v1/monthly_clients?slug=like.syn-review-*&select=id&order=created_at.desc&limit=1',headers=h,timeout=30).json()[0]['id'];x=rpc('monthly_admin_create_report',{'p_client':c,'p_start':'2026-10-05T00:00:00Z','p_end':'2026-11-05T23:59:59Z','p_label':'Synthetic atomic correction','p_kind':'monthly'});assert x.ok;report=x.json();sums={'html':'a'*64,'pdf':'b'*64,'content':'c'*64};bytes={'html':10,'pdf':10,'content':10}
def acquire(request):return rpc('monthly_admin_stage_acquire',{'p_request':request,'p_report':report,'p_sums':sums,'p_bytes':bytes})
ids=[str(uuid.uuid4()) for _ in range(3)]
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:results=list(pool.map(acquire,ids))
assert all(x.ok for x in results);versions=[x.json()[0]['version'] for x in results];assert len(set(versions))==3
request=str(uuid.uuid4())
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:overlap=list(pool.map(acquire,[request,request]))
assert sum(x.ok for x in overlap)==1;lease=next(x for x in overlap if x.ok).json()[0]['lease']
for token in [None,str(uuid.uuid4())]:assert not rpc('monthly_admin_stage_commit',{'p_request':request,'p_lease':token,'p_dataset':{},'p_notes':'SYNTHETIC denied lease'}).ok
x=rpc('monthly_admin_stage_release',{'p_request':request,'p_lease':lease,'p_reason':'synthetic QA nonfatal release','p_fatal':False,'p_orphans':[]});assert x.ok and x.json() is True
assert not rpc('monthly_admin_stage_commit',{'p_request':request,'p_lease':None,'p_dataset':{},'p_notes':'SYNTHETIC null after release'}).ok
out={'test':'hosted atomic reservations overlap and NULL lease guards','status':'PASS','mode':'HOSTED','at_chicago':datetime.datetime.now(ZoneInfo('America/Chicago')).isoformat(),'expected':'3 distinct versions; exactly 1 successful overlapping lease; NULL/forged/released NULL commits denied','actual':{'distinct_versions':versions,'overlap_successes':1,'denied_commit_cases':3},'synthetic_client_id':c,'synthetic_report_id':report,'synthetic_request_ids':ids+[request]};Path('/tmp/code-correction/atomic-result.json').write_text(json.dumps(out));print('PASS hosted atomic reservations, overlap and NULL guards')
