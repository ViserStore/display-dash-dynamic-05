
-- Create trade_settings table to store all trade configuration
CREATE TABLE public.trade_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Manual Trade Settings
  manual_min_trade_amount NUMERIC NOT NULL DEFAULT 5,
  manual_max_trade_amount NUMERIC NOT NULL DEFAULT 100,
  manual_daily_trade_limit INTEGER NOT NULL DEFAULT 100,
  
  -- Bot Trade Settings
  bot_profit_type TEXT NOT NULL DEFAULT 'profit' CHECK (bot_profit_type IN ('profit', 'lose')),
  bot_min_trade_amount NUMERIC NOT NULL DEFAULT 10,
  bot_max_trade_amount NUMERIC NOT NULL DEFAULT 200,
  bot_daily_trade_limit INTEGER NOT NULL DEFAULT 5,
  
  -- Bot Trade Time & Profit Settings (stored as JSON for flexibility)
  time_profit_settings JSONB NOT NULL DEFAULT '[
    {"time_hours": 1, "profit_percentage": 2},
    {"time_hours": 3, "profit_percentage": 5},
    {"time_hours": 6, "profit_percentage": 10},
    {"time_hours": 12, "profit_percentage": 15},
    {"time_hours": 24, "profit_percentage": 20}
  ]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for trade_settings table
ALTER TABLE public.trade_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to trade settings
CREATE POLICY "Public read access to trade settings" 
  ON public.trade_settings 
  FOR SELECT 
  USING (true);

-- Allow admin users to perform all operations on trade settings
CREATE POLICY "Admin full access to trade settings" 
  ON public.trade_settings 
  FOR ALL 
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_trade_settings_updated_at
  BEFORE UPDATE ON public.trade_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default trade settings
INSERT INTO public.trade_settings (
  manual_min_trade_amount,
  manual_max_trade_amount,
  manual_daily_trade_limit,
  bot_profit_type,
  bot_min_trade_amount,
  bot_max_trade_amount,
  bot_daily_trade_limit,
  time_profit_settings
) VALUES (
  5,
  100,
  100,
  'profit',
  10,
  200,
  5,
  '[
    {"time_hours": 1, "profit_percentage": 2},
    {"time_hours": 3, "profit_percentage": 5},
    {"time_hours": 6, "profit_percentage": 10},
    {"time_hours": 12, "profit_percentage": 15},
    {"time_hours": 24, "profit_percentage": 20}
  ]'::jsonb
);
