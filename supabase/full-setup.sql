-- =============================================================================
-- Grampanchayat Bavi — COMPLETE Supabase setup (single file)
-- =============================================================================
-- Run in: Supabase Dashboard → SQL Editor → New query → Paste → Run
-- Safe to re-run on an existing project (IF NOT EXISTS / DROP POLICY IF EXISTS).
--
-- BEFORE running — create public Storage buckets (Dashboard → Storage):
--   officials | leaders | works | events
--
-- AFTER running — change YOUR_EMAIL in section 8 to your login email, then
-- re-run only the admin INSERT block if needed.
-- =============================================================================


-- =============================================================================
-- PART 1 — TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  mobile TEXT,
  role TEXT DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin', 'official')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_no TEXT UNIQUE NOT NULL,
  service_type TEXT DEFAULT 'takrar',
  form_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected')),
  remarks TEXT,
  citizen_id UUID REFERENCES public.profiles(id),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_no TEXT UNIQUE NOT NULL,
  complaint_type TEXT DEFAULT 'other',
  subject TEXT NOT NULL,
  description TEXT,
  citizen_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  response TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_mr TEXT NOT NULL,
  title_en TEXT,
  event_date DATE,
  description_mr TEXT,
  description_en TEXT,
  location TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  registration_open BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.market_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_mr TEXT,
  crop_en TEXT,
  price_inr NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'quintal',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_mr TEXT NOT NULL,
  title_en TEXT,
  body_mr TEXT,
  body_en TEXT,
  category TEXT DEFAULT 'general',
  published_at DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.officials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_mr TEXT NOT NULL,
  name_en TEXT,
  designation_mr TEXT NOT NULL,
  designation_en TEXT,
  category TEXT DEFAULT 'staff',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_mr TEXT,
  name_en TEXT,
  url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_mr TEXT NOT NULL,
  title_en TEXT,
  description_mr TEXT,
  description_en TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'planned')),
  budget_inr NUMERIC DEFAULT 0,
  contractor TEXT,
  start_date DATE,
  end_date DATE,
  progress INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.leaders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  designation TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- PART 2 — COLUMN MIGRATIONS (existing projects)
-- =============================================================================

ALTER TABLE public.officials ADD COLUMN IF NOT EXISTS photo_url TEXT;

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_open BOOLEAN DEFAULT true;

ALTER TABLE public.works ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS description_mr TEXT;
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

ALTER TABLE public.leaders ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.leaders ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE public.leaders ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.leaders ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.leaders ADD COLUMN IF NOT EXISTS role_en TEXT;
ALTER TABLE public.leaders ADD COLUMN IF NOT EXISTS role_mr TEXT;


-- =============================================================================
-- PART 3 — INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);


-- =============================================================================
-- PART 4 — HELPER: is_staff()
-- =============================================================================

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


-- =============================================================================
-- PART 5 — ENABLE RLS
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;


-- =============================================================================
-- PART 6 — TABLE POLICIES
-- =============================================================================

-- Profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Service role full access profiles" ON public.profiles;
CREATE POLICY "Service role full access profiles" ON public.profiles FOR ALL USING (auth.role() = 'service_role');

-- Applications
DROP POLICY IF EXISTS "Anyone can insert applications" ON public.applications;
CREATE POLICY "Anyone can insert applications" ON public.applications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can read applications" ON public.applications;
CREATE POLICY "Anyone can read applications" ON public.applications FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access applications" ON public.applications;
CREATE POLICY "Service role full access applications" ON public.applications FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Staff manage applications" ON public.applications;
CREATE POLICY "Staff manage applications" ON public.applications FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Complaints
DROP POLICY IF EXISTS "Anyone can insert complaints" ON public.complaints;
CREATE POLICY "Anyone can insert complaints" ON public.complaints FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can read complaints" ON public.complaints;
CREATE POLICY "Anyone can read complaints" ON public.complaints FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access complaints" ON public.complaints;
CREATE POLICY "Service role full access complaints" ON public.complaints FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Staff manage complaints" ON public.complaints;
CREATE POLICY "Staff manage complaints" ON public.complaints FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Events
DROP POLICY IF EXISTS "Public read events" ON public.events;
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access events" ON public.events;
CREATE POLICY "Service role full access events" ON public.events FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Staff manage events" ON public.events;
CREATE POLICY "Staff manage events" ON public.events FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Event registrations
DROP POLICY IF EXISTS "Staff read event registrations" ON public.event_registrations;
CREATE POLICY "Staff read event registrations" ON public.event_registrations FOR SELECT TO authenticated
  USING (public.is_staff());
