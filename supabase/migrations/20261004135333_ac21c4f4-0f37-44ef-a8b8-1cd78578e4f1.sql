CREATE OR REPLACE FUNCTION public.search_staff(_q text DEFAULT '', _departments text[] DEFAULT NULL, _limit int DEFAULT 60, _offset int DEFAULT 0)
RETURNS TABLE (profile_url text, display_name text, role text, listed_role text, department_slug text, image_url text, research_interests text[], biography_zh text, biography text, total bigint)
LANGUAGE sql STABLE SET search_path = public AS $$
  WITH terms AS (
    SELECT coalesce(array_agg(t), '{}') AS t FROM unnest(regexp_split_to_array(lower(trim(left(coalesce(_q,''),80))), '\s+')) t WHERE t <> ''
  ), base AS (
    SELECT s.*, (SELECT t FROM terms) AS tt FROM public.staff_profiles s
    WHERE s.is_active AND s.display_name IS NOT NULL
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
$$;
GRANT EXECUTE ON FUNCTION public.search_staff(text, text[], int, int) TO anon, authenticated;