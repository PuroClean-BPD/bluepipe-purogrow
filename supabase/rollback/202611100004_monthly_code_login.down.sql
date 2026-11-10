-- Non-destructive rollback: disables code authority while retaining credentials, sessions and audit rows.
REVOKE EXECUTE ON FUNCTION public.monthly_code_begin(text),public.monthly_code_finish(uuid,boolean,text),public.monthly_code_access(text,text,uuid,text),public.monthly_code_request_gate() FROM service_role;
REVOKE EXECUTE ON FUNCTION public.monthly_code_manage(text,uuid,text,text,text,uuid[]) FROM authenticated;
UPDATE public.monthly_settings SET code_real_access_enabled=false WHERE id;
