
-- Remove profit_status column from coins table as it's no longer needed
ALTER TABLE public.coins DROP COLUMN IF EXISTS profit_status;

-- Update existing records to ensure profit_loss values are properly set as percentages
-- This ensures all coins have valid profit_loss percentages
UPDATE public.coins 
SET profit_loss = CASE 
    WHEN profit_loss IS NULL THEN 10
    WHEN profit_loss = 0 THEN 10
    ELSE ABS(profit_loss)
END
WHERE profit_loss IS NULL OR profit_loss = 0;
