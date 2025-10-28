-- Drop all existing policies before recreating them
-- Run this BEFORE rls_policies.sql if you're re-running the policies

-- Drop Companies policies
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Admins can update their company" ON companies;
DROP POLICY IF EXISTS "Anyone can insert companies (for signup)" ON companies;

-- Drop Profiles policies
DROP POLICY IF EXISTS "Users can view profiles in their company" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles in their company" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles in their company" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Drop Approval Rules policies
DROP POLICY IF EXISTS "Users can view rules in their company" ON approval_rules;
DROP POLICY IF EXISTS "Admins can manage rules in their company" ON approval_rules;
DROP POLICY IF EXISTS "Users can view rules" ON approval_rules;
DROP POLICY IF EXISTS "Admins can manage rules" ON approval_rules;

-- Drop Expenses policies
DROP POLICY IF EXISTS "Users can view expenses in their company" ON expenses;
DROP POLICY IF EXISTS "Employees can insert their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update their own draft expenses" ON expenses;
DROP POLICY IF EXISTS "Admins can update all company expenses" ON expenses;
DROP POLICY IF EXISTS "Admins can delete expenses in their company" ON expenses;
DROP POLICY IF EXISTS "Users can view expenses" ON expenses;
DROP POLICY IF EXISTS "Admins can update all expenses" ON expenses;
DROP POLICY IF EXISTS "Admins can delete expenses" ON expenses;

-- Drop Expense Approvals policies
DROP POLICY IF EXISTS "Users can view approvals for expenses in their company" ON expense_approvals;
DROP POLICY IF EXISTS "System can insert approvals" ON expense_approvals;
DROP POLICY IF EXISTS "Approvers can update their own approvals" ON expense_approvals;
DROP POLICY IF EXISTS "Users can view approvals" ON expense_approvals;
