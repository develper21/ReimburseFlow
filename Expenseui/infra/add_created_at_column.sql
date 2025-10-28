-- Add created_at column to expense_approvals table
-- Run this in Supabase SQL Editor

ALTER TABLE expense_approvals 
ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing records to have a created_at timestamp
UPDATE expense_approvals 
SET created_at = NOW() 
WHERE created_at IS NULL;
