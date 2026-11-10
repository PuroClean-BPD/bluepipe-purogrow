"""Synthetic hosted corrections; only the existing approved admin JWT. No Auth mint/refresh.
Every mutation uses the genuine admin's audited RPC/edge path. No real imports.
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

ROOT = Path('/dev-server')
ENV = dict(line.split('=', 1) for line in (ROOT / '.env').read_text().splitlines() if '=' in line)
URL = ENV['VITE_SUPABASE_URL'].strip('"')
KEY = ENV['VITE_SUPABASE_PUBLISHABLE_KEY'].strip('"')
SESSION = json.loads(Path('/tmp/monthly-admin-session.json').read_text())['session']
assert SESSION['user']['id'] == '76a43a8c-0fc9-4a59-9bfc-7b7b7efb89d5'
HEADERS = {'apikey': KEY, 'Authorization': 'Bearer ' + SESSION['access_token']}
TAG = 'syn-review-' + uuid.uuid4().hex[:10]
ROWS, FIXTURES = [], {'tag': TAG, 'admin_id': SESSION['user']['id'], 'clients': [], 'credentials': [], 'versions': [], 'requests': []}
START = datetime.datetime.now(datetime.timezone.utc).isoformat()
LAST_BATCH = time.monotonic()

def record(name, expected, actual, status='PASS', mode='HOSTED'):
    ROWS.append({'test': name, 'status': status, 'mode': mode, 'at_chicago': datetime.datetime.now(ZoneInfo('America/Chicago')).isoformat(), 'expected': expected, 'actual': actual})
    print(status, name, flush=True)

def rpc(name, args):
    return requests.post(URL + '/rest/v1/rpc/' + name, headers=HEADERS, json=args, timeout=40)

def scalar(name, args):
    r = rpc(name, args)
    assert r.ok, name + ' HTTP ' + str(r.status_code)
    return r.json() if r.content else None

def admin(body):
    return requests.post(URL + '/functions/v1/monthly-admin', headers=HEADERS, json=body, timeout=50)

def code(body):
    return requests.post(URL + '/functions/v1/monthly-code', json=body, timeout=40)

def login(value):
    before = datetime.datetime.now(datetime.timezone.utc)
    r = code({'action': 'login', 'code': value})
    assert r.ok, 'Login HTTP ' + str(r.status_code)
    data = r.json()
    assert isinstance(data.get('session'), str) and len(data['session']) == 64
    expiry = datetime.datetime.fromisoformat(data['expires_at'].replace('Z', '+00:00'))
    assert abs((expiry - before).total_seconds() - 30 * 86400) < 15
    return data['session']

def stage(client, suffix='published'):
    rid = scalar('monthly_admin_create_report', {'p_client': client, 'p_start': '2026-10-05T00:00:00Z', 'p_end': '2026-11-05T23:59:59Z', 'p_label': 'Synthetic Oct 5–Nov 5', 'p_kind': 'monthly'})
    request = str(uuid.uuid4())
    # Independent expected SHA256 computed BEFORE ingestion from fixed fixture source bytes.
    files = {'html': ('<!doctype html><html><body>SYNTHETIC ' + client + '</body></html>').encode(), 'pdf': ('%PDF-1.4\n% SYNTHETIC ' + client + '\n%%EOF\n').encode(), 'content': json.dumps({'synthetic': True, 'client_id': client}, indent=2).encode()}
    sums = {k: hashlib.sha256(v).hexdigest() for k, v in files.items()}
    body = {'action': 'stage_version', 'request_id': request, 'report_id': rid, **{k + '_b64': base64.b64encode(v).decode() for k, v in files.items()}, 'expected': {k + '_sha256': v for k, v in sums.items()}, 'notes': TAG + ' SYNTHETIC ONLY'}
    r = admin(body)
    assert r.ok, 'Stage HTTP ' + str(r.status_code)
    receipt = r.json()
    assert uuid.UUID(receipt['id']) and receipt['sha256'] == sums and receipt['bytes'] == {k: len(v) for k, v in files.items()}
    FIXTURES['versions'].append({'id': receipt['id'], 'report_id': rid, 'client_id': client, 'state': suffix, 'expected_sha256': sums, 'expected_bytes': {k: len(v) for k, v in files.items()}})
    FIXTURES['requests'].append(request)
    if suffix == 'published':
        for state in ['approved', 'published']:
            scalar('monthly_transition', {'vid': receipt['id'], 'next_state': state})
    return receipt, body, files

try:
    r = requests.get(URL + '/auth/v1/user', headers=HEADERS, timeout=30)
    assert r.ok, 'Existing admin session unavailable; no mint/refresh permitted'
    assert scalar('monthly_staff_role', {}) == 'admin'
    record('existing approved genuine admin', 'admin JWT valid; no mint/refresh', 'verified')
    for body in [None, [], 1, {'action': 'archive', 'session': '0' * 64, 'slug': 'forged'}]:
        r = code(body) if body is not None else requests.post(URL + '/functions/v1/monthly-code', data='null', timeout=40)
        assert r.status_code == 400
    record('Cloud strict JSON shape', 'null/array/primitive/unknown fields HTTP 400', '4/4 rejected')
    r = requests.post(URL + '/functions/v1/monthly-code', data=iter([b'{"action":"login","code":"', b'a' * 4096, b'"}']), timeout=40)
    assert r.status_code == 400
    record('Cloud chunked oversized request', '400 and bounded reader', 'HTTP 400; reader cancellation separately UNIT tested')
    org = scalar('monthly_admin_create_org', {'p_name': TAG + ' SYNTHETIC ONLY'})
    FIXTURES['org_id'] = org
    for i in range(24):
        FIXTURES['clients'].append(scalar('monthly_admin_create_client', {'p_org': org, 'p_slug': TAG + '-' + str(i), 'p_display': 'SYNTHETIC Review ' + str(i), 'p_package': None}))
    values, tokens, offset = [], [], 0
    for size in [3, 3, 2, 2] + [1] * 14:
        selector, salt, secret = secrets.token_hex(16), secrets.token_hex(16), secrets.token_hex(32)
        verifier = hashlib.pbkdf2_hmac('sha256', secret.encode(), bytes.fromhex(salt), 600000).hex()
        scopes = FIXTURES['clients'][offset:offset + size]
        cid = scalar('monthly_code_manage', {'p_action': 'create_synthetic', 'p_selector': selector, 'p_salt': salt, 'p_verifier': verifier, 'p_clients': scopes})
        FIXTURES['credentials'].append({'id': cid, 'client_ids': scopes})
        values.append(selector + '.' + secret)
        offset += size
    # Repeated success before matrix sessions; throttle stays below global 30/min.
    for _ in range(6): login(values[0])
    record('six successive successful logins', 'all 200 without lockout', '6/6 200')
    for value in values: tokens.append(login(value))
    record('session expiry policy receipt', 'exact 30-day interval within 15s request time', '24 successful login receipts checked; elapsed 30 days NOT observed')
    records = []
    for client in FIXTURES['clients']:
        receipt, body, files = stage(client)
        records.append((receipt, body, files))
    record('24 tiny synthetic published versions', 'audited staging/readback plus synthetic-only transitions', '24 published QA versions; independent source hashes frozen')
    receipt, body, files = records[0]
    replay = admin(body)
    assert replay.ok
    for key in ['id', 'version', 'state', 'sha256', 'bytes']: assert replay.json()[key] == receipt[key]
    changed = dict(body); changed['html_b64'] = base64.b64encode(b'<html>changed SYNTHETIC</html>').decode(); changed['expected'] = dict(body['expected']); changed['expected']['html_sha256'] = hashlib.sha256(b'<html>changed SYNTHETIC</html>').hexdigest()
    assert admin(changed).status_code == 409
    record('committed replay and payload binding', 'nonnull UUID and original id/version/state/hash/bytes; changed payload 409', 'exact receipt stable; changed payload rejected')
    archive_cells = 0
    for i, token in enumerate(tokens):
        r = code({'action': 'archive', 'session': token}); assert r.ok
        actual = {c['id'] for c in r.json()['clients']}
        expected = set(FIXTURES['credentials'][i]['client_ids']); assert actual == expected
        for client in FIXTURES['clients']: assert (client in actual) == (client in expected); archive_cells += 1
    record('archive membership matrix (not file requests)', '432 cells; groups 3/3/2/2 plus 14 singles', {'cells': archive_cells, 'allowed': 24, 'denied': 408})
    # Concurrent mixed attempts: two successes plus two failures; then three failures lock.
    time.sleep(63)
    value=values[0]; bad=value.split('.')[0]+'.'+'0'*64
    def attempt(value): return code({'action':'login','code':value}).status_code
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        statuses=list(pool.map(attempt,[value,value,bad,bad]))
    assert statuses[:2]==[200,200] and statuses[2:]==[401,401]
    assert attempt(value)==200
    for _ in range(3): assert attempt(bad)==401
    assert attempt(value)==401
    scalar('monthly_code_manage',{'p_action':'unlock','p_id':FIXTURES['credentials'][0]['id']})
    assert attempt(value)==200
    record('mixed concurrent success/failure and true five-failure lockout','2 mixed successes preserve 2 failures; three additional failures lock; audited unlock works',{'mixed_http':statuses,'five_failure_lock':True,'unlock_login_http':200})

    for fmt in ['html', 'pdf']:
        # 432 file authorization requests per format; separate minute from next format.
        start = time.monotonic(); allowed = denied = 0
        def check(pair):
            i, j = pair
            receipt, body, files = records[j]
            r = code({'action': 'file', 'session': tokens[i], 'version_id': receipt['id'], 'format': fmt})
            if FIXTURES['clients'][j] in FIXTURES['credentials'][i]['client_ids']:
                assert r.ok, 'Allowed file HTTP ' + str(r.status_code)
                expected = hashlib.sha256(files[fmt]).hexdigest()
                assert r.json()['sha256'] == expected
                download = requests.get(r.json()['url'], timeout=40)
                assert download.ok and download.content == files[fmt] and hashlib.sha256(download.content).hexdigest() == expected
                return True
            assert r.status_code == 401, 'Denied file HTTP ' + str(r.status_code)
            return False
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
            for granted in pool.map(check, [(i, j) for i in range(18) for j in range(24)]):
                if granted: allowed += 1
                else: denied += 1
        assert (allowed, denied) == (24, 408)
        record('actual ' + fmt + ' file authorization matrix', '432 requests: 24 allowed independent-hash downloads / 408 denied', {'requests': 432, 'allowed': allowed, 'denied': denied, 'verified_downloads': allowed})
        time.sleep(max(0, 63 - (time.monotonic() - start)))
    # Raw content bytes, not canonicalized JSONB text; includes indentation deliberately.
    r = code({'action': 'file', 'session': tokens[0], 'version_id': records[0][0]['id'], 'format': 'content'}); assert r.ok
    download = requests.get(r.json()['url'], timeout=40); expected = hashlib.sha256(records[0][2]['content']).hexdigest()
    assert download.ok and download.content == records[0][2]['content'] and r.json()['sha256'] == expected
    record('content hash semantics', 'SHA256 original UTF8 content.json bytes including whitespace, not JSONB serialization', 'independent expected hash and exact bytes matched')
    for field in [{'version_id': str(uuid.uuid4())}, {'slug': 'forged'}, {'path': 'monthly/arbitrary/report.html'}]:
        b = {'action': 'file', 'session': tokens[0], 'version_id': records[0][0]['id'], 'format': 'html', **field}
        r = code(b); assert r.status_code == (401 if 'version_id' in field else 400)
    record('forged version/slugs/paths', '401 unknown version; 400 unknown slug/path fields', 'all denied')
    draft, _, _ = stage(FIXTURES['clients'][0], 'draft')
    for fmt in ['html', 'pdf', 'content']:
        assert code({'action': 'file', 'session': tokens[0], 'version_id': draft['id'], 'format': fmt}).status_code == 401
    record('unpublished denial across formats', 'draft HTML/PDF/content denied', '3/3 HTTP 401')
    # Forbidden owner writes use owner token, never a forged staff role.
    owner_headers = {'apikey': KEY, 'Authorization': 'Bearer ' + tokens[0]}
    r = requests.post(URL + '/functions/v1/monthly-admin', headers=owner_headers, json={'action': 'create_org', 'name': 'DENIED'}, timeout=40); assert r.status_code == 401
    for table in ['monthly_code_credentials', 'monthly_report_versions', 'monthly_memberships']:
        r = requests.post(URL + '/rest/v1/' + table, headers=owner_headers, json={}, timeout=30); assert r.status_code in [401, 403]
    record('owner staff endpoint and writes denied', '401/403; opaque owner session is not JWT', '4/4 denied')
    r = requests.get(URL + '/rest/v1/monthly_report_versions?id=eq.' + records[0][0]['id'], headers=HEADERS, timeout=30); assert r.ok
    path = r.json()[0]['html_path']
    for suffix in ['/storage/v1/object/reports-private/' + path, '/storage/v1/object/public/reports-private/' + path]:
        r = requests.get(URL + suffix, headers={'apikey': KEY}, timeout=30); assert r.status_code >= 400
    record('private storage path bypass', 'direct/public URLs denied', '2/2 denied')
    r = requests.post(URL + '/storage/v1/object/list/reports-private', headers={'apikey': KEY}, json={'prefix': 'monthly'}, timeout=30); assert r.status_code >= 400 or r.json() == []
    record('anonymous private list', 'denied or empty', 'no visible objects')
    audits = requests.get(URL + '/rest/v1/monthly_audit_log', params={'select':'id,action,target_id','at':'gte.'+START,'order':'at.desc','limit':1000}, headers=HEADERS, timeout=30)
    assert audits.ok and audits.json()
    aid = audits.json()[0]['id']; FIXTURES['audit_ids'] = [row['id'] for row in audits.json()]
    for method in ['PATCH', 'DELETE']:
        r = requests.request(method, URL + '/rest/v1/monthly_audit_log?id=eq.' + aid, headers=HEADERS, json={'action': 'DENIED'} if method == 'PATCH' else None, timeout=30); assert r.status_code in [401, 403]
    record('audit immutability genuine admin', 'PATCH/DELETE 403', 'both denied')
    actions=set()
    for action in ['code_file','code_file_denied','code_file_confirm','code_input_denied','code_session_created']:
        check=requests.get(URL+'/rest/v1/monthly_audit_log',params={'select':'id,action,target_id','at':'gte.'+START,'action':'eq.'+action,'limit':5},headers=HEADERS,timeout=30)
        assert check.ok and check.json()
        actions.add(action)
        FIXTURES['audit_ids'].extend(row['id'] for row in check.json())
    record('durable authorization audit receipts', 'required actions present', {'rows': len(audits.json()), 'actions': sorted(actions)})
    record('live audit failure injection', 'strict fixture-scoped safe hook', 'no supported isolated injection hook; global audit trigger prohibited', 'BLOCKED')
    record('forced hosted expiry', 'safe admin fixture-only expiry path', 'not invoked: no approved expiry mutation RPC; exact interval checked, expiry denial UNIT', 'BLOCKED')
    record('genuine editor JWT', 'genuine approved editor session', 'unavailable; no mint/spoof/identity retry', 'BLOCKED')
    record('real staged verifier creation / real import', 'genuine nonsynthetic admin plus private manifest/package', 'NOT invoked; local SQL simulation only', 'NOT_RUN')
    record('Netlify cookie / Safari frontend runtime', 'deployed broker', 'frontend deploy withheld; broker and browser hash rejection tested locally', 'BLOCKED')
    record('elapsed 30-day observation', '30 days elapsed', 'not observed; separate from exact interval policy proof', 'NOT_RUN')
except Exception as error:
    record('suite completion', 'all runnable checks complete', 'stopped: ' + type(error).__name__, 'FAIL')
finally:
    out = {'mode': 'HOSTED synthetic ONLY', 'baseline': '0b484e74ee0090ffaa0f158091c788155342e145', 'fixtures': FIXTURES, 'tests': ROWS, 'no_frontend_deploy': True, 'real_access_off': True, 'cost_credits': None, 'prior_harness_attempt': json.loads(Path('/tmp/code-correction/first-attempt.json').read_text()) if Path('/tmp/code-correction/first-attempt.json').exists() else None}
    (ROOT / 'docs/test-results/code-correction-hosted.json').write_text(json.dumps(out, indent=2))
    print('SUMMARY', json.dumps({s: sum(r['status'] == s for r in ROWS) for s in ['PASS', 'FAIL', 'BLOCKED', 'NOT_RUN']}), flush=True)