DROP POLICY IF EXISTS "Staff delete event registrations" ON public.event_registrations;
CREATE POLICY "Staff delete event registrations" ON public.event_registrations FOR DELETE TO authenticated
  USING (public.is_staff());
DROP POLICY IF EXISTS "Service role full access event_registrations" ON public.event_registrations;
CREATE POLICY "Service role full access event_registrations" ON public.event_registrations FOR ALL
  USING (auth.role() = 'service_role');

-- Market rates
DROP POLICY IF EXISTS "Public read market_rates" ON public.market_rates;
CREATE POLICY "Public read market_rates" ON public.market_rates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access market_rates" ON public.market_rates;
CREATE POLICY "Service role full access market_rates" ON public.market_rates FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Staff manage market_rates" ON public.market_rates;
CREATE POLICY "Staff manage market_rates" ON public.market_rates FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Notices
DROP POLICY IF EXISTS "Public read notices" ON public.notices;
CREATE POLICY "Public read notices" ON public.notices FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access notices" ON public.notices;
CREATE POLICY "Service role full access notices" ON public.notices FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Staff manage notices" ON public.notices;
CREATE POLICY "Staff manage notices" ON public.notices FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Officials
DROP POLICY IF EXISTS "Public read officials" ON public.officials;
CREATE POLICY "Public read officials" ON public.officials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access officials" ON public.officials;
CREATE POLICY "Service role full access officials" ON public.officials FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Staff manage officials" ON public.officials;
CREATE POLICY "Staff manage officials" ON public.officials FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Schemes
DROP POLICY IF EXISTS "Public read schemes" ON public.schemes;
CREATE POLICY "Public read schemes" ON public.schemes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access schemes" ON public.schemes;
CREATE POLICY "Service role full access schemes" ON public.schemes FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Staff manage schemes" ON public.schemes;
CREATE POLICY "Staff manage schemes" ON public.schemes FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Works
DROP POLICY IF EXISTS "Public read works" ON public.works;
CREATE POLICY "Public read works" ON public.works FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access works" ON public.works;
CREATE POLICY "Service role full access works" ON public.works FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Staff manage works" ON public.works;
CREATE POLICY "Staff manage works" ON public.works FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Leaders
DROP POLICY IF EXISTS "Public read leaders" ON public.leaders;
CREATE POLICY "Public read leaders" ON public.leaders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access leaders" ON public.leaders;
CREATE POLICY "Service role full access leaders" ON public.leaders FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Staff manage leaders" ON public.leaders;
CREATE POLICY "Staff manage leaders" ON public.leaders FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Settings
DROP POLICY IF EXISTS "Public read settings" ON public.settings;
CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access settings" ON public.settings;
CREATE POLICY "Service role full access settings" ON public.settings FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Staff manage settings" ON public.settings;
CREATE POLICY "Staff manage settings" ON public.settings FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());


-- =============================================================================
-- PART 7 — STORAGE POLICIES (buckets must exist: officials, leaders, works, events)
-- =============================================================================

-- Officials bucket
DROP POLICY IF EXISTS "Staff upload officials bucket" ON storage.objects;
CREATE POLICY "Staff upload officials bucket" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'officials' AND public.is_staff());
DROP POLICY IF EXISTS "Staff update officials bucket" ON storage.objects;
CREATE POLICY "Staff update officials bucket" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'officials' AND public.is_staff());
DROP POLICY IF EXISTS "Staff delete officials bucket" ON storage.objects;
CREATE POLICY "Staff delete officials bucket" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'officials' AND public.is_staff());
DROP POLICY IF EXISTS "Public read officials storage" ON storage.objects;
CREATE POLICY "Public read officials storage" ON storage.objects FOR SELECT USING (bucket_id = 'officials');

