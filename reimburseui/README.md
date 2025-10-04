# ExpenseFlow - Expense Management System

A modern, full-stack expense management web application built with Next.js, Supabase, and TailwindCSS. This system provides comprehensive expense tracking, approval workflows, and user management capabilities.

## 🚀 Features

### Core Functionality
- **Authentication & User Management**: Secure signup/login with role-based access control
- **Expense Submission**: Employees can submit expenses with receipts and multiple currencies
- **Approval Workflows**: Flexible multi-level approval system with conditional rules
- **User Roles**: Employee, Manager, and Admin roles with different permissions
- **File Upload**: Receipt upload and storage using Supabase Storage
- **Real-time Updates**: Live status updates and notifications

### Advanced Features
- **Conditional Approval Rules**:
  - Percentage-based approval (e.g., 60% of approvers must approve)
  - Specific approver rules (e.g., CFO approval required)
  - Hybrid rules combining both approaches
- **Multi-currency Support**: Handle expenses in different currencies
- **Approval Sequences**: Define custom approval order and hierarchy
- **Manager Relationships**: Assign employees to managers for approval routing

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: Zustand
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Lucide React icons
- **File Upload**: React Dropzone
- **Notifications**: React Hot Toast

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd reimburseui
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up the Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the schema from `database/schema.sql` to create all tables, policies, and functions
4. Optionally run `database/seed.sql` for sample data

### 5. Set up Storage

1. In Supabase dashboard, go to Storage
2. The `expense-receipts` bucket should be created automatically by the schema
3. If not, create it manually and set it to public

### 6. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── expenses/          # Expense management
│   ├── approvals/         # Approval workflow
│   ├── users/             # User management
│   ├── workflows/         # Approval workflow management
│   └── settings/          # User settings
├── components/            # Reusable UI components
│   └── Layout/           # Layout components
├── contexts/             # React contexts
├── lib/                  # Utility functions and configurations
├── store/                # Zustand state management
├── types/                # TypeScript type definitions
└── database/             # Database schema and seed files
```

## 👥 User Roles & Permissions

### Employee
- Submit expense claims
- View own expense history
- Upload receipts
- Edit draft expenses

### Manager
- All Employee permissions
- Approve/reject expenses from team members
- View team expense reports
- Manage team members (if assigned)

### Admin
- All Manager permissions
- Create and manage users
- Define approval workflows
- Set conditional approval rules
- Manage company settings
- View all company expenses

## 🔄 Approval Workflow

1. **Employee submits expense** → Status: `draft`
2. **Employee submits for approval** → Status: `pending`
3. **System creates approval records** based on workflow rules
4. **Approvers review and decide** → Status: `approved` or `rejected`
5. **System processes conditional rules** (percentage, specific approver, etc.)
6. **Final status determined** and notifications sent

## 🎯 Conditional Approval Rules

### Percentage Rule
```json
{
  "type": "percentage",
  "percentage": 60
}
```
Requires 60% of approvers to approve the expense.

### Specific Approver Rule
```json
{
  "type": "specific_approver",
  "specific_approver_id": "user-id"
}
```
Requires a specific user (e.g., CFO) to approve.

### Hybrid Rule
```json
{
  "type": "hybrid",
  "percentage": 50,
  "specific_approver_id": "user-id",
  "conditions": {
    "amount_threshold": 1000
  }
}
```
Combines percentage and specific approver rules with conditions.

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🔒 Security Features

- Row Level Security (RLS) policies in Supabase
- JWT-based authentication
- Role-based access control
- Secure file upload with validation
- Input validation and sanitization

## 🧪 Testing

### Manual Testing Scenarios

1. **User Registration & Login**
   - Sign up with new company
   - Verify admin user creation
   - Test login/logout

2. **User Management**
   - Create managers and employees
   - Assign manager relationships
   - Test role permissions

3. **Expense Submission**
   - Submit expense with receipt
   - Test different currencies
   - Verify file upload

4. **Approval Workflow**
   - Create approval workflows
   - Test different conditional rules
   - Verify approval sequences

5. **Multi-currency Support**
   - Submit expenses in different currencies
   - Test currency conversion display

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📊 Database Schema

### Key Tables

- `companies`: Company information and settings
- `users`: User profiles and roles
- `expenses`: Expense claims and details
- `approval_workflows`: Approval workflow definitions
- `expense_approvals`: Individual approval records

### Relationships

- Users belong to companies
- Expenses belong to users
- Approval workflows belong to companies
- Expense approvals link expenses to approvers

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |

### Supabase Configuration

- Enable Row Level Security
- Set up storage bucket for receipts
- Configure email templates for auth
- Set up database triggers for automation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the database schema
- Test with the provided seed data
- Create an issue in the repository

## 🎉 Demo

To see the application in action:

1. Sign up with a new account
2. Create some users with different roles
3. Set up approval workflows
4. Submit expenses and test the approval process
5. Try different conditional approval rules

The application includes comprehensive error handling, loading states, and user feedback to provide a smooth experience.

---

**Built with ❤️ for the hackathon project**