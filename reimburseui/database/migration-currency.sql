-- Migration script to add currency conversion support to existing database
-- Run this if you already have the basic schema and want to add currency features

-- Add new columns to expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS converted_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(10,6),
ADD COLUMN IF NOT EXISTS conversion_date TIMESTAMP WITH TIME ZONE;

-- Create new tables for currency support
CREATE TABLE IF NOT EXISTS exchange_rates_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    base_currency VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(10,6) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(base_currency, target_currency, date)
);

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
CREATE INDEX IF NOT EXISTS idx_expenses_currency ON expenses(currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_cache_lookup ON exchange_rates_cache(base_currency, target_currency, date);
CREATE INDEX IF NOT EXISTS idx_currency_conversions_expense_id ON currency_conversions(expense_id);

-- Enable RLS on new tables
ALTER TABLE exchange_rates_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_conversions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Authenticated users can view exchange rates" ON exchange_rates_cache 
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own conversions" ON currency_conversions 
FOR SELECT USING (
    expense_id IN (SELECT id FROM expenses WHERE employee_id = auth.uid())
);

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

-- Add some sample exchange rates for testing
INSERT INTO exchange_rates_cache (base_currency, target_currency, rate, date) VALUES
('USD', 'EUR', 0.85, CURRENT_DATE),
('USD', 'GBP', 0.73, CURRENT_DATE),
('USD', 'INR', 83.0, CURRENT_DATE),
('USD', 'CAD', 1.35, CURRENT_DATE),
('USD', 'AUD', 1.50, CURRENT_DATE),
('EUR', 'USD', 1.18, CURRENT_DATE),
('GBP', 'USD', 1.37, CURRENT_DATE),
('INR', 'USD', 0.012, CURRENT_DATE)
ON CONFLICT (base_currency, target_currency, date) DO NOTHING;
