-- Run in Supabase SQL Editor if the site still shows the old Jawalke name from settings.

UPDATE public.settings SET value = 'ग्रामपंचायत बावी' WHERE key = 'gp_name_mr';
UPDATE public.settings SET value = 'Grampanchayat Bavi' WHERE key = 'gp_name_en';
