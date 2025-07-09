
-- Create a dedicated app_settings table
CREATE TABLE public.app_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_name TEXT DEFAULT 'TradeBull',
  app_description TEXT DEFAULT 'Trading & Investing',
  app_logo_url TEXT DEFAULT 'https://tradebull.scriptbasket.com/logo/logo.png',
  app_rating DECIMAL(2,1) DEFAULT 4.6,
  app_reviews_count TEXT DEFAULT '5,000+',
  app_downloads_count TEXT DEFAULT '156K+',
  app_download_url TEXT DEFAULT '/app/app.apk',
  app_screenshots TEXT[] DEFAULT ARRAY[
    'https://tradebull.scriptbasket.com/app/screenshots/1.webp',
    'https://tradebull.scriptbasket.com/app/screenshots/2.webp', 
    'https://tradebull.scriptbasket.com/app/screenshots/3.webp',
    'https://tradebull.scriptbasket.com/app/screenshots/4.webp',
    'https://tradebull.scriptbasket.com/app/screenshots/5.webp'
  ],
  app_about TEXT DEFAULT 'It''s a social platform for traders and investors to share their ideas, discuss markets, and follow each other''s trading activities. It''s a place to learn from others, get inspiration, and showcase your own trading skills.',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default app settings
INSERT INTO public.app_settings (app_name, app_description, app_logo_url, app_rating, app_reviews_count, app_downloads_count, app_download_url, app_screenshots, app_about)
VALUES (
  'TradeBull', 
  'Trading & Investing', 
  'https://tradebull.scriptbasket.com/logo/logo.png', 
  4.6, 
  '5,000+', 
  '156K+', 
  '/app/app.apk',
  ARRAY[
    'https://tradebull.scriptbasket.com/app/screenshots/1.webp',
    'https://tradebull.scriptbasket.com/app/screenshots/2.webp', 
    'https://tradebull.scriptbasket.com/app/screenshots/3.webp',
    'https://tradebull.scriptbasket.com/app/screenshots/4.webp',
    'https://tradebull.scriptbasket.com/app/screenshots/5.webp'
  ],
  'It''s a social platform for traders and investors to share their ideas, discuss markets, and follow each other''s trading activities. It''s a place to learn from others, get inspiration, and showcase your own trading skills.'
);

-- Add updated_at trigger
CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
