
-- Add withdraw_pin column to users table
ALTER TABLE public.users 
ADD COLUMN withdraw_pin TEXT;
