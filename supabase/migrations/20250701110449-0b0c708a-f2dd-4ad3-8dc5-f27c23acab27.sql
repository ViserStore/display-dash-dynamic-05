
-- Enable real-time for trade_transactions table
ALTER TABLE public.trade_transactions REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER publication supabase_realtime ADD TABLE public.trade_transactions;
