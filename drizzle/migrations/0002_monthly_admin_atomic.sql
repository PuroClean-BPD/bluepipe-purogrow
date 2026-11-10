-- Atomic, audited admin mutations for monthly portal. Additive only.
-- Each RPC checks the genuine caller (auth.uid()) is a monthly admin and writes its audit row in the
-- same transaction as the mutation: if the audit insert fails, the mutation rolls back.
CREATE TABLE public.monthly_staging(
 request_id uuid PRIMARY KEY,
 report_id uuid NOT NULL REFERENCES public.monthly_reports(id),
 client_id uuid NOT NULL REFERENCES public.monthly_clients(id),
 version integer NOT NULL CHECK(version>0),
 base_path text NOT NULL UNIQUE CHECK(base_path ~ '^monthly/[0-9a-f-]{36}/[0-9a-f-]{36}/v[0-9]+-[0-9a-f-]{36}$'),
 state text NOT NULL DEFAULT 'reserved' CHECK(state IN ('reserved','committed','failed')),
 created_by uuid NOT NULL,
 version_id uuid REFERENCES public.monthly_report_versions(id),
 failure text,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(report_id,version));
GRANT ALL ON public.monthly_staging TO service_role;
ALTER TABLE public.monthly_staging ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_staging FORCE ROW LEVEL SECURITY;

