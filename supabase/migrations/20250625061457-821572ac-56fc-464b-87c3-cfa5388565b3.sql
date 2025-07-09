
-- Add the symbol column to the existing deposit_methods table
ALTER TABLE public.deposit_methods 
ADD COLUMN IF NOT EXISTS symbol TEXT NOT NULL DEFAULT '$';

-- Update existing records with proper symbols
UPDATE public.deposit_methods 
SET symbol = CASE 
  WHEN currency = 'Taka' THEN '৳'
  WHEN currency = 'USDT' THEN '$'
  ELSE '$'
END;

-- Insert sample deposit methods if they don't exist (without symbol in the insert since we'll update it)
INSERT INTO public.deposit_methods (name, currency, image_url, min_amount, max_amount, deposit_address, order_priority) 
SELECT 'Nagad', 'Taka', 'https://i.ibb.co/dtKh38Y/images.png', 5, 500, '01712345678', 1
WHERE NOT EXISTS (SELECT 1 FROM public.deposit_methods WHERE name = 'Nagad');

INSERT INTO public.deposit_methods (name, currency, image_url, min_amount, max_amount, deposit_address, order_priority) 
SELECT 'bKash', 'Taka', 'https://i.ibb.co/87CCnW3/5e6ab3fa58a91.png', 5, 500, '01987654321', 2
WHERE NOT EXISTS (SELECT 1 FROM public.deposit_methods WHERE name = 'bKash');

INSERT INTO public.deposit_methods (name, currency, image_url, min_amount, max_amount, deposit_address, order_priority) 
SELECT 'USDT (TRC 20)', 'USDT', 'https://i.ibb.co/dkbyxQM/tether-usdt-badge-crypto-isolated-on-white-background-blockchain-technology-3d-rendering-free-png.webp', 5, 1000, 'TAjQiD4J3xJbNAaEbE3EvcuvSygXgM4rA5', 3
WHERE NOT EXISTS (SELECT 1 FROM public.deposit_methods WHERE name = 'USDT (TRC 20)');

-- Update symbols for the newly inserted records
UPDATE public.deposit_methods 
SET symbol = CASE 
  WHEN currency = 'Taka' THEN '৳'
  WHEN currency = 'USDT' THEN '$'
  ELSE '$'
END
WHERE symbol = '$' AND currency != 'USDT';

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Anyone can view deposit methods" ON public.deposit_methods;
DROP POLICY IF EXISTS "Admins can manage deposit methods" ON public.deposit_methods;

-- Create policy to allow anyone to view deposit methods (for public access)
CREATE POLICY "Anyone can view deposit methods" 
  ON public.deposit_methods 
  FOR SELECT 
  TO PUBLIC
  USING (true);

-- Create policy for admin operations
CREATE POLICY "Admins can manage deposit methods" 
  ON public.deposit_methods 
  FOR ALL 
  TO PUBLIC
  USING (true);
