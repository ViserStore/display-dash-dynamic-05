
-- Add balance column to users table
ALTER TABLE public.users ADD COLUMN balance DECIMAL(20, 8) NOT NULL DEFAULT 0.00;

-- Set default balance for existing users
UPDATE public.users SET balance = 0.50 WHERE balance = 0.00;

-- Drop the user_balances table
DROP TABLE public.user_balances;
