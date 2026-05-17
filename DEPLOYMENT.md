# Deployment Guide — Grampanchayat Bavi

## 1. Vercel Deployment

### Step 1: Import Project
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select **Nikitanikam-web/grampanchayat-bavi**
4. Click **Import**

### Step 2: Configure
- Framework Preset: **Next.js** (auto-detected)
- Root Directory: `.` (default)
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Click **Deploy**

### Step 3: Wait for Build
- Vercel will install deps, build, and deploy
- You'll get a URL like `grampanchayat-bavi.vercel.app`
- The `vercel.json` already targets Mumbai region (`bom1`) for low latency

### Step 4: Custom Domain (Optional)
1. Go to Project → Settings → Domains
2. Add your domain (e.g., `gpbavi.in`)
3. Update DNS records as shown by Vercel

---

## 2. Supabase Setup

### Step 1: Create Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Choose your organization
4. Fill in:
   - **Name:** `grampanchayat-bavi`
   - **Database Password:** (save this somewhere safe)
   - **Region:** `South Asia (Mumbai)` — ap-south-1
5. Click **Create new project**
6. Wait ~2 minutes for provisioning

### Step 2: Get API Keys
1. Go to **Project Settings → API**
2. Copy these values:
   - **Project URL** → `https://xxxx.supabase.co`
   - **anon public key** → `eyJ...`
   - **service_role key** → `eyJ...` (keep this SECRET)

### Step 3: Create Database Tables
1. Go to **SQL Editor** in Supabase dashboard
2. Run the following SQL (paste the entire block):

```sql
-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  full_name_mr TEXT,
  mobile TEXT,
  ward_number INTEGER,
  role TEXT NOT NULL DEFAULT 'citizen'
    CHECK (role IN ('admin','official','citizen','govt_officer')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notices
CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_mr TEXT NOT NULL,
  title_en TEXT,
  body_mr TEXT,
  body_en TEXT,
  category TEXT DEFAULT 'general'
    CHECK (category IN ('gramsabha','pani','swachha','general')),
  published_at DATE NOT NULL DEFAULT CURRENT_DATE,
  attachment_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Works
CREATE TABLE works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_mr TEXT NOT NULL,
  title_en TEXT,
  description_mr TEXT,
  description_en TEXT,
  status TEXT DEFAULT 'ongoing'
    CHECK (status IN ('ongoing','completed','planned')),
  start_date DATE,
  end_date DATE,
  budget_inr NUMERIC,
  contractor TEXT,
  progress INTEGER DEFAULT 0,
  cover_image TEXT,
  images TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_mr TEXT NOT NULL,
  title_en TEXT,
  description_mr TEXT,
  description_en TEXT,
  event_date DATE NOT NULL,
  location TEXT,
  cover_image TEXT,
  images TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Officials
CREATE TABLE officials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_mr TEXT NOT NULL,
  name_en TEXT,
  designation_mr TEXT NOT NULL,
  designation_en TEXT,
  category TEXT NOT NULL
    CHECK (category IN ('sarpanch','d_sarpanch','sadasya','cm','dcm','minister','staff')),
  photo_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_no TEXT UNIQUE NOT NULL,
  service_type TEXT NOT NULL
    CHECK (service_type IN ('janm_dakhala','mrutyu_dakhala','gharpatti','pani_tukrar','takrar','bandhkam_parvagi','kar_shulka')),
  citizen_id UUID REFERENCES profiles(id),
  form_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','processing','approved','rejected')),
  remarks TEXT,
  documents TEXT[],
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  handled_by UUID REFERENCES profiles(id)
);

-- Complaints
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_no TEXT UNIQUE NOT NULL,
  citizen_id UUID REFERENCES profiles(id),
  complaint_type TEXT NOT NULL
    CHECK (complaint_type IN ('water','road','sanitation','other')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  ward_number INTEGER,
  address TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'open'
    CHECK (status IN ('open','in_progress','resolved','closed')),
  response TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  handled_by UUID REFERENCES profiles(id)
);

-- Schemes
CREATE TABLE schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_mr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_name TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Market Rates
CREATE TABLE market_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_mr TEXT NOT NULL,
  crop_en TEXT NOT NULL,
  price_inr NUMERIC NOT NULL,
  unit TEXT DEFAULT 'quintal',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Hero Slides
CREATE TABLE hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings (key-value store)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Step 4: Seed Default Data
Run this in SQL Editor:

```sql
-- Default settings
INSERT INTO settings (key, value) VALUES
  ('gp_name_mr', 'ग्रामपंचायत बावी'),
  ('gp_name_en', 'Grampanchayat Bavi'),
  ('gp_mobile', '9876543210'),
  ('gp_email', 'gp.bavi@gov.in'),
  ('population', '2500'),
  ('total_works', '120'),
  ('total_schemes', '45'),
  ('total_facilities', '18');

