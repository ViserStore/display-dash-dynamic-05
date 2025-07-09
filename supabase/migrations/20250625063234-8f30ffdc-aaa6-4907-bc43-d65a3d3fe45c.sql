
-- Create the storage bucket for deposit method images
INSERT INTO storage.buckets (id, name, public)
VALUES ('deposit-method-images', 'deposit-method-images', true);

-- Create storage policies to allow public access
CREATE POLICY "Anyone can view deposit method images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'deposit-method-images');

CREATE POLICY "Anyone can upload deposit method images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'deposit-method-images');

CREATE POLICY "Anyone can update deposit method images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'deposit-method-images');

CREATE POLICY "Anyone can delete deposit method images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'deposit-method-images');
