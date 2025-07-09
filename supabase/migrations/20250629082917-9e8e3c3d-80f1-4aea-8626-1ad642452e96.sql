
-- Enable real-time updates for the tables we need to monitor
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.coins REPLICA IDENTITY FULL;

-- Add tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coins;
