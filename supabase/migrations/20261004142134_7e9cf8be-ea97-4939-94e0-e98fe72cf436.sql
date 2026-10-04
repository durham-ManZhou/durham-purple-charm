CREATE OR REPLACE FUNCTION public.cancel_booking(_code text, _phone text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE n int;
BEGIN
  UPDATE public.bookings SET status = '已取消'
  WHERE visit_code = upper(trim(_code)) AND phone = trim(_phone) AND status <> '已取消';
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n > 0;
END $$;
GRANT EXECUTE ON FUNCTION public.cancel_booking(text, text) TO anon, authenticated;