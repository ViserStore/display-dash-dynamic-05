
-- Create bot_trades table to store bot trading data
CREATE TABLE public.bot_trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id),
  trade_amount NUMERIC NOT NULL DEFAULT 0,
  return_amount NUMERIC NOT NULL DEFAULT 0,
  profit_amount NUMERIC NOT NULL DEFAULT 0,
  selected_tokens TEXT[] NOT NULL DEFAULT '{}',
  trade_timer INTEGER NOT NULL DEFAULT 1, -- in hours
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for bot_trades
ALTER TABLE public.bot_trades ENABLE ROW LEVEL SECURITY;

-- Users can view their own bot trades
CREATE POLICY "Users can view their own bot trades" 
  ON public.bot_trades 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own bot trades
CREATE POLICY "Users can create their own bot trades" 
  ON public.bot_trades 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own bot trades
CREATE POLICY "Users can update their own bot trades" 
  ON public.bot_trades 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create bot_tokens table for available tokens
CREATE TABLE public.bot_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert some sample tokens
INSERT INTO public.bot_tokens (symbol, name, image_url) VALUES
('BTC', 'Bitcoin', 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'),
('ETH', 'Ethereum', 'https://cryptologos.cc/logos/ethereum-eth-logo.png'),
('BNB', 'Binance Coin', 'https://cryptologos.cc/logos/bnb-bnb-logo.png'),
('ADA', 'Cardano', 'https://cryptologos.cc/logos/cardano-ada-logo.png'),
('SOL', 'Solana', 'https://cryptologos.cc/logos/solana-sol-logo.png'),
('DOT', 'Polkadot', 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png'),
('AVAX', 'Avalanche', 'https://cryptologos.cc/logos/avalanche-avax-logo.png'),
('MATIC', 'Polygon', 'https://cryptologos.cc/logos/polygon-matic-logo.png'),
('LINK', 'Chainlink', 'https://cryptologos.cc/logos/chainlink-link-logo.png'),
('UNI', 'Uniswap', 'https://cryptologos.cc/logos/uniswap-uni-logo.png');

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_bot_trades_updated_at
  BEFORE UPDATE ON public.bot_trades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bot_tokens_updated_at
  BEFORE UPDATE ON public.bot_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
