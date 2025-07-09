
-- Add missing columns to trade_transactions table for better trade tracking
ALTER TABLE public.trade_transactions 
ADD COLUMN IF NOT EXISTS closing_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS trade_status TEXT DEFAULT 'PENDING';

-- Add comment to explain the new columns
COMMENT ON COLUMN public.trade_transactions.closing_time IS 'The exact time when the trade was closed';
COMMENT ON COLUMN public.trade_transactions.trade_status IS 'Trade status: PENDING (when opened), PROFIT (when won), LOSS (when lost)';

-- Create index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_trade_transactions_trade_status ON public.trade_transactions(trade_status);
CREATE INDEX IF NOT EXISTS idx_trade_transactions_closing_time ON public.trade_transactions(closing_time);

-- Update existing records to set proper status based on profit_loss
UPDATE public.trade_transactions 
SET trade_status = CASE 
    WHEN action = 'OPEN' THEN 'PENDING'
    WHEN action = 'CLOSE' AND profit_loss > 0 THEN 'PROFIT'
    WHEN action = 'CLOSE' AND profit_loss <= 0 THEN 'LOSS'
    ELSE 'PENDING'
END
WHERE trade_status = 'PENDING' OR trade_status IS NULL;

-- Update closing_time for existing CLOSE records
UPDATE public.trade_transactions 
SET closing_time = updated_at 
WHERE action = 'CLOSE' AND closing_time IS NULL;
