-- Fix: "new row violates row-level security policy for table market_rates"
-- Run in Supabase → SQL Editor (safe to re-run)

-- Requires is_staff() — created in fix-rls-officials.sql
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

-- Promote YOUR login to admin (change email below, then run)
INSERT INTO public.profiles (id, full_name, role)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', email), 'admin'
FROM auth.users
WHERE email = 'YOUR_EMAIL@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
