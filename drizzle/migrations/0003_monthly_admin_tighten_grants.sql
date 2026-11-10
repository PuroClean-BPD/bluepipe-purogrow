-- Deny-default: staging/provisioning are reachable only through audited admin RPCs.
REVOKE ALL ON public.monthly_staging, public.monthly_provisioning FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.monthly_require_admin() FROM authenticated;
