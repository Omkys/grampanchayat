-- Homepage events carousel: allow anonymous read (run in Supabase SQL Editor)
-- Safe to re-run. Use if /api/events returns [] but dashboard shows events.

DROP POLICY IF EXISTS "Public read events" ON public.events;
CREATE POLICY "Public read events" ON public.events
  FOR SELECT USING (true);
