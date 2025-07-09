
-- Add missing columns to trade_transactions table to match the provided data structure
ALTER TABLE public.trade_transactions 
ADD COLUMN IF NOT EXISTS buy_price numeric,
ADD COLUMN IF NOT EXISTS trade_close_price numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS win_loss text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS return_time timestamp with time zone;

-- Update existing columns to match the data structure
ALTER TABLE public.trade_transactions 
ALTER COLUMN status SET DEFAULT 'pending';

-- Add index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_trade_transactions_status ON public.trade_transactions(status);
CREATE INDEX IF NOT EXISTS idx_trade_transactions_user_status ON public.trade_transactions(user_id, status);
