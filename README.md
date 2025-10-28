<<<<<<< HEAD
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
=======
# Expenseura - Smart Expense Management System

A full-stack expense management application built with React and Supabase, featuring role-based authentication, multi-level approvals, OCR receipt extraction, and multi-currency support.

## Features

### Core Functionality
- **Role-Based Access Control**: Admin, Manager, and Employee roles with specific permissions
- **Multi-Level Approvals**: Configurable approval workflows with sequential or parallel processing
- **OCR Receipt Extraction**: Automatic data extraction from receipt images using Tesseract.js
- **Multi-Currency Support**: Automatic currency conversion to company base currency
- **Receipt Storage**: Secure file storage with Supabase Storage

### User Roles

#### Admin
- Create and manage company users
- Configure approval rules (percentage, specific approver, hybrid)
- View all company expenses
- Manage approval workflows

#### Manager
- Approve/reject expense submissions
- View team expenses
- Submit own expenses

#### Employee
- Submit expense claims with receipt upload
- Track expense status
- View approval history

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Query** - Data fetching and state management
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **Tesseract.js** - OCR processing

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Storage
  - Row Level Security (RLS)
  - Edge Functions

### APIs
- **ExchangeRate API** - Currency conversion
- **REST Countries API** - Country/currency mapping

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the database schema:
   - Go to SQL Editor in Supabase Dashboard
   - Execute `infra/schema.sql`
   - Execute `infra/rls_policies.sql`

3. Create Storage Bucket:
   - Go to Storage in Supabase Dashboard
   - Create a new bucket named `receipts`
   - Set it to private (authenticated access only)

4. Get your credentials:
   - Go to Project Settings > API
   - Copy the `URL` and `anon/public` key

### 2. Local Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd expenseura
```

2. Install dependencies:
>>>>>>> 6e8055c (add whole project with new ui)
```bash
npm install
```

<<<<<<< HEAD
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

=======
3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_EXCHANGE_API_KEY=optional
VITE_RESTCOUNTRIES_URL=https://restcountries.com/v3.1/all?fields=name,currencies
```

5. Start the development server:
>>>>>>> 6e8055c (add whole project with new ui)
```bash
npm run dev
```

<<<<<<< HEAD
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
=======
6. Open [http://localhost:3000](http://localhost:3000)

## Usage Guide

### First Time Setup

1. **Sign Up** (Creates Admin Account)
   - Navigate to `/signup`
   - Enter your details
   - Choose company country (base currency auto-set)
   - First signup automatically creates company and admin user

2. **Create Approval Rule** (Admin)
   - Go to Approval Rules
   - Create at least one rule for expense approvals
   - Configure approvers, percentage, or specific approver

3. **Add Users** (Admin)
   - Go to Users
   - Add Managers and Employees
   - Assign manager relationships

### Employee Workflow

1. **Submit Expense**
   - Go to My Expenses
   - Click "New Expense"
   - Upload receipt (OCR auto-fills fields)
   - Review and correct OCR data
   - Select category, payment method
   - Submit for approval

2. **Track Status**
   - View expense list with status badges
   - Click to see approval history
   - View receipt and details

### Manager Workflow

1. **Review Approvals**
   - Go to Approvals
   - View pending expenses
   - Click to see full details and receipt
   - Approve or reject with comments

2. **View Team Expenses**
   - Go to All Expenses
   - Filter by status, category
   - Monitor team spending

### Admin Workflow

1. **Manage Users**
   - Create users with roles
   - Assign managers to employees
   - Update user information

2. **Configure Approval Rules**
   - Create rules with different types:
     - **Percentage**: Requires X% of approvers
     - **Specific**: Requires specific person (e.g., CFO)
     - **Hybrid**: Either specific OR percentage
   - Set sequential or parallel approval
   - Include manager approval requirement

## Database Schema

### Tables
- `companies` - Company information and base currency
- `profiles` - User profiles linked to Supabase auth
- `approval_rules` - Configurable approval workflows
- `expenses` - Expense records with amounts and status
- `expense_approvals` - Approval tracking and history

### Key Features
- Row Level Security (RLS) on all tables
- Foreign key constraints for data integrity
- Indexes for performance
- Stored procedure for approval processing

## API Integration

### Currency Conversion
Expenses are automatically converted to company base currency using real-time exchange rates:
```javascript
const amountBase = await convertCurrency(amount, fromCurrency, baseCurrency)
```

### OCR Processing
Receipt images are processed client-side:
```javascript
const parsed = await parseReceipt(file)
// Returns: { amount, date, merchant, rawText }
```

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database (Supabase)
Already hosted - no additional deployment needed

## Project Structure

```
expenseura/
├── infra/
│   ├── schema.sql          # Database schema
│   ├── rls_policies.sql    # Security policies
│   └── seed.sql            # Sample data
├── src/
│   ├── components/
│   │   ├── Admin/          # Admin components
│   │   ├── Auth/           # Login/Signup
│   │   ├── Employee/       # Expense submission
│   │   ├── Manager/        # Approval components
│   │   └── Shared/         # Shared components
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useExpenses.js
│   │   ├── useApprovals.js
│   │   └── useUsers.js
│   ├── lib/                # Utilities
│   │   ├── supabaseClient.js
│   │   ├── ocr.js
│   │   ├── currency.js
│   │   └── constants.js
│   ├── pages/              # Page components
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Security

- **Row Level Security (RLS)**: All database tables protected
- **Authentication**: Supabase Auth with JWT tokens
- **Signed URLs**: Receipt access via temporary signed URLs
- **Role-Based Access**: Route and data access by user role
- **Input Validation**: Client and server-side validation

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

## Troubleshooting

### Common Issues

1. **OCR not working**
   - Ensure image quality is good
   - Try different image formats
   - Manual entry always available

2. **Currency conversion fails**
   - Check internet connection
   - API rate limits may apply
   - Falls back to original currency

3. **Upload fails**
   - Check file size (max 10MB)
   - Verify storage bucket permissions
   - Check Supabase storage quota

4. **RLS errors**
   - Verify policies are applied
   - Check user authentication
   - Review role assignments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use for personal or commercial projects

## Support

For issues and questions:
- Create an issue on GitHub
- Check Supabase documentation
- Review the troubleshooting section

## Roadmap

- [ ] Email notifications for approvals
- [ ] Bulk expense upload
- [ ] Advanced reporting and analytics
- [ ] Mobile app (React Native)
- [ ] Integration with accounting software
- [ ] Mileage tracking
- [ ] Per diem calculations
- [ ] Budget management
- [ ] Expense policies and limits

## Acknowledgments

- Supabase for the amazing BaaS platform
- Tesseract.js for OCR capabilities
- TailwindCSS for the styling system
- React Query for data management
>>>>>>> 6e8055c (add whole project with new ui)
