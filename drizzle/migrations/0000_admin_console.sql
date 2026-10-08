CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users see own roles, admins see all" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins grant roles" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins revoke others" ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND user_id <> auth.uid());

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile or admin" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, coalesce(NEW.email, ''), NEW.raw_user_meta_data->>'display_name')
  ON CONFLICT (id) DO NOTHING;
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads content" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert content" ON public.site_content FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update content" ON public.site_content FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete content" ON public.site_content FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER site_content_set_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.bookings TO authenticated;
CREATE POLICY "Admins read leads" ON public.leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update leads" ON public.leads FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete leads" ON public.leads FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins read bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete bookings" ON public.bookings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.staff_profiles ADD COLUMN admin_hidden boolean NOT NULL DEFAULT false;
GRANT UPDATE (admin_hidden) ON public.staff_profiles TO authenticated;
CREATE POLICY "Admins update staff visibility" ON public.staff_profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.search_staff(_q text DEFAULT ''::text, _departments text[] DEFAULT NULL::text[], _limit integer DEFAULT 60, _offset integer DEFAULT 0)
 RETURNS TABLE(profile_url text, display_name text, role text, listed_role text, department_slug text, image_url text, research_interests text[], biography_zh text, biography text, total bigint)
 LANGUAGE sql STABLE SET search_path TO 'public'
AS $function$
  WITH terms AS (
    SELECT coalesce(array_agg(t), '{}') AS t FROM unnest(regexp_split_to_array(lower(trim(left(coalesce(_q,''),80))), '\s+')) t WHERE t <> ''
  ), base AS (
    SELECT s.*, (SELECT t FROM terms) AS tt FROM public.staff_profiles s
    WHERE s.is_active AND NOT s.admin_hidden AND s.display_name IS NOT NULL
      AND (_departments IS NULL OR s.department_slug = ANY(_departments))
  ), scored AS (
    SELECT b.*,
      (SELECT count(*) FROM unnest(b.tt) x WHERE lower(b.display_name) ~ ('\m' || regexp_replace(x, '([.^$*+?()\[\]{}|\\-])', '\\\1', 'g'))) AS name_word_hits,
      (SELECT count(*) FROM unnest(b.tt) x WHERE lower(b.display_name) LIKE '%' || x || '%') AS name_hits,
      (SELECT count(*) FROM unnest(b.tt) x WHERE b.search_text LIKE '%' || x || '%') AS any_hits,
      (SELECT count(*) FROM unnest(b.tt) x WHERE lower(concat_ws(' ', b.role, b.listed_role, b.department_slug, array_to_string(b.research_interests,' '))) LIKE '%' || x || '%') AS meta_hits
    FROM base b
  )
  SELECT profile_url, display_name, role, listed_role, department_slug, image_url, research_interests, biography_zh, left(biography, 300),
    count(*) OVER () AS total
  FROM scored
  WHERE cardinality(tt) = 0 OR any_hits > 0
  ORDER BY (name_word_hits = cardinality(tt) AND cardinality(tt) > 0) DESC, name_word_hits DESC, name_hits DESC, any_hits DESC, meta_hits DESC,
    regexp_replace(display_name, '^(Professor|Prof|Dr|Mr|Mrs|Ms|Miss|Mx)\.?\s+', '')
  LIMIT least(greatest(_limit,1),100) OFFSET greatest(_offset,0)
$function$;