-- Leaders table + RLS (matches app code: name, designation, image_url, display_order, is_active)
-- Storage: public bucket `leaders`

CREATE TABLE IF NOT EXISTS public.leaders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.leaders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read leaders" ON public.leaders;
CREATE POLICY "Public read leaders" ON public.leaders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage leaders" ON public.leaders;
CREATE POLICY "Staff manage leaders" ON public.leaders
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'official')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'official')));

DROP POLICY IF EXISTS "Service role full access leaders" ON public.leaders;
CREATE POLICY "Service role full access leaders" ON public.leaders
  FOR ALL USING (auth.role() = 'service_role');
