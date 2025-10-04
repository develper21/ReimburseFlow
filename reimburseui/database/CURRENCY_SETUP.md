# Currency Conversion Database Setup

## Overview
यह guide बताता है कि currency conversion features के लिए database में क्या changes करने हैं।

## Files Created:
1. **`schema-updated.sql`** - Complete updated schema with currency support
2. **`migration-currency.sql`** - Migration script for existing databases
3. **`currency-functions.sql`** - Database functions for currency operations

## Setup Options:

### Option 1: Fresh Database (Recommended)
अगर आप नया database बना रहे हैं:

1. **Supabase SQL Editor में जाएं**
2. **`schema-updated.sql` का content copy करें**
3. **Run करें** - यह complete schema create करेगा

### Option 2: Existing Database Migration
अगर आपके पास पहले से database है:

1. **Supabase SQL Editor में जाएं**
2. **`migration-currency.sql` का content copy करें**
3. **Run करें** - यह existing database को update करेगा

### Option 3: Add Currency Functions
Database functions add करने के लिए:

1. **`currency-functions.sql` का content copy करें**
2. **Run करें** - यह currency conversion functions add करेगा

## New Database Tables:

### 1. **exchange_rates_cache**
```sql
- id (UUID)
- base_currency (VARCHAR(3))
- target_currency (VARCHAR(3))
- rate (DECIMAL(10,6))
- date (DATE)
- created_at (TIMESTAMP)
```

### 2. **currency_conversions**
```sql
- id (UUID)
- expense_id (UUID) - Foreign key to expenses
- from_currency (VARCHAR(3))
- to_currency (VARCHAR(3))
- original_amount (DECIMAL(10,2))
- converted_amount (DECIMAL(10,2))
- exchange_rate (DECIMAL(10,6))
- conversion_date (TIMESTAMP)
```

## Updated Expenses Table:
```sql
-- New columns added:
- converted_amount (DECIMAL(10,2)) - Amount in company currency
- conversion_rate (DECIMAL(10,6)) - Exchange rate used
- conversion_date (TIMESTAMP) - When conversion was done
```

## Database Functions:

### 1. **get_exchange_rate(from_currency, to_currency, date)**
- Returns exchange rate between two currencies
- Uses cached rates or calculates reverse rate

### 2. **convert_currency_amount(amount, from_currency, to_currency, date)**
- Converts amount from one currency to another
- Returns converted amount

### 3. **update_expense_conversion(expense_id, company_currency, date)**
- Updates expense with converted amount
- Logs conversion in currency_conversions table

### 4. **update_company_expense_conversions(company_id, date)**
- Batch updates all expenses for a company
- Returns count of updated expenses

### 5. **get_expense_with_conversion(expense_id, company_currency)**
- Returns expense with converted amount
- Automatically converts if not already converted

## Usage Examples:

### Get Exchange Rate:
```sql
SELECT get_exchange_rate('USD', 'EUR', CURRENT_DATE);
```

### Convert Amount:
```sql
SELECT convert_currency_amount(100, 'USD', 'EUR', CURRENT_DATE);
```

### Update Single Expense:
```sql
SELECT update_expense_conversion('expense-uuid', 'USD', CURRENT_DATE);
```

### Update All Company Expenses:
```sql
SELECT update_company_expense_conversions('company-uuid', CURRENT_DATE);
```

### Get Expense with Conversion:
```sql
SELECT * FROM get_expense_with_conversion('expense-uuid', 'USD');
```

## Security (RLS Policies):
- **exchange_rates_cache**: Read-only for authenticated users
- **currency_conversions**: Users can only view their own conversions
- **expenses**: Updated with new currency fields

## Performance Indexes:
- `idx_expenses_currency` - For currency-based queries
- `idx_exchange_rates_cache_lookup` - For rate lookups
- `idx_currency_conversions_expense_id` - For conversion history

## Testing:
After setup, you can test with:
```sql
-- Add sample exchange rates
INSERT INTO exchange_rates_cache (base_currency, target_currency, rate, date) VALUES
('USD', 'EUR', 0.85, CURRENT_DATE),
('USD', 'INR', 83.0, CURRENT_DATE);

-- Test conversion
SELECT convert_currency_amount(100, 'USD', 'EUR', CURRENT_DATE);
```

## Next Steps:
1. Run the appropriate setup script
2. Test the functions
3. Update your application code to use these functions
4. Set up automatic currency conversion triggers

## Notes:
- All functions handle same-currency conversions (returns 1.0 rate)
- Functions are idempotent (can be run multiple times safely)
- RLS policies ensure data security
- Indexes optimize performance for currency operations
