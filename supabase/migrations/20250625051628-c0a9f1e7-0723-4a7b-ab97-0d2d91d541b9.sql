
-- Create notice_settings table
CREATE TABLE public.notice_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scrolling_notice TEXT NOT NULL DEFAULT 'TradeBull - It''s a Option Trading App.',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default notice setting
INSERT INTO public.notice_settings (scrolling_notice) VALUES
('TradeBull - It''s a Option Trading App.');

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_notice_settings_updated_at 
    BEFORE UPDATE ON public.notice_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
