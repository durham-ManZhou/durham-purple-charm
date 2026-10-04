CREATE OR REPLACE FUNCTION public.cancel_booking_by_code(_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _updated integer;
BEGIN
  UPDATE public.bookings
  SET status = '已取消', updated_at = now()
  WHERE visit_code = _code AND status = '待到访';
  GET DIAGNOSTICS _updated = ROW_COUNT;
  RETURN _updated > 0;
END;
$$;
GRANT EXECUTE ON FUNCTION public.cancel_booking_by_code(text) TO anon, authenticated;