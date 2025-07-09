
-- Ensure RLS is disabled for withdrawals table since custom auth is being used
ALTER TABLE public.withdrawals DISABLE ROW LEVEL SECURITY;

-- Also ensure RLS is disabled for related tables that might have the same issue
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdraw_methods DISABLE ROW LEVEL SECURITY;
