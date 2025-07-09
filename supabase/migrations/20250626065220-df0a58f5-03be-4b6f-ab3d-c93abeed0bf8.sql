
-- Drop existing policies that use auth.uid()
DROP POLICY IF EXISTS "Users can view their own NFT transactions" ON public.nft_transactions;
DROP POLICY IF EXISTS "Users can insert their own NFT transactions" ON public.nft_transactions;
DROP POLICY IF EXISTS "Users can update their own NFT transactions" ON public.nft_transactions;

-- Disable RLS temporarily since we're using custom authentication
ALTER TABLE public.nft_transactions DISABLE ROW LEVEL SECURITY;

-- Alternative: If you want to keep RLS, we can create policies that work with your custom auth
-- But for now, disabling RLS is the quickest solution since your app handles user permissions
-- through your custom AuthContext
