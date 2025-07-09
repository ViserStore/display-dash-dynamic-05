
-- Create table to store individual coin performance for bot trades
CREATE TABLE public.bot_trade_coin_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_trade_id UUID NOT NULL,
  coin_symbol TEXT NOT NULL,
  invested_amount NUMERIC NOT NULL DEFAULT 0,
  return_amount NUMERIC NOT NULL DEFAULT 0,
  profit_loss NUMERIC NOT NULL DEFAULT 0,
  profit_percentage NUMERIC NOT NULL DEFAULT 0,
  is_profit BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint
ALTER TABLE public.bot_trade_coin_performance 
ADD CONSTRAINT fk_bot_trade_coin_performance_trade_id 
FOREIGN KEY (bot_trade_id) REFERENCES public.user_bot_trades(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.bot_trade_coin_performance ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Allow all bot trade coin performance access" 
  ON public.bot_trade_coin_performance 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_bot_trade_coin_performance_updated_at
  BEFORE UPDATE ON public.bot_trade_coin_performance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bot_trade_coin_performance_trade_id ON public.bot_trade_coin_performance(bot_trade_id);
CREATE INDEX IF NOT EXISTS idx_bot_trade_coin_performance_coin_symbol ON public.bot_trade_coin_performance(coin_symbol);
