
-- Remove the foreign key constraint from profiles table
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Since we're no longer using Supabase auth, we can also disable RLS
-- as we're handling authentication manually in our application
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop the existing policies since we're not using Supabase auth
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Remove the trigger that was designed for Supabase auth users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
