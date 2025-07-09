
-- Create NFTs table
CREATE TABLE public.nfts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT,
  min_invest_limit NUMERIC NOT NULL DEFAULT 0,
  max_invest_limit NUMERIC NOT NULL DEFAULT 0,
  min_profit_percentage NUMERIC NOT NULL DEFAULT 0,
  max_profit_percentage NUMERIC NOT NULL DEFAULT 0,
  nft_date TEXT,
  validity_days INTEGER NOT NULL DEFAULT 0,
  website_link TEXT,
  details TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for NFTs table
ALTER TABLE public.nfts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to NFTs
CREATE POLICY "Public read access to NFTs" 
  ON public.nfts 
  FOR SELECT 
  USING (true);

-- Allow admin users to perform all operations on NFTs
CREATE POLICY "Admin full access to NFTs" 
  ON public.nfts 
  FOR ALL 
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_nfts_updated_at
  BEFORE UPDATE ON public.nfts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
