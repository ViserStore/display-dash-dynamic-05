
-- Remove profit_status column from coins table
ALTER TABLE public.coins DROP COLUMN IF EXISTS profit_status;

-- Remove the check constraint that was associated with profit_status
-- (This will be automatically removed when the column is dropped)
