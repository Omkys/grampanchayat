-- Fix: column leaders.name does not exist
-- Your table was likely created with role_en / role_mr. This adds the new columns and copies old data.

ALTER TABLE public.leaders ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.leaders ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE public.leaders ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.leaders ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Copy legacy → new columns (only where name is still empty)
UPDATE public.leaders
SET
  name = COALESCE(NULLIF(TRIM(name), ''), role_en, 'Leader'),
  designation = COALESCE(NULLIF(TRIM(designation), ''), role_mr, role_en, ''),
  display_order = COALESCE(display_order, 0),
  is_active = COALESCE(is_active, true)
WHERE name IS NULL OR TRIM(name) = '';

-- Optional: after verifying the app works, you may drop old columns:
-- ALTER TABLE public.leaders DROP COLUMN IF EXISTS role_en;
-- ALTER TABLE public.leaders DROP COLUMN IF EXISTS role_mr;
