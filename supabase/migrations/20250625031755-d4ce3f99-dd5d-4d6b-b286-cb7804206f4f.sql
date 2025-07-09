
-- Create deposits table to store deposit requests
CREATE TABLE public.deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  deposit_method_id UUID REFERENCES public.deposit_methods(id),
  amount NUMERIC NOT NULL,
  transaction_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table to store all transaction records
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'deposit', 'withdraw', 'transfer'
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reference_id UUID, -- references deposits.id, withdrawals.id, etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own data
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for deposits table
CREATE POLICY "Users can view their own deposits" 
  ON public.deposits 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deposits" 
  ON public.deposits 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deposits" 
  ON public.deposits 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policies for transactions table
CREATE POLICY "Users can view their own transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX idx_deposits_status ON public.deposits(status);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