-- Seed notices
INSERT INTO notices (title_mr, title_en, body_mr, body_en, category, published_at) VALUES
  ('ग्रामसभा सूचना', 'Gram Sabha Notice', 'ग्रामसभा दिनांक १५ फेब्रुवारी २०२६ रोजी सकाळी ११ वाजता आयोजित करण्यात येणार आहे. सर्व नागरिकांनी उपस्थित राहावे.', 'Gram Sabha will be held on 15 Feb 2026 at 11 AM. All citizens are requested to attend.', 'gramsabha', '2026-02-15'),
  ('पाणीपुरवठा सूचना', 'Water Supply Notice', 'पाणीपुरवठा देखभालीसाठी १८ फेब्रुवारी रोजी सकाळी ८ ते दुपारी २ पर्यंत बंद राहील.', 'Water supply will remain closed on 18 Feb from 8 AM to 2 PM for maintenance.', 'pani', '2026-02-18'),
  ('स्वच्छता अभियान', 'Cleanliness Drive', 'गावात स्वच्छता अभियान राबविण्यात येणार आहे. सर्वांनी सहभाग घ्यावा.', 'A village cleanliness drive will be conducted. All villagers are encouraged to participate.', 'swachha', '2026-02-20'),
  ('वीजपुरवठा सूचना', 'Electricity Maintenance Notice', 'वीज देखभाल कामामुळे २५ फेब्रुवारी रोजी सकाळी १० ते दुपारी १ पर्यंत वीजपुरवठा बंद राहील.', 'Due to maintenance work, electricity supply will remain closed on 25 Feb from 10 AM to 1 PM.', 'general', '2026-02-25');

-- Seed market rates
INSERT INTO market_rates (crop_mr, crop_en, price_inr) VALUES
  ('गहू', 'Wheat', 2250), ('ज्वारी', 'Jowar', 2800), ('बाजरी', 'Bajra', 2400),
  ('कांदा', 'Onion', 1500), ('टोमॅटो', 'Tomato', 1200), ('बटाटा', 'Potato', 1100),
  ('वांगी', 'Brinjal', 1350), ('मिरची', 'Chilli', 2000), ('भेंडी', 'Okra', 1800),
  ('कोबी', 'Cabbage', 900);

-- Seed schemes
INSERT INTO schemes (name_mr, name_en, url, icon_name, sort_order) VALUES
  ('पंतप्रधान किसान सन्मान निधी', 'PM Kisan Samman Nidhi', 'https://pmkisan.gov.in/', 'Users', 1),
  ('महाडीबीटी शेतकरी योजना', 'MahaDBT Farmer Schemes', 'https://mahadbt.maharashtra.gov.in/', 'CreditCard', 2),
  ('कृषी विभाग योजना', 'Agriculture Dept Schemes', 'https://agricoop.nic.in/', 'Droplets', 3),
  ('मनरेगा', 'MGNREGA', 'https://nrega.nic.in/', 'Hammer', 4),
  ('ग्रामविकास विभाग', 'Rural Development Dept', 'https://rdd.maharashtra.gov.in/', 'Building2', 5),
  ('महाराष्ट्र गृहनिर्माण योजना', 'Maharashtra Housing', 'https://housing.maharashtra.gov.in/', 'Home', 6),
  ('सार्वजनिक वितरण प्रणाली', 'PDS', 'https://mahafood.gov.in/', 'ClipboardList', 7);

-- Seed hero slides
INSERT INTO hero_slides (image_url, sort_order) VALUES
  ('https://images.pexels.com/photos/33872281/pexels-photo-33872281.jpeg?auto=compress&cs=tinysrgb&w=1600', 1),
  ('https://images.pexels.com/photos/5111999/pexels-photo-5111999.jpeg?auto=compress&cs=tinysrgb&w=1600', 2),
  ('https://images.pexels.com/photos/2909066/pexels-photo-2909066.jpeg?auto=compress&cs=tinysrgb&w=1600', 3),
  ('https://images.pexels.com/photos/30860914/pexels-photo-30860914.jpeg?auto=compress&cs=tinysrgb&w=1600', 4);
```

### Step 5: Enable Row Level Security (RLS)
Run in SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE officials ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public read for active content
CREATE POLICY "Public read notices" ON notices FOR SELECT USING (is_active = true);
CREATE POLICY "Public read works" ON works FOR SELECT USING (is_active = true);
CREATE POLICY "Public read events" ON events FOR SELECT USING (is_active = true);
CREATE POLICY "Public read officials" ON officials FOR SELECT USING (is_active = true);
CREATE POLICY "Public read schemes" ON schemes FOR SELECT USING (is_active = true);
CREATE POLICY "Public read market_rates" ON market_rates FOR SELECT USING (true);
CREATE POLICY "Public read hero_slides" ON hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);

-- Citizens can read own data
CREATE POLICY "Citizens read own apps" ON applications FOR SELECT USING (citizen_id = auth.uid());
CREATE POLICY "Citizens insert apps" ON applications FOR INSERT WITH CHECK (citizen_id = auth.uid());
CREATE POLICY "Citizens read own complaints" ON complaints FOR SELECT USING (citizen_id = auth.uid());
CREATE POLICY "Citizens insert complaints" ON complaints FOR INSERT WITH CHECK (citizen_id = auth.uid());

-- Profiles: users read own
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
```

### Step 6: Create Storage Buckets
1. Go to **Storage** in Supabase dashboard
2. Create these **public** buckets:
   - `hero-images`
   - `work-images`
   - `event-images`
   - `official-photos`
   - `notice-attachments`
3. Create these **private** buckets:
   - `applications`
   - `complaints`

---

## 3. Connect Vercel to Supabase

### Step 1: Add Environment Variables in Vercel
1. Go to your Vercel project → **Settings → Environment Variables**
2. Add these:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (anon key) | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service role) | Production only |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` | All |

3. Click **Save**
4. **Redeploy** the project for env vars to take effect

### Step 2: Verify
1. Open your Vercel URL
2. The site should load with all sections
3. Once Supabase integration code is added, data will come from the database

---

## Quick Reference

| Service | URL |
|---------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| Supabase Dashboard | https://supabase.com/dashboard |
| GitHub Repo | https://github.com/Nikitanikam-web/grampanchayat-bavi |
| Live Site | *(your Vercel URL after deploy)* |
