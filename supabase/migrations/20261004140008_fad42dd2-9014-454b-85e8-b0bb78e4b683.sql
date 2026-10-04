CREATE OR REPLACE FUNCTION public.booking_slot_counts(_date date)
RETURNS TABLE(time_slot text, booked bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT time_slot, COALESCE(SUM(party_size), 0)::bigint AS booked
  FROM public.bookings
  WHERE visit_date = _date
    AND status <> '已取消'
  GROUP BY time_slot
$$;

GRANT EXECUTE ON FUNCTION public.booking_slot_counts(date) TO anon, authenticated, service_role;