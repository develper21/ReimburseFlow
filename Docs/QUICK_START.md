# Expenseura - Quick Start Guide

Get up and running with Expenseura in under 30 minutes!

## 🚀 Quick Setup (5 Steps)

### Step 1: Supabase Setup (10 min)
```bash
1. Go to supabase.com and create a project
2. In SQL Editor, run: infra/schema.sql
3. In SQL Editor, run: infra/rls_policies.sql
4. In Storage, create bucket: "receipts" (private)
5. Copy your Project URL and anon key from Settings > API
```

### Step 2: Install Dependencies (2 min)
```bash
npm install
```

### Step 3: Configure Environment (1 min)
```bash
# Copy example file
cp .env.example .env

# Edit .env and add your Supabase credentials:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 4: Start Development Server (1 min)
```bash
npm run dev
```
Open http://localhost:3000

### Step 5: Create Admin Account (1 min)
```bash
1. Click "Sign Up"
2. Enter your details
3. Select country (currency auto-set)
4. Submit - you're now an admin!
```

## 📋 First-Time Checklist

After signup, complete these tasks:

### ✅ Create Approval Rule (Required)
```
Dashboard → Approval Rules → Add Rule
- Name: "Standard Approval"
- Type: Percentage
- Percentage: 60%
- Check "Require manager approval"
- Save
```

### ✅ Add Test Users (Optional)
```
Dashboard → Users → Add User

Manager:
- Email: manager@test.com
- Role: Manager

Employee:
- Email: employee@test.com  
- Role: Employee
- Manager: [Select the manager]
```

### ✅ Update Approval Rule
```
Dashboard → Approval Rules → Edit
- Check the manager in "Additional Approvers"
- Save
```

## 🎯 Test the Workflow

### As Employee:
1. Sign in as employee@test.com
2. Go to "My Expenses"
3. Click "New Expense"
4. Upload a receipt image
5. Watch OCR auto-fill fields
6. Submit expense

### As Manager:
1. Sign out, sign in as manager@test.com
2. Go to "Approvals"
3. See pending expense
4. Click approve/reject
5. Add comment
6. Submit

### As Admin:
1. Sign in as your admin account
2. Go to "All Expenses"
3. See all company expenses
4. View approval history

## 🎨 Customization

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#your-color',
    600: '#your-darker-color',
    // ...
  }
}
```

### Add Expense Categories
Edit `src/lib/constants.js`:
```javascript
export const EXPENSE_CATEGORIES = [
  'Travel',
  'Your Custom Category',
  // ...
]
```

### Modify Payment Methods
Edit `src/lib/constants.js`:
```javascript
export const PAYMENT_METHODS = [
  'Company Card',
  'Your Custom Method',
  // ...
]
```

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm test                 # Run unit tests
npm run test:e2e         # Run E2E tests

# Code Quality
npm run lint             # Check code style
npm run format           # Format code
```

## 📱 Access URLs

- **Local**: http://localhost:3000
- **Production**: Your Vercel URL

## 🆘 Troubleshooting

### "Missing Supabase environment variables"
→ Check `.env` file exists and has correct values
→ Restart dev server after creating `.env`

### OCR not working
→ Try a clearer image
→ Manual entry always available

### Can't upload receipt
→ Check `receipts` bucket exists in Supabase Storage
→ Verify bucket is private (not public)

### "Row Level Security policy violation"
→ Make sure you ran `rls_policies.sql`
→ Check you're logged in

## 📚 Learn More

- **Full Setup**: See `SETUP_GUIDE.md`
- **Features**: See `FEATURES.md`
- **API Docs**: See `API_DOCUMENTATION.md`
- **Contributing**: See `CONTRIBUTING.md`

## 🎉 You're Ready!

Your Expenseura instance is now running. Start managing expenses!

### Next Steps:
1. Customize branding and colors
2. Add your team members
3. Configure approval workflows
4. Start submitting expenses

### Need Help?
- Check documentation files
- Review Supabase docs
- Check browser console for errors

---

**Happy Expense Managing! 💰**
