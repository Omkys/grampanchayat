-- Government schemes on homepage — allow public read (Supabase SQL Editor)
-- Safe to re-run.

DROP POLICY IF EXISTS "Public read schemes" ON public.schemes;
CREATE POLICY "Public read schemes" ON public.schemes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read notices" ON public.notices;
CREATE POLICY "Public read notices" ON public.notices
  FOR SELECT USING (true);
