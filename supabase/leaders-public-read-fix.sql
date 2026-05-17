-- Run this if /api/leaders returns [] but images exist in Storage.
-- Cause: server uses anon key without SELECT on leaders, OR no rows in table.

-- 1) Anyone can read leaders (required for homepage when SERVICE_ROLE_KEY is not set)
ALTER TABLE public.leaders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read leaders" ON public.leaders;
CREATE POLICY "Public read leaders" ON public.leaders
  FOR SELECT
  USING (true);

-- 2) Staff can insert/update/delete (admin dashboard)
DROP POLICY IF EXISTS "Staff manage leaders" ON public.leaders;
CREATE POLICY "Staff manage leaders" ON public.leaders
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- If is_staff() does not exist yet, run supabase/fix-rls-officials.sql first.
