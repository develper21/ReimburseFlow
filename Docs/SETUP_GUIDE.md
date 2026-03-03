# Expenseura - Complete Setup Guide

This guide will walk you through setting up Expenseura from scratch.

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- A Supabase account (free tier works)
- A modern web browser

## Step-by-Step Setup

### Part 1: Supabase Configuration (15 minutes)

#### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub or create an account
4. Click "New Project"
5. Fill in:
   - **Name**: expenseura (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait 2-3 minutes for setup to complete

#### 1.2 Set Up Database Schema

1. In your Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire contents of `infra/schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

#### 1.3 Enable Row Level Security

1. Still in SQL Editor, click **New Query**
2. Copy the entire contents of `infra/rls_policies.sql`
3. Paste into the SQL editor
4. Click **Run**
5. Verify all policies were created successfully

#### 1.4 Create Storage Bucket

1. Click **Storage** in the left sidebar
2. Click **New Bucket**
3. Enter:
   - **Name**: `receipts`
   - **Public bucket**: OFF (keep it private)
4. Click **Create bucket**
5. Click on the `receipts` bucket
6. Click **Policies** tab
7. Click **New Policy**
8. Choose **Custom policy**
9. Add this policy for authenticated uploads:
   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Authenticated users can upload receipts"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'receipts');

   -- Allow users to read their own receipts
   CREATE POLICY "Users can read receipts"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id = 'receipts');
   ```

#### 1.5 Get API Credentials

1. Click **Settings** (gear icon in sidebar)
2. Click **API**
3. Copy these values (you'll need them soon):
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (the long string under "Project API keys")

### Part 2: Local Development Setup (10 minutes)

#### 2.1 Install Dependencies

Open your terminal in the project directory:

```bash
# Install all dependencies
npm install
```

This will install:
- React and React DOM
- Supabase client
- React Query
- TailwindCSS
- Tesseract.js (OCR)
- React Router
- Lucide icons
- And all other dependencies

#### 2.2 Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your text editor

3. Replace the placeholder values with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_EXCHANGE_API_KEY=
   VITE_RESTCOUNTRIES_URL=https://restcountries.com/v3.1/all?fields=name,currencies
   ```

   **Note**: The exchange API key is optional. The app uses a free API by default.

#### 2.3 Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Part 3: Initial Application Setup (10 minutes)

#### 3.1 Create Admin Account

1. You should see the signup page
2. Fill in the form:
   - **Full Name**: Your name
   - **Email**: Your email
   - **Password**: At least 6 characters
   - **Company Name**: Your company name
   - **Country**: Select your country
   - **Base Currency**: Auto-filled based on country
3. Click **Sign Up**
4. You'll be automatically logged in and redirected to the dashboard

**Important**: The first signup creates:
- A new company
- An admin user (you)
- Sets the base currency for all expenses

#### 3.2 Create an Approval Rule

Before employees can submit expenses, you need at least one approval rule:

1. Click **Approval Rules** in the sidebar
2. Click **Add Rule**
3. Fill in:
   - **Rule Name**: "Standard Approval"
   - **Description**: "Default approval workflow"
   - **Rule Type**: Choose one:
     - **Percentage**: Requires X% of approvers to approve
     - **Specific**: Requires a specific person (e.g., CFO)
     - **Hybrid**: Either specific person OR percentage
   - **Approval Percentage**: 60 (if using percentage)
   - Check **Require employee's manager approval** if desired
   - **Sequential approval**: Check for ordered approvals
4. Click **Create**

#### 3.3 Add Users (Optional)

To test the full workflow, add some test users:

1. Click **Users** in the sidebar
2. Click **Add User**
3. Create a Manager:
   - **Email**: manager@test.com
   - **Password**: password123
   - **Full Name**: Test Manager
   - **Role**: Manager
4. Click **Create**
5. Create an Employee:
   - **Email**: employee@test.com
   - **Password**: password123
   - **Full Name**: Test Employee
   - **Role**: Employee
   - **Manager**: Select "Test Manager"
6. Click **Create**

#### 3.4 Update Approval Rule with Approvers

1. Go back to **Approval Rules**
2. Click edit on your rule
3. Check the manager(s) in **Additional Approvers**
4. Click **Update**

### Part 4: Testing the Application (15 minutes)

#### 4.1 Test Employee Expense Submission

1. Sign out (bottom of sidebar)
2. Sign in as the employee (employee@test.com / password123)
3. Click **My Expenses**
4. Click **New Expense**
5. Upload a receipt image (or use a sample image)
   - Watch the OCR process the image
   - Fields should auto-fill
6. Review and correct the data:
   - Description
   - Category
   - Amount
   - Date
7. Click **Submit Expense**
8. You should see it in the list with "Pending" status

#### 4.2 Test Manager Approval

1. Sign out
2. Sign in as the manager (manager@test.com / password123)
3. Click **Approvals** in the sidebar
4. You should see the pending expense
5. Click the eye icon to view details
6. Click the checkmark to approve (or X to reject)
7. Add a comment (optional for approval, required for rejection)
8. Click **Approve**
9. The expense should disappear from pending approvals

#### 4.3 Verify Approval

1. Sign out
2. Sign in as the employee again
3. Click **My Expenses**
4. The expense should now show "Approved" status
5. Click the eye icon to view approval history

### Part 5: Production Deployment (Optional)

#### 5.1 Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **Import Project**
4. Select your GitHub repository
5. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - (Copy from your `.env` file)
7. Click **Deploy**
8. Wait for deployment to complete
9. Visit your live URL!

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution**: Make sure your `.env` file exists and has the correct values. Restart the dev server after creating/updating `.env`.

### Issue: OCR not extracting data

**Solution**: 
- Ensure the image is clear and well-lit
- Try a different image format (PNG, JPG)
- Manual entry is always available as fallback

### Issue: "Row Level Security policy violation"

**Solution**: 
- Make sure you ran `infra/rls_policies.sql`
- Check that you're logged in
- Verify your user has the correct role

### Issue: File upload fails

**Solution**:
- Check that the `receipts` bucket exists in Supabase Storage
- Verify storage policies are set up correctly
- Check file size (max 10MB)

### Issue: Currency conversion not working

**Solution**:
- Check internet connection
- The free API has rate limits
- The app will still work, just won't convert currencies

## Next Steps

Now that your app is set up:

1. **Customize**: Update colors in `tailwind.config.js`
2. **Add Categories**: Modify `EXPENSE_CATEGORIES` in `src/lib/constants.js`
3. **Configure Rules**: Create different approval rules for different scenarios
4. **Add More Users**: Build out your team
5. **Test Workflows**: Try different approval scenarios

## Support

If you run into issues:

1. Check the main README.md
2. Review Supabase documentation
3. Check browser console for errors
4. Verify all SQL scripts ran successfully

## Security Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Review RLS policies
- [ ] Set up proper backup strategy
- [ ] Enable Supabase auth email confirmation
- [ ] Set up proper error logging
- [ ] Review storage bucket policies
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Set up monitoring

## Congratulations! 🎉

Your Expenseura application is now fully set up and ready to use!
