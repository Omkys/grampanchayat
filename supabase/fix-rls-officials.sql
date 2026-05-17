-- =============================================================================
-- Fix RLS for dashboard tables (officials, leaders, market_rates, notices, …)
-- Run in Supabase → SQL Editor (safe to re-run)
-- =============================================================================

-- 1) Column used by dashboard photo upload
ALTER TABLE public.officials ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2) Helper: check admin/official without RLS recursion on profiles
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'official')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;

-- 3) Officials table policies
ALTER TABLE public.officials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read officials" ON public.officials;
CREATE POLICY "Public read officials" ON public.officials
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage officials" ON public.officials;
CREATE POLICY "Staff manage officials" ON public.officials
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Service role full access officials" ON public.officials;
CREATE POLICY "Service role full access officials" ON public.officials
  FOR ALL USING (auth.role() = 'service_role');

-- 4) Leaders (same pattern — use if leaders insert also fails)
ALTER TABLE public.leaders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read leaders" ON public.leaders;
CREATE POLICY "Public read leaders" ON public.leaders
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage leaders" ON public.leaders;
CREATE POLICY "Staff manage leaders" ON public.leaders
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- 4b) Market rates + other dashboard tables (notices, schemes, events, works, settings)
ALTER TABLE public.market_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read market_rates" ON public.market_rates;
CREATE POLICY "Public read market_rates" ON public.market_rates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage market_rates" ON public.market_rates;
CREATE POLICY "Staff manage market_rates" ON public.market_rates
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Service role full access market_rates" ON public.market_rates;
CREATE POLICY "Service role full access market_rates" ON public.market_rates
  FOR ALL USING (auth.role() = 'service_role');

-- notices (homepage notice board — public SELECT)
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read notices" ON public.notices;
CREATE POLICY "Public read notices" ON public.notices
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff manage notices" ON public.notices;
CREATE POLICY "Staff manage notices" ON public.notices
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- schemes (homepage government schemes list — public SELECT)
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read schemes" ON public.schemes;
CREATE POLICY "Public read schemes" ON public.schemes
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff manage schemes" ON public.schemes;
CREATE POLICY "Staff manage schemes" ON public.schemes
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- events (homepage /api/events uses anon or service role — needs public SELECT)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read events" ON public.events;
CREATE POLICY "Public read events" ON public.events
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff manage events" ON public.events;
CREATE POLICY "Staff manage events" ON public.events
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- works
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff manage works" ON public.works;
CREATE POLICY "Staff manage works" ON public.works
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff manage settings" ON public.settings;
CREATE POLICY "Staff manage settings" ON public.settings
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- 5) Storage: allow staff to upload/delete in public buckets `officials` and `leaders`
DROP POLICY IF EXISTS "Staff upload officials bucket" ON storage.objects;
CREATE POLICY "Staff upload officials bucket" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'officials' AND public.is_staff());

DROP POLICY IF EXISTS "Staff update officials bucket" ON storage.objects;
CREATE POLICY "Staff update officials bucket" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'officials' AND public.is_staff());

DROP POLICY IF EXISTS "Staff delete officials bucket" ON storage.objects;
CREATE POLICY "Staff delete officials bucket" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'officials' AND public.is_staff());

DROP POLICY IF EXISTS "Staff upload leaders bucket" ON storage.objects;
CREATE POLICY "Staff upload leaders bucket" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'leaders' AND public.is_staff());

DROP POLICY IF EXISTS "Staff delete leaders bucket" ON storage.objects;
CREATE POLICY "Staff delete leaders bucket" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'leaders' AND public.is_staff());

-- Public read for public buckets (if not already set)
DROP POLICY IF EXISTS "Public read officials storage" ON storage.objects;
CREATE POLICY "Public read officials storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'officials');

DROP POLICY IF EXISTS "Public read leaders storage" ON storage.objects;
CREATE POLICY "Public read leaders storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'leaders');

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

DROP POLICY IF EXISTS "Staff upload events bucket" ON storage.objects;
CREATE POLICY "Staff upload events bucket" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'events' AND public.is_staff());

DROP POLICY IF EXISTS "Staff update events bucket" ON storage.objects;
CREATE POLICY "Staff update events bucket" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'events' AND public.is_staff());

DROP POLICY IF EXISTS "Staff delete events bucket" ON storage.objects;
CREATE POLICY "Staff delete events bucket" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'events' AND public.is_staff());

DROP POLICY IF EXISTS "Public read events storage" ON storage.objects;
CREATE POLICY "Public read events storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'events');

-- =============================================================================
-- 6) Make YOUR login user an admin (change email to match your account)
-- =============================================================================
INSERT INTO public.profiles (id, full_name, role)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', email), 'admin'
FROM auth.users
WHERE email = 'demo@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
