
-- Add missing columns to withdraw_methods table
ALTER TABLE public.withdraw_methods 
ADD COLUMN IF NOT EXISTS symbol TEXT NOT NULL DEFAULT '$',
ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS charge_percentage NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS user_info_label TEXT NOT NULL DEFAULT 'Your Account Details';

-- Update existing records with default values
UPDATE public.withdraw_methods 
SET symbol = CASE 
  WHEN currency = 'Taka' THEN '৳'
  WHEN currency = 'USDT' THEN '$'
  ELSE '$'
END,
exchange_rate = CASE 
  WHEN currency = 'Taka' THEN 100
  ELSE 1
END,
charge_percentage = CASE 
  WHEN currency = 'Taka' THEN 5
  WHEN currency = 'USDT' THEN 2.5
  ELSE 2.5
END,
user_info_label = CASE 
  WHEN name = 'Nagad' THEN 'Your Nagad Personal Number'
  WHEN name = 'bKash' THEN 'Your bKash Personal Number'
  WHEN name = 'USDT (TRC 20)' THEN 'Your USDT (TRC 20) Address'
  ELSE 'Your Account Details'
END;
