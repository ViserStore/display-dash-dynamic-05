
-- Create deposit_methods table
CREATE TABLE public.deposit_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  currency TEXT NOT NULL,
  image_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  order_priority INTEGER NOT NULL DEFAULT 0,
  min_amount DECIMAL(20, 8) DEFAULT 0,
  max_amount DECIMAL(20, 8) DEFAULT 999999999,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert sample deposit methods
INSERT INTO public.deposit_methods (name, currency, image_url, order_priority) VALUES
('Nagad', 'Taka', 'https://i.ibb.co.com/bdWDb6V/images.png', 1),
('bKash', 'Taka', 'https://i.ibb.co.com/X2CWKhy/5e6ab3fa58a91.png', 2),
('USDT (TRC 20)', 'USDT', 'https://i.ibb.co.com/QJK8Vg9/tether-usdt-badge-crypto-isolated-on-white-background-blockchain-technology-3d-rendering-free-png.webp', 3);

-- Enable Row Level Security (optional - make public for now)
ALTER TABLE public.deposit_methods ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view deposit methods
CREATE POLICY "Anyone can view deposit methods" 
  ON public.deposit_methods 
  FOR SELECT 
  TO PUBLIC
  USING (true);
