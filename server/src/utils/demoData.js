import Company from '../models/Company.js'
import User from '../models/User.js'
import ApprovalRule from '../models/ApprovalRule.js'
import Expense from '../models/Expense.js'
import ExpenseApproval from '../models/ExpenseApproval.js'
import DepartmentBudget from '../models/DepartmentBudget.js'
import AuditLog from '../models/AuditLog.js'

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Initializing demo data...')

    // Check if company already exists
    let company = await Company.findOne({ name: 'Acme Global Corp' })
    if (!company) {
      company = await Company.create({
        name: 'Acme Global Corp',
        country: 'United States',
        baseCurrency: 'USD',
        domain: 'acme.com',
        settings: {
          requireReceiptAbove: 25,
          autoApproveBelow: 15
        }
      })
    }

    // Create Admin
    let admin = await User.findOne({ email: 'admin@reimburseflow.com' })
    if (!admin) {
      admin = await User.create({
        email: 'admin@reimburseflow.com',
        password: 'password123',
        fullName: 'Alex Vance (Admin)',
        role: 'admin',
        companyId: company._id,
        department: 'Operations',
        spendingLimit: 25000
      })
    }

    // Create Manager
    let manager = await User.findOne({ email: 'manager@reimburseflow.com' })
    if (!manager) {
      manager = await User.create({
        email: 'manager@reimburseflow.com',
        password: 'password123',
        fullName: 'Sarah Connor (Engineering Lead)',
        role: 'manager',
        companyId: company._id,
        managerId: admin._id,
        department: 'Engineering',
        spendingLimit: 15000
      })
    }

    // Create Employee
    let employee = await User.findOne({ email: 'employee@reimburseflow.com' })
    if (!employee) {
      employee = await User.create({
        email: 'employee@reimburseflow.com',
        password: 'password123',
        fullName: 'John Doe (Software Engineer)',
        role: 'employee',
        companyId: company._id,
        managerId: manager._id,
        department: 'Engineering',
        spendingLimit: 5000
      })
    }

    // Ensure manager relationship is set
    await User.findByIdAndUpdate(employee._id, { managerId: manager._id })
    await User.findByIdAndUpdate(manager._id, { managerId: admin._id })

    // Create Default Approval Rule
    let defaultRule = await ApprovalRule.findOne({ companyId: company._id, name: 'Standard Management Approval' })
    if (!defaultRule) {
      defaultRule = await ApprovalRule.create({
        companyId: company._id,
        name: 'Standard Management Approval',
        description: 'Requires primary department manager approval followed by secondary finance review for expenses over $500',
        isManagerApprover: true,
        approverIds: [manager._id, admin._id],
        sequenceOrder: true,
        ruleType: 'hybrid',
        percentageRequired: 50,
        specificApprover: admin._id,
        isDefault: true
      })
    }

    // Create Department Budgets
    const departments = [
      { department: 'Engineering', monthlyBudget: 25000, spentAmount: 11450 },
      { department: 'Marketing', monthlyBudget: 15000, spentAmount: 8200 },
      { department: 'Sales', monthlyBudget: 20000, spentAmount: 14800 },
      { department: 'Operations', monthlyBudget: 10000, spentAmount: 3100 }
    ]

    for (const dept of departments) {
      const existing = await DepartmentBudget.findOne({ companyId: company._id, department: dept.department })
      if (!existing) {
        await DepartmentBudget.create({
          companyId: company._id,
          department: dept.department,
          monthlyBudget: dept.monthlyBudget,
          spentAmount: dept.spentAmount,
          currency: 'USD'
        })
      }
    }

    // Create Sample Expenses if none exist
    const expenseCount = await Expense.countDocuments({ companyId: company._id })
    if (expenseCount === 0) {
      const sampleExpenses = [
        {
          companyId: company._id,
          createdBy: employee._id,
          description: 'AWS Cloud Server Hosting & Staging Environment',
          category: 'Software & SaaS',
          dateOfExpense: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          amount: 249.99,
          currency: 'USD',
          amountBase: 249.99,
          baseCurrency: 'USD',
          paidBy: 'Corporate Amex',
          status: 'pending',
          merchant: 'Amazon Web Services',
          approvalRuleId: defaultRule._id,
          department: 'Engineering'
        },
        {
          companyId: company._id,
          createdBy: employee._id,
          description: 'Client Dinner with Enterprise Partners',
          category: 'Meals & Entertainment',
          dateOfExpense: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          amount: 185.50,
          currency: 'USD',
          amountBase: 185.50,
          baseCurrency: 'USD',
          paidBy: 'Personal Card',
          status: 'pending',
          merchant: 'Nobu Downtown',
          approvalRuleId: defaultRule._id,
          department: 'Engineering'
        },
        {
          companyId: company._id,
          createdBy: employee._id,
          description: 'Figma Organization Annual Seat License',
          category: 'Software & SaaS',
          dateOfExpense: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          amount: 450.00,
          currency: 'EUR',
          amountBase: 490.50,
          baseCurrency: 'USD',
          exchangeRate: 1.09,
          paidBy: 'Personal Card',
          status: 'approved',
          merchant: 'Figma Inc.',
          approvalRuleId: defaultRule._id,
          department: 'Engineering'
        },
        {
          companyId: company._id,
          createdBy: manager._id,
          description: 'Offsite Team Strategy Flight Tickets (NYC ➔ SFO)',
          category: 'Travel & Lodging',
          dateOfExpense: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          amount: 820.00,
          currency: 'USD',
          amountBase: 820.00,
          baseCurrency: 'USD',
          paidBy: 'Corporate Amex',
          status: 'approved',
          merchant: 'Delta Air Lines',
          approvalRuleId: defaultRule._id,
          department: 'Engineering'
        },
        {
          companyId: company._id,
          createdBy: employee._id,
          description: 'Personal Ergonomic Chair - Unauthorized Vendor',
          category: 'Office Supplies',
          dateOfExpense: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          amount: 650.00,
          currency: 'USD',
          amountBase: 650.00,
          baseCurrency: 'USD',
          paidBy: 'Personal Card',
          status: 'rejected',
          merchant: 'Custom Herman Miller Reseller',
          rejectionReason: 'Exceeds non-contracted equipment spending limit. Please procure via corporate catalog.',
          approvalRuleId: defaultRule._id,
          department: 'Engineering'
        }
      ]

      for (const exp of sampleExpenses) {
        const createdExp = await Expense.create(exp)

        // Create pending approvals for pending expenses
        if (createdExp.status === 'pending') {
          await ExpenseApproval.create({
            expenseId: createdExp._id,
            approverId: manager._id,
            sequenceIndex: 0,
            status: 'pending'
          })
          await ExpenseApproval.create({
            expenseId: createdExp._id,
            approverId: admin._id,
            sequenceIndex: 1,
            status: 'pending'
          })
        }
      }
    }

    // Seed sample audit log
    const auditCount = await AuditLog.countDocuments({ companyId: company._id })
    if (auditCount === 0) {
      await AuditLog.create({
        companyId: company._id,
        action: 'System Initialized',
        entityType: 'auth',
        actorName: 'System Engine',
        details: { message: 'ReimburseFlow MongoDB Atlas Engine initialized with Appwrite design standards.' }
      })
    }

    console.log('[Seed] Database seeded successfully with demo users and data!')
    return {
      success: true,
      company: company.name,
      users: [
        { email: 'admin@reimburseflow.com', role: 'admin' },
        { email: 'manager@reimburseflow.com', role: 'manager' },
        { email: 'employee@reimburseflow.com', role: 'employee' }
      ]
    }
  } catch (error) {
    console.error('[Seed Error]:', error.message)
    return { success: false, error: error.message }
  }
}
