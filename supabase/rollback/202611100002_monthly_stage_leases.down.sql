-- Non-destructive rollback: revoke leased staging RPCs. Columns, staging rows, objects, audit retained.
REVOKE EXECUTE ON FUNCTION public.monthly_admin_stage_acquire(uuid,uuid,jsonb,jsonb,integer),public.monthly_admin_stage_commit(uuid,uuid,jsonb,text),public.monthly_admin_stage_release(uuid,uuid,text,boolean,jsonb) FROM authenticated;
