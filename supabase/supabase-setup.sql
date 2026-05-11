-- ============================================
-- Grampanchayat Jawalke - Full Supabase Setup
-- Run this in a new Supabase project's SQL Editor
-- ============================================

-- 1. PROFILES (linked to Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  mobile TEXT,
  role TEXT DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin', 'official')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. APPLICATIONS
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_no TEXT UNIQUE NOT NULL,
  service_type TEXT DEFAULT 'takrar',
  form_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected')),
  remarks TEXT,
  citizen_id UUID REFERENCES profiles(id),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. COMPLAINTS
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_no TEXT UNIQUE NOT NULL,
  complaint_type TEXT DEFAULT 'other',
  subject TEXT NOT NULL,
  description TEXT,
  citizen_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  response TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. EVENTS
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_mr TEXT NOT NULL,
  title_en TEXT,
  event_date DATE,
  description_mr TEXT,
  description_en TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. MARKET RATES
CREATE TABLE market_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_mr TEXT,
  crop_en TEXT,
  price_inr NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'quintal',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. NOTICES
CREATE TABLE notices (
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

-- 7. OFFICIALS
CREATE TABLE officials (
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

-- 8. SCHEMES
CREATE TABLE schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_mr TEXT,
  name_en TEXT,
  url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. WORKS
CREATE TABLE works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_mr TEXT NOT NULL,
  title_en TEXT,
  status TEXT DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'planned')),
  budget_inr NUMERIC DEFAULT 0,
  contractor TEXT,
  start_date DATE,
  end_date DATE,
  progress INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. SETTINGS (key-value store)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE officials ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Service role full access profiles" ON profiles FOR ALL USING (auth.role() = 'service_role');

-- Applications
CREATE POLICY "Anyone can insert applications" ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read applications" ON applications FOR SELECT USING (true);
CREATE POLICY "Service role full access applications" ON applications FOR ALL USING (auth.role() = 'service_role');

-- Complaints
CREATE POLICY "Anyone can insert complaints" ON complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read complaints" ON complaints FOR SELECT USING (true);
CREATE POLICY "Service role full access complaints" ON complaints FOR ALL USING (auth.role() = 'service_role');

-- Public read content
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);
CREATE POLICY "Service role full access events" ON events FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read market_rates" ON market_rates FOR SELECT USING (true);
CREATE POLICY "Service role full access market_rates" ON market_rates FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read notices" ON notices FOR SELECT USING (true);
CREATE POLICY "Service role full access notices" ON notices FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read officials" ON officials FOR SELECT USING (true);
CREATE POLICY "Service role full access officials" ON officials FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read schemes" ON schemes FOR SELECT USING (true);
CREATE POLICY "Service role full access schemes" ON schemes FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read works" ON works FOR SELECT USING (true);
CREATE POLICY "Service role full access works" ON works FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Service role full access settings" ON settings FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- Staff (admin / official): dashboard mutations via anon key + JWT
-- ============================================

CREATE POLICY "Staff manage notices" ON notices FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'official')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'official')));

CREATE POLICY "Staff manage events" ON events FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'official')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'official')));

CREATE POLICY "Staff manage officials" ON officials FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'official')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'official')));

CREATE POLICY "Staff manage schemes" ON schemes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'official')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'official')));

CREATE POLICY "Staff manage works" ON works FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'official')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'official')));

CREATE POLICY "Staff manage market_rates" ON market_rates FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'official')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'official')));

CREATE POLICY "Staff manage settings" ON settings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'official')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'official')));

CREATE POLICY "Staff manage applications" ON applications FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'official')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'official')));

CREATE POLICY "Staff manage complaints" ON complaints FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'official')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'official')));

-- ============================================
-- SEED DEFAULT SETTINGS
-- ============================================
INSERT INTO settings (key, value) VALUES
  ('gp_name_mr', 'ग्रामपंचायत जावळके'),
  ('gp_name_en', 'Grampanchayat Jawalke'),
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
  ('gp_admin_en', 'Mr. Mahadev Popat Karande');
