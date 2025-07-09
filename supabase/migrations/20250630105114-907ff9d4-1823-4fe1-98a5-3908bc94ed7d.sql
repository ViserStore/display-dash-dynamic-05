
-- Enable pg_cron and pg_net extensions for scheduled functions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job that runs every minute to check for expired trades
SELECT cron.schedule(
  'auto-close-expired-trades',
  '* * * * *', -- Run every minute
  $$
  SELECT
    net.http_post(
        url:='https://xgrwsbjqeghsscjovgdj.supabase.co/functions/v1/auto-close-trades',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhncndzYmpxZWdoc3Njam92Z2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjkzOTksImV4cCI6MjA2NjM0NTM5OX0.GrQ4Wm2DZ1ooVbzS6k0yjRc7O9rkwJoVEdpd_jCrbFc"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
