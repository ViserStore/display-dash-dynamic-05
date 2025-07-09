
-- Add bot_balance column to users table
ALTER TABLE public.users ADD COLUMN bot_balance NUMERIC NOT NULL DEFAULT 0.00;

-- Insert the 15 tokens into bot_tokens table
INSERT INTO public.bot_tokens (symbol, name, image_url) VALUES
('BTC', 'Bitcoin', 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'),
('ETH', 'Ethereum', 'https://cryptologos.cc/logos/ethereum-eth-logo.png'),
('SOL', 'Solana', 'https://cryptologos.cc/logos/solana-sol-logo.png'),
('LTC', 'Litecoin', 'https://cryptologos.cc/logos/litecoin-ltc-logo.png'),
('ADA', 'Cardano', 'https://cryptologos.cc/logos/cardano-ada-logo.png'),
('APT', 'Aptos', 'https://cryptologos.cc/logos/aptos-apt-logo.png'),
('BANANAS31', 'Bananas', 'https://via.placeholder.com/32x32?text=BANANAS31'),
('BCH', 'Bitcoin Cash', 'https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png'),
('BNB', 'Binance Coin', 'https://cryptologos.cc/logos/bnb-bnb-logo.png'),
('DOGE', 'Dogecoin', 'https://cryptologos.cc/logos/dogecoin-doge-logo.png'),
('ENA', 'Ethena', 'https://via.placeholder.com/32x32?text=ENA'),
('FDUSD', 'First Digital USD', 'https://via.placeholder.com/32x32?text=FDUSD'),
('FUN', 'FunFair', 'https://via.placeholder.com/32x32?text=FUN'),
('LPT', 'Livepeer', 'https://cryptologos.cc/logos/livepeer-lpt-logo.png'),
('NEIRO', 'Neiro', 'https://via.placeholder.com/32x32?text=NEIRO')
ON CONFLICT (symbol) DO UPDATE SET
name = EXCLUDED.name,
image_url = EXCLUDED.image_url;

-- Create user_bot_trades table to store all bot trade records
CREATE TABLE public.user_bot_trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_symbol TEXT NOT NULL,
  trade_type TEXT NOT NULL, -- 'BUY' or 'SELL'
  trade_amount NUMERIC NOT NULL DEFAULT 0,
  open_price NUMERIC NOT NULL DEFAULT 0,
  close_price NUMERIC,
  profit_loss NUMERIC DEFAULT 0,
  trade_timer INTEGER NOT NULL DEFAULT 1, -- in hours
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, cancelled
  open_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  close_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for user_bot_trades
ALTER TABLE public.user_bot_trades ENABLE ROW LEVEL SECURITY;

-- Users can view their own bot trades
CREATE POLICY "Users can view their own bot trades" 
  ON public.user_bot_trades 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own bot trades
CREATE POLICY "Users can create their own bot trades" 
  ON public.user_bot_trades 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own bot trades
CREATE POLICY "Users can update their own bot trades" 
  ON public.user_bot_trades 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_user_bot_trades_updated_at
  BEFORE UPDATE ON public.user_bot_trades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
