-- Non-destructive shutdown only; retain all data, auth users, audit records and storage.
REVOKE ALL ON public.monthly_organizations FROM anon,authenticated;
REVOKE ALL ON public.monthly_clients FROM anon,authenticated;
REVOKE ALL ON public.monthly_memberships FROM anon,authenticated;
REVOKE ALL ON public.monthly_staff FROM anon,authenticated;
REVOKE ALL ON public.monthly_reports FROM anon,authenticated;
REVOKE ALL ON public.monthly_report_versions FROM anon,authenticated;
REVOKE ALL ON public.monthly_audit_log FROM anon,authenticated;
REVOKE ALL ON public.monthly_settings FROM anon,authenticated;
REVOKE ALL ON FUNCTION public.monthly_staff_role(),public.monthly_can_client(uuid),public.monthly_can_version(uuid),public.monthly_transition(uuid,text),public.monthly_grant(uuid,uuid,text,text),public.monthly_revoke(uuid) FROM anon,authenticated;
