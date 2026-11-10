-- Protected, non-deleting staff revocation honored by every authority check.
ALTER TABLE public.monthly_staff ADD COLUMN IF NOT EXISTS revoked_at timestamptz;
ALTER TABLE public.monthly_staff ADD COLUMN IF NOT EXISTS revoked_by uuid;
COMMENT ON COLUMN public.monthly_staff.revoked_at IS 'Non-deleting revocation. Set only by monthly_revoke_synthetic_staff (genuine real admin). A revoked row grants no authority.';

CREATE OR REPLACE FUNCTION public.monthly_staff_role() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
  SELECT role FROM public.monthly_staff WHERE user_id = auth.uid() AND revoked_at IS NULL
$$;

CREATE OR REPLACE FUNCTION public.monthly_require_real_admin() RETURNS uuid
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE a uuid := monthly_require_admin();
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM monthly_staff
    WHERE user_id = a AND role = 'admin' AND synthetic = false AND revoked_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Real staff required' USING ERRCODE = '42501';
  END IF;
  RETURN a;
END $$;
REVOKE ALL ON FUNCTION public.monthly_require_real_admin() FROM PUBLIC, anon, authenticated;

-- Only a genuine real admin may revoke, only reserved synthetic fixture identities, update + audit in one transaction.
CREATE OR REPLACE FUNCTION public.monthly_revoke_synthetic_staff(p_user uuid, p_reason text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE
  actor uuid := monthly_require_real_admin();
  s public.monthly_staff;
BEGIN
  IF p_user IS NULL OR p_reason IS NULL OR length(p_reason) NOT BETWEEN 3 AND 200 THEN
    RAISE EXCEPTION 'Invalid input' USING ERRCODE = '22023';
  END IF;
  IF p_user = actor THEN RAISE EXCEPTION 'Cannot revoke self' USING ERRCODE = '42501'; END IF;
  SELECT * INTO s FROM monthly_staff WHERE user_id = p_user FOR UPDATE;
  IF s.user_id IS NULL OR s.synthetic IS NOT TRUE OR s.revoked_at IS NOT NULL THEN
    RAISE EXCEPTION 'Not an active synthetic staff fixture' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = p_user
      AND u.email ~ '^bluepipe-monthly-[0-9a-f]{32}-[a-z0-9-]+@example\.invalid$'
  ) THEN
    RAISE EXCEPTION 'Not a reserved fixture identity' USING ERRCODE = '42501';
  END IF;
  UPDATE monthly_staff SET revoked_at = now(), revoked_by = actor WHERE user_id = p_user;
  INSERT INTO monthly_audit_log(actor, action, target_table, target_id, detail)
  VALUES (actor, 'staff_revoke_synthetic', 'monthly_staff', p_user,
          jsonb_build_object('role_before', s.role, 'reason', p_reason));
END $$;
REVOKE ALL ON FUNCTION public.monthly_revoke_synthetic_staff(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.monthly_revoke_synthetic_staff(uuid, text) TO authenticated;

-- Same signature; audit now keeps exact requested/before/after scope UUIDs plus generation/active state.
CREATE OR REPLACE FUNCTION public.monthly_code_manage(p_action text, p_id uuid DEFAULT NULL, p_selector text DEFAULT NULL, p_salt text DEFAULT NULL, p_verifier text DEFAULT NULL, p_clients uuid[] DEFAULT NULL) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE
  cid uuid;
  before_scopes uuid[] := '{}';
  before_gen integer;
  before_active boolean;
  after_gen integer;
  after_active boolean;
BEGIN
  PERFORM monthly_require_admin();
  IF p_action IN ('create_synthetic', 'create_real_staged') THEN
    IF p_action = 'create_real_staged' THEN
      PERFORM monthly_require_real_admin();
      IF p_clients IS NULL OR cardinality(p_clients) NOT BETWEEN 1 AND 3 OR EXISTS (
        SELECT 1 FROM unnest(p_clients) x LEFT JOIN monthly_clients mc ON mc.id = x
        WHERE mc.id IS NULL OR mc.slug ~ '^(test-|syn-)' OR mc.slug = 'rocklin-ca') THEN
        RAISE EXCEPTION 'Real scopes required';
      END IF;
    ELSE
      IF p_clients IS NULL OR cardinality(p_clients) NOT BETWEEN 1 AND 3 OR EXISTS (
        SELECT 1 FROM unnest(p_clients) x LEFT JOIN monthly_clients mc ON mc.id = x
        WHERE mc.id IS NULL OR mc.slug !~ '^(test-|syn-)') THEN
        RAISE EXCEPTION 'Synthetic scopes required';
      END IF;
    END IF;
    INSERT INTO monthly_code_credentials(selector, salt, verifier, created_by, synthetic, active)
    VALUES (p_selector, p_salt, p_verifier, auth.uid(), p_action = 'create_synthetic', p_action = 'create_synthetic')
    RETURNING id INTO cid;
    INSERT INTO monthly_code_scopes SELECT cid, x FROM unnest(p_clients) x;
  ELSE
    SELECT id, generation, active INTO cid, before_gen, before_active
    FROM monthly_code_credentials WHERE id = p_id FOR UPDATE;
    IF cid IS NULL THEN RAISE EXCEPTION 'Unknown credential'; END IF;
    IF EXISTS (SELECT 1 FROM monthly_code_credentials WHERE id = cid AND NOT synthetic) THEN
      PERFORM monthly_require_real_admin();
    END IF;
    SELECT coalesce(array_agg(client_id ORDER BY client_id), '{}') INTO before_scopes
    FROM monthly_code_scopes WHERE credential_id = cid;
    IF p_action = 'revoke' THEN
      UPDATE monthly_code_credentials SET active = false, generation = generation + 1 WHERE id = cid;
    ELSIF p_action = 'rotate' THEN
      UPDATE monthly_code_credentials SET selector = p_selector, salt = p_salt, verifier = p_verifier,
        generation = generation + 1, failures = 0, locked_until = NULL, window_start = now() WHERE id = cid;
    ELSIF p_action = 'remove_scope' THEN
      DELETE FROM monthly_code_scopes WHERE credential_id = cid AND client_id = ANY (p_clients);
      UPDATE monthly_code_credentials SET generation = generation + 1 WHERE id = cid;
    ELSIF p_action = 'unlock' THEN
      UPDATE monthly_code_credentials SET failures = 0, locked_until = NULL, window_start = now() WHERE id = cid;
    ELSE
      RAISE EXCEPTION 'Invalid action';
    END IF;
  END IF;
  SELECT generation, active INTO after_gen, after_active FROM monthly_code_credentials WHERE id = cid;
  INSERT INTO monthly_audit_log(actor, action, target_table, target_id, detail)
  VALUES (auth.uid(), 'code_admin_' || p_action, 'monthly_code_credentials', cid, jsonb_build_object(
    'scope_count', cardinality(p_clients),
    'requested_clients', to_jsonb(coalesce(p_clients, '{}')),
    'before_clients', to_jsonb(before_scopes),
    'after_clients', to_jsonb((SELECT coalesce(array_agg(client_id ORDER BY client_id), '{}') FROM monthly_code_scopes WHERE credential_id = cid)),
    'generation_before', before_gen, 'generation_after', after_gen,
    'active_before', before_active, 'active_after', after_active));
  RETURN cid;
END $$;