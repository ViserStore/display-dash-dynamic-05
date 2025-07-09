
-- Remove token_symbol column from user_bot_trades table since we'll use selected_coins instead
ALTER TABLE public.user_bot_trades DROP COLUMN IF EXISTS token_symbol;

-- Add timezone column to store user's timezone for accurate time calculations
ALTER TABLE public.user_bot_trades ADD COLUMN IF NOT EXISTS user_timezone TEXT DEFAULT 'UTC';

-- Add location columns to store user's location data
ALTER TABLE public.user_bot_trades ADD COLUMN IF NOT EXISTS user_latitude NUMERIC DEFAULT NULL;
ALTER TABLE public.user_bot_trades ADD COLUMN IF NOT EXISTS user_longitude NUMERIC DEFAULT NULL;
