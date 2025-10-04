-- Complete fix for infinite recursion in RLS policies
-- Run this in your Supabase SQL Editor

-- Drop ALL existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can view expenses they need to approve" ON expenses;
DROP POLICY IF EXISTS "Managers can view expenses from their team" ON expenses;
DROP POLICY IF EXISTS "Admins can view all expenses in their company" ON expenses;
DROP POLICY IF EXISTS "Users can create their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update their own draft expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete their own draft expenses" ON expenses;

DROP POLICY IF EXISTS "Users can view approvals for their expenses" ON expense_approvals;
DROP POLICY IF EXISTS "Users can view approvals they need to handle" ON expense_approvals;
DROP POLICY IF EXISTS "Managers can view approvals for their team's expenses" ON expense_approvals;
DROP POLICY IF EXISTS "Admins can view all approvals in their company" ON expense_approvals;
DROP POLICY IF EXISTS "Approvers can update their own approvals" ON expense_approvals;

-- Drop the conflicting policies
DROP POLICY IF EXISTS "Authenticated users can view companies" ON companies;
DROP POLICY IF EXISTS "Authenticated users can view workflows" ON approval_workflows;

-- Create SIMPLE, SAFE policies that don't cause recursion

-- Users table - only allow users to see their own data
CREATE POLICY "Users can view their own profile" ON users
FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON users
FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON users
FOR INSERT WITH CHECK (id = auth.uid());

-- Expenses table - only allow users to see their own expenses
CREATE POLICY "Users can view their own expenses" ON expenses
FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Users can create their own expenses" ON expenses
FOR INSERT WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Users can update their own draft expenses" ON expenses
FOR UPDATE USING (employee_id = auth.uid() AND status = 'draft');

CREATE POLICY "Users can delete their own draft expenses" ON expenses
FOR DELETE USING (employee_id = auth.uid() AND status = 'draft');

-- Expense approvals - only allow users to see approvals they need to handle
CREATE POLICY "Users can view their own approvals" ON expense_approvals
FOR SELECT USING (approver_id = auth.uid());

CREATE POLICY "Users can update their own approvals" ON expense_approvals
FOR UPDATE USING (approver_id = auth.uid());

-- Companies - allow all authenticated users to view
CREATE POLICY "Authenticated users can view companies" ON companies
FOR SELECT USING (auth.role() = 'authenticated');

-- Approval workflows - allow all authenticated users to view
CREATE POLICY "Authenticated users can view workflows" ON approval_workflows
FOR SELECT USING (auth.role() = 'authenticated');

-- Note: For admin functionality, we'll handle the filtering in the application code
-- This avoids the recursion issues while still maintaining security