# Changelog

All notable changes to Expenseura will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added
- Initial release of Expenseura
- User authentication with Supabase Auth
- Role-based access control (Admin, Manager, Employee)
- Company creation on first signup
- Automatic base currency setting based on country
- Expense submission with receipt upload
- OCR receipt processing with Tesseract.js
- Multi-currency support with automatic conversion
- Configurable approval workflows
- Three approval rule types (Percentage, Specific, Hybrid)
- Sequential and parallel approval processing
- Manager approval workflow
- Expense tracking and status management
- Receipt storage with Supabase Storage
- User management (Admin only)
- Approval rule configuration (Admin only)
- Dashboard with statistics
- Responsive design for mobile and desktop
- Row Level Security policies
- Comprehensive documentation

### Features by Role

#### Admin
- Create and manage users
- Configure approval rules
- View all company expenses
- Approve/reject expenses
- Manage company settings

#### Manager
- Approve/reject team expenses
- View team expense reports
- Submit own expenses
- Track approval status

#### Employee
- Submit expenses with receipts
- Track expense status
- View approval history
- Upload and manage receipts

### Technical Features
- React 18 with Vite
- TailwindCSS for styling
- React Query for state management
- Supabase for backend
- PostgreSQL database
- Secure file storage
- Real-time data synchronization
- OCR text extraction
- Currency conversion API integration

### Security
- Row Level Security on all tables
- JWT-based authentication
- Signed URLs for file access
- Input validation
- XSS protection
- CSRF protection

### Documentation
- Complete README with setup instructions
- Detailed setup guide
- Feature documentation
- API documentation
- Contributing guidelines
- Code of conduct

## [Unreleased]

### Planned Features
- Email notifications
- Bulk expense upload
- Advanced reporting
- Budget management
- Mobile app
- Accounting software integration
- Recurring expenses
- Mileage tracking
- Per diem calculations

### Known Issues
- OCR accuracy depends on image quality
- Currency API has rate limits on free tier
- Large file uploads may be slow on slow connections

---

## Version History

### Version 1.0.0 (Initial Release)
First stable release with core expense management features.

**Highlights:**
- Complete expense submission workflow
- Multi-level approval system
- OCR receipt processing
- Multi-currency support
- Role-based access control
- Comprehensive admin controls

**Statistics:**
- 50+ React components
- 4 custom hooks
- 5 database tables
- 10+ RLS policies
- 1 stored procedure
- 18+ supported currencies
- 11 expense categories
