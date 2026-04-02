-- =====================================================
-- TechFarm: Smart Return & Tracking Migration
-- Run in your Supabase SQL Editor
-- =====================================================

-- 1. Extend bookings table
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS notification_status TEXT DEFAULT 'pending';

-- Note: late_fee and actual_return_date were already added in the previous migration.
-- If actual_return_date is just DATE, you may want to change it to TIMESTAMP for accurate hourly tracking later,
-- but standard DATE works perfectly for daily penalties.
