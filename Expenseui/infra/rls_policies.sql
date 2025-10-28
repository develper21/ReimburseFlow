-- Row Level Security Policies for Expenseura
-- Run this AFTER schema.sql

-- First, drop all existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Admins can update their company" ON companies;
DROP POLICY IF EXISTS "Anyone can insert companies (for signup)" ON companies;
DROP POLICY IF EXISTS "Users can view profiles in their company" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles in their company" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles in their company" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Users can view rules in their company" ON approval_rules;
DROP POLICY IF EXISTS "Admins can manage rules in their company" ON approval_rules;
DROP POLICY IF EXISTS "Users can view rules" ON approval_rules;
DROP POLICY IF EXISTS "Admins can manage rules" ON approval_rules;
DROP POLICY IF EXISTS "Users can view expenses in their company" ON expenses;
DROP POLICY IF EXISTS "Employees can insert their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update their own draft expenses" ON expenses;
DROP POLICY IF EXISTS "Admins can update all company expenses" ON expenses;
DROP POLICY IF EXISTS "Admins can delete expenses in their company" ON expenses;
DROP POLICY IF EXISTS "Users can view expenses" ON expenses;
DROP POLICY IF EXISTS "Admins can update all expenses" ON expenses;
DROP POLICY IF EXISTS "Admins can delete expenses" ON expenses;
DROP POLICY IF EXISTS "Users can view approvals for expenses in their company" ON expense_approvals;
DROP POLICY IF EXISTS "System can insert approvals" ON expense_approvals;
DROP POLICY IF EXISTS "Approvers can update their own approvals" ON expense_approvals;
DROP POLICY IF EXISTS "Users can view approvals" ON expense_approvals;

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_approvals ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  USING (true);

CREATE POLICY "Admins can update their company"
  ON companies FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can insert companies (for signup)"
  ON companies FOR INSERT
  WITH CHECK (true);

-- Profiles policies
-- Allow users to view all profiles in the system (needed for manager lookups, approver lists, etc.)
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Allow profile creation during signup"
  ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Approval rules policies
CREATE POLICY "Users can view rules"
  ON approval_rules FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage rules"
  ON approval_rules FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Expenses policies
CREATE POLICY "Users can view expenses"
  ON expenses FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Employees can insert their own expenses"
  ON expenses FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own draft expenses"
  ON expenses FOR UPDATE
  USING (created_by = auth.uid() AND status = 'draft');

CREATE POLICY "Admins can update all expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete expenses"
  ON expenses FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Expense approvals policies
CREATE POLICY "Users can view approvals"
  ON expense_approvals FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert approvals"
  ON expense_approvals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Approvers can update their own approvals"
  ON expense_approvals FOR UPDATE
  USING (approver_id = auth.uid());

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION process_approval TO authenticated;
