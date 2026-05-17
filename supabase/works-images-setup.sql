-- =============================================================================
-- Works photos — run in Supabase SQL Editor (safe to re-run)
-- =============================================================================
-- BEFORE running: create Storage bucket (see steps in project README / below)
--
-- Dashboard → Storage → New bucket
--   Name: works
--   Public bucket: ON
-- =============================================================================

-- 1) Table columns for photos + descriptions
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS description_mr TEXT;
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 2) is_staff() (skip if you already ran fix-rls-officials.sql)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'official')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;

-- 3) Staff can manage works rows
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read works" ON public.works;
CREATE POLICY "Public read works" ON public.works FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage works" ON public.works;
CREATE POLICY "Staff manage works" ON public.works
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- 4) Storage: staff upload/delete, public read bucket `works`
DROP POLICY IF EXISTS "Staff upload works bucket" ON storage.objects;
CREATE POLICY "Staff upload works bucket" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'works' AND public.is_staff());

DROP POLICY IF EXISTS "Staff update works bucket" ON storage.objects;
CREATE POLICY "Staff update works bucket" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'works' AND public.is_staff());

DROP POLICY IF EXISTS "Staff delete works bucket" ON storage.objects;
CREATE POLICY "Staff delete works bucket" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'works' AND public.is_staff());

DROP POLICY IF EXISTS "Public read works storage" ON storage.objects;
CREATE POLICY "Public read works storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'works');

-- 5) Promote your login to admin (change email)
-- INSERT INTO public.profiles (id, full_name, role)
-- SELECT id, COALESCE(raw_user_meta_data->>'full_name', email), 'admin'
-- FROM auth.users WHERE email = 'YOUR_EMAIL@example.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';
