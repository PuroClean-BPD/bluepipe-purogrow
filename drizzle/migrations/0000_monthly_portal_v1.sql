-- Additive monthly portal v1; no legacy schema or auth setting changes.
CREATE TABLE public.monthly_organizations(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
REVOKE ALL ON public.monthly_organizations FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.monthly_organizations TO authenticated;
GRANT ALL ON public.monthly_organizations TO service_role;
ALTER TABLE public.monthly_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_organizations FORCE ROW LEVEL SECURITY;
CREATE TABLE public.monthly_clients(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid NOT NULL REFERENCES public.monthly_organizations(id), slug text UNIQUE NOT NULL, display_name text NOT NULL, package text, status text NOT NULL DEFAULT 'active', created_at timestamptz NOT NULL DEFAULT now());
REVOKE ALL ON public.monthly_clients FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.monthly_clients TO authenticated;
GRANT ALL ON public.monthly_clients TO service_role;
ALTER TABLE public.monthly_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_clients FORCE ROW LEVEL SECURITY;
CREATE TABLE public.monthly_memberships(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, client_id uuid NOT NULL REFERENCES public.monthly_clients(id), role text NOT NULL CHECK(role IN ('client_viewer','client_manager')), granted_by uuid NOT NULL, grant_source text NOT NULL, granted_at timestamptz NOT NULL DEFAULT now(), revoked_at timestamptz);
REVOKE ALL ON public.monthly_memberships FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.monthly_memberships TO authenticated;
GRANT ALL ON public.monthly_memberships TO service_role;
ALTER TABLE public.monthly_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_memberships FORCE ROW LEVEL SECURITY;
CREATE TABLE public.monthly_staff(user_id uuid PRIMARY KEY, role text NOT NULL CHECK(role IN ('admin','approver','editor')));
REVOKE ALL ON public.monthly_staff FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.monthly_staff TO authenticated;
GRANT ALL ON public.monthly_staff TO service_role;
ALTER TABLE public.monthly_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_staff FORCE ROW LEVEL SECURITY;
CREATE TABLE public.monthly_reports(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), client_id uuid NOT NULL REFERENCES public.monthly_clients(id), period_start timestamptz NOT NULL, period_end timestamptz NOT NULL, period_label text NOT NULL, kind text NOT NULL CHECK(kind IN ('monthly','special')), created_at timestamptz NOT NULL DEFAULT now());
REVOKE ALL ON public.monthly_reports FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.monthly_reports TO authenticated;
GRANT ALL ON public.monthly_reports TO service_role;
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_reports FORCE ROW LEVEL SECURITY;
CREATE TABLE public.monthly_report_versions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), report_id uuid NOT NULL REFERENCES public.monthly_reports(id), version integer NOT NULL CHECK(version>0), state text NOT NULL DEFAULT 'draft' CHECK(state IN ('draft','approved','published','withdrawn')), dataset_sha256 text NOT NULL CHECK(dataset_sha256 ~ '^[0-9a-f]{64}$'), dataset jsonb NOT NULL, html_path text NOT NULL UNIQUE, pdf_path text NOT NULL UNIQUE, created_by uuid NOT NULL, approved_by uuid, approved_at timestamptz, published_by uuid, published_at timestamptz, notes text, UNIQUE(report_id,version));
REVOKE ALL ON public.monthly_report_versions FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.monthly_report_versions TO authenticated;
GRANT ALL ON public.monthly_report_versions TO service_role;
ALTER TABLE public.monthly_report_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_report_versions FORCE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX monthly_one_published ON public.monthly_report_versions(report_id) WHERE state='published';
CREATE TABLE public.monthly_audit_log(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), at timestamptz NOT NULL DEFAULT now(), actor uuid, action text NOT NULL, target_table text NOT NULL, target_id uuid, client_id uuid, detail jsonb NOT NULL DEFAULT '{}', ip inet);
REVOKE ALL ON public.monthly_audit_log FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.monthly_audit_log TO authenticated;
GRANT ALL ON public.monthly_audit_log TO service_role;
ALTER TABLE public.monthly_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_audit_log FORCE ROW LEVEL SECURITY;
CREATE TABLE public.monthly_settings(id boolean PRIMARY KEY DEFAULT true CHECK(id), auth_sending_enabled boolean NOT NULL DEFAULT false);
REVOKE ALL ON public.monthly_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.monthly_settings TO authenticated;
GRANT ALL ON public.monthly_settings TO service_role;
ALTER TABLE public.monthly_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_settings FORCE ROW LEVEL SECURITY;

