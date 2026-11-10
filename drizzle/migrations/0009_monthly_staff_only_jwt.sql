-- Retire monthly owner membership authority without deleting records.
CREATE OR REPLACE FUNCTION public.monthly_can_client(cid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT public.monthly_staff_role() IN ('admin','approver','editor')
   AND EXISTS(SELECT 1 FROM public.monthly_clients WHERE id=cid)
$$;
CREATE OR REPLACE FUNCTION public.monthly_can_version(vid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT public.monthly_staff_role() IN ('admin','approver','editor')
   AND EXISTS(SELECT 1 FROM public.monthly_report_versions WHERE id=vid)
$$;
ALTER POLICY monthly_org_select ON public.monthly_organizations USING (public.monthly_staff_role() IN ('admin','approver','editor'));
ALTER POLICY monthly_client_select ON public.monthly_clients USING (public.monthly_staff_role() IN ('admin','approver','editor'));
ALTER POLICY monthly_report_select ON public.monthly_reports USING (public.monthly_staff_role() IN ('admin','approver','editor'));
ALTER POLICY monthly_version_select ON public.monthly_report_versions USING (public.monthly_can_version(id));
ALTER POLICY monthly_membership_select ON public.monthly_memberships USING (public.monthly_staff_role() IN ('admin','approver','editor'));
COMMENT ON TABLE public.monthly_memberships IS 'Retained historical monthly grants; retired as owner JWT authority. Code scopes alone authorize owners. Do not restore membership policies during frontend rollback.';
-- Permit only existing state-machine transitions on UPDATE; imports remain admin gated.
CREATE OR REPLACE FUNCTION public.monthly_import_scope_guard() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE sr text:=public.monthly_staff_role(); cid uuid;
BEGIN
 IF TG_TABLE_NAME='monthly_report_versions' AND TG_OP='UPDATE' THEN
  IF (NEW.report_id=OLD.report_id AND NEW.version=OLD.version
      AND NEW.dataset=OLD.dataset AND NEW.dataset_sha256=OLD.dataset_sha256
      AND NEW.html_path=OLD.html_path AND NEW.pdf_path=OLD.pdf_path
      AND NEW.created_by=OLD.created_by AND NEW.notes IS NOT DISTINCT FROM OLD.notes
      AND ((OLD.state='draft' AND NEW.state='approved' AND sr IN ('admin','approver'))
        OR (OLD.state='approved' AND NEW.state='published' AND sr='admin')
        OR (OLD.state='published' AND NEW.state='withdrawn' AND sr='admin'))) IS NOT TRUE THEN
   RAISE EXCEPTION 'Forbidden transition' USING ERRCODE='42501';
  END IF;
  SELECT client_id INTO cid FROM monthly_reports WHERE id=NEW.report_id;
  IF NOT EXISTS(SELECT 1 FROM monthly_clients WHERE id=cid AND slug ~ '^(test-|syn-)')
     AND NOT EXISTS(SELECT 1 FROM monthly_staff WHERE user_id=auth.uid() AND synthetic=false AND role IN ('admin','approver')) THEN
   RAISE EXCEPTION 'Real staff required' USING ERRCODE='42501';
  END IF;
  RETURN NEW;
 END IF;
 PERFORM monthly_require_admin();
 IF TG_TABLE_NAME='monthly_organizations' THEN
  IF NEW.name !~* '^(syn-|test-|synthetic)' THEN PERFORM monthly_require_real_admin(); END IF;
 ELSIF TG_TABLE_NAME='monthly_clients' THEN
  IF NEW.slug='rocklin-ca' THEN RAISE EXCEPTION 'Excluded location'; END IF;
  IF NEW.slug !~ '^(test-|syn-)' THEN PERFORM monthly_require_real_admin(); END IF;
 ELSIF TG_TABLE_NAME IN ('monthly_reports','monthly_staging') THEN PERFORM monthly_assert_import_client(NEW.client_id);
 ELSIF TG_TABLE_NAME='monthly_report_versions' THEN
  PERFORM monthly_assert_import_client((SELECT client_id FROM monthly_reports WHERE id=NEW.report_id));
 END IF;
 RETURN NEW;
END $$;