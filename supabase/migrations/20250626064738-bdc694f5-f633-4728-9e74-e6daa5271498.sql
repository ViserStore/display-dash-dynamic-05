
-- Create NFT transactions table to store all investment data
CREATE TABLE public.nft_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nft_id UUID NOT NULL REFERENCES public.nfts(id) ON DELETE CASCADE,
  investment_amount NUMERIC NOT NULL,
  return_amount NUMERIC NOT NULL DEFAULT 0,
  latest_return_amount NUMERIC NOT NULL DEFAULT 0,
  return_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  invested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  next_return_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.nft_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for NFT transactions
CREATE POLICY "Users can view their own NFT transactions" 
  ON public.nft_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own NFT transactions" 
  ON public.nft_transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own NFT transactions" 
  ON public.nft_transactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_nft_transactions_user_id ON public.nft_transactions(user_id);
CREATE INDEX idx_nft_transactions_nft_id ON public.nft_transactions(nft_id);
CREATE INDEX idx_nft_transactions_status ON public.nft_transactions(status);
CREATE INDEX idx_nft_transactions_expires_at ON public.nft_transactions(expires_at);

-- Create trigger to update updated_at column
CREATE TRIGGER update_nft_transactions_updated_at
    BEFORE UPDATE ON public.nft_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