CREATE TABLE public.monthly_provisioning(
 request_id uuid PRIMARY KEY,
 email text NOT NULL CHECK(email=lower(email)),
 state text NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','created','failed')),
 user_id uuid,
 created_by uuid NOT NULL,
 failure text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.monthly_provisioning TO service_role;
ALTER TABLE public.monthly_provisioning ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_provisioning FORCE ROW LEVEL SECURITY;

CREATE FUNCTION public.monthly_require_admin() RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 IF auth.uid() IS NULL OR public.monthly_staff_role() IS DISTINCT FROM 'admin' THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
 RETURN auth.uid();
END $$;

CREATE FUNCTION public.monthly_admin_create_org(p_name text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE a uuid:=public.monthly_require_admin(); oid uuid;
BEGIN
 INSERT INTO public.monthly_organizations(name) VALUES(p_name) RETURNING id INTO oid;
 INSERT INTO public.monthly_audit_log(actor,action,target_table,target_id,detail) VALUES(a,'create_org','monthly_organizations',oid,jsonb_build_object('name',p_name));
 RETURN oid;
END $$;

CREATE FUNCTION public.monthly_admin_create_client(p_org uuid,p_slug text,p_display text,p_package text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE a uuid:=public.monthly_require_admin(); cid uuid;
BEGIN
 INSERT INTO public.monthly_clients(org_id,slug,display_name,package) VALUES(p_org,p_slug,p_display,p_package) RETURNING id INTO cid;
 INSERT INTO public.monthly_audit_log(actor,action,target_table,target_id,client_id,detail) VALUES(a,'create_client','monthly_clients',cid,cid,jsonb_build_object('slug',p_slug));
 RETURN cid;
END $$;

CREATE FUNCTION public.monthly_admin_create_report(p_client uuid,p_start timestamptz,p_end timestamptz,p_label text,p_kind text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE a uuid:=public.monthly_require_admin(); rid uuid;
BEGIN
 IF p_end<=p_start OR p_kind NOT IN ('monthly','special') THEN RAISE EXCEPTION 'Invalid report'; END IF;
 INSERT INTO public.monthly_reports(client_id,period_start,period_end,period_label,kind) VALUES(p_client,p_start,p_end,p_label,p_kind) RETURNING id INTO rid;
 INSERT INTO public.monthly_audit_log(actor,action,target_table,target_id,client_id,detail) VALUES(a,'create_report','monthly_reports',rid,p_client,jsonb_build_object('period_label',p_label));
 RETURN rid;
END $$;

-- Atomic version allocation: the report row lock serializes concurrent reservations.
-- Idempotent per request_id; paths embed the request_id so no two requests share objects.
CREATE FUNCTION public.monthly_admin_reserve_version(p_request uuid,p_report uuid) RETURNS TABLE(version integer,base_path text,state text,version_id uuid) LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE a uuid:=public.monthly_require_admin(); s public.monthly_staging; cid uuid; nv integer;
BEGIN
 SELECT * INTO s FROM public.monthly_staging x WHERE x.request_id=p_request;
 IF FOUND THEN
  IF s.report_id<>p_report OR s.created_by<>a THEN RAISE EXCEPTION 'Request id conflict' USING ERRCODE='42501'; END IF;
  RETURN QUERY SELECT s.version,s.base_path,s.state,s.version_id; RETURN;
 END IF;
 SELECT r.client_id INTO cid FROM public.monthly_reports r WHERE r.id=p_report FOR UPDATE;
 IF cid IS NULL THEN RAISE EXCEPTION 'Not found' USING ERRCODE='P0002'; END IF;
 SELECT GREATEST(COALESCE((SELECT max(v.version) FROM public.monthly_report_versions v WHERE v.report_id=p_report),0),COALESCE((SELECT max(x.version) FROM public.monthly_staging x WHERE x.report_id=p_report),0))+1 INTO nv;
 INSERT INTO public.monthly_staging(request_id,report_id,client_id,version,base_path,created_by)
  VALUES(p_request,p_report,cid,nv,'monthly/'||cid||'/'||p_report||'/v'||nv||'-'||p_request,a) RETURNING * INTO s;
 INSERT INTO public.monthly_audit_log(actor,action,target_table,target_id,client_id,detail) VALUES(a,'stage_reserved','monthly_reports',p_report,cid,jsonb_build_object('request_id',p_request,'version',nv));
 RETURN QUERY SELECT s.version,s.base_path,s.state,s.version_id;
END $$;

CREATE FUNCTION public.monthly_admin_commit_version(p_request uuid,p_dataset jsonb,p_sha text,p_detail jsonb,p_notes text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE a uuid:=public.monthly_require_admin(); s public.monthly_staging; vid uuid;
BEGIN
 SELECT * INTO s FROM public.monthly_staging x WHERE x.request_id=p_request FOR UPDATE;
 IF NOT FOUND OR s.created_by<>a THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
 IF s.state='committed' THEN RETURN s.version_id; END IF;
 IF s.state<>'reserved' THEN RAISE EXCEPTION 'Staging not reserved'; END IF;
 INSERT INTO public.monthly_report_versions(report_id,version,state,dataset,dataset_sha256,html_path,pdf_path,created_by,notes)
  VALUES(s.report_id,s.version,'draft',p_dataset,p_sha,s.base_path||'/report.html',s.base_path||'/report.pdf',a,p_notes) RETURNING id INTO vid;
 UPDATE public.monthly_staging x SET state='committed',version_id=vid WHERE x.request_id=p_request;
 INSERT INTO public.monthly_audit_log(actor,action,target_table,target_id,client_id,detail) VALUES(a,'stage_version','monthly_report_versions',vid,s.client_id,COALESCE(p_detail,'{}'::jsonb)||jsonb_build_object('request_id',p_request,'version',s.version));
 RETURN vid;
END $$;

CREATE FUNCTION public.monthly_admin_fail_staging(p_request uuid,p_reason text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE a uuid:=public.monthly_require_admin(); s public.monthly_staging;
BEGIN
 SELECT * INTO s FROM public.monthly_staging x WHERE x.request_id=p_request FOR UPDATE;
 IF NOT FOUND OR s.created_by<>a OR s.state<>'reserved' THEN RETURN; END IF;
 UPDATE public.monthly_staging x SET state='failed',failure=left(p_reason,200) WHERE x.request_id=p_request;
 INSERT INTO public.monthly_audit_log(actor,action,target_table,target_id,client_id,detail) VALUES(a,'stage_failed','monthly_reports',s.report_id,s.client_id,jsonb_build_object('request_id',p_request,'reason',left(p_reason,200)));
END $$;

-- Durable intent is audited BEFORE the Auth Admin call (outside the DB transaction).
-- A pending row without completion is the audited recovery state; nothing is silently unlogged.
CREATE FUNCTION public.monthly_admin_provision_begin(p_request uuid,p_email text) RETURNS TABLE(state text,user_id uuid) LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE a uuid:=public.monthly_require_admin(); p public.monthly_provisioning;
BEGIN
 SELECT * INTO p FROM public.monthly_provisioning m WHERE m.request_id=p_request;
 IF FOUND THEN
  IF p.email<>lower(p_email) OR p.created_by<>a THEN RAISE EXCEPTION 'Request id conflict' USING ERRCODE='42501'; END IF;
  RETURN QUERY SELECT p.state,p.user_id; RETURN;
 END IF;
 INSERT INTO public.monthly_provisioning(request_id,email,created_by) VALUES(p_request,lower(p_email),a);
 INSERT INTO public.monthly_audit_log(actor,action,target_table,target_id,detail) VALUES(a,'provision_intent','monthly_provisioning',p_request,jsonb_build_object('email_domain',split_part(lower(p_email),'@',2)));
 RETURN QUERY SELECT 'pending'::text,NULL::uuid;
END $$;

CREATE FUNCTION public.monthly_admin_provision_finish(p_request uuid,p_user uuid,p_failure text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE a uuid:=public.monthly_require_admin(); p public.monthly_provisioning;
BEGIN
 SELECT * INTO p FROM public.monthly_provisioning m WHERE m.request_id=p_request FOR UPDATE;
 IF NOT FOUND OR p.created_by<>a THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
 IF p.state<>'pending' THEN RETURN; END IF;
 UPDATE public.monthly_provisioning m SET state=CASE WHEN p_user IS NULL THEN 'failed' ELSE 'created' END,user_id=p_user,failure=left(p_failure,200),updated_at=now() WHERE m.request_id=p_request;
 INSERT INTO public.monthly_audit_log(actor,action,target_table,target_id,detail) VALUES(a,CASE WHEN p_user IS NULL THEN 'provision_failed' ELSE 'provision_owner' END,'monthly_provisioning',p_request,jsonb_build_object('user_id',p_user,'reason',left(p_failure,200)));
END $$;

REVOKE ALL ON FUNCTION public.monthly_require_admin(),public.monthly_admin_create_org(text),public.monthly_admin_create_client(uuid,text,text,text),public.monthly_admin_create_report(uuid,timestamptz,timestamptz,text,text),public.monthly_admin_reserve_version(uuid,uuid),public.monthly_admin_commit_version(uuid,jsonb,text,jsonb,text),public.monthly_admin_fail_staging(uuid,text),public.monthly_admin_provision_begin(uuid,text),public.monthly_admin_provision_finish(uuid,uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.monthly_admin_create_org(text),public.monthly_admin_create_client(uuid,text,text,text),public.monthly_admin_create_report(uuid,timestamptz,timestamptz,text,text),public.monthly_admin_reserve_version(uuid,uuid),public.monthly_admin_commit_version(uuid,jsonb,text,jsonb,text),public.monthly_admin_fail_staging(uuid,text),public.monthly_admin_provision_begin(uuid,text),public.monthly_admin_provision_finish(uuid,uuid,text) TO authenticated;
