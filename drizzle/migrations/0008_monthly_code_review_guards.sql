-- Additive correction; real access remains OFF. No data activation.
ALTER TABLE public.monthly_code_credentials ALTER COLUMN synthetic SET DEFAULT false;
ALTER TABLE public.monthly_code_credentials ALTER COLUMN active SET DEFAULT false;
ALTER TABLE public.monthly_staff ADD COLUMN synthetic boolean NOT NULL DEFAULT true;
ALTER TABLE public.monthly_code_attempts ADD COLUMN reservation_window timestamptz, ADD COLUMN successful boolean NOT NULL DEFAULT false;
CREATE FUNCTION public.monthly_require_real_admin() RETURNS uuid
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE a uuid:=monthly_require_admin();
BEGIN
 IF NOT EXISTS(SELECT 1 FROM monthly_staff WHERE user_id=a AND role='admin' AND synthetic=false) THEN
  RAISE EXCEPTION 'Real staff required' USING ERRCODE='42501';
 END IF;
 RETURN a;
END $$;
REVOKE ALL ON FUNCTION public.monthly_require_real_admin() FROM PUBLIC,anon,authenticated;
CREATE FUNCTION public.monthly_assert_import_client(p_client uuid) RETURNS void
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 PERFORM monthly_require_admin();
 IF NOT EXISTS(SELECT 1 FROM monthly_clients WHERE id=p_client AND slug ~ '^(test-|syn-)') THEN
  PERFORM monthly_require_real_admin();
 END IF;
