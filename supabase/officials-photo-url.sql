-- Run if `officials` table exists but lacks photo_url (required for dashboard uploads)
ALTER TABLE public.officials ADD COLUMN IF NOT EXISTS photo_url TEXT;
