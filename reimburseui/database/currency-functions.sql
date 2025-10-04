-- Database functions for currency conversion
-- These functions can be called from the application to handle currency conversions

-- Function to get exchange rate between two currencies
CREATE OR REPLACE FUNCTION get_exchange_rate(
    from_currency VARCHAR(3),
    to_currency VARCHAR(3),
    target_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL(10,6) AS $$
DECLARE
    rate DECIMAL(10,6);
BEGIN
    -- If same currency, return 1
    IF from_currency = to_currency THEN
        RETURN 1.0;
    END IF;
    
    -- Try to get rate from cache
    SELECT erc.rate INTO rate
    FROM exchange_rates_cache erc
    WHERE erc.base_currency = from_currency 
    AND erc.target_currency = to_currency 
    AND erc.date = target_date
    LIMIT 1;
    
    -- If not found, try reverse rate
    IF rate IS NULL THEN
        SELECT (1.0 / erc.rate) INTO rate
        FROM exchange_rates_cache erc
        WHERE erc.base_currency = to_currency 
        AND erc.target_currency = from_currency 
        AND erc.date = target_date
        LIMIT 1;
    END IF;
    
    -- If still not found, return 1 (no conversion)
    IF rate IS NULL THEN
        RETURN 1.0;
    END IF;
    
    RETURN rate;
END;
$$ LANGUAGE plpgsql;

-- Function to convert amount between currencies
CREATE OR REPLACE FUNCTION convert_currency_amount(
    amount DECIMAL(10,2),
    from_currency VARCHAR(3),
    to_currency VARCHAR(3),
    target_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    rate DECIMAL(10,6);
    converted_amount DECIMAL(10,2);
BEGIN
    -- Get exchange rate
    rate := get_exchange_rate(from_currency, to_currency, target_date);
    
    -- Convert amount
    converted_amount := amount * rate;
    
    -- Round to 2 decimal places
    converted_amount := ROUND(converted_amount, 2);
    
    RETURN converted_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to update expense with converted amount
CREATE OR REPLACE FUNCTION update_expense_conversion(
    expense_uuid UUID,
    company_currency VARCHAR(3),
    target_date DATE DEFAULT CURRENT_DATE
)
RETURNS BOOLEAN AS $$
DECLARE
    expense_record RECORD;
    converted_amount DECIMAL(10,2);
    conversion_rate DECIMAL(10,6);
BEGIN
    -- Get expense details
    SELECT amount, currency INTO expense_record
    FROM expenses 
    WHERE id = expense_uuid;
    
    -- If expense not found, return false
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- If same currency, no conversion needed
    IF expense_record.currency = company_currency THEN
        UPDATE expenses 
        SET converted_amount = expense_record.amount,
            conversion_rate = 1.0,
            conversion_date = NOW()
        WHERE id = expense_uuid;
        RETURN TRUE;
    END IF;
    
    -- Get conversion rate
    conversion_rate := get_exchange_rate(expense_record.currency, company_currency, target_date);
    
    -- Convert amount
    converted_amount := convert_currency_amount(
        expense_record.amount, 
        expense_record.currency, 
        company_currency, 
        target_date
    );
    
    -- Update expense with conversion data
    UPDATE expenses 
    SET converted_amount = converted_amount,
        conversion_rate = conversion_rate,
        conversion_date = NOW()
    WHERE id = expense_uuid;
    
    -- Log the conversion
    INSERT INTO currency_conversions (
        expense_id, from_currency, to_currency, 
        original_amount, converted_amount, exchange_rate
    ) VALUES (
        expense_uuid, expense_record.currency, company_currency,
        expense_record.amount, converted_amount, conversion_rate
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to batch update all expenses for a company
CREATE OR REPLACE FUNCTION update_company_expense_conversions(
    company_uuid UUID,
    target_date DATE DEFAULT CURRENT_DATE
)
RETURNS INTEGER AS $$
DECLARE
    company_currency VARCHAR(3);
    expense_record RECORD;
    updated_count INTEGER := 0;
BEGIN
    -- Get company currency
    SELECT currency INTO company_currency
    FROM companies 
    WHERE id = company_uuid;
    
    -- If company not found, return 0
    IF company_currency IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Update all expenses for the company
    FOR expense_record IN 
        SELECT e.id, e.amount, e.currency
        FROM expenses e
        JOIN users u ON e.employee_id = u.id
        WHERE u.company_id = company_uuid
    LOOP
        IF update_expense_conversion(expense_record.id, company_currency, target_date) THEN
            updated_count := updated_count + 1;
        END IF;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get expense with converted amount
CREATE OR REPLACE FUNCTION get_expense_with_conversion(
    expense_uuid UUID,
    company_currency VARCHAR(3)
)
RETURNS TABLE (
    id UUID,
    amount DECIMAL(10,2),
    currency VARCHAR(3),
    converted_amount DECIMAL(10,2),
    conversion_rate DECIMAL(10,6),
    conversion_date TIMESTAMP WITH TIME ZONE,
    category VARCHAR(100),
    description TEXT,
    expense_date DATE,
    status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.amount,
        e.currency,
        COALESCE(e.converted_amount, convert_currency_amount(e.amount, e.currency, company_currency)) as converted_amount,
        COALESCE(e.conversion_rate, get_exchange_rate(e.currency, company_currency)) as conversion_rate,
        e.conversion_date,
        e.category,
        e.description,
        e.expense_date,
        e.status
    FROM expenses e
    WHERE e.id = expense_uuid;
END;
$$ LANGUAGE plpgsql;
