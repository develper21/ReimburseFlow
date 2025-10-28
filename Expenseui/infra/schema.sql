-- Expenseura Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT,
  base_currency TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin','manager','employee')) NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approval rules configuration
CREATE TABLE approval_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_manager_approver BOOLEAN DEFAULT FALSE,
  approver_ids UUID[] DEFAULT '{}',
  sequence_order BOOLEAN DEFAULT TRUE,
  rule_type TEXT CHECK(rule_type IN ('percentage','specific','hybrid')) NOT NULL DEFAULT 'percentage',
  percentage_required INT DEFAULT 60,
  specific_approver UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  created_by UUID REFERENCES profiles(id),
  description TEXT,
  category TEXT,
  date_of_expense DATE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  amount_base NUMERIC,
  base_currency TEXT,
  paid_by TEXT,
  status TEXT CHECK(status IN ('draft','pending','approved','rejected')) DEFAULT 'draft',
  receipt_path TEXT,
  approval_rule_id UUID REFERENCES approval_rules(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense approvals tracking
CREATE TABLE expense_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES profiles(id),
  sequence_index INT,
  status TEXT CHECK(status IN ('pending','approved','rejected','skipped')) DEFAULT 'pending',
  comment TEXT,
  acted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- View for expense status with approval counts
CREATE VIEW expense_status_view AS
SELECT 
  e.*,
  (SELECT COUNT(*) FILTER (WHERE ea.status='approved') 
   FROM expense_approvals ea WHERE ea.expense_id = e.id) AS approved_count,
  (SELECT COUNT(*) 
   FROM expense_approvals ea WHERE ea.expense_id = e.id) AS total_approvers
FROM expenses e;

-- Function to process approval/rejection
CREATE OR REPLACE FUNCTION process_approval(
  p_expense_id UUID,
  p_approver_id UUID,
  p_action TEXT,
  p_comment TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expense RECORD;
  v_approval RECORD;
  v_rule RECORD;
  v_approved_count INT;
  v_total_approvers INT;
  v_percentage NUMERIC;
  v_result JSON;
BEGIN
  -- Get expense details
  SELECT * INTO v_expense FROM expenses WHERE id = p_expense_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Expense not found');
  END IF;
  
  -- Get approval record
  SELECT * INTO v_approval 
  FROM expense_approvals 
  WHERE expense_id = p_expense_id AND approver_id = p_approver_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Not authorized to approve this expense');
  END IF;
  
  IF v_approval.status != 'pending' THEN
    RETURN json_build_object('success', false, 'message', 'Approval already processed');
  END IF;
  
  -- Update approval record
  UPDATE expense_approvals
  SET status = p_action,
      comment = p_comment,
      acted_at = NOW()
  WHERE id = v_approval.id;
  
  -- If rejected, mark expense as rejected
  IF p_action = 'rejected' THEN
    UPDATE expenses SET status = 'rejected' WHERE id = p_expense_id;
    RETURN json_build_object('success', true, 'message', 'Expense rejected', 'status', 'rejected');
  END IF;
  
  -- Get approval rule
  SELECT * INTO v_rule FROM approval_rules WHERE id = v_expense.approval_rule_id;
  
  -- Calculate approval progress
  SELECT 
    COUNT(*) FILTER (WHERE status = 'approved'),
    COUNT(*)
  INTO v_approved_count, v_total_approvers
  FROM expense_approvals
  WHERE expense_id = p_expense_id;
  
  -- Check if expense should be approved based on rule
  IF v_rule.rule_type = 'specific' THEN
    -- If specific approver approved, mark as approved
    IF v_rule.specific_approver = p_approver_id THEN
      UPDATE expenses SET status = 'approved' WHERE id = p_expense_id;
      RETURN json_build_object('success', true, 'message', 'Expense approved by specific approver', 'status', 'approved');
    END IF;
  ELSIF v_rule.rule_type = 'percentage' THEN
    -- Check if percentage threshold met
    v_percentage := (v_approved_count::NUMERIC / v_total_approvers::NUMERIC) * 100;
    IF v_percentage >= v_rule.percentage_required THEN
      UPDATE expenses SET status = 'approved' WHERE id = p_expense_id;
      RETURN json_build_object('success', true, 'message', 'Expense approved (percentage met)', 'status', 'approved');
    END IF;
  ELSIF v_rule.rule_type = 'hybrid' THEN
    -- Combination of specific and percentage
    IF v_rule.specific_approver = p_approver_id THEN
      UPDATE expenses SET status = 'approved' WHERE id = p_expense_id;
      RETURN json_build_object('success', true, 'message', 'Expense approved by specific approver', 'status', 'approved');
    ELSE
      v_percentage := (v_approved_count::NUMERIC / v_total_approvers::NUMERIC) * 100;
      IF v_percentage >= v_rule.percentage_required THEN
        UPDATE expenses SET status = 'approved' WHERE id = p_expense_id;
        RETURN json_build_object('success', true, 'message', 'Expense approved (percentage met)', 'status', 'approved');
      END IF;
    END IF;
  END IF;
  
  -- Check if all approvers have approved
  IF v_approved_count = v_total_approvers THEN
    UPDATE expenses SET status = 'approved' WHERE id = p_expense_id;
    RETURN json_build_object('success', true, 'message', 'Expense fully approved', 'status', 'approved');
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'Approval recorded', 'status', 'pending');
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_profiles_company ON profiles(company_id);
CREATE INDEX idx_profiles_manager ON profiles(manager_id);
CREATE INDEX idx_expenses_company ON expenses(company_id);
CREATE INDEX idx_expenses_created_by ON expenses(created_by);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expense_approvals_expense ON expense_approvals(expense_id);
CREATE INDEX idx_expense_approvals_approver ON expense_approvals(approver_id);
CREATE INDEX idx_expense_approvals_status ON expense_approvals(status);
