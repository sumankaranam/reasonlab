-- Owner runs once in Supabase SQL Editor. No user-level rows leave the database.
CREATE OR REPLACE FUNCTION public.reasonlab_registration_counts(p_from timestamptz, p_to timestamptz)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF p_from IS NULL OR p_to IS NULL OR p_to <= p_from OR p_to-p_from > interval '1 day' THEN
    RAISE EXCEPTION 'Expected a single-day reporting window';
  END IF;
  RETURN (SELECT jsonb_build_object(
    'new_accounts', count(*) FILTER (WHERE created_at >= p_from AND created_at < p_to),
    'total_accounts', count(*) FILTER (WHERE created_at < p_to)
  ) FROM auth.users);
END;
$$;
REVOKE ALL ON FUNCTION public.reasonlab_registration_counts(timestamptz,timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reasonlab_registration_counts(timestamptz,timestamptz) TO service_role;
