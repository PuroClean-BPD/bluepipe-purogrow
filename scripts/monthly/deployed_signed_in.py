"""Approved synthetic-only Netlify regression; credentials remain in sandbox/memory.
Uses existing synthetic published fixtures; creates no Auth users or real data.
"""
import base64
import concurrent.futures
import datetime
import hashlib
import json
import secrets
import time
import uuid
from pathlib import Path
from zoneinfo import ZoneInfo

import requests
from playwright.sync_api import sync_playwright

ROOT = Path('/dev-server')
ENV = dict(x.split('=', 1) for x in (ROOT / '.env').read_text().splitlines() if '=' in x)
CLOUD = ENV['VITE_SUPABASE_URL'].strip('"')
KEY = ENV['VITE_SUPABASE_PUBLISHABLE_KEY'].strip('"')
SITE = 'https://puroclean.bluepipedigital.com'
API = SITE + '/portal/api/owner'
COOKIE = '__Host-bluepipe-owner'
CSRF = {'Origin': SITE, 'X-BluePipe-Request': '1'}
SESSIONS = {name: json.loads(Path('/tmp/monthly-' + name + '-session.json').read_text())['session'] for name in ['admin', 'editor', 'legacy']}
ROWS, CREATED = [], []
START = datetime.datetime.now(datetime.timezone.utc).isoformat()
OUT = ROOT / 'docs/test-results/deployed-signed-in-ledger.json'


def record(name, expected, actual, status='PASS', mode='DEPLOYED_HTTP'):
    ROWS.append(dict(test=name, mode=mode, status=status, at_chicago=datetime.datetime.now(ZoneInfo('America/Chicago')).isoformat(), expected=expected, actual=actual))
    print(status, name, flush=True)


def headers(who='admin'):
    return {'apikey': KEY, 'Authorization': 'Bearer ' + SESSIONS[who]['access_token']}


def rpc(name, args, who='admin'):
    return requests.post(CLOUD + '/rest/v1/rpc/' + name, headers=headers(who), json=args, timeout=40)


def scalar(name, args):
    r = rpc(name, args)
    assert r.ok, name + ' HTTP ' + str(r.status_code)
    return r.json() if r.content else None


def admin(body, who='admin'):
    return requests.post(CLOUD + '/functions/v1/monthly-admin', headers=headers(who), json=body, timeout=50)


def broker(client, body):
    return client.post(API, headers=CSRF, json=body, timeout=40)


def make(scope):
    selector, salt, secret = secrets.token_hex(16), secrets.token_hex(16), secrets.token_hex(32)
    verifier = hashlib.pbkdf2_hmac('sha256', secret.encode(), bytes.fromhex(salt), 600000).hex()
    cid = scalar('monthly_code_manage', dict(p_action='create_synthetic', p_selector=selector, p_salt=salt, p_verifier=verifier, p_clients=scope))
    CREATED.append(cid)
    return cid, selector + '.' + secret


def check(name, fn, mode='DEPLOYED_HTTP'):
    try:
        actual = fn()
        record(name, 'all concrete assertions satisfied', actual, mode=mode)
    except Exception as error:
        # Never include exception messages: HTTP exceptions may contain signed URLs.
        record(name, 'all concrete assertions satisfied', type(error).__name__, 'FAIL', mode)


