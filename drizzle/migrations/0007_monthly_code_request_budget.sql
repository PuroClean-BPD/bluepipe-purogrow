CREATE TABLE public.monthly_code_request_budget(id boolean PRIMARY KEY DEFAULT true CHECK(id), window_start timestamptz NOT NULL DEFAULT now(), used integer NOT NULL DEFAULT 0);
REVOKE ALL ON public.monthly_code_request_budget FROM PUBLIC,anon,authenticated; GRANT ALL ON public.monthly_code_request_budget TO service_role; ALTER TABLE public.monthly_code_request_budget ENABLE ROW LEVEL SECURITY; ALTER TABLE public.monthly_code_request_budget FORCE ROW LEVEL SECURITY;
CREATE FUNCTION public.monthly_code_request_gate() RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE b monthly_code_request_budget;
BEGIN
 INSERT INTO monthly_code_request_budget(id) VALUES(true) ON CONFLICT DO NOTHING;
 SELECT * INTO b FROM monthly_code_request_budget WHERE id FOR UPDATE;
 IF b.window_start<=now()-interval '1 minute' THEN UPDATE monthly_code_request_budget SET used=0,window_start=now() WHERE id; b.used:=0; END IF;
 IF b.used>=600 THEN PERFORM monthly_code_audit('code_request_limited'); RETURN false; END IF;
 UPDATE monthly_code_request_budget SET used=used+1 WHERE id;
 PERFORM monthly_code_audit('code_request_received'); RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.monthly_code_request_gate() FROM PUBLIC,anon,authenticated; GRANT EXECUTE ON FUNCTION public.monthly_code_request_gate() TO service_role;