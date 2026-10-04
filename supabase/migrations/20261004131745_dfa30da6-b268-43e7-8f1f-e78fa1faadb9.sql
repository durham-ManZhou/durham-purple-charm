CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.staff_profiles (
  profile_url text PRIMARY KEY,
  display_name text,
  role text,
  phone text,
  email text,
  orcid_url text,
  image_url text,
  biography text,
  biography_zh text,
  biography_hash text,
  research_interests text[] NOT NULL DEFAULT '{}',
  publications jsonb NOT NULL DEFAULT '[]'::jsonb,
  supervision jsonb NOT NULL DEFAULT '[]'::jsonb,
  other_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.staff_profiles TO anon, authenticated;
GRANT ALL ON public.staff_profiles TO service_role;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view staff profiles" ON public.staff_profiles FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER staff_profiles_set_updated_at BEFORE UPDATE ON public.staff_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.staff_sync_state (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  locked_until timestamptz,
  paused_reason text,
  last_run_at timestamptz,
  last_status text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.staff_sync_state TO service_role;
ALTER TABLE public.staff_sync_state ENABLE ROW LEVEL SECURITY;
INSERT INTO public.staff_sync_state (id) VALUES (1);

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;
CREATE TABLE private.sync_config (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'hex')
);
INSERT INTO private.sync_config (id) VALUES (1);

CREATE OR REPLACE FUNCTION public.verify_staff_sync_token(_token text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = private, public AS $$
  SELECT EXISTS (SELECT 1 FROM private.sync_config WHERE token = _token AND length(_token) > 20)
$$;
REVOKE ALL ON FUNCTION public.verify_staff_sync_token(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_staff_sync_token(text) TO service_role;

CREATE OR REPLACE FUNCTION public.acquire_staff_sync_lease()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ok boolean;
BEGIN
  UPDATE public.staff_sync_state SET locked_until = now() + interval '10 minutes', last_run_at = now()
  WHERE id = 1 AND (locked_until IS NULL OR locked_until < now())
  RETURNING true INTO ok;
  RETURN coalesce(ok, false);
END $$;
REVOKE ALL ON FUNCTION public.acquire_staff_sync_lease() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_staff_sync_lease() TO service_role;