CREATE FUNCTION public.monthly_staff_role() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$ SELECT role FROM public.monthly_staff WHERE user_id=auth.uid() $$;
CREATE FUNCTION public.monthly_can_client(cid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$ SELECT EXISTS(SELECT 1 FROM public.monthly_memberships WHERE user_id=auth.uid() AND client_id=cid AND revoked_at IS NULL) $$;
CREATE FUNCTION public.monthly_can_version(vid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$ SELECT EXISTS(SELECT 1 FROM public.monthly_report_versions v JOIN public.monthly_reports r ON r.id=v.report_id WHERE v.id=vid AND (public.monthly_staff_role() IS NOT NULL OR (v.state='published' AND public.monthly_can_client(r.client_id)))) $$;
REVOKE ALL ON FUNCTION public.monthly_staff_role(),public.monthly_can_client(uuid),public.monthly_can_version(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.monthly_staff_role(),public.monthly_can_client(uuid),public.monthly_can_version(uuid) TO authenticated,service_role;
CREATE POLICY monthly_org_select ON public.monthly_organizations FOR SELECT TO authenticated USING(public.monthly_staff_role() IS NOT NULL OR EXISTS(SELECT 1 FROM public.monthly_clients c WHERE c.org_id=id AND public.monthly_can_client(c.id)));
CREATE POLICY monthly_client_select ON public.monthly_clients FOR SELECT TO authenticated USING(public.monthly_staff_role() IS NOT NULL OR public.monthly_can_client(id));
CREATE POLICY monthly_membership_select ON public.monthly_memberships FOR SELECT TO authenticated USING(public.monthly_staff_role() IS NOT NULL OR (user_id=auth.uid() AND revoked_at IS NULL));
CREATE POLICY monthly_staff_select ON public.monthly_staff FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY monthly_report_select ON public.monthly_reports FOR SELECT TO authenticated USING(public.monthly_staff_role() IS NOT NULL OR (public.monthly_can_client(client_id) AND EXISTS(SELECT 1 FROM public.monthly_report_versions v WHERE v.report_id=id AND v.state='published')));
CREATE POLICY monthly_version_select ON public.monthly_report_versions FOR SELECT TO authenticated USING(public.monthly_can_version(id));
CREATE POLICY monthly_log_select ON public.monthly_audit_log FOR SELECT TO authenticated USING(public.monthly_staff_role()='admin');
-- No settings policy: only trusted server may read/change the flag.
CREATE FUNCTION public.monthly_transition(vid uuid, next_state text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v public.monthly_report_versions; cid uuid; sr text;
BEGIN
 sr:=public.monthly_staff_role();
 IF sr IS NULL OR sr='editor' THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
 SELECT * INTO v FROM public.monthly_report_versions WHERE id=vid FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
 SELECT client_id INTO cid FROM public.monthly_reports WHERE id=v.report_id;
 IF NOT ((v.state='draft' AND next_state='approved' AND sr IN ('approver','admin')) OR (v.state='approved' AND next_state='published' AND sr='admin') OR (v.state='published' AND next_state='withdrawn' AND sr='admin')) THEN RAISE EXCEPTION 'Forbidden transition' USING ERRCODE='42501'; END IF;
 UPDATE public.monthly_report_versions SET state=next_state,approved_by=CASE WHEN next_state='approved' THEN auth.uid() ELSE approved_by END,approved_at=CASE WHEN next_state='approved' THEN now() ELSE approved_at END,published_by=CASE WHEN next_state='published' THEN auth.uid() ELSE published_by END,published_at=CASE WHEN next_state='published' THEN now() ELSE published_at END WHERE id=vid;
 INSERT INTO public.monthly_audit_log(actor,action,target_table,target_id,client_id,detail) VALUES(auth.uid(),next_state,'monthly_report_versions',vid,cid,jsonb_build_object('from',v.state,'to',next_state));
END $$;
CREATE FUNCTION public.monthly_grant(uid uuid,cid uuid,mrole text,source text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE mid uuid;
BEGIN
 IF public.monthly_staff_role() IS DISTINCT FROM 'admin' THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
 IF source IS NULL OR length(trim(source))=0 OR mrole NOT IN ('client_viewer','client_manager') THEN RAISE EXCEPTION 'Invalid grant'; END IF;
 INSERT INTO public.monthly_memberships(user_id,client_id,role,granted_by,grant_source) VALUES(uid,cid,mrole,auth.uid(),source) RETURNING id INTO mid;
 INSERT INTO public.monthly_audit_log(actor,action,target_table,target_id,client_id,detail) VALUES(auth.uid(),'grant','monthly_memberships',mid,cid,jsonb_build_object('user_id',uid,'source',source));
 RETURN mid;
END $$;
CREATE FUNCTION public.monthly_revoke(mid uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE cid uuid;
BEGIN
 IF public.monthly_staff_role() IS DISTINCT FROM 'admin' THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
 UPDATE public.monthly_memberships SET revoked_at=now() WHERE id=mid AND revoked_at IS NULL RETURNING client_id INTO cid;
 IF cid IS NULL THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
 INSERT INTO public.monthly_audit_log(actor,action,target_table,target_id,client_id) VALUES(auth.uid(),'revoke','monthly_memberships',mid,cid);
END $$;
REVOKE ALL ON FUNCTION public.monthly_transition(uuid,text),public.monthly_grant(uuid,uuid,text,text),public.monthly_revoke(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.monthly_transition(uuid,text),public.monthly_grant(uuid,uuid,text,text),public.monthly_revoke(uuid) TO authenticated,service_role;
CREATE FUNCTION public.monthly_immutable_version() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$ BEGIN
 IF NEW.report_id IS DISTINCT FROM OLD.report_id OR NEW.version IS DISTINCT FROM OLD.version OR NEW.dataset IS DISTINCT FROM OLD.dataset OR NEW.dataset_sha256 IS DISTINCT FROM OLD.dataset_sha256 OR NEW.html_path IS DISTINCT FROM OLD.html_path OR NEW.pdf_path IS DISTINCT FROM OLD.pdf_path THEN RAISE EXCEPTION 'Create a new report version'; END IF; RETURN NEW;
END $$;
CREATE TRIGGER monthly_frozen_version BEFORE UPDATE ON public.monthly_report_versions FOR EACH ROW EXECUTE FUNCTION public.monthly_immutable_version();
CREATE FUNCTION public.monthly_log_immutable() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$ BEGIN RAISE EXCEPTION 'Audit log is append-only'; END $$;
CREATE TRIGGER monthly_log_immutable BEFORE UPDATE OR DELETE ON public.monthly_audit_log FOR EACH ROW EXECUTE FUNCTION public.monthly_log_immutable();
REVOKE ALL ON FUNCTION public.monthly_immutable_version(),public.monthly_log_immutable() FROM PUBLIC,anon,authenticated;
-- Restrictive storage policy future-proofs against broader legacy storage policies.
CREATE POLICY monthly_storage_deny ON storage.objects AS RESTRICTIVE FOR ALL TO anon,authenticated USING(bucket_id<>'reports-private') WITH CHECK(bucket_id<>'reports-private');
