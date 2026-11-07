-- Do not restore the erroneous correlated policy scope. Safe rollback is to disable new access.
REVOKE ALL ON public.monthly_organizations,public.monthly_reports FROM anon,authenticated;