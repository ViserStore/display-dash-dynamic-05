
-- Create referral_settings table to store referral bonus configurations
CREATE TABLE public.referral_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_type text NOT NULL, -- 'deposit' or 'trade_win'
  level_number integer NOT NULL,
  bonus_percentage numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(setting_type, level_number)
);

-- Insert default referral settings for deposit bonuses (15 levels)
INSERT INTO public.referral_settings (setting_type, level_number, bonus_percentage) VALUES
('deposit', 1, 0),
('deposit', 2, 0),
('deposit', 3, 0),
('deposit', 4, 0),
('deposit', 5, 0),
('deposit', 6, 0),
('deposit', 7, 0),
('deposit', 8, 0),
('deposit', 9, 0),
('deposit', 10, 0),
('deposit', 11, 0),
('deposit', 12, 0),
('deposit', 13, 0),
('deposit', 14, 0),
('deposit', 15, 0);

-- Insert default referral settings for trade win bonuses (15 levels)
INSERT INTO public.referral_settings (setting_type, level_number, bonus_percentage) VALUES
('trade_win', 1, 20),
('trade_win', 2, 15),
('trade_win', 3, 10),
('trade_win', 4, 5),
('trade_win', 5, 5),
('trade_win', 6, 0),
('trade_win', 7, 0),
('trade_win', 8, 0),
('trade_win', 9, 0),
('trade_win', 10, 0),
('trade_win', 11, 0),
('trade_win', 12, 0),
('trade_win', 13, 0),
('trade_win', 14, 0),
('trade_win', 15, 0);

-- Add trigger to update updated_at column
CREATE TRIGGER update_referral_settings_updated_at
  BEFORE UPDATE ON public.referral_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
