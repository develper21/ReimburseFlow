-- Test script to verify the database is working correctly
-- Run this after applying the fix-recursion.sql

-- Test 1: Check if we can query users table without recursion
SELECT 'Testing users table access...' as test;

-- This should work without infinite recursion
SELECT id, email, full_name, role FROM users LIMIT 1;

-- Test 2: Check if we can query expenses table
SELECT 'Testing expenses table access...' as test;

-- This should work without infinite recursion
SELECT id, amount, currency, status FROM expenses LIMIT 1;

-- Test 3: Check if we can query expense_approvals table
SELECT 'Testing expense_approvals table access...' as test;

-- This should work without infinite recursion
SELECT id, status, sequence_order FROM expense_approvals LIMIT 1;

-- Test 4: Check if we can query companies table
SELECT 'Testing companies table access...' as test;

-- This should work without infinite recursion
SELECT id, name, currency FROM companies LIMIT 1;

-- Test 5: Check if we can query approval_workflows table
SELECT 'Testing approval_workflows table access...' as test;

-- This should work without infinite recursion
SELECT id, name, is_active FROM approval_workflows LIMIT 1;

SELECT 'All tests completed successfully!' as result;
