
-- Drop existing policies that rely on auth.uid()
DROP POLICY IF EXISTS "Users can view their own deposits" ON public.deposits;
DROP POLICY IF EXISTS "Users can create their own deposits" ON public.deposits;
DROP POLICY IF EXISTS "Users can update their own deposits" ON public.deposits;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;

-- Disable RLS temporarily to allow all operations
-- Since you're using custom authentication, you'll manage access control in your application code
ALTER TABLE public.deposits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;

-- Alternative: If you want to keep RLS enabled but allow authenticated users to manage their own data
-- You would need to create policies that work with your custom auth system
-- For now, disabling RLS is the quickest solution for your custom auth setup
