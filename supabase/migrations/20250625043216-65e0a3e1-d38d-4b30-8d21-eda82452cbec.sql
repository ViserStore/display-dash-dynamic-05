
-- Add ImageKit configuration fields and remove crypto_api_key
ALTER TABLE public.site_settings 
ADD COLUMN imagekit_public_key TEXT,
ADD COLUMN imagekit_private_key TEXT,
ADD COLUMN imagekit_url_endpoint TEXT,
ADD COLUMN imagekit_id TEXT,
DROP COLUMN crypto_api_key;

-- Update the existing record with the provided ImageKit values
UPDATE public.site_settings 
SET 
  imagekit_public_key = 'public_w9M6vx/bHtF6WampdhVcwtiDowo=',
  imagekit_private_key = 'private_kbjfsLWYEU01EO9cu11YjQJVU+k=',
  imagekit_url_endpoint = 'https://ik.imagekit.io/r1amuht2z/',
  imagekit_id = 'r1amuht2z';
