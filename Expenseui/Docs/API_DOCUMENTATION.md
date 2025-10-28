# Expenseura API Documentation

This document describes the database schema, RPC functions, and data access patterns used in Expenseura.

## Database Schema

### Tables

#### companies
Stores company information and base currency settings.

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT,
  base_currency TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique company identifier
- `name`: Company name
- `country`: Company country
- `base_currency`: Base currency code (e.g., USD, EUR)
- `created_at`: Timestamp of creation

---

#### profiles
User profiles linked to Supabase authentication.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin','manager','employee')) NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Fields:**
- `id`: User ID (matches auth.users.id)
- `full_name`: User's full name
- `role`: User role (admin, manager, employee)
- `company_id`: Reference to company
- `manager_id`: Reference to user's manager (nullable)
- `created_at`: Timestamp of creation

---

#### approval_rules
Configurable approval workflow rules.

```sql
CREATE TABLE approval_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_manager_approver BOOLEAN DEFAULT FALSE,
  approver_ids UUID[] DEFAULT '{}',
  sequence_order BOOLEAN DEFAULT TRUE,
  rule_type TEXT CHECK(rule_type IN ('percentage','specific','hybrid')) NOT NULL DEFAULT 'percentage',
  percentage_required INT DEFAULT 60,
  specific_approver UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique rule identifier
- `company_id`: Reference to company
- `name`: Rule name
- `description`: Rule description
- `is_manager_approver`: Whether to include employee's manager
- `approver_ids`: Array of approver user IDs
- `sequence_order`: Sequential (true) or parallel (false)
- `rule_type`: Type of rule (percentage, specific, hybrid)
- `percentage_required`: Percentage threshold for approval
- `specific_approver`: Specific user who must approve
- `created_at`: Timestamp of creation

---

#### expenses
Expense records submitted by employees.

```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  created_by UUID REFERENCES profiles(id),
  description TEXT,
  category TEXT,
  date_of_expense DATE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  amount_base NUMERIC,
  base_currency TEXT,
  paid_by TEXT,
  status TEXT CHECK(status IN ('draft','pending','approved','rejected')) DEFAULT 'draft',
  receipt_path TEXT,
  approval_rule_id UUID REFERENCES approval_rules(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique expense identifier
- `company_id`: Reference to company
- `created_by`: User who created the expense
- `description`: Expense description
- `category`: Expense category
- `date_of_expense`: Date when expense occurred
- `amount`: Original amount
- `currency`: Original currency code
- `amount_base`: Converted amount in base currency
- `base_currency`: Company base currency
- `paid_by`: Payment method
- `status`: Current status (draft, pending, approved, rejected)
- `receipt_path`: Path to receipt file in storage
- `approval_rule_id`: Reference to approval rule
- `created_at`: Timestamp of creation

---

#### expense_approvals
Tracks approval actions and history.

```sql
CREATE TABLE expense_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES profiles(id),
  sequence_index INT,
  status TEXT CHECK(status IN ('pending','approved','rejected','skipped')) DEFAULT 'pending',
  comment TEXT,
  acted_at TIMESTAMPTZ
);
```

**Fields:**
- `id`: Unique approval record identifier
- `expense_id`: Reference to expense
- `approver_id`: User who needs to/did approve
- `sequence_index`: Order in approval chain
- `status`: Approval status
- `comment`: Approver's comment
- `acted_at`: Timestamp of approval action

---

### Views

#### expense_status_view
Provides expense data with approval counts.

```sql
CREATE VIEW expense_status_view AS
SELECT 
  e.*,
  (SELECT COUNT(*) FILTER (WHERE ea.status='approved') 
   FROM expense_approvals ea WHERE ea.expense_id = e.id) AS approved_count,
  (SELECT COUNT(*) 
   FROM expense_approvals ea WHERE ea.expense_id = e.id) AS total_approvers
FROM expenses e;
```

---

## RPC Functions

### process_approval

Processes an approval or rejection action.

**Signature:**
```sql
process_approval(
  p_expense_id UUID,
  p_approver_id UUID,
  p_action TEXT,
  p_comment TEXT DEFAULT NULL
) RETURNS JSON
```

**Parameters:**
- `p_expense_id`: ID of expense to approve/reject
- `p_approver_id`: ID of user performing action
- `p_action`: 'approved' or 'rejected'
- `p_comment`: Optional comment (required for rejection)

**Returns:**
```json
{
  "success": true,
  "message": "Approval recorded",
  "status": "pending|approved|rejected"
}
```

**Logic:**
1. Validates expense exists
2. Validates approver is authorized
3. Updates approval record
4. If rejected: marks expense as rejected
5. If approved: checks rule conditions
   - Percentage rule: calculates approval percentage
   - Specific rule: checks if specific approver approved
   - Hybrid rule: checks either condition
6. Auto-approves expense if conditions met
7. Returns result

**Usage Example:**
```javascript
const { data, error } = await supabase.rpc('process_approval', {
  p_expense_id: 'expense-uuid',
  p_approver_id: 'user-uuid',
  p_action: 'approved',
  p_comment: 'Looks good!'
})
```

---

## Row Level Security Policies

### Companies
- Users can view their own company
- Admins can update their company
- Anyone can insert (for signup)

### Profiles
- Users can view profiles in their company
- Users can view/update their own profile
- Admins can insert/update profiles in their company

### Approval Rules
- Users can view rules in their company
- Admins can manage rules in their company

### Expenses
- Users can view expenses in their company
- Employees can insert their own expenses
- Users can update their own draft expenses
- Admins can update/delete all company expenses

### Expense Approvals
- Users can view approvals for company expenses
- System can insert approvals
- Approvers can update their own approvals

---

## Storage Buckets

### receipts
Private bucket for receipt files.

**Policies:**
- Authenticated users can upload
- Users can read receipts (via signed URLs)

**Access Pattern:**
```javascript
// Upload
const { data, error } = await supabase.storage
  .from('receipts')
  .upload(filePath, file)

// Get signed URL
const { data } = await supabase.storage
  .from('receipts')
  .createSignedUrl(filePath, 3600)
```

---

## Common Queries

### Get User's Expenses
```javascript
const { data } = await supabase
  .from('expenses')
  .select('*')
  .eq('created_by', userId)
  .order('created_at', { ascending: false })
```

### Get Pending Approvals for User
```javascript
const { data } = await supabase
  .from('expense_approvals')
  .select(`
    *,
    expense:expenses(
      *,
      created_by_profile:profiles!expenses_created_by_fkey(full_name)
    )
  `)
  .eq('approver_id', userId)
  .eq('status', 'pending')
```

### Get Company Users
```javascript
const { data } = await supabase
  .from('profiles')
  .select(`
    *,
    manager:profiles!profiles_manager_id_fkey(full_name)
  `)
  .eq('company_id', companyId)
```

### Create Expense with Approvals
```javascript
// 1. Insert expense
const { data: expense } = await supabase
  .from('expenses')
  .insert([expenseData])
  .select()
  .single()

// 2. Get approval rule
const { data: rule } = await supabase
  .from('approval_rules')
  .select('*')
  .eq('id', ruleId)
  .single()

// 3. Create approval records
const approvals = rule.approver_ids.map((approverId, index) => ({
  expense_id: expense.id,
  approver_id: approverId,
  sequence_index: index,
  status: 'pending'
}))

await supabase
  .from('expense_approvals')
  .insert(approvals)
```

---

## Error Handling

### Common Errors

**RLS Policy Violation:**
```
{
  "code": "42501",
  "message": "new row violates row-level security policy"
}
```
**Solution:** Check user authentication and permissions

**Foreign Key Violation:**
```
{
  "code": "23503",
  "message": "insert or update on table violates foreign key constraint"
}
```
**Solution:** Ensure referenced records exist

**Check Constraint Violation:**
```
{
  "code": "23514",
  "message": "new row violates check constraint"
}
```
**Solution:** Validate data matches allowed values

---

## Performance Considerations

### Indexes
All foreign keys are indexed automatically. Additional indexes:
- `expenses.status` - for filtering by status
- `expense_approvals.status` - for pending approvals queries

### Query Optimization
- Use `select()` to specify only needed columns
- Use `single()` when expecting one result
- Limit results with `.limit()`
- Use pagination for large datasets

### Caching
React Query handles caching automatically:
- 5-minute stale time
- Automatic refetch on window focus disabled
- Manual invalidation after mutations

---

## Security Best Practices

1. **Never expose service_role key** - Use anon key only
2. **Validate all inputs** - Both client and server side
3. **Use RLS policies** - Never bypass with service_role
4. **Sanitize user input** - Especially OCR-parsed data
5. **Use signed URLs** - For receipt access
6. **Implement rate limiting** - On API endpoints
7. **Log security events** - For audit trail

---

## Migration Guide

### Adding New Fields

1. Add column to table:
```sql
ALTER TABLE expenses ADD COLUMN new_field TEXT;
```

2. Update RLS policies if needed

3. Update TypeScript types

4. Update queries and mutations

### Modifying RLS Policies

1. Drop existing policy:
```sql
DROP POLICY "policy_name" ON table_name;
```

2. Create new policy:
```sql
CREATE POLICY "new_policy_name" ON table_name ...
```

3. Test thoroughly with different roles
