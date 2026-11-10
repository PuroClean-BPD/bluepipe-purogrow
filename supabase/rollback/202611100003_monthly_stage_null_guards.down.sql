-- Rollback of 0005: restores the 0004 function bodies (non-destructive; no data/storage/audit rows touched).
-- NOTE: restoring re-opens the NULL-lease commit hole; prefer forward fixes.
CREATE OR REPLACE FUNCTION public.monthly_admin_stage_acquire(p_request uuid,p_report uuid,p_sums jsonb,p_bytes jsonb,p_lease_seconds integer DEFAULT 120)
RETURNS TABLE(version integer,base_path text,state text,version_id uuid,lease uuid,sums jsonb,bytes jsonb)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE a uuid:=public.monthly_require_admin(); s public.monthly_staging; cid uuid; nv integer; fp text; tok uuid:=gen_random_uuid();
BEGIN
 IF NOT (p_sums ?& ARRAY['html','pdf','content'] AND p_bytes ?& ARRAY['html','pdf','content']) THEN RAISE EXCEPTION 'Invalid payload'; END IF;
 IF p_lease_seconds NOT BETWEEN 30 AND 600 THEN RAISE EXCEPTION 'Invalid lease'; END IF;
 fp:=public.monthly_stage_fingerprint(p_sums,p_bytes);
 SELECT * INTO s FROM public.monthly_staging x WHERE x.request_id=p_request FOR UPDATE;
 IF FOUND THEN
  IF s.report_id<>p_report OR s.created_by<>a THEN RAISE EXCEPTION 'Request id conflict' USING ERRCODE='42501'; END IF;
  IF s.fingerprint IS DISTINCT FROM fp THEN RAISE EXCEPTION 'Payload mismatch' USING ERRCODE='22023'; END IF;
  IF s.state<>'reserved' THEN RETURN QUERY SELECT s.version,s.base_path,s.state,s.version_id,NULL::uuid,s.sums,s.bytes; RETURN; END IF;
  IF s.lease_token IS NOT NULL AND s.lease_expires_at>now() THEN RAISE EXCEPTION 'Busy' USING ERRCODE='55P03'; END IF;
  UPDATE public.monthly_staging x SET lease_token=tok,lease_expires_at=now()+make_interval(secs=>p_lease_seconds),attempts=x.attempts+1 WHERE x.request_id=p_request RETURNING * INTO s;
  INSERT INTO public.monthly_audit_log(actor,action,target_table,target_id,client_id,detail) VALUES(a,'stage_lease','monthly_reports',s.report_id,s.client_id,jsonb_build_object('request_id',p_request,'attempt',s.attempts));
  RETURN QUERY SELECT s.version,s.base_path,s.state,s.version_id,tok,s.sums,s.bytes; RETURN;
 END IF;
 SELECT r.client_id INTO cid FROM public.monthly_reports r WHERE r.id=p_report FOR UPDATE;
 IF cid IS NULL THEN RAISE EXCEPTION 'Not found' USING ERRCODE='P0002'; END IF;
 SELECT GREATEST(COALESCE((SELECT max(v.version) FROM public.monthly_report_versions v WHERE v.report_id=p_report),0),COALESCE((SELECT max(x.version) FROM public.monthly_staging x WHERE x.report_id=p_report),0))+1 INTO nv;
 INSERT INTO public.monthly_staging(request_id,report_id,client_id,version,base_path,created_by,fingerprint,sums,bytes,lease_token,lease_expires_at,attempts)
  VALUES(p_request,p_report,cid,nv,'monthly/'||cid||'/'||p_report||'/v'||nv||'-'||p_request,a,fp,p_sums,p_bytes,tok,now()+make_interval(secs=>p_lease_seconds),1) RETURNING * INTO s;
 INSERT INTO public.monthly_audit_log(actor,action,target_table,target_id,client_id,detail) VALUES(a,'stage_reserved','monthly_reports',p_report,cid,jsonb_build_object('request_id',p_request,'version',nv,'sha256',p_sums,'bytes',p_bytes));
 RETURN QUERY SELECT s.version,s.base_path,s.state,s.version_id,tok,s.sums,s.bytes;
END $$;
CREATE OR REPLACE FUNCTION public.monthly_admin_stage_commit(p_request uuid,p_lease uuid,p_dataset jsonb,p_notes text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE a uuid:=public.monthly_require_admin(); s public.monthly_staging; vid uuid;
BEGIN
 SELECT * INTO s FROM public.monthly_staging x WHERE x.request_id=p_request FOR UPDATE;
 IF NOT FOUND OR s.created_by<>a THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
 IF s.state='committed' THEN RETURN s.version_id; END IF;
 IF s.state<>'reserved' OR s.lease_token IS DISTINCT FROM p_lease OR s.lease_expires_at<=now() THEN RAISE EXCEPTION 'Lease lost' USING ERRCODE='55P03'; END IF;
 INSERT INTO public.monthly_report_versions(report_id,version,state,dataset,dataset_sha256,html_path,pdf_path,created_by,notes)
  VALUES(s.report_id,s.version,'draft',p_dataset,s.sums->>'content',s.base_path||'/report.html',s.base_path||'/report.pdf',a,p_notes) RETURNING id INTO vid;
 UPDATE public.monthly_staging x SET state='committed',version_id=vid,lease_token=NULL,lease_expires_at=NULL WHERE x.request_id=p_request;
 INSERT INTO public.monthly_audit_log(actor,action,target_table,target_id,client_id,detail) VALUES(a,'stage_version','monthly_report_versions',vid,s.client_id,jsonb_build_object('request_id',p_request,'version',s.version,'sha256',s.sums,'bytes',s.bytes,'attempt',s.attempts));
 RETURN vid;
END $$;
CREATE OR REPLACE FUNCTION public.monthly_admin_stage_release(p_request uuid,p_lease uuid,p_reason text,p_fatal boolean,p_orphans jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE a uuid:=public.monthly_require_admin(); s public.monthly_staging;
BEGIN
 SELECT * INTO s FROM public.monthly_staging x WHERE x.request_id=p_request FOR UPDATE;
 IF NOT FOUND OR s.created_by<>a OR s.state<>'reserved' OR s.lease_token IS DISTINCT FROM p_lease THEN RETURN false; END IF;
 UPDATE public.monthly_staging x SET lease_token=NULL,lease_expires_at=NULL,state=CASE WHEN p_fatal THEN 'failed' ELSE 'reserved' END,failure=left(p_reason,200) WHERE x.request_id=p_request;
 INSERT INTO public.monthly_audit_log(actor,action,target_table,target_id,client_id,detail) VALUES(a,CASE WHEN p_fatal THEN 'stage_failed' ELSE 'stage_attempt_failed' END,'monthly_reports',s.report_id,s.client_id,jsonb_build_object('request_id',p_request,'reason',left(p_reason,200),'orphan_candidates',COALESCE(p_orphans,'[]'::jsonb),'attempt',s.attempts));
 RETURN true;
END $$;
DROP FUNCTION IF EXISTS public.monthly_stage_payload_ok(jsonb,jsonb);
