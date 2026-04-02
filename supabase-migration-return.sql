-- =====================================================
-- TechFarm: Machine Return & Late Penalty Migration
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Add new columns to bookings table
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS actual_return_date DATE,
  ADD COLUMN IF NOT EXISTS late_fee NUMERIC(10, 2) DEFAULT 0;

-- 2. Verify columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'bookings'
  AND column_name IN ('actual_return_date', 'late_fee');
