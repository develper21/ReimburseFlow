-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('employee', 'manager', 'admin')),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_manager_approver BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    expense_date DATE NOT NULL,
    receipt_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create approval workflows table
CREATE TABLE IF NOT EXISTS approval_workflows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    approvers UUID[] NOT NULL,
    approval_sequence INTEGER[] NOT NULL,
    conditional_rules JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expense approvals table
CREATE TABLE IF NOT EXISTS expense_approvals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(expense_id, approver_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_manager_id ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_expenses_employee_id ON expenses(employee_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expense_approvals_expense_id ON expense_approvals(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_approvals_approver_id ON expense_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_company_id ON approval_workflows(company_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_approval_workflows_updated_at BEFORE UPDATE ON approval_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expense_approvals_updated_at BEFORE UPDATE ON expense_approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('expense-receipts', 'expense-receipts', true);

-- Create storage policies
CREATE POLICY "Users can upload their own receipts" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'expense-receipts' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "Users can view their own receipts" ON storage.objects
FOR SELECT USING (bucket_id = 'expense-receipts' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "Users can update their own receipts" ON storage.objects
FOR UPDATE USING (bucket_id = 'expense-receipts' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "Users can delete their own receipts" ON storage.objects
FOR DELETE USING (bucket_id = 'expense-receipts' AND auth.uid()::text = (storage.foldername(name))[2]);

-- Create RLS policies for companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view companies (we'll filter in the application)
CREATE POLICY "Authenticated users can view companies" ON companies
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to update companies
CREATE POLICY "Admins can update companies" ON companies
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
        AND u.company_id = companies.id
    )
);

-- Create RLS policies for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON users
FOR SELECT USING (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON users
FOR UPDATE USING (id = auth.uid());

-- Allow admins to view all users (we'll handle company filtering in the application)
CREATE POLICY "Admins can view all users" ON users
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
);

-- Allow admins to manage all users
CREATE POLICY "Admins can manage all users" ON users
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
);

-- Create RLS policies for expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expenses" ON expenses
FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Users can view expenses they need to approve" ON expenses
FOR SELECT USING (
    id IN (
        SELECT ea.expense_id 
        FROM expense_approvals ea 
        WHERE ea.approver_id = auth.uid()
    )
);

CREATE POLICY "Managers can view expenses from their team" ON expenses
FOR SELECT USING (
    employee_id IN (
        SELECT id FROM users WHERE manager_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all expenses in their company" ON expenses
FOR SELECT USING (
    employee_id IN (
        SELECT id FROM users 
        WHERE company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    )
);

CREATE POLICY "Users can create their own expenses" ON expenses
FOR INSERT WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Users can update their own draft expenses" ON expenses
FOR UPDATE USING (employee_id = auth.uid() AND status = 'draft');

CREATE POLICY "Users can delete their own draft expenses" ON expenses
FOR DELETE USING (employee_id = auth.uid() AND status = 'draft');

-- Create RLS policies for approval workflows
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view workflows
CREATE POLICY "Authenticated users can view workflows" ON approval_workflows
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to manage workflows
CREATE POLICY "Admins can manage workflows" ON approval_workflows
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
);

-- Create RLS policies for expense approvals
ALTER TABLE expense_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view approvals for their expenses" ON expense_approvals
FOR SELECT USING (
    expense_id IN (SELECT id FROM expenses WHERE employee_id = auth.uid())
);

CREATE POLICY "Users can view approvals they need to handle" ON expense_approvals
FOR SELECT USING (approver_id = auth.uid());

CREATE POLICY "Managers can view approvals for their team's expenses" ON expense_approvals
FOR SELECT USING (
    expense_id IN (
        SELECT id FROM expenses 
        WHERE employee_id IN (
            SELECT id FROM users WHERE manager_id = auth.uid()
        )
    )
);

CREATE POLICY "Admins can view all approvals in their company" ON expense_approvals
FOR SELECT USING (
    expense_id IN (
        SELECT id FROM expenses 
        WHERE employee_id IN (
            SELECT id FROM users 
            WHERE company_id IN (
                SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin'
            )
        )
    )
);

CREATE POLICY "Approvers can update their own approvals" ON expense_approvals
FOR UPDATE USING (approver_id = auth.uid());

-- Create function to automatically create approval records when expense is submitted
CREATE OR REPLACE FUNCTION create_expense_approvals()
RETURNS TRIGGER AS $$
DECLARE
    workflow_record RECORD;
    approver_id UUID;
    sequence_order INTEGER;
BEGIN
    -- Only create approvals when status changes to 'pending'
    IF NEW.status = 'pending' AND OLD.status != 'pending' THEN
        -- Get the active workflow for the company
        SELECT * INTO workflow_record
        FROM approval_workflows
        WHERE company_id = (
            SELECT company_id FROM users WHERE id = NEW.employee_id
        )
        AND is_active = TRUE
        LIMIT 1;

        -- If no workflow found, create a default approval for the manager
        IF workflow_record IS NULL THEN
            -- Get the employee's manager
            SELECT manager_id INTO approver_id
            FROM users
            WHERE id = NEW.employee_id AND is_manager_approver = TRUE;

            IF approver_id IS NOT NULL THEN
                INSERT INTO expense_approvals (expense_id, approver_id, sequence_order)
                VALUES (NEW.id, approver_id, 1);
            END IF;
        ELSE
            -- Create approvals based on workflow
            FOR i IN 1..array_length(workflow_record.approvers, 1) LOOP
                approver_id := workflow_record.approvers[i];
                sequence_order := workflow_record.approval_sequence[i];
                
                INSERT INTO expense_approvals (expense_id, approver_id, sequence_order)
                VALUES (NEW.id, approver_id, sequence_order);
            END LOOP;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic approval creation
CREATE TRIGGER create_expense_approvals_trigger
    AFTER UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION create_expense_approvals();
