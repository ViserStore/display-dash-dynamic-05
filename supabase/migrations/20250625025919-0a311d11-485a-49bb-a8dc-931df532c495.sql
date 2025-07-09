
-- Add deposit_address column to deposit_methods table
ALTER TABLE public.deposit_methods 
ADD COLUMN deposit_address TEXT;

-- Update existing records with sample addresses
UPDATE public.deposit_methods 
SET deposit_address = CASE 
  WHEN name = 'Nagad' THEN '01712345678'
  WHEN name = 'bKash' THEN '01987654321'
  WHEN name = 'USDT (TRC 20)' THEN 'TAjQiD4J3xJbNAaEbE3EvcuvSygXgM4rA5'
  ELSE 'ADDRESS_NOT_SET'
END;
