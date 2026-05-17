# Supabase SQL

## One-file setup (recommended)

Run **`full-setup.sql`** in the Supabase SQL Editor. It merges all migrations below into a single script (safe to re-run).

**Before running:** create public Storage buckets: `officials`, `leaders`, `works`, `events`.

**After running:** edit `YOUR_EMAIL@example.com` in section 8 of the file to your login email and re-run that `INSERT` block if you need admin access.

## Individual files (reference only)

These are included in `full-setup.sql`:

| File | Purpose |
|------|---------|
| `supabase-setup.sql` | Base tables, RLS, seed settings |
| `officials-photo-url.sql` | `officials.photo_url` column |
| `events-setup.sql` | Events columns, registrations, storage |
| `works-images-setup.sql` | Works columns, storage |
| `fix-rls-officials.sql` | `is_staff()`, RLS + storage fixes |
| `fix-rls-market-rates.sql` | Market rates RLS (subset of fix-rls-officials) |
| `fix-schemes-public-read.sql` | Public read schemes/notices |
| `fix-events-public-read.sql` | Public read events |
| `leaders.sql` | Leaders table policies |
| `leaders-add-name-columns.sql` | Legacy `role_en` / `role_mr` migration |
| `leaders-public-read-fix.sql` | Leaders public read |
| `update-gp-name-bavi.sql` | GP name settings |

You do not need to run the individual files if you already ran `full-setup.sql`.
