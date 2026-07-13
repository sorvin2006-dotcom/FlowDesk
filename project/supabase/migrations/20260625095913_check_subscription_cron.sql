-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily subscription status check at 00:05 UTC
SELECT cron.schedule(
  'check-subscription-daily',
  '5 0 * * *',
  $$
  UPDATE profiles
  SET subscription_status = 'expired'
  WHERE subscription_status = 'trial'
    AND trial_ends_at < NOW();

  UPDATE profiles
  SET subscription_status = 'expired'
  WHERE subscription_status = 'active'
    AND subscription_ends_at IS NOT NULL
    AND subscription_ends_at < NOW();
  $$
);
