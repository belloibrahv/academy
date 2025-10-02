-- Fix RLS policies for assignments table
-- This ensures admins can create, read, update, and delete assignments

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage assignments" ON assignments;
DROP POLICY IF EXISTS "Students can view assignments for their cohorts" ON assignments;
DROP POLICY IF EXISTS "Anyone can view assignments" ON assignments;

-- Enable RLS if not already enabled
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admins can manage all assignments (CRUD operations)
CREATE POLICY "Admins can manage assignments" ON assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy 2: Students can view assignments for their cohorts
CREATE POLICY "Students can view assignments for their cohorts" ON assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_cohorts sc
      JOIN profiles p ON p.user_id = auth.uid()
      WHERE sc.student_id = auth.uid() 
      AND sc.cohort_id = assignments.cohort_id
      AND p.role = 'student'
    )
  );

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'assignments';

-- Test query to verify admin access
-- This should return true if you're logged in as an admin
SELECT EXISTS (
  SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
) as is_admin;
