
-- Create contact_details table
CREATE TABLE public.contact_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  link TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert some default contact details
INSERT INTO public.contact_details (name, link) VALUES
('Telegram', 'https://t.me/tradebull'),
('Telegram Group', 'https://t.me/tradebullgroup'),
('Whatsapp', 'https://wa.me/1234567890');

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_contact_details_updated_at 
    BEFORE UPDATE ON public.contact_details 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
