
-- Add app download related columns to site_settings table
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS app_name TEXT DEFAULT 'TradeBull',
ADD COLUMN IF NOT EXISTS app_description TEXT DEFAULT 'Trading & Investing',
ADD COLUMN IF NOT EXISTS app_logo_url TEXT DEFAULT 'https://tradebull.scriptbasket.com/logo/logo.png',
ADD COLUMN IF NOT EXISTS app_rating DECIMAL(2,1) DEFAULT 4.6,
ADD COLUMN IF NOT EXISTS app_reviews_count TEXT DEFAULT '5,000+',
ADD COLUMN IF NOT EXISTS app_downloads_count TEXT DEFAULT '156K+',
ADD COLUMN IF NOT EXISTS app_download_url TEXT DEFAULT '/app/app.apk',
ADD COLUMN IF NOT EXISTS app_screenshots TEXT[] DEFAULT ARRAY[
  'https://tradebull.scriptbasket.com/app/screenshots/1.webp',
  'https://tradebull.scriptbasket.com/app/screenshots/2.webp', 
  'https://tradebull.scriptbasket.com/app/screenshots/3.webp',
  'https://tradebull.scriptbasket.com/app/screenshots/4.webp',
  'https://tradebull.scriptbasket.com/app/screenshots/5.webp'
],
ADD COLUMN IF NOT EXISTS app_about TEXT DEFAULT 'It''s a social platform for traders and investors to share their ideas, discuss markets, and follow each other''s trading activities. It''s a place to learn from others, get inspiration, and showcase your own trading skills.';

-- Insert default data if site_settings table is empty
INSERT INTO public.site_settings (id, app_name, app_description, app_logo_url, app_rating, app_reviews_count, app_downloads_count, app_download_url, app_screenshots, app_about)
SELECT 1, 'TradeBull', 'Trading & Investing', 'https://tradebull.scriptbasket.com/logo/logo.png', 4.6, '5,000+', '156K+', '/app/app.apk', 
ARRAY[
  'https://tradebull.scriptbasket.com/app/screenshots/1.webp',
  'https://tradebull.scriptbasket.com/app/screenshots/2.webp', 
  'https://tradebull.scriptbasket.com/app/screenshots/3.webp',
  'https://tradebull.scriptbasket.com/app/screenshots/4.webp',
  'https://tradebull.scriptbasket.com/app/screenshots/5.webp'
],
'It''s a social platform for traders and investors to share their ideas, discuss markets, and follow each other''s trading activities. It''s a place to learn from others, get inspiration, and showcase your own trading skills.'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings WHERE id = 1);
