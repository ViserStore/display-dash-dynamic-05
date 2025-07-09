
-- Create user_checkins table to track daily check-ins
CREATE TABLE public.user_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  day_name TEXT NOT NULL,
  bonus_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, checkin_date)
);

-- Add RLS policies
ALTER TABLE public.user_checkins ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own check-ins
CREATE POLICY "Users can view own checkins" ON public.user_checkins
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert their own check-ins
CREATE POLICY "Users can insert own checkins" ON public.user_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_user_checkins_user_id_date ON public.user_checkins(user_id, checkin_date);
