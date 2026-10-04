CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 20),
  phone TEXT NOT NULL CHECK (phone ~ '^1[3-9][0-9]{9}$'),
  education TEXT NOT NULL CHECK (education IN ('高中', '高二', '大专', '本科', '其他')),
  intended_program TEXT NOT NULL CHECK (intended_program IN ('国际本科', '硕士', '本科直博', '暂不确定')),
  intended_countries TEXT[] NOT NULL DEFAULT '{}',
  entry_year TEXT,
  budget TEXT,
  notes TEXT CHECK (char_length(notes) <= 200),
  follow_up_status TEXT NOT NULL DEFAULT '待跟进',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitors can submit leads" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (follow_up_status = '待跟进');

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 20),
  phone TEXT NOT NULL CHECK (phone ~ '^1[3-9][0-9]{9}$'),
  visit_date DATE NOT NULL,
  time_slot TEXT NOT NULL CHECK (time_slot IN ('上午', '下午')),
  party_size INTEGER NOT NULL CHECK (party_size BETWEEN 1 AND 10),
  notes TEXT CHECK (char_length(notes) <= 200),
  status TEXT NOT NULL DEFAULT '待到访',
  visit_code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitors can submit bookings" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (status = '待到访');

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER leads_set_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER bookings_set_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();