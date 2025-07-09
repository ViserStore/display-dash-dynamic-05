
-- Create site settings table
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_title TEXT NOT NULL DEFAULT 'TradeBull',
  site_currency TEXT NOT NULL DEFAULT 'USDT',
  currency_symbol TEXT NOT NULL DEFAULT '$',
  signup_bonus NUMERIC NOT NULL DEFAULT 5,
  transfer_min_limit NUMERIC NOT NULL DEFAULT 10,
  transfer_charge NUMERIC NOT NULL DEFAULT 3,
  crypto_api_key TEXT,
  image_api_key TEXT,
  refer_need INTEGER NOT NULL DEFAULT 0,
  email_verification BOOLEAN NOT NULL DEFAULT true,
  kyc_verification BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.site_settings (
  site_title, site_currency, currency_symbol, signup_bonus, 
  transfer_min_limit, transfer_charge, crypto_api_key, 
  image_api_key, refer_need, email_verification, kyc_verification
) VALUES (
  'TradeBull', 'USDT', '$', 5, 10, 3, 
  '091026fd-d4ed-4544-8bc2-cf26875c1d15', 
  '9c3774fbfb79146b5a3a78cafdba45c4', 
  0, true, true
);
