# ExpenseFlow Setup Instructions

## Quick Start

1. **Create a `.env.local` file** in the project root with the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. **Get your Supabase credentials:**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - In your project dashboard, go to Settings > API
   - Copy the Project URL and API keys

3. **Set up the database:**
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `database/schema.sql`
   - Click "Run" to execute the schema

4. **Start the application:**
   ```bash
   npm run dev
   ```

5. **Visit the setup page:**
   - Go to `http://localhost:3000/setup` for detailed setup instructions
   - Or visit `http://localhost:3000` to start using the app

## Troubleshooting

### "supabaseKey is required" Error
This error occurs when environment variables are not set. Make sure you have:
- Created a `.env.local` file in the project root
- Added all required environment variables
- Restarted your development server after adding the variables

### Database Connection Issues
- Verify your Supabase URL and keys are correct
- Make sure you've run the database schema
- Check that your Supabase project is active

### Authentication Issues
- Ensure email confirmation is disabled in Supabase Auth settings (for development)
- Check that your domain is added to the allowed origins in Supabase

## Need Help?

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the project README.md
- Visit the setup page at `/setup` for interactive guidance
