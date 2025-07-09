
-- Create withdrawals table to store withdrawal requests
CREATE TABLE public.withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  withdraw_method_id UUID REFERENCES public.withdraw_methods(id),
  amount NUMERIC NOT NULL,
  payment_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Disable RLS since you're using custom authentication
-- Row Level Security is not compatible with your custom auth system
ALTER TABLE public.withdrawals DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON public.withdrawals(status);
