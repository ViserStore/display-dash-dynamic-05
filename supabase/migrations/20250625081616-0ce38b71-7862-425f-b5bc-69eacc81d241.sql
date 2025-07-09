
-- Add profit_status column to coins table to store whether coin is set as profit or loss
ALTER TABLE public.coins 
ADD COLUMN profit_status TEXT DEFAULT 'profit' 
CHECK (profit_status IN ('profit', 'loss'));

-- Update existing records to set profit_status based on current profit_loss values
UPDATE public.coins 
SET profit_status = CASE 
    WHEN profit_loss >= 0 THEN 'profit' 
    ELSE 'loss' 
END;
