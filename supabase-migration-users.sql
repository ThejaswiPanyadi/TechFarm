-- =====================================================
-- TechFarm: User Management Migration
-- Run in your Supabase SQL Editor
-- =====================================================

-- 1. Add status column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'blocked'));

-- 2. Ensure existing rows default to 'active'
UPDATE profiles SET status = 'active' WHERE status IS NULL;

-- 3. (Optional) Add an index for fast status filtering
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- 4. Verify
SELECT id, full_name, role, status FROM profiles LIMIT 10;
