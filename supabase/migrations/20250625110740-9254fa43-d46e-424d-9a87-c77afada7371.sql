
-- Add close_price column to trade_transactions table
ALTER TABLE public.trade_transactions 
ADD COLUMN close_price NUMERIC DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.trade_transactions.close_price IS 'The closing price of the trade when it was closed';