-- Leaders bucket
DROP POLICY IF EXISTS "Staff upload leaders bucket" ON storage.objects;
CREATE POLICY "Staff upload leaders bucket" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'leaders' AND public.is_staff());
DROP POLICY IF EXISTS "Staff update leaders bucket" ON storage.objects;
CREATE POLICY "Staff update leaders bucket" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'leaders' AND public.is_staff());
DROP POLICY IF EXISTS "Staff delete leaders bucket" ON storage.objects;
CREATE POLICY "Staff delete leaders bucket" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'leaders' AND public.is_staff());
DROP POLICY IF EXISTS "Public read leaders storage" ON storage.objects;
CREATE POLICY "Public read leaders storage" ON storage.objects FOR SELECT USING (bucket_id = 'leaders');

-- Works bucket
DROP POLICY IF EXISTS "Staff upload works bucket" ON storage.objects;
CREATE POLICY "Staff upload works bucket" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'works' AND public.is_staff());
DROP POLICY IF EXISTS "Staff update works bucket" ON storage.objects;
CREATE POLICY "Staff update works bucket" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'works' AND public.is_staff());
DROP POLICY IF EXISTS "Staff delete works bucket" ON storage.objects;
CREATE POLICY "Staff delete works bucket" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'works' AND public.is_staff());
DROP POLICY IF EXISTS "Public read works storage" ON storage.objects;
CREATE POLICY "Public read works storage" ON storage.objects FOR SELECT USING (bucket_id = 'works');

-- Events bucket
DROP POLICY IF EXISTS "Staff upload events bucket" ON storage.objects;
CREATE POLICY "Staff upload events bucket" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'events' AND public.is_staff());
DROP POLICY IF EXISTS "Staff update events bucket" ON storage.objects;
CREATE POLICY "Staff update events bucket" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'events' AND public.is_staff());
DROP POLICY IF EXISTS "Staff delete events bucket" ON storage.objects;
CREATE POLICY "Staff delete events bucket" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'events' AND public.is_staff());
DROP POLICY IF EXISTS "Public read events storage" ON storage.objects;
CREATE POLICY "Public read events storage" ON storage.objects FOR SELECT USING (bucket_id = 'events');


-- =============================================================================
-- PART 8 — SEED SETTINGS + PROMOTE ADMIN
-- =============================================================================

INSERT INTO public.settings (key, value) VALUES
  ('gp_name_mr', 'ग्रामपंचायत बावी'),
  ('gp_name_en', 'Grampanchayat Bavi'),
  ('gp_mobile', ''),
  ('gp_email', ''),
  ('population', ''),
  ('total_works', ''),
  ('total_schemes', ''),
  ('total_facilities', ''),
  ('about_mr', 'ग्रामपंचायत ही स्थानिक स्वराज्य संस्थेचा पाया आहे. ग्रामपंचायत गावाच्या सर्वांगीण विकासासाठी कार्यरत आहे. पाणीपुरवठा, रस्ते, स्वच्छता, शिक्षण व सामाजिक योजना राबविणे हे आमचे प्रमुख उद्दिष्ट आहे.'),
  ('about_en', 'Gram Panchayat ensures rural development. The Gram Panchayat works for the holistic development of the village. Key focus areas include water supply, roads, sanitation, education, and implementation of welfare schemes.'),
  ('gp_officer_mr', 'श्री. रफिक दस्तागिर तांबोळी'),
  ('gp_officer_en', 'Mr. Rafik Dastagir Tamboli'),
  ('gp_admin_mr', 'श्री महादेव पोपट कारंडे'),
  ('gp_admin_en', 'Mr. Mahadev Popat Karande')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

-- Change YOUR_EMAIL@example.com to your Supabase Auth login email:
INSERT INTO public.profiles (id, full_name, role)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', email), 'admin'
FROM auth.users
WHERE email = 'YOUR_EMAIL@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';


-- =============================================================================
-- PART 9 — LEGACY LEADERS MIGRATION (role_en / role_mr → name / designation)
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'leaders' AND column_name = 'role_en'
  ) THEN
    UPDATE public.leaders
    SET
      name = COALESCE(NULLIF(TRIM(name), ''), role_en, 'Leader'),
      designation = COALESCE(NULLIF(TRIM(designation), ''), role_mr, role_en, ''),
      display_order = COALESCE(display_order, 0),
      is_active = COALESCE(is_active, true)
    WHERE name IS NULL OR TRIM(name) = '';
  END IF;
END $$;

-- =============================================================================
-- Done. Verify: Table Editor → schemes, events, works, leaders have rows after
-- dashboard saves; Storage buckets are public; your user has role = admin.
-- =============================================================================
