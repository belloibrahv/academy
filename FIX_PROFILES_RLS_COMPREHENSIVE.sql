-- Comprehensive Fix for Profiles Table RLS Policies
-- This script addresses the "Error fetching profile" issue

-- First, let's check the current state of the profiles table and policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own profile (for registration)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Policy 5: Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Verify the new policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Test queries to verify policies work
-- This should work for any authenticated user
SELECT 'Testing own profile access' as test_name;
SELECT * FROM profiles WHERE user_id = auth.uid();

-- Check if there are any profiles in the table
SELECT 'Profile count check' as test_name;
SELECT COUNT(*) as total_profiles FROM profiles;

-- Check for the specific test user profiles
SELECT 'Test user profiles check' as test_name;
SELECT user_id, full_name, role, registration_status 
FROM profiles 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('belloibrahim@techvaults.com', 'belloibrahv@gmail.com')
);

-- If no profiles exist, we need to create them
-- First, let's check if the auth users exist
SELECT 'Auth users check' as test_name;
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email IN ('belloibrahim@techvaults.com', 'belloibrahv@gmail.com');

-- Create admin profile if it doesn't exist
INSERT INTO profiles (user_id, full_name, role, registration_status)
SELECT 
  id, 
  'Admin User', 
  'admin', 
  'active'
FROM auth.users 
WHERE email = 'belloibrahim@techvaults.com'
AND NOT EXISTS (
  SELECT 1 FROM profiles WHERE user_id = auth.users.id
);

-- Create student profile if it doesn't exist
INSERT INTO profiles (user_id, full_name, role, registration_status)
SELECT 
  id, 
  'Student User', 
  'student', 
  'active'
FROM auth.users 
WHERE email = 'belloibrahv@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM profiles WHERE user_id = auth.users.id
);

-- Final verification
SELECT 'Final verification' as test_name;
SELECT 
  p.user_id,
  u.email,
  p.full_name,
  p.role,
  p.registration_status
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE u.email IN ('belloibrahim@techvaults.com', 'belloibrahv@gmail.com');
