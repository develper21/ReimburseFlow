-- Seed data for testing the expense management system
-- Run this after creating the schema

-- Insert sample companies
INSERT INTO companies (id, name, currency) VALUES 
('550e8400-e29b-41d4-a716-446655440001'::uuid, 'Acme Corporation', 'USD'),
('550e8400-e29b-41d4-a716-446655440002'::uuid, 'TechStart Inc', 'EUR'),
('550e8400-e29b-41d4-a716-446655440003'::uuid, 'Global Solutions Ltd', 'GBP');

-- Note: Users will be created through the signup process
-- The following are example user records that would be created:

-- Sample users for Acme Corporation
-- Admin user (created during signup)
-- INSERT INTO users (id, email, full_name, role, company_id, is_manager_approver) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440010'::uuid, 'admin@acme.com', 'John Admin', 'admin', '550e8400-e29b-41d4-a716-446655440001'::uuid, true);

-- Manager user
-- INSERT INTO users (id, email, full_name, role, company_id, manager_id, is_manager_approver) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440011'::uuid, 'manager@acme.com', 'Jane Manager', 'manager', '550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440010'::uuid, true);

-- Employee users
-- INSERT INTO users (id, email, full_name, role, company_id, manager_id, is_manager_approver) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440012'::uuid, 'employee1@acme.com', 'Bob Employee', 'employee', '550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440011'::uuid, false),
-- ('550e8400-e29b-41d4-a716-446655440013'::uuid, 'employee2@acme.com', 'Alice Employee', 'employee', '550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440011'::uuid, false);

-- Sample approval workflows for Acme Corporation
INSERT INTO approval_workflows (id, company_id, name, approvers, approval_sequence, conditional_rules, is_active) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440020'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'Standard Approval Flow',
  ARRAY['550e8400-e29b-41d4-a716-446655440011'::uuid, '550e8400-e29b-41d4-a716-446655440010'::uuid],
  ARRAY[1, 2],
  '{"type": "percentage", "percentage": 100}'::jsonb,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440021'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'Fast Track Approval',
  ARRAY['550e8400-e29b-41d4-a716-446655440010'::uuid],
  ARRAY[1],
  '{"type": "specific_approver", "specific_approver_id": "550e8400-e29b-41d4-a716-446655440010"}'::jsonb,
  true
);

-- Sample expenses (these would be created through the application)
-- INSERT INTO expenses (id, employee_id, amount, currency, category, description, expense_date, receipt_url, status) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440030'::uuid, '550e8400-e29b-41d4-a716-446655440012'::uuid, 150.00, 'USD', 'Travel', 'Taxi to client meeting', '2024-01-15', null, 'pending'),
-- ('550e8400-e29b-41d4-a716-446655440031'::uuid, '550e8400-e29b-41d4-a716-446655440013'::uuid, 75.50, 'USD', 'Food & Dining', 'Team lunch', '2024-01-16', null, 'approved'),
-- ('550e8400-e29b-41d4-a716-446655440032'::uuid, '550e8400-e29b-41d4-a716-446655440012'::uuid, 200.00, 'USD', 'Office Supplies', 'Laptop accessories', '2024-01-17', null, 'rejected');

-- Sample expense approvals (these would be created automatically)
-- INSERT INTO expense_approvals (id, expense_id, approver_id, status, comments, approved_at, sequence_order) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440040'::uuid, '550e8400-e29b-41d4-a716-446655440030'::uuid, '550e8400-e29b-41d4-a716-446655440011'::uuid, 'pending', null, null, 1),
-- ('550e8400-e29b-41d4-a716-446655440041'::uuid, '550e8400-e29b-41d4-a716-446655440031'::uuid, '550e8400-e29b-41d4-a716-446655440011'::uuid, 'approved', 'Looks good', '2024-01-16 14:30:00', 1),
-- ('550e8400-e29b-41d4-a716-446655440042'::uuid, '550e8400-e29b-41d4-a716-446655440032'::uuid, '550e8400-e29b-41d4-a716-446655440011'::uuid, 'rejected', 'Not business related', '2024-01-17 10:15:00', 1);

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
  '550e8400-e29b-41d4-a716-446655440022'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'Multi-Level Approval',
  ARRAY['550e8400-e29b-41d4-a716-446655440011'::uuid, '550e8400-e29b-41d4-a716-446655440010'::uuid],
  ARRAY[1, 2],
  '{"type": "percentage", "percentage": 100}'::jsonb,
  true
);

-- 2. Percentage-based approval workflow
INSERT INTO approval_workflows (id, company_id, name, approvers, approval_sequence, conditional_rules, is_active) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440023'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'Percentage Approval',
  ARRAY['550e8400-e29b-41d4-a716-446655440011'::uuid, '550e8400-e29b-41d4-a716-446655440010'::uuid],
  ARRAY[1, 2],
  '{"type": "percentage", "percentage": 50}'::jsonb,
  true
);

-- 3. Hybrid approval workflow
INSERT INTO approval_workflows (id, company_id, name, approvers, approval_sequence, conditional_rules, is_active) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440024'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'Hybrid Approval',
  ARRAY['550e8400-e29b-41d4-a716-446655440011'::uuid, '550e8400-e29b-41d4-a716-446655440010'::uuid],
  ARRAY[1, 2],
  '{"type": "hybrid", "percentage": 50, "specific_approver_id": "550e8400-e29b-41d4-a716-446655440010", "conditions": {"amount_threshold": 1000}}'::jsonb,
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
-- SELECT e.description, e.amount, e.currency, e.status, u.full_name as