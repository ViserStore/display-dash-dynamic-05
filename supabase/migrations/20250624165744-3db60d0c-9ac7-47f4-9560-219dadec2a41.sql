
-- Update the profiles table to make username required and unique
ALTER TABLE public.profiles 
ALTER COLUMN username SET NOT NULL;

-- Add unique constraint to username if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_username_key'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
END $$;

-- Update the handle_new_user function to ensure username is always set
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, pay_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name',
    LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
