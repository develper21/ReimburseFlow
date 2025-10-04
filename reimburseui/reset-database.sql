-- Reset Database Schema
-- Run this in your Supabase SQL Editor to fix the infinite recursion issue

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view users in their company" ON users;
DROP POLICY IF EXISTS "Admins can manage users in their company" ON users;
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Users can update their own company" ON companies;
DROP POLICY IF EXISTS "Users can view workflows in their company" ON approval_workflows;
DROP POLICY IF EXISTS "Admins can manage workflows in their company" ON approval_workflows;

-- Recreate the fixed policies
-- Companies policies
CREATE POLICY "Authenticated users can view companies" ON companies
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update companies" ON companies
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
        AND u.company_id = companies.id
    )
);

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON users
FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can view all users" ON users
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
);

CREATE POLICY "Admins can manage all users" ON users
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
);

-- Approval workflows policies
CREATE POLICY "Authenticated users can view workflows" ON approval_workflows
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage workflows" ON approval_workflows
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
);
