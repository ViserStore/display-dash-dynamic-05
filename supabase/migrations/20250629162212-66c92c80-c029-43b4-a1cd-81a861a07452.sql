
-- Update user_bot_trades table to match the JSON structure
ALTER TABLE public.user_bot_trades 
DROP COLUMN IF EXISTS token_symbol,
DROP COLUMN IF EXISTS trade_type,
ADD COLUMN IF NOT EXISTS profit_or_lose TEXT DEFAULT 'profit',
ADD COLUMN IF NOT EXISTS profit_percent NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS profit NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS coins TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS invest_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS return_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS return_time TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Update existing records to use new structure
UPDATE public.user_bot_trades 
SET 
  profit_or_lose = CASE 
    WHEN profit_loss > 0 THEN 'profit' 
    ELSE 'lose' 
  END,
  invest_amount = trade_amount,
  return_amount = trade_amount + profit_loss,
  coins = selected_coins,
  return_time = close_time
WHERE profit_or_lose IS NULL;

-- Remove columns that are no longer needed
ALTER TABLE public.user_bot_trades 
DROP COLUMN IF EXISTS open_price,
DROP COLUMN IF EXISTS close_price;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_bot_trades_profit_or_lose ON public.user_bot_trades(profit_or_lose);
CREATE INDEX IF NOT EXISTS idx_user_bot_trades_return_time ON public.user_bot_trades(return_time);