try:
    for who, expected in [('admin', 'admin'), ('editor', 'editor'), ('legacy', None)]:
        r = requests.get(CLOUD + '/auth/v1/user', headers=headers(who), timeout=30)
        assert r.ok and r.json()['id'] == SESSIONS[who]['user']['id']
        r = rpc('monthly_staff_role', {}, who)
        assert r.ok and r.json() == expected
    record('three genuine approved native identities', 'admin/editor/no staff role for legacy owner', '3 verified; no role changes', mode='HOSTED_AUTH')
    settings = requests.get(CLOUD + '/rest/v1/monthly_settings?select=*', headers=headers(), timeout=30)
    assert settings.ok
    # Settings values inspected but never dumped.
    data = settings.json()
    if data:
        assert all(x.get('code_real_access_enabled') is False and x.get('auth_sending_enabled') is False for x in data)
        record('real-access and auth-sending flags', 'both OFF', 'OFF', mode='HOSTED_READ')
    else:
        record('fresh settings read', 'read flags without authority bypass', 'JWT RLS returns empty; coordinator OFF evidence retained, no writes', 'BLOCKED', 'HOSTED_READ')
    old = json.loads((ROOT / 'docs/test-results/code-correction-hosted.json').read_text())['fixtures']
    clients = old['clients']
    versions = [v for v in old['versions'] if v['state'] == 'published']
    assert len(clients) == 24 and len(versions) == 24
    # Confirm fixtures and published state through genuine admin, never use real IDs.
    live = requests.get(CLOUD + '/rest/v1/monthly_clients', params={'id': 'in.(' + ','.join(clients) + ')', 'select': 'id,slug'}, headers=headers(), timeout=30)
    assert live.ok and len(live.json()) == 24 and all(x['slug'].startswith('syn-') for x in live.json())
    records = {v['client_id']: v for v in versions}
    scopes, owner_clients, codes, ids = [], [], [], []
    offset = 0
    for n in [3, 3, 2, 2] + [1] * 14:
        scope = clients[offset:offset+n]
        cid, code = make(scope)
        s = requests.Session()
        r = broker(s, {'action': 'login', 'code': code})
        assert r.ok and r.json() == {'ok': True}
        raw = r.headers.get('Set-Cookie', '')
        assert all(x in raw for x in ['HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/', 'Max-Age=2592000']) and 'Domain=' not in raw
        assert COOKIE in s.cookies.get_dict()
        scopes.append(scope); owner_clients.append(s); codes.append(code); ids.append(cid)
        offset += n
    record('18 logins and 30-day host-only HttpOnly cookies', '18 successful safe replies; Secure/Strict/2592000s/no Domain', '18/18; no session fields returned')
    db_sessions = requests.get(CLOUD + '/rest/v1/monthly_code_sessions', params={'credential_id': 'in.(' + ','.join(ids) + ')', 'select': 'created_at,expires_at'}, headers=headers(), timeout=30)
    if not db_sessions.ok:
        record('session table direct read', 'protected rows remain hidden', 'HTTP '+str(db_sessions.status_code), 'BLOCKED', 'HOSTED_READ')
        class EmptyRead:
            def json(self): return []
        db_sessions = EmptyRead()
    if db_sessions.json():
        for row in db_sessions.json():
            a = datetime.datetime.fromisoformat(row['created_at'].replace('Z', '+00:00'))
            b = datetime.datetime.fromisoformat(row['expires_at'].replace('Z', '+00:00'))
            assert (b-a).total_seconds() == 2592000
        record('exact backend 30-day interval', '2592000 seconds', 'visible rows exact', mode='HOSTED_READ')
    else:
        record('fresh backend interval read', 'independent session timestamp read', 'deny-default RLS hides digest-only rows; cookie 2592000s verified, earlier interval evidence unchanged', 'BLOCKED', 'HOSTED_READ')
    for i, s in enumerate(owner_clients):
        r = broker(s, {'action': 'archive'})
        assert r.ok and {x['id'] for x in r.json()['clients']} == set(scopes[i])
    record('archive membership matrix (not file requests)', '3/3/2/2+14 singles; 24 allowed/408 excluded', {'cells': 432, 'allowed': 24, 'excluded': 408})
    for fmt in ['html', 'pdf']:
        started = time.monotonic()
        def cell(pair):
            i, j = pair
            v = records[clients[j]]
            r = broker(owner_clients[i], dict(action='file', version_id=v['id'], format=fmt))
            if clients[j] not in scopes[i]:
                assert r.status_code == 401
                return False
            assert r.ok and set(r.json()) == {'url', 'sha256', 'expires_in'}
            assert r.json()['sha256'] == v['expected_sha256'][fmt] and r.json()['expires_in'] == 60
            download = requests.get(r.json()['url'], timeout=30)
            assert download.ok and len(download.content) == v['expected_bytes'][fmt]
            assert hashlib.sha256(download.content).hexdigest() == v['expected_sha256'][fmt]
            return True
        # 401 deliberately clears broker cookie. Keep immutable snapshots per request;
        # rejected cross-owner requests must not erase the valid session used by other cells.
        snapshots = [s.cookies.get_dict() for s in owner_clients]
        def isolated_cell(pair):
            i, j = pair
            s = requests.Session(); s.cookies.update(snapshots[i])
            v = records[clients[j]]
            r = broker(s, dict(action='file', version_id=v['id'], format=fmt))
            if clients[j] not in scopes[i]:
                assert r.status_code == 401
                return False
            assert r.ok and set(r.json()) == {'url', 'sha256', 'expires_in'}
            d = r.json(); assert d['sha256'] == v['expected_sha256'][fmt] and d['expires_in'] == 60
            g = requests.get(d['url'], timeout=30)
            assert g.ok and len(g.content) == v['expected_bytes'][fmt] and hashlib.sha256(g.content).hexdigest() == v['expected_sha256'][fmt]
            return True
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
            results = list(pool.map(isolated_cell, [(i, j) for i in range(18) for j in range(24)]))
        assert sum(results) == 24 and len(results)-sum(results) == 408
        record(fmt + ' deployed file matrix', '432 real broker requests: 24 independent-hash downloads/408 denied', dict(requests=432, allowed=24, denied=408, independently_verified_downloads=24))
        time.sleep(max(0, 63-(time.monotonic()-started)))

    def browser_flow():
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(viewport={'width':1280,'height':1800})
            page = context.new_page(); page.goto(SITE + '/portal/monthly')
            page.get_by_label('Owner access code').fill(codes[0])
            page.get_by_role('button', name='Sign in', exact=True).click()
            page.get_by_label('Location', exact=True).wait_for(timeout=40000)
            assert page.get_by_label('Location', exact=True).locator('option').count() == 3
            c = next(c for c in context.cookies() if c['name'] == COOKIE)
            assert c['httpOnly'] and c['secure'] and c['sameSite'] == 'Strict' and abs(c['expires']-time.time()-2592000)<20
            assert page.evaluate("document.cookie.indexOf('__Host-bluepipe-owner') === -1")
            assert page.evaluate('Object.keys(localStorage).length === 0 && Object.keys(sessionStorage).length === 0')
            page.reload(); page.get_by_label('Location', exact=True).wait_for(timeout=40000)
            page.get_by_role('button', name='Open report', exact=True).click()
            page.get_by_title('Monthly report', exact=True).wait_for(timeout=40000)
            assert 'SYNTHETIC' in page.get_by_title('Monthly report', exact=True).get_attribute('srcdoc')
            page.screenshot(path='/tmp/browser/synthetic-deployed/signed-in.png')
            page.get_by_role('button', name='Sign out', exact=True).click()
            page.get_by_label('Owner access code').wait_for(timeout=30000)
            assert not any(c['name']==COOKIE for c in context.cookies())
            browser.close()
        return 'Chromium: 3 locations, persisted reload, verified report rendered; JS cannot read cookie; no browser storage; logout clears cookie'
    check('deployed browser login/reload/private cookie/report/logout', browser_flow, 'DEPLOYED_BROWSER')

    def stage_checks():
        rid = scalar('monthly_admin_create_report', dict(p_client=clients[0], p_start='2026-10-05T00:00:00Z', p_end='2026-11-05T23:59:59Z', p_label='SYNTHETIC deployed draft QA', p_kind='monthly'))
        files = {'html':b'<!doctype html><html><body>SYNTHETIC deployed draft</body></html>', 'pdf':b'%PDF-1.4\n% SYNTHETIC\n%%EOF\n', 'content':b'{\n "synthetic": true\n}\n'}
        sums = {k:hashlib.sha256(v).hexdigest() for k,v in files.items()}
        body = dict(action='stage_version', request_id=str(uuid.uuid4()), report_id=rid, expected={k+'_sha256':v for k,v in sums.items()}, notes='SYNTHETIC deployed regression only', **{k+'_b64':base64.b64encode(v).decode() for k,v in files.items()})
        r = admin(body); assert r.ok, 'stage HTTP '+str(r.status_code)
        receipt=r.json(); assert uuid.UUID(receipt['id']) and receipt['state']=='draft' and receipt['sha256']==sums and receipt['bytes']=={k:len(v) for k,v in files.items()}
        replay=admin(body); assert replay.ok
        assert all(replay.json()[k]==receipt[k] for k in ['id','version','state','sha256','bytes'])
        # Independent storage readback through genuine staff signer (HTML/PDF).
        for fmt in ['html','pdf']:
            r=requests.post(CLOUD+'/functions/v1/get-report-file', headers=headers(), json=dict(version_id=receipt['id'],format=fmt),timeout=40); assert r.ok
            g=requests.get(r.json()['url'],timeout=30); assert g.ok and g.content==files[fmt] and hashlib.sha256(g.content).hexdigest()==sums[fmt]
            assert broker(owner_clients[0],dict(action='file',version_id=receipt['id'],format=fmt)).status_code==401
            owner_clients[0].cookies.update(snapshots[0])
        changed=dict(body); changed['html_b64']=base64.b64encode(b'<html>SYNTHETIC changed</html>').decode(); changed['expected']=dict(body['expected']); changed['expected']['html_sha256']=hashlib.sha256(b'<html>SYNTHETIC changed</html>').hexdigest()
        assert admin(changed).status_code==409
        request=str(uuid.uuid4())
        args=dict(p_request=request,p_report=rid,p_sums=sums,p_bytes={k:len(v) for k,v in files.items()})
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            acquired=list(pool.map(lambda _:rpc('monthly_admin_stage_acquire',args),range(2)))
        assert sum(x.ok for x in acquired)==1
        lease=next(x for x in acquired if x.ok).json()[0]['lease']
        for token in [None,str(uuid.uuid4())]:
            assert not rpc('monthly_admin_stage_commit',dict(p_request=request,p_lease=token,p_dataset={},p_notes='SYNTHETIC denied')).ok
        assert scalar('monthly_admin_stage_release',dict(p_request=request,p_lease=lease,p_reason='Synthetic regression completed',p_fatal=False,p_orphans=[])) is True
        assert not rpc('monthly_admin_stage_commit',dict(p_request=request,p_lease=None,p_dataset={},p_notes='SYNTHETIC released')).ok
        # Real editor JWT: no imports, grants, or transitions; legacy owner cannot read/sign.
        assert not rpc('monthly_transition',dict(vid=receipt['id'],next_state='approved'),'editor').ok
        assert not rpc('monthly_transition',dict(vid=receipt['id'],next_state='published'),'editor').ok
        assert not rpc('monthly_admin_create_report',dict(p_client=clients[0],p_start='2026-10-05',p_end='2026-11-05',p_label='DENIED',p_kind='monthly'),'editor').ok
        assert admin(body,'editor').status_code==403
        for who in ['editor','legacy']:
            assert not rpc('monthly_revoke_synthetic_staff',dict(p_user=SESSIONS['admin']['user']['id'],p_reason='Synthetic denial check'),who).ok
        for who in ['legacy']:
            for name,args in [('monthly_can_client',dict(cid=clients[0])),('monthly_can_version',dict(vid=versions[0]['id']))]:
                r=rpc(name,args,who); assert r.ok and r.json() is not True
            for table in ['monthly_clients','monthly_reports','monthly_report_versions']:
                r=requests.get(CLOUD+'/rest/v1/'+table,headers=headers(who),timeout=30); assert r.ok and r.json()==[]
            r=requests.post(CLOUD+'/functions/v1/get-report-file',headers=headers(who),json=dict(version_id=versions[0]['id'],format='html'),timeout=30); assert r.status_code==403
        assert not rpc('monthly_revoke_synthetic_staff',dict(p_user=SESSIONS['editor']['user']['id'],p_reason='Synthetic admin denial check')).ok
        record('genuine editor forbidden imports/transitions/staff revocation', 'denied with native editor JWT', '6 denial checks',mode='HOSTED_AUTH')
        record('legacy owner membership bypass retirement', 'no client/version authority, no rows, signer denied', '6 checks denied with genuine native legacy JWT',mode='HOSTED_AUTH')
        record('synthetic admin staff-revocation denial', 'real admin required; no roles changed', 'denied',mode='HOSTED_AUTH')
        return dict(synthetic_report_id=rid,synthetic_version_id=receipt['id'],synthetic_request_id=body['request_id'],draft=True,readback_formats=2,replay='exact receipt',overlap_successes=1,invalid_lease_denials=3)
    check('fresh synthetic upload/readback/replay/atomic/null lease',stage_checks,'HOSTED_AUTH')

    def denial_checks():
        s=requests.Session();s.cookies.update(snapshots[0])
        assert broker(s,dict(action='file',version_id=str(uuid.uuid4()),format='html')).status_code==401
        s.cookies.update(snapshots[0])
        for extra in [{'slug':'forged'},{'path':'arbitrary'}]:
            assert broker(s,dict(action='file',version_id=versions[0]['id'],format='html',**extra)).status_code==400
        return 'forged UUID 401; forged slug/path 400; cross-owner matrix separately verified'
    check('forged file identifiers',denial_checks)

    def expiry():
        r=broker(owner_clients[1],dict(action='file',version_id=records[scopes[1][0]]['id'],format='html'));assert r.ok
        link=r.json()['url'];start=time.monotonic()
        assert requests.get(link,timeout=30).ok
        tampered=link[:-1]+('a' if link[-1]!='a' else 'b')
        assert requests.get(tampered,timeout=30).status_code>=400
        time.sleep(max(0,66-(time.monotonic()-start)))
        r=requests.get(link,timeout=30);assert r.status_code>=400
        return dict(initial_http=200,tampered='denied',expired_http=r.status_code,elapsed_seconds=round(time.monotonic()-start))
    check('actual 60-second signed-link expiry and tamper',expiry)

    def lifecycle():
        for i,action in [(2,'logout'),(3,'remove_scope'),(4,'rotate'),(5,'revoke')]:
            oldcookie=owner_clients[i].cookies.get_dict()
            if action=='logout':
                r=broker(owner_clients[i],dict(action='logout'));assert r.ok and 'Max-Age=0' in r.headers.get('Set-Cookie','')
            else:
                args=dict(p_action=action,p_id=ids[i])
                if action=='remove_scope':args['p_clients']=scopes[i][:1]
                if action=='rotate':args.update(p_selector=secrets.token_hex(16),p_salt=secrets.token_hex(16),p_verifier=secrets.token_hex(32))
                scalar('monthly_code_manage',args)
            s=requests.Session();s.cookies.update(oldcookie)
            assert broker(s,dict(action='archive')).status_code==401
        return 'logout/scope removal/rotation/revocation: 4 old-cookie replays denied immediately'
    check('logout/rotation/revoke/scope removal and replay',lifecycle)

    def lockout():
        bad=codes[6].split('.')[0]+'.'+'0'*64
        def attempt(value):
            s=requests.Session();return s.post(API,headers={**CSRF,'X-Forwarded-For':'198.51.100.'+str(secrets.randbelow(200))},json=dict(action='login',code=value),timeout=40).status_code
        # Positive successful attempts must not consume failure slots.
        for _ in range(6):assert attempt(codes[6])==200
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            mixed=list(pool.map(attempt,[codes[6],codes[6],bad,bad]))
        assert mixed==[200,200,401,401]
        assert attempt(codes[6])==200
        for _ in range(3):assert attempt(bad)==401
        assert attempt(codes[6])==401
        scalar('monthly_code_manage',dict(p_action='unlock',p_id=ids[6]))
        assert attempt(codes[6])==200
        return dict(successes=6,mixed=mixed,five_failures_lock=True,audited_unlock=True)
    check('success reservations/concurrent mixed failures/five-failure lockout',lockout)

    def audit():
        r=requests.get(CLOUD+'/rest/v1/monthly_audit_log',params={'at':'gte.'+START,'select':'id,action,target_id,detail','order':'at.desc','limit':1000},headers=headers(),timeout=30);assert r.ok and r.json()
        rows=r.json();aid=rows[0]['id']
        for who in ['admin','editor','legacy']:
            for method in ['PATCH','DELETE']:
                x=requests.request(method,CLOUD+'/rest/v1/monthly_audit_log',params={'id':'eq.'+aid},headers=headers(who),json={'action':'DENIED'} if method=='PATCH' else None,timeout=30);assert x.status_code in [401,403]
        for cid in ids:
            x=requests.get(CLOUD+'/rest/v1/monthly_audit_log',params={'target_id':'eq.'+cid,'action':'eq.code_admin_create_synthetic','at':'gte.'+START,'select':'id,detail'},headers=headers(),timeout=30);assert x.ok and len(x.json())==1
            detail=x.json()[0]['detail'];i=ids.index(cid)
            assert set(detail['after_clients'])==set(scopes[i]) and set(detail['requested_clients'])==set(scopes[i]) and detail['before_clients']==[]
        return dict(immutable_denials=6,exact_scope_receipts=18,observed_rows=len(rows))
    check('durable scope receipts and audit immutability',audit,'HOSTED_AUTH')
    record('forced session expiry/live audit failure injection','reviewed tightly fixture-scoped operator path','none exists; not bypassed','BLOCKED','HOSTED_AUTH')
    record('native password entry/MFA','human browser password sign-in and verified settings','native test sessions used; password flow and MFA not configured/verified','BLOCKED','DEPLOYED_BROWSER')
    record('elapsed 30-day observation/Safari','actual elapsed duration and Safari runtime','not observed; Chromium and exact interval separately proven','NOT_RUN','DEPLOYED_BROWSER')
