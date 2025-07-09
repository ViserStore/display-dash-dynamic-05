
-- Remove order_priority column from banners table
ALTER TABLE public.banners DROP COLUMN IF EXISTS order_priority;