END $$;
REVOKE ALL ON FUNCTION public.monthly_assert_import_client(uuid) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.monthly_code_begin(p_selector text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE c monthly_code_credentials; b monthly_code_budget; aid uuid; allowed boolean;
BEGIN
 INSERT INTO monthly_code_budget(id) VALUES(true) ON CONFLICT DO NOTHING;
 SELECT * INTO b FROM monthly_code_budget WHERE id FOR UPDATE;
 IF b.window_start<=now()-interval '1 minute' THEN
  UPDATE monthly_code_budget SET window_start=now(),used=0 WHERE id; b.used:=0;
 END IF;
 IF b.used>=30 THEN PERFORM monthly_code_audit('code_global_limited'); RETURN jsonb_build_object('allowed',false); END IF;
 UPDATE monthly_code_budget SET used=used+1 WHERE id;
 SELECT * INTO c FROM monthly_code_credentials WHERE selector=p_selector FOR UPDATE;
 allowed:=c.id IS NOT NULL AND c.active AND (c.synthetic OR EXISTS(SELECT 1 FROM monthly_settings WHERE id AND code_real_access_enabled)) AND (c.locked_until IS NULL OR c.locked_until<=now());
 IF NOT coalesce(allowed,false) THEN PERFORM monthly_code_audit('code_denied',c.id); RETURN jsonb_build_object('allowed',false); END IF;
 IF c.window_start<=now()-interval '15 minutes' THEN
  UPDATE monthly_code_credentials SET failures=0,window_start=now(),locked_until=NULL WHERE id=c.id;
  c.failures:=0; c.window_start:=now();
 END IF;
 -- Outstanding reservations count before KDF. Success releases only its own slot.
 IF c.failures>=5 THEN PERFORM monthly_code_audit('code_credential_limited',c.id); RETURN jsonb_build_object('allowed',false); END IF;
 UPDATE monthly_code_credentials SET failures=failures+1 WHERE id=c.id;
 INSERT INTO monthly_code_attempts(credential_id,generation,expires_at,reservation_window)
 VALUES(c.id,c.generation,now()+interval '30 seconds',c.window_start) RETURNING id INTO aid;
 PERFORM monthly_code_audit('code_attempt',c.id);
 RETURN jsonb_build_object('allowed',true,'attempt',aid,'salt',c.salt,'verifier',c.verifier,'iterations',c.iterations);
END $$;
CREATE OR REPLACE FUNCTION public.monthly_code_finish(p_attempt uuid,p_match boolean,p_digest text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE a monthly_code_attempts; c monthly_code_credentials; expiry timestamptz;
BEGIN
 SELECT * INTO a FROM monthly_code_attempts WHERE id=p_attempt FOR UPDATE;
 SELECT * INTO c FROM monthly_code_credentials WHERE id=a.credential_id FOR UPDATE;
 IF a.id IS NULL OR a.finished OR a.expires_at<=now() OR c.id IS NULL OR NOT c.active OR c.generation IS DISTINCT FROM a.generation OR NOT(c.synthetic OR EXISTS(SELECT 1 FROM monthly_settings WHERE id AND code_real_access_enabled)) OR p_match IS DISTINCT FROM true OR p_digest IS NULL OR p_digest !~ '^[a-f0-9]{64}$' THEN
  IF a.id IS NOT NULL AND NOT a.finished THEN
   UPDATE monthly_code_attempts SET finished=true WHERE id=a.id;
   IF a.generation=c.generation AND a.reservation_window=c.window_start AND
    (SELECT count(*) FROM monthly_code_attempts WHERE credential_id=c.id AND generation=c.generation AND reservation_window=c.window_start AND finished AND NOT successful)>=5 THEN
    UPDATE monthly_code_credentials SET locked_until=now()+interval '15 minutes' WHERE id=c.id;
   END IF;
  END IF;
  PERFORM monthly_code_audit('code_verification_denied',c.id); RETURN jsonb_build_object('ok',false);
 END IF;
 UPDATE monthly_code_attempts SET finished=true,successful=true WHERE id=a.id;
 expiry:=now()+interval '30 days';
 INSERT INTO monthly_code_sessions(digest,credential_id,generation,expires_at) VALUES(p_digest,c.id,c.generation,expiry);
 IF a.generation=c.generation AND a.reservation_window=c.window_start THEN
  UPDATE monthly_code_credentials SET failures=greatest(0,failures-1) WHERE id=c.id;
 END IF;
 PERFORM monthly_code_audit('code_session_created',c.id,jsonb_build_object('expires_at',expiry));
 RETURN jsonb_build_object('ok',true,'expires_at',expiry);
END $$;
CREATE OR REPLACE FUNCTION public.monthly_code_access(p_digest text,p_action text,p_version uuid DEFAULT NULL,p_format text DEFAULT NULL) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE s monthly_code_sessions; c monthly_code_credentials; v monthly_report_versions; cid uuid; path text; frozen text; result jsonb;
BEGIN
 SELECT c0.* INTO c FROM monthly_code_credentials c0 JOIN monthly_code_sessions s0 ON s0.credential_id=c0.id WHERE s0.digest=p_digest FOR UPDATE OF c0;
 SELECT * INTO s FROM monthly_code_sessions WHERE digest=p_digest FOR UPDATE;
 IF s.digest IS NULL OR c.id IS NULL OR s.revoked_at IS NOT NULL OR s.expires_at<=now() OR NOT c.active OR s.generation<>c.generation OR NOT(c.synthetic OR EXISTS(SELECT 1 FROM monthly_settings WHERE id AND code_real_access_enabled)) THEN
  PERFORM monthly_code_audit('code_access_denied',c.id); RETURN jsonb_build_object('ok',false);
 END IF;
 IF p_action='logout' THEN
  UPDATE monthly_code_sessions SET revoked_at=now() WHERE digest=p_digest; result:=jsonb_build_object('ok',true);
 ELSIF p_action='archive' THEN
  SELECT jsonb_build_object('ok',true,'clients',coalesce((SELECT jsonb_agg(jsonb_build_object('id',cl.id,'display_name',cl.display_name,'slug',cl.slug,'package',cl.package) ORDER BY cl.display_name,cl.id) FROM monthly_clients cl JOIN monthly_code_scopes sc ON sc.client_id=cl.id WHERE sc.credential_id=c.id AND cl.status='active'),'[]'::jsonb),'reports',coalesce((SELECT jsonb_agg(jsonb_build_object('id',rv.id,'report_id',r.id,'client_id',r.client_id,'version',rv.version,'period_label',r.period_label,'period_start',r.period_start,'period_end',r.period_end,'dataset_sha256',rv.dataset_sha256) ORDER BY r.period_end DESC,r.period_start DESC,rv.version DESC,rv.id) FROM monthly_report_versions rv JOIN monthly_reports r ON r.id=rv.report_id JOIN monthly_clients cl ON cl.id=r.client_id JOIN monthly_code_scopes sc ON sc.client_id=r.client_id WHERE sc.credential_id=c.id AND rv.state='published' AND cl.status='active'),'[]'::jsonb)) INTO result;
 ELSIF p_action IN ('file','file_confirm') AND p_format IN ('html','pdf','content') THEN
  SELECT rv.* INTO v FROM monthly_report_versions rv JOIN monthly_reports r ON r.id=rv.report_id JOIN monthly_code_scopes sc ON sc.client_id=r.client_id JOIN monthly_clients cl ON cl.id=r.client_id WHERE rv.id=p_version AND sc.credential_id=c.id AND rv.state='published' AND cl.status='active' FOR SHARE OF rv;
  IF v.id IS NULL THEN PERFORM monthly_code_audit('code_file_denied',c.id); RETURN jsonb_build_object('ok',false); END IF;
  SELECT client_id INTO cid FROM monthly_reports WHERE id=v.report_id;
  path:=CASE p_format WHEN 'html' THEN v.html_path WHEN 'pdf' THEN v.pdf_path ELSE (SELECT base_path||'/content.json' FROM monthly_staging WHERE version_id=v.id AND state='committed') END;
  SELECT sums->>p_format INTO frozen FROM monthly_staging WHERE version_id=v.id AND state='committed';
  IF frozen IS NULL OR frozen !~ '^[a-f0-9]{64}$' OR (p_format='content' AND frozen IS DISTINCT FROM v.dataset_sha256) OR path IS NULL OR path NOT LIKE 'monthly/%' OR path LIKE '%..%' THEN
   PERFORM monthly_code_audit('code_file_denied',c.id); RETURN jsonb_build_object('ok',false);
  END IF;
  result:=jsonb_build_object('ok',true,'path',path,'sha256',frozen);
 ELSE PERFORM monthly_code_audit('code_action_denied',c.id); RETURN jsonb_build_object('ok',false);
 END IF;
 PERFORM monthly_code_audit('code_'||p_action,c.id,jsonb_build_object('version_id',p_version,'format',p_format)); RETURN result;
END $$;
CREATE OR REPLACE FUNCTION public.monthly_code_manage(p_action text,p_id uuid DEFAULT NULL,p_selector text DEFAULT NULL,p_salt text DEFAULT NULL,p_verifier text DEFAULT NULL,p_clients uuid[] DEFAULT NULL) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE cid uuid;
BEGIN
 PERFORM monthly_require_admin();
 IF p_action IN ('create_synthetic','create_real_staged') THEN
  IF p_action='create_real_staged' THEN
   PERFORM monthly_require_real_admin();
   IF p_clients IS NULL OR cardinality(p_clients) NOT BETWEEN 1 AND 3 OR EXISTS(SELECT 1 FROM unnest(p_clients) x LEFT JOIN monthly_clients mc ON mc.id=x WHERE mc.id IS NULL OR mc.slug ~ '^(test-|syn-)' OR mc.slug='rocklin-ca') THEN RAISE EXCEPTION 'Real scopes required'; END IF;
  ELSE
   IF p_clients IS NULL OR cardinality(p_clients) NOT BETWEEN 1 AND 3 OR EXISTS(SELECT 1 FROM unnest(p_clients) x LEFT JOIN monthly_clients mc ON mc.id=x WHERE mc.id IS NULL OR mc.slug !~ '^(test-|syn-)') THEN RAISE EXCEPTION 'Synthetic scopes required'; END IF;
  END IF;
  INSERT INTO monthly_code_credentials(selector,salt,verifier,created_by,synthetic,active)
  VALUES(p_selector,p_salt,p_verifier,auth.uid(),p_action='create_synthetic',p_action='create_synthetic') RETURNING id INTO cid;
  INSERT INTO monthly_code_scopes SELECT cid,x FROM unnest(p_clients) x;
 ELSE
  SELECT id INTO cid FROM monthly_code_credentials WHERE id=p_id FOR UPDATE;
  IF cid IS NULL THEN RAISE EXCEPTION 'Unknown credential'; END IF;
  IF EXISTS(SELECT 1 FROM monthly_code_credentials WHERE id=cid AND NOT synthetic) THEN PERFORM monthly_require_real_admin(); END IF;
  IF p_action='revoke' THEN UPDATE monthly_code_credentials SET active=false,generation=generation+1 WHERE id=cid;
  ELSIF p_action='rotate' THEN UPDATE monthly_code_credentials SET selector=p_selector,salt=p_salt,verifier=p_verifier,generation=generation+1,failures=0,locked_until=NULL,window_start=now() WHERE id=cid;
  ELSIF p_action='remove_scope' THEN DELETE FROM monthly_code_scopes WHERE credential_id=cid AND client_id=ANY(p_clients); UPDATE monthly_code_credentials SET generation=generation+1 WHERE id=cid;
  ELSIF p_action='unlock' THEN UPDATE monthly_code_credentials SET failures=0,locked_until=NULL,window_start=now() WHERE id=cid;
  ELSE RAISE EXCEPTION 'Invalid action'; END IF;
 END IF;
 INSERT INTO monthly_audit_log(actor,action,target_table,target_id,detail) VALUES(auth.uid(),'code_admin_'||p_action,'monthly_code_credentials',cid,jsonb_build_object('scope_count',cardinality(p_clients)));
 RETURN cid;
END $$;
-- Import scope is also enforced inside direct RPC transactions, not just the edge handler.
CREATE FUNCTION public.monthly_import_scope_guard() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 PERFORM monthly_require_admin();
 IF TG_TABLE_NAME='monthly_organizations' THEN
  IF NEW.name !~* '^(syn-|test-|synthetic)' THEN PERFORM monthly_require_real_admin(); END IF;
 ELSIF TG_TABLE_NAME='monthly_clients' THEN
  IF NEW.slug='rocklin-ca' THEN RAISE EXCEPTION 'Excluded location'; END IF;
  IF NEW.slug !~ '^(test-|syn-)' THEN PERFORM monthly_require_real_admin(); END IF;
 ELSIF TG_TABLE_NAME='monthly_reports' THEN PERFORM monthly_assert_import_client(NEW.client_id);
 ELSIF TG_TABLE_NAME='monthly_staging' THEN PERFORM monthly_assert_import_client(NEW.client_id);
 ELSIF TG_TABLE_NAME='monthly_report_versions' THEN
  PERFORM monthly_assert_import_client((SELECT client_id FROM monthly_reports WHERE id=NEW.report_id));
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.monthly_import_scope_guard() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER monthly_real_org_guard BEFORE INSERT OR UPDATE ON public.monthly_organizations FOR EACH ROW EXECUTE FUNCTION public.monthly_import_scope_guard();
CREATE TRIGGER monthly_real_client_guard BEFORE INSERT OR UPDATE ON public.monthly_clients FOR EACH ROW EXECUTE FUNCTION public.monthly_import_scope_guard();
CREATE TRIGGER monthly_real_report_guard BEFORE INSERT OR UPDATE ON public.monthly_reports FOR EACH ROW EXECUTE FUNCTION public.monthly_import_scope_guard();
CREATE TRIGGER monthly_real_stage_guard BEFORE INSERT OR UPDATE ON public.monthly_staging FOR EACH ROW EXECUTE FUNCTION public.monthly_import_scope_guard();
CREATE TRIGGER monthly_real_version_guard BEFORE INSERT OR UPDATE ON public.monthly_report_versions FOR EACH ROW EXECUTE FUNCTION public.monthly_import_scope_guard();
COMMENT ON COLUMN public.monthly_staff.synthetic IS 'Fail-closed identity classification. Existing staff default synthetic; only separately authorized human bootstrap may assign false. Never inferred from browser metadata.';