except Exception as error:
    record('suite completion','all runnable assertions complete','stopped: '+type(error).__name__+' at line '+str(__import__('traceback').extract_tb(error.__traceback__)[-1].lineno),'FAIL')
finally:
    # Revoke every freshly created synthetic owner credential non-destructively.
    cleanup=[]
    for cid in CREATED:
        try:cleanup.append(rpc('monthly_code_manage',dict(p_action='revoke',p_id=cid)).ok)
        except Exception:cleanup.append(False)
    record('synthetic code cleanup','all new credentials durably revoked; records retained',dict(created=len(CREATED),revoked=sum(cleanup)), 'PASS' if all(cleanup) else 'FAIL','HOSTED_AUTH')
    OUT.write_text(json.dumps(dict(frontend=dict(deploy='6af37af58a30a9e9d3155135',source='87a6efeb2b3ba22cdd8fc1836a3a6ce8cf08e876',confirmed_by='coordinator'),backend_source='eb5493b126298eb95a69c922bfff46f853876408',identities={k:v['user']['id'] for k,v in SESSIONS.items()},synthetic_credential_ids=CREATED,tests=ROWS,no_deploy=True,no_real_setup=True,cost=dict(cap_credits=6,actual_credits=None,reason='current response usage not finalized until turn ends',project_recorded_usage_before=104.223881336)),indent=2))
    print('SUMMARY',json.dumps({s:sum(x['status']==s for x in ROWS) for s in ['PASS','FAIL','BLOCKED','NOT_RUN']}),flush=True)
