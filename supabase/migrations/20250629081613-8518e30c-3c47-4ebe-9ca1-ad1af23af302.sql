
-- Remove ImageKit columns and add ImgBB API key column
ALTER TABLE public.site_settings 
DROP COLUMN imagekit_public_key,
DROP COLUMN imagekit_private_key,
DROP COLUMN imagekit_url_endpoint,
DROP COLUMN imagekit_id,
ADD COLUMN imgbb_api_key TEXT;

-- Update the existing record with a placeholder for ImgBB API key
UPDATE public.site_settings 
SET imgbb_api_key = NULL;
