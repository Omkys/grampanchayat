-- =============================================================================
-- Events: photos + public registration — run in Supabase SQL Editor
-- =============================================================================
-- BEFORE running: Storage → New bucket → name: events → Public: ON
-- =============================================================================

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_open BOOLEAN DEFAULT true;

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT,
  registered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (event_id, mobile)
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);

-- is_staff() — skip if already from fix-rls-officials.sql
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

-- Events table RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read events" ON public.events;
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage events" ON public.events;
CREATE POLICY "Staff manage events" ON public.events
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- Registrations RLS
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff read event registrations" ON public.event_registrations;
CREATE POLICY "Staff read event registrations" ON public.event_registrations
  FOR SELECT TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "Staff delete event registrations" ON public.event_registrations;
CREATE POLICY "Staff delete event registrations" ON public.event_registrations
  FOR DELETE TO authenticated
  USING (public.is_staff());

-- Storage bucket `events`
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
