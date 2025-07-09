
-- Create a table for storing trade transactions
CREATE TABLE public.trade_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  trade_type TEXT NOT NULL, -- 'BUY' or 'SELL'
  action TEXT NOT NULL, -- 'OPEN' or 'CLOSE'
  amount NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  profit_loss NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SUCCESS', 'FAILED'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trade_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for trade transactions
CREATE POLICY "Users can view their own trade transactions" 
  ON public.trade_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trade transactions" 
  ON public.trade_transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trade transactions" 
  ON public.trade_transactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_trade_transactions_user_id ON public.trade_transactions(user_id);
CREATE INDEX idx_trade_transactions_created_at ON public.trade_transactions(created_at);
