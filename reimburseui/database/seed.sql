-- Seed data for testing the expense management system
-- Run this after creating the schema

-- Insert sample companies
INSERT INTO companies (id, name, currency) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Acme Corporation', 'USD'),
('550e8400-e29b-41d4-a716-446655440002', 'TechStart Inc', 'EUR'),
('550e8400-e29b-41d4-a716-446655440003', 'Global Solutions Ltd', 'GBP');

-- Note: Users will be created through the signup process
-- The following are example user records that would be created:

-- Sample users for Acme Corporation
-- Admin user (created during signup)
-- INSERT INTO users (id, email, full_name, role, company_id, is_manager_approver) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440010', 'admin@acme.com', 'John Admin', 'admin', '550e8400-e29b-41d4-a716-446655440001', true);

-- Manager user
-- INSERT INTO users (id, email, full_name, role, company_id, manager_id, is_manager_approver) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440011', 'manager@acme.com', 'Jane Manager', 'manager', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', true);

-- Employee users
-- INSERT INTO users (id, email, full_name, role, company_id, manager_id, is_manager_approver) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440012', 'employee1@acme.com', 'Bob Employee', 'employee', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', false),
-- ('550e8400-e29b-41d4-a716-446655440013', 'employee2@acme.com', 'Alice Employee', 'employee', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', false);

-- Sample approval workflows for Acme Corporation
INSERT INTO approval_workflows (id, company_id, name, approvers, approval_sequence, conditional_rules, is_active) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440020',
  '550e8400-e29b-41d4-a716-446655440001',
  'Standard Approval Flow',
  ARRAY['550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440010'],
  ARRAY[1, 2],
  '{"type": "percentage", "percentage": 100}',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440021',
  '550e8400-e29b-41d4-a716-446655440001',
  'Fast Track Approval',
  ARRAY['550e8400-e29b-41d4-a716-446655440010'],
  ARRAY[1],
  '{"type": "specific_approver", "specific_approver_id": "550e8400-e29b-41d4-a716-446655440010"}',
  true
);

-- Sample expenses (these would be created through the application)
-- INSERT INTO expenses (id, employee_id, amount, currency, category, description, expense_date, receipt_url, status) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440012', 150.00, 'USD', 'Travel', 'Taxi to client meeting', '2024-01-15', null, 'pending'),
-- ('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440013', 75.50, 'USD', 'Food & Dining', 'Team lunch', '2024-01-16', null, 'approved'),
-- ('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440012', 200.00, 'USD', 'Office Supplies', 'Laptop accessories', '2024-01-17', null, 'rejected');

-- Sample expense approvals (these would be created automatically)
-- INSERT INTO expense_approvals (id, expense_id, approver_id, status, comments, approved_at, sequence_order) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440011', 'pending', null, null, 1),
-- ('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440011', 'approved', 'Looks good', '2024-01-16 14:30:00', 1),
-- ('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440011', 'rejected', 'Not business related', '2024-01-17 10:15:00', 1);

-- Create some sample storage files (receipts)
-- These would be uploaded through the application interface
-- The storage bucket 'expense-receipts' is already created in the schema

-- Grant necessary permissions for the application
-- These are handled by the RLS policies in the schema

-- Create indexes for better performance (already in schema)
-- CREATE INDEX IF NOT EXISTS idx_expenses_employee_status ON expenses(employee_id, status);
-- CREATE INDEX IF NOT EXISTS idx_expense_approvals_status ON expense_approvals(status);

-- Sample data for testing different scenarios:

-- 1. Multi-level approval workflow
INSERT INTO approval_workflows (id, company_id, name, approvers, approval_sequence, conditional_rules, is_active) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440022',
  '550e8400-e29b-41d4-a716-446655440001',
  'Multi-Level Approval',
  ARRAY['550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440010'],
  ARRAY[1, 2],
  '{"type": "percentage", "percentage": 100}',
  true
);

-- 2. Percentage-based approval workflow
INSERT INTO approval_workflows (id, company_id, name, approvers, approval_sequence, conditional_rules, is_active) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440023',
  '550e8400-e29b-41d4-a716-446655440001',
  'Percentage Approval',
  ARRAY['550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440010'],
  ARRAY[1, 2],
  '{"type": "percentage", "percentage": 50}',
  true
);

-- 3. Hybrid approval workflow
INSERT INTO approval_workflows (id, company_id, name, approvers, approval_sequence, conditional_rules, is_active) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440024',
  '550e8400-e29b-41d4-a716-446655440001',
  'Hybrid Approval',
  ARRAY['550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440010'],
  ARRAY[1, 2],
  '{"type": "hybrid", "percentage": 50, "specific_approver_id": "550e8400-e29b-41d4-a716-446655440010", "conditions": {"amount_threshold": 1000}}',
  true
);

-- Note: To test the application:
-- 1. Sign up with a new account to create a company and admin user
-- 2. Add managers and employees through the user management interface
-- 3. Create approval workflows
-- 4. Submit expenses and test the approval process
-- 5. Test different conditional approval rules

-- Useful queries for testing:

-- View all companies and their users
-- SELECT c.name as company, u.full_name, u.email, u.role 
-- FROM companies c 
-- JOIN users u ON c.id = u.company_id 
-- ORDER BY c.name, u.role;

-- View all approval workflows
-- SELECT aw.name, aw.approvers, aw.approval_sequence, aw.conditional_rules, aw.is_active
-- FROM approval_workflows aw
-- JOIN companies c ON aw.company_id = c.id
-- ORDER BY c.name, aw.name;

-- View expenses with their approval status
-- SELECT e.description, e.amount, e.currency, e.status, u.full_name as employee,
--        ea.status as approval_status, ea.comments, approver.full_name as approver
-- FROM expenses e
-- JOIN users u ON e.employee_id = u.id
-- LEFT JOIN expense_approvals ea ON e.id = ea.expense_id
-- LEFT JOIN users approver ON ea.approver_id = approver.id
-- ORDER BY e.created_at DESC;
