
-- First, let's see what policies already exist and add only the missing ones
-- Drop existing policies if they exist to recreate them properly
DROP POLICY IF EXISTS "Users can view own checkins" ON public.user_checkins;
DROP POLICY IF EXISTS "Users can insert own checkins" ON public.user_checkins;
DROP POLICY IF EXISTS "Users can update own checkins" ON public.user_checkins;

-- Recreate the policies with proper auth checks
CREATE POLICY "Users can view own checkins" ON public.user_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins" ON public.user_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins" ON public.user_checkins
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index for better performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_user_checkins_user_id_date ON public.user_checkins(user_id, checkin_date);
