
-- Create daily_checkin_settings table
CREATE TABLE public.daily_checkin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_name TEXT NOT NULL UNIQUE,
  bonus_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default daily check-in settings
INSERT INTO public.daily_checkin_settings (day_name, bonus_amount) VALUES
('Saturday', 0.01),
('Sunday', 0.02),
('Monday', 0.03),
('Tuesday', 0.04),
('Wednesday', 0.05),
('Thursday', 0.06),
('Friday', 0.07);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_daily_checkin_settings_updated_at 
    BEFORE UPDATE ON public.daily_checkin_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
