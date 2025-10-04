-- Fix RLS policies to allow approvers to update expenses
-- This script adds policies to allow approvers to update expense status

-- Add policy for approvers to update expenses they need to approve
DROP POLICY IF EXISTS "Approvers can update expenses they need to approve" ON expenses;
CREATE POLICY "Approvers can update expenses they need to approve" ON expenses 
FOR UPDATE USING (
  id IN (
    SELECT ea.expense_id 
    FROM expense_approvals ea 
    WHERE ea.approver_id = auth.uid() 
    AND ea.status = 'pending'
  )
);

-- Add policy for managers to update expenses from their team
DROP POLICY IF EXISTS "Managers can update expenses from their team" ON expenses;
CREATE POLICY "Managers can update expenses from their team" ON expenses 
FOR UPDATE USING (
  employee_id IN (
    SELECT id 
    FROM users 
    WHERE manager_id = auth.uid()
  )
);

-- Add policy for admins to update all expenses in their company
DROP POLICY IF EXISTS "Admins can update all expenses in their company" ON expenses;
CREATE POLICY "Admins can update all expenses in their company" ON expenses 
FOR UPDATE USING (
  employee_id IN (
    SELECT id 
    FROM users 
    WHERE company_id IN (
      SELECT company_id 
      FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
);

-- Add policy to allow status updates from draft to pending for approvers
DROP POLICY IF EXISTS "Allow status updates for approvers" ON expenses;
CREATE POLICY "Allow status updates for approvers" ON expenses 
FOR UPDATE USING (
  -- Allow if user is the employee and status is draft
  (employee_id = auth.uid() AND status = 'draft') OR
  -- Allow if user is an approver for this expense
  id IN (
    SELECT ea.expense_id 
    FROM expense_approvals ea 
    WHERE ea.approver_id = auth.uid()
  ) OR
  -- Allow if user is a manager of the employee
  employee_id IN (
    SELECT id 
    FROM users 
    WHERE manager_id = auth.uid()
  ) OR
  -- Allow if user is admin in the same company
  employee_id IN (
    SELECT id 
    FROM users 
    WHERE company_id IN (
      SELECT company_id 
      FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
);

-- Also add a policy for expense_approvals to allow approvers to insert records
DROP POLICY IF EXISTS "Approvers can create approval records" ON expense_approvals;
CREATE POLICY "Approvers can create approval records" ON expense_approvals 
FOR INSERT WITH CHECK (
  approver_id = auth.uid() OR
  -- Allow if user is admin in the same company as the expense employee
  expense_id IN (
    SELECT e.id 
    FROM expenses e
    JOIN users u ON e.employee_id = u.id
    WHERE u.company_id IN (
      SELECT company_id 
      FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
);
