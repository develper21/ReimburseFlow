-- Updated schema with currency conversion support
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Updated expenses table with currency conversion fields
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL,
    -- New fields for currency conversion
    converted_amount DECIMAL(10,2), -- Amount converted to company currency
    conversion_rate DECIMAL(10,6), -- Exchange rate used for conversion
    conversion_date TIMESTAMP WITH TIME ZONE, -- When conversion was done
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    expense_date DATE NOT NULL,
    receipt_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- New table for storing exchange rates cache
CREATE TABLE IF NOT EXISTS exchange_rates_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    base_currency VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(10,6) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(base_currency, target_currency, date)
);

-- New table for storing currency conversion history
CREATE TABLE IF NOT EXISTS currency_conversions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    original_amount DECIMAL(10,2) NOT NULL,
    converted_amount DECIMAL(10,2) NOT NULL,
    exchange_rate DECIMAL(10,6) NOT NULL,
    conversion_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_manager_id ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_expenses_employee_id ON expenses(employee_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_currency ON expenses(currency);
CREATE INDEX IF NOT EXISTS idx_expense_approvals_expense_id ON expense_approvals(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_approvals_approver_id ON expense_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_company_id ON approval_workflows(company_id);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_cache_lookup ON exchange_rates_cache(base_currency, target_currency, date);
CREATE INDEX IF NOT EXISTS idx_currency_conversions_expense_id ON currency_conversions(expense_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (Idempotent)
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_approval_workflows_updated_at ON approval_workflows;
CREATE TRIGGER update_approval_workflows_updated_at BEFORE UPDATE ON approval_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expense_approvals_updated_at ON expense_approvals;
CREATE TRIGGER update_expense_approvals_updated_at BEFORE UPDATE ON expense_approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for receipts (Idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-receipts', 'expense-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies (Idempotent)
DROP POLICY IF EXISTS "Users can upload their own receipts" ON storage.objects;
CREATE POLICY "Users can upload their own receipts" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'expense-receipts' AND auth.uid()::text = (storage.foldername(name))[2]);

DROP POLICY IF EXISTS "Users can view their own receipts" ON storage.objects;
CREATE POLICY "Users can view their own receipts" ON storage.objects
FOR SELECT USING (bucket_id = 'expense-receipts' AND auth.uid()::text = (storage.foldername(name))[2]);

DROP POLICY IF EXISTS "Users can update their own receipts" ON storage.objects;
CREATE POLICY "Users can update their own receipts" ON storage.objects
FOR UPDATE USING (bucket_id = 'expense-receipts' AND auth.uid()::text = (storage.foldername(name))[2]);

DROP POLICY IF EXISTS "Users can delete their own receipts" ON storage.objects;
CREATE POLICY "Users can delete their own receipts" ON storage.objects
FOR DELETE USING (bucket_id = 'expense-receipts' AND auth.uid()::text = (storage.foldername(name))[2]);

-- === RLS POLICIES (Make sure RLS is enabled on each table) ===

-- RLS for companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view companies" ON companies;
CREATE POLICY "Authenticated users can view companies" ON companies FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admins can update companies" ON companies;
CREATE POLICY "Admins can update companies" ON companies FOR UPDATE USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin' AND u.company_id = companies.id));

-- RLS for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (id = auth.uid());
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (id = auth.uid());

-- RLS for expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;
CREATE POLICY "Users can view their own expenses" ON expenses FOR SELECT USING (employee_id = auth.uid());
DROP POLICY IF EXISTS "Users can view expenses they need to approve" ON expenses;
CREATE POLICY "Users can view expenses they need to approve" ON expenses FOR SELECT USING (id IN (SELECT ea.expense_id FROM expense_approvals ea WHERE ea.approver_id = auth.uid()));
DROP POLICY IF EXISTS "Managers can view expenses from their team" ON expenses;
CREATE POLICY "Managers can view expenses from their team" ON expenses FOR SELECT USING (employee_id IN (SELECT id FROM users WHERE manager_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can view all expenses in their company" ON expenses;
CREATE POLICY "Admins can view all expenses in their company" ON expenses FOR SELECT USING (employee_id IN (SELECT id FROM users WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin')));
DROP POLICY IF EXISTS "Users can create their own expenses" ON expenses;
CREATE POLICY "Users can create their own expenses" ON expenses FOR INSERT WITH CHECK (employee_id = auth.uid());
DROP POLICY IF EXISTS "Users can update their own draft expenses" ON expenses;
CREATE POLICY "Users can update their own draft expenses" ON expenses FOR UPDATE USING (employee_id = auth.uid() AND status = 'draft');
DROP POLICY IF EXISTS "Users can delete their own draft expenses" ON expenses;
CREATE POLICY "Users can delete their own draft expenses" ON expenses FOR DELETE USING (employee_id = auth.uid() AND status = 'draft');

-- RLS for approval workflows
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view workflows" ON approval_workflows;
CREATE POLICY "Authenticated users can view workflows" ON approval_workflows FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admins can manage workflows" ON approval_workflows;
CREATE POLICY "Admins can manage workflows" ON approval_workflows FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));

-- RLS for expense approvals
ALTER TABLE expense_approvals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view approvals for their expenses" ON expense_approvals;
CREATE POLICY "Users can view approvals for their expenses" ON expense_approvals FOR SELECT USING (expense_id IN (SELECT id FROM expenses WHERE employee_id = auth.uid()));
DROP POLICY IF EXISTS "Users can view approvals they need to handle" ON expense_approvals;
CREATE POLICY "Users can view approvals they need to handle" ON expense_approvals FOR SELECT USING (approver_id = auth.uid());
DROP POLICY IF EXISTS "Managers can view approvals for their team's expenses" ON expense_approvals;
CREATE POLICY "Managers can view approvals for their team's expenses" ON expense_approvals FOR SELECT USING (expense_id IN (SELECT id FROM expenses WHERE employee_id IN (SELECT id FROM users WHERE manager_id = auth.uid())));
DROP POLICY IF EXISTS "Admins can view all approvals in their company" ON expense_approvals;
CREATE POLICY "Admins can view all approvals in their company" ON expense_approvals FOR SELECT USING (expense_id IN (SELECT id FROM expenses WHERE employee_id IN (SELECT id FROM users WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin'))));
DROP POLICY IF EXISTS "Approvers can update their own approvals" ON expense_approvals;
CREATE POLICY "Approvers can update their own approvals" ON expense_approvals FOR UPDATE USING (approver_id = auth.uid());

-- RLS for exchange rates cache (read-only for authenticated users)
ALTER TABLE exchange_rates_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view exchange rates" ON exchange_rates_cache FOR SELECT USING (auth.role() = 'authenticated');

-- RLS for currency conversions (users can view their own conversions)
ALTER TABLE currency_conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own conversions" ON currency_conversions FOR SELECT USING (
    expense_id IN (SELECT id FROM expenses WHERE employee_id = auth.uid())
);

-- Create function to automatically create approval records when expense is submitted
CREATE OR REPLACE FUNCTION create_expense_approvals()
RETURNS TRIGGER AS $$
DECLARE
    workflow_record RECORD;
    approver_id UUID;
    sequence_order INTEGER;
BEGIN
    -- Only create approvals when status changes to 'pending'
    IF NEW.status = 'pending' AND (OLD.status IS NULL OR OLD.status != 'pending') THEN
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
                VALUES (NEW.id, approver_id, 1)
                ON CONFLICT (expense_id, approver_id) DO NOTHING;
            END IF;
        ELSE
            -- Create approvals based on workflow
            FOR i IN 1..array_length(workflow_record.approvers, 1) LOOP
                approver_id := workflow_record.approvers[i];
                sequence_order := workflow_record.approval_sequence[i];
                
                INSERT INTO expense_approvals (expense_id, approver_id, sequence_order)
                VALUES (NEW.id, approver_id, sequence_order)
                ON CONFLICT (expense_id, approver_id) DO NOTHING;
            END LOOP;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic approval creation (Idempotent)
DROP TRIGGER IF EXISTS create_expense_approvals_trigger ON expenses;
CREATE TRIGGER create_expense_approvals_trigger
    AFTER UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION create_expense_approvals();

-- Create function to update currency conversion when expense is updated
CREATE OR REPLACE FUNCTION update_currency_conversion()
RETURNS TRIGGER AS $$
BEGIN
    -- If currency or amount changed, clear conversion data
    IF OLD.currency IS DISTINCT FROM NEW.currency OR OLD.amount IS DISTINCT FROM NEW.amount THEN
        NEW.converted_amount := NULL;
        NEW.conversion_rate := NULL;
        NEW.conversion_date := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for currency conversion updates
DROP TRIGGER IF EXISTS update_currency_conversion_trigger ON expenses;
CREATE TRIGGER update_currency_conversion_trigger
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_currency_conversion();
