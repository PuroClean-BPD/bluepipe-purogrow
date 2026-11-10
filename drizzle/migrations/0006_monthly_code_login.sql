CREATE TABLE public.monthly_code_credentials(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), selector text UNIQUE NOT NULL CHECK(selector ~ '^[a-f0-9]{32}$'), salt text NOT NULL CHECK(salt ~ '^[a-f0-9]{32}$'), verifier text NOT NULL CHECK(verifier ~ '^[a-f0-9]{64}$'), iterations integer NOT NULL DEFAULT 600000 CHECK(iterations=600000), generation integer NOT NULL DEFAULT 1, synthetic boolean NOT NULL DEFAULT true, active boolean NOT NULL DEFAULT true, failures integer NOT NULL DEFAULT 0, window_start timestamptz NOT NULL DEFAULT now(), locked_until timestamptz, created_by uuid NOT NULL);
REVOKE ALL ON public.monthly_code_credentials FROM PUBLIC,anon,authenticated; GRANT ALL ON public.monthly_code_credentials TO service_role; ALTER TABLE public.monthly_code_credentials ENABLE ROW LEVEL SECURITY; ALTER TABLE public.monthly_code_credentials FORCE ROW LEVEL SECURITY;
CREATE TABLE public.monthly_code_scopes(credential_id uuid NOT NULL REFERENCES public.monthly_code_credentials(id), client_id uuid NOT NULL REFERENCES public.monthly_clients(id), PRIMARY KEY(credential_id,client_id));
REVOKE ALL ON public.monthly_code_scopes FROM PUBLIC,anon,authenticated; GRANT ALL ON public.monthly_code_scopes TO service_role; ALTER TABLE public.monthly_code_scopes ENABLE ROW LEVEL SECURITY; ALTER TABLE public.monthly_code_scopes FORCE ROW LEVEL SECURITY;
CREATE TABLE public.monthly_code_sessions(digest text PRIMARY KEY CHECK(digest ~ '^[a-f0-9]{64}$'), credential_id uuid NOT NULL REFERENCES public.monthly_code_credentials(id), generation integer NOT NULL, expires_at timestamptz NOT NULL, revoked_at timestamptz);
REVOKE ALL ON public.monthly_code_sessions FROM PUBLIC,anon,authenticated; GRANT ALL ON public.monthly_code_sessions TO service_role; ALTER TABLE public.monthly_code_sessions ENABLE ROW LEVEL SECURITY; ALTER TABLE public.monthly_code_sessions FORCE ROW LEVEL SECURITY;
CREATE TABLE public.monthly_code_attempts(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), credential_id uuid REFERENCES public.monthly_code_credentials(id), generation integer, expires_at timestamptz NOT NULL, finished boolean NOT NULL DEFAULT false);
REVOKE ALL ON public.monthly_code_attempts FROM PUBLIC,anon,authenticated; GRANT ALL ON public.monthly_code_attempts TO service_role; ALTER TABLE public.monthly_code_attempts ENABLE ROW LEVEL SECURITY; ALTER TABLE public.monthly_code_attempts FORCE ROW LEVEL SECURITY;
CREATE TABLE public.monthly_code_budget(id boolean PRIMARY KEY DEFAULT true CHECK(id), window_start timestamptz NOT NULL DEFAULT now(), used integer NOT NULL DEFAULT 0);
REVOKE ALL ON public.monthly_code_budget FROM PUBLIC,anon,authenticated; GRANT ALL ON public.monthly_code_budget TO service_role; ALTER TABLE public.monthly_code_budget ENABLE ROW LEVEL SECURITY; ALTER TABLE public.monthly_code_budget FORCE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_settings ADD COLUMN code_real_access_enabled boolean NOT NULL DEFAULT false;
CREATE FUNCTION public.monthly_code_audit(p_action text,p_credential uuid DEFAULT NULL,p_detail jsonb DEFAULT '{}') RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=public,pg_temp AS $$ INSERT INTO public.monthly_audit_log(action,target_table,target_id,detail) VALUES(p_action,'monthly_code_credentials',p_credential,p_detail) $$;
CREATE FUNCTION public.monthly_code_begin(p_selector text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE c monthly_code_credentials; b monthly_code_budget; aid uuid; allowed boolean;
BEGIN
 INSERT INTO monthly_code_budget(id) VALUES(true) ON CONFLICT DO NOTHING;
 SELECT * INTO b FROM monthly_code_budget WHERE id FOR UPDATE;
 IF b.window_start<=now()-interval '1 minute' THEN UPDATE monthly_code_budget SET window_start=now(),used=0 WHERE id; b.used:=0; END IF;
 IF b.used>=30 THEN PERFORM monthly_code_audit('code_global_limited'); RETURN jsonb_build_object('allowed',false); END IF;
 UPDATE monthly_code_budget SET used=used+1 WHERE id;
 SELECT * INTO c FROM monthly_code_credentials WHERE selector=p_selector FOR UPDATE;
 allowed:=c.id IS NOT NULL AND c.active AND (c.synthetic OR EXISTS(SELECT 1 FROM monthly_settings WHERE id AND code_real_access_enabled)) AND (c.locked_until IS NULL OR c.locked_until<=now());
 IF NOT coalesce(allowed,false) THEN PERFORM monthly_code_audit('code_denied',c.id); RETURN jsonb_build_object('allowed',false); END IF;
 IF c.window_start<=now()-interval '15 minutes' THEN UPDATE monthly_code_credentials SET failures=0,window_start=now(),locked_until=NULL WHERE id=c.id; c.failures:=0; END IF;
 -- Reserve a failure slot BEFORE KDF: concurrent in-flight attempts cannot bypass lockout.
 UPDATE monthly_code_credentials SET failures=failures+1,locked_until=CASE WHEN failures+1>=5 THEN now()+interval '15 minutes' ELSE locked_until END WHERE id=c.id;
 INSERT INTO monthly_code_attempts(credential_id,generation,expires_at) VALUES(c.id,c.generation,now()+interval '30 seconds') RETURNING id INTO aid;
 PERFORM monthly_code_audit('code_attempt',c.id);
 RETURN jsonb_build_object('allowed',true,'attempt',aid,'salt',c.salt,'verifier',c.verifier,'iterations',c.iterations);
END $$;
CREATE FUNCTION public.monthly_code_finish(p_attempt uuid,p_match boolean,p_digest text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE a monthly_code_attempts; c monthly_code_credentials; expiry timestamptz;
BEGIN
 SELECT * INTO a FROM monthly_code_attempts WHERE id=p_attempt FOR UPDATE;
 SELECT * INTO c FROM monthly_code_credentials WHERE id=a.credential_id FOR UPDATE;
 IF a.id IS NULL OR a.finished OR a.expires_at<=now() OR c.id IS NULL OR NOT c.active OR c.generation IS DISTINCT FROM a.generation OR NOT(c.synthetic OR EXISTS(SELECT 1 FROM monthly_settings WHERE id AND code_real_access_enabled)) OR p_match IS DISTINCT FROM true OR p_digest IS NULL OR p_digest !~ '^[a-f0-9]{64}$' THEN
  IF a.id IS NOT NULL THEN UPDATE monthly_code_attempts SET finished=true WHERE id=a.id; END IF;
  PERFORM monthly_code_audit('code_verification_denied',c.id); RETURN jsonb_build_object('ok',false);
 END IF;
 UPDATE monthly_code_attempts SET finished=true WHERE id=a.id;
 expiry:=now()+interval '30 days';
 INSERT INTO monthly_code_sessions(digest,credential_id,generation,expires_at) VALUES(p_digest,c.id,c.generation,expiry);
 -- Do not clear reserved failures: a successful concurrent attempt must not unlock an attack burst.
 PERFORM monthly_code_audit('code_session_created',c.id,jsonb_build_object('expires_at',expiry));
 RETURN jsonb_build_object('ok',true,'expires_at',expiry);
END $$;
CREATE FUNCTION public.monthly_code_access(p_digest text,p_action text,p_version uuid DEFAULT NULL,p_format text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE s monthly_code_sessions; c monthly_code_credentials; v monthly_report_versions; cid uuid; path text; result jsonb;
BEGIN
 -- Credential locks serialize all generation/scope mutations with authorization decisions.
 SELECT c0.* INTO c FROM monthly_code_credentials c0 JOIN monthly_code_sessions s0 ON s0.credential_id=c0.id WHERE s0.digest=p_digest FOR UPDATE OF c0;
 SELECT * INTO s FROM monthly_code_sessions WHERE digest=p_digest FOR UPDATE;
 IF s.digest IS NULL OR c.id IS NULL OR s.revoked_at IS NOT NULL OR s.expires_at<=now() OR NOT c.active OR s.generation<>c.generation OR NOT(c.synthetic OR EXISTS(SELECT 1 FROM monthly_settings WHERE id AND code_real_access_enabled)) THEN PERFORM monthly_code_audit('code_access_denied',c.id); RETURN jsonb_build_object('ok',false); END IF;
 IF p_action='logout' THEN UPDATE monthly_code_sessions SET revoked_at=now() WHERE digest=p_digest; result:=jsonb_build_object('ok',true);
 ELSIF p_action='archive' THEN
  SELECT jsonb_build_object('ok',true,'clients',coalesce((SELECT jsonb_agg(jsonb_build_object('id',cl.id,'display_name',cl.display_name,'slug',cl.slug,'package',cl.package)) FROM monthly_clients cl JOIN monthly_code_scopes sc ON sc.client_id=cl.id WHERE sc.credential_id=c.id AND cl.status='active'),'[]'::jsonb),'reports',coalesce((SELECT jsonb_agg(jsonb_build_object('id',rv.id,'report_id',r.id,'client_id',r.client_id,'version',rv.version,'period_label',r.period_label,'period_start',r.period_start,'period_end',r.period_end,'dataset_sha256',rv.dataset_sha256)) FROM monthly_report_versions rv JOIN monthly_reports r ON r.id=rv.report_id JOIN monthly_clients cl ON cl.id=r.client_id JOIN monthly_code_scopes sc ON sc.client_id=r.client_id WHERE sc.credential_id=c.id AND rv.state='published' AND cl.status='active'),'[]'::jsonb)) INTO result;
 ELSIF p_action IN ('file','file_confirm') AND p_format IN ('html','pdf','content') THEN
  SELECT rv.* INTO v FROM monthly_report_versions rv JOIN monthly_reports r ON r.id=rv.report_id JOIN monthly_code_scopes sc ON sc.client_id=r.client_id JOIN monthly_clients cl ON cl.id=r.client_id WHERE rv.id=p_version AND sc.credential_id=c.id AND rv.state='published' AND cl.status='active' FOR SHARE OF rv;
  IF v.id IS NULL THEN PERFORM monthly_code_audit('code_file_denied',c.id); RETURN jsonb_build_object('ok',false); END IF;
  SELECT client_id INTO cid FROM monthly_reports WHERE id=v.report_id;
  path:=CASE p_format WHEN 'html' THEN v.html_path WHEN 'pdf' THEN v.pdf_path ELSE (SELECT base_path||'/content.json' FROM monthly_staging WHERE version_id=v.id AND state='committed') END;
  IF path IS NULL OR path NOT LIKE 'monthly/%' OR path LIKE '%..%' THEN PERFORM monthly_code_audit('code_file_denied',c.id); RETURN jsonb_build_object('ok',false); END IF;
  result:=jsonb_build_object('ok',true,'path',path,'sha256',CASE WHEN p_format='content' THEN v.dataset_sha256 ELSE (SELECT sums->>p_format FROM monthly_staging WHERE version_id=v.id AND state='committed') END);
 ELSE PERFORM monthly_code_audit('code_action_denied',c.id); RETURN jsonb_build_object('ok',false);
 END IF;
 PERFORM monthly_code_audit('code_'||p_action,c.id,jsonb_build_object('version_id',p_version,'format',p_format)); RETURN result;
END $$;
CREATE FUNCTION public.monthly_code_manage(p_action text,p_id uuid DEFAULT NULL,p_selector text DEFAULT NULL,p_salt text DEFAULT NULL,p_verifier text DEFAULT NULL,p_clients uuid[] DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE cid uuid; cl uuid;
BEGIN
 IF monthly_staff_role() IS DISTINCT FROM 'admin' THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
 IF p_action='create_synthetic' THEN
  IF p_clients IS NULL OR cardinality(p_clients) NOT BETWEEN 1 AND 3 OR EXISTS(SELECT 1 FROM unnest(p_clients) x LEFT JOIN monthly_clients mc ON mc.id=x WHERE mc.id IS NULL OR mc.slug !~ '^(test-|syn-)') THEN RAISE EXCEPTION 'Synthetic scopes required'; END IF;
  INSERT INTO monthly_code_credentials(selector,salt,verifier,created_by) VALUES(p_selector,p_salt,p_verifier,auth.uid()) RETURNING id INTO cid;
  INSERT INTO monthly_code_scopes SELECT cid,x FROM unnest(p_clients) x;
 ELSE
  SELECT id INTO cid FROM monthly_code_credentials WHERE id=p_id FOR UPDATE;
  IF cid IS NULL THEN RAISE EXCEPTION 'Unknown credential'; END IF;
  IF p_action='revoke' THEN UPDATE monthly_code_credentials SET active=false,generation=generation+1 WHERE id=cid;
  ELSIF p_action='rotate' THEN UPDATE monthly_code_credentials SET selector=p_selector,salt=p_salt,verifier=p_verifier,generation=generation+1,failures=0,locked_until=NULL,window_start=now() WHERE id=cid;
  ELSIF p_action='remove_scope' THEN DELETE FROM monthly_code_scopes WHERE credential_id=cid AND client_id=ANY(p_clients); UPDATE monthly_code_credentials SET generation=generation+1 WHERE id=cid;
  ELSIF p_action='unlock' THEN UPDATE monthly_code_credentials SET failures=0,locked_until=NULL,window_start=now() WHERE id=cid;
  ELSE RAISE EXCEPTION 'Invalid action'; END IF;
 END IF;
 INSERT INTO monthly_audit_log(actor,action,target_table,target_id,detail) VALUES(auth.uid(),'code_admin_'||p_action,'monthly_code_credentials',cid,jsonb_build_object('scope_count',cardinality(p_clients)));
 RETURN cid;
END $$;
REVOKE ALL ON FUNCTION public.monthly_code_audit(text,uuid,jsonb),public.monthly_code_begin(text),public.monthly_code_finish(uuid,boolean,text),public.monthly_code_access(text,text,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.monthly_code_audit(text,uuid,jsonb),public.monthly_code_begin(text),public.monthly_code_finish(uuid,boolean,text),public.monthly_code_access(text,text,uuid,text) TO service_role;
REVOKE ALL ON FUNCTION public.monthly_code_manage(text,uuid,text,text,text,uuid[]) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.monthly_code_manage(text,uuid,text,text,text,uuid[]) TO authenticated;
COMMENT ON TABLE public.monthly_code_credentials IS 'Independent owner-code authority; real access remains OFF. Never expose verifier rows through client APIs.';