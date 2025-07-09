
-- Create a table for user balances
CREATE TABLE public.user_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  balance DECIMAL(20, 8) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, currency)
);

-- Enable Row Level Security
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;

-- Create policies for user balances
CREATE POLICY "Users can view their own balance" 
  ON public.user_balances 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own balance" 
  ON public.user_balances 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own balance" 
  ON public.user_balances 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Insert a default balance for testing (you can remove this later)
INSERT INTO public.user_balances (user_id, balance, currency)
SELECT id, 0.50, 'USD' 
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM public.user_balances WHERE currency = 'USD');
