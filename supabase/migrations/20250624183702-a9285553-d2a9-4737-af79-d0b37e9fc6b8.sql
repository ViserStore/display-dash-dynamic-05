
-- Create withdraw_methods table
CREATE TABLE public.withdraw_methods (
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

-- Insert sample withdraw methods
INSERT INTO public.withdraw_methods (name, currency, image_url, order_priority) VALUES
('Nagad', 'Taka', 'https://i.ibb.co/dtKh38Y/images.png', 1),
('bKash', 'Taka', 'https://i.ibb.co/87CCnW3/5e6ab3fa58a91.png', 2),
('USDT (TRC 20)', 'USDT', 'https://i.ibb.co/dkbyxQM/tether-usdt-badge-crypto-isolated-on-white-background-blockchain-technology-3d-rendering-free-png.webp', 3);

-- Enable Row Level Security
ALTER TABLE public.withdraw_methods ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view withdraw methods
CREATE POLICY "Anyone can view withdraw methods" 
  ON public.withdraw_methods 
  FOR SELECT 
  TO PUBLIC
  USING (true);
