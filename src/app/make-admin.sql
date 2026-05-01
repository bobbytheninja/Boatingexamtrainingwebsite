-- Make User Admin Script
-- 
-- Instructions:
-- 1. Sign up on your site first
-- 2. Go to Supabase Dashboard → Authentication → Users
-- 3. Copy your User ID (looks like: a1b2c3d4-5678-90ab-cdef-1234567890ab)
-- 4. Replace 'YOUR_USER_ID' below with your actual User ID
-- 5. Go to SQL Editor in Supabase Dashboard
-- 6. Paste and run this query

UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE id = 'YOUR_USER_ID';

-- To verify it worked, run this:
-- SELECT id, email, raw_user_meta_data->>'role' as role FROM auth.users;

-- You should see "admin" in the role column for your user
