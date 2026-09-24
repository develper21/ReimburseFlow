// In-memory data store for seamless zero-setup testing and development when MongoDB Atlas is connecting
class MemoryStore {
  constructor() {
    this.companies = []
    this.users = []
    this.approvalRules = []
    this.expenses = []
    this.expenseApprovals = []
    this.departmentBudgets = []
    this.auditLogs = []

    this.initDemoData()
  }

  initDemoData() {
    // Demo Company
    const company = {
      _id: 'comp_acme_001',
      id: 'comp_acme_001',
      name: 'Acme Global Corp',
      country: 'United States',
      baseCurrency: 'USD',
      domain: 'acme.com',
      settings: { requireReceiptAbove: 25, autoApproveBelow: 15 },
      createdAt: new Date().toISOString()
    }
    this.companies.push(company)

    // Demo Admin (Alex Vance)
    const admin = {
      _id: 'usr_admin_001',
      id: 'usr_admin_001',
      email: 'admin@reimburseflow.com',
      fullName: 'Alex Vance (Admin)',
      role: 'admin',
      companyId: company._id,
      department: 'Management',
      spendingLimit: 25000,
      createdAt: new Date().toISOString()
    }

    // Demo Manager (Sarah Connor)
    const manager = {
      _id: 'usr_manager_001',
      id: 'usr_manager_001',
      email: 'manager@reimburseflow.com',
      fullName: 'Sarah Connor (Engineering Lead)',
      role: 'manager',
      companyId: company._id,
      managerId: admin._id,
      department: 'Engineering',
      spendingLimit: 15000,
      createdAt: new Date().toISOString()
    }

    // Demo Employee (John Doe)
    const employee = {
      _id: 'usr_emp_001',
      id: 'usr_emp_001',
      email: 'employee@reimburseflow.com',
      fullName: 'John Doe (Software Engineer)',
      role: 'employee',
      companyId: company._id,
      managerId: manager._id,
      department: 'Engineering',
      spendingLimit: 5000,
      createdAt: new Date().toISOString()
    }

    this.users.push(admin, manager, employee)

    // Default Approval Rule
    const defaultRule = {
      _id: 'rule_default_001',
      id: 'rule_default_001',
      companyId: company._id,
      name: 'Standard Management Approval',
      description: 'Requires primary department manager approval followed by secondary finance review',
      isManagerApprover: true,
      approverIds: [manager._id, admin._id],
      sequenceOrder: true,
      ruleType: 'hybrid',
      percentageRequired: 50,
      specificApprover: admin._id,
      isDefault: true,
      createdAt: new Date().toISOString()
    }
    this.approvalRules.push(defaultRule)

    // Department Budgets
    this.departmentBudgets.push(
      {
        _id: 'bgt_001',
        companyId: company._id,
        department: 'Engineering',
        monthlyBudget: 25000,
        spentAmount: 11450,
        currency: 'USD'
      },
      {
        _id: 'bgt_002',
        companyId: company._id,
        department: 'Sales',
        monthlyBudget: 20000,
        spentAmount: 14800,
        currency: 'USD'
      },
      {
        _id: 'bgt_003',
        companyId: company._id,
        department: 'Marketing',
        monthlyBudget: 15000,
        spentAmount: 8200,
        currency: 'USD'
      },
      {
        _id: 'bgt_004',
        companyId: company._id,
        department: 'Operations',
        monthlyBudget: 10000,
        spentAmount: 3100,
        currency: 'USD'
      }
    )

    // Sample Expenses
    const exp1 = {
      _id: 'exp_001',
      id: 'exp_001',
      companyId: company._id,
      createdBy: employee,
      description: 'AWS Cloud Server Hosting & Staging Environment',
      category: 'Software & SaaS',
      dateOfExpense: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 249.99,
      currency: 'USD',
      amountBase: 249.99,
      baseCurrency: 'USD',
      exchangeRate: 1,
      paidBy: 'Corporate Amex',
      status: 'pending',
      merchant: 'Amazon Web Services',
      approvalRuleId: defaultRule,
      department: 'Engineering',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }

    const exp2 = {
      _id: 'exp_002',
      id: 'exp_002',
      companyId: company._id,
      createdBy: employee,
      description: 'Client Dinner with Enterprise Partners',
      category: 'Meals & Entertainment',
      dateOfExpense: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 185.5,
      currency: 'USD',
      amountBase: 185.5,
      baseCurrency: 'USD',
      exchangeRate: 1,
      paidBy: 'Personal Card',
      status: 'pending',
      merchant: 'Nobu Downtown',
      approvalRuleId: defaultRule,
      department: 'Engineering',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    }

    const exp3 = {
      _id: 'exp_003',
      id: 'exp_003',
      companyId: company._id,
      createdBy: employee,
      description: 'Figma Organization Annual Seat License',
      category: 'Software & SaaS',
      dateOfExpense: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 450.0,
      currency: 'EUR',
      amountBase: 490.5,
      baseCurrency: 'USD',
      exchangeRate: 1.09,
      paidBy: 'Personal Card',
      status: 'approved',
      merchant: 'Figma Inc.',
      approvalRuleId: defaultRule,
      department: 'Engineering',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }

    const exp4 = {
      _id: 'exp_004',
      id: 'exp_004',
      companyId: company._id,
      createdBy: manager,
      description: 'Offsite Strategy Flight Tickets (NYC ➔ SFO)',
      category: 'Travel & Lodging',
      dateOfExpense: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 820.0,
      currency: 'USD',
      amountBase: 820.0,
      baseCurrency: 'USD',
      exchangeRate: 1,
      paidBy: 'Corporate Amex',
      status: 'approved',
      merchant: 'Delta Air Lines',
      approvalRuleId: defaultRule,
      department: 'Engineering',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }

    const exp5 = {
      _id: 'exp_005',
      id: 'exp_005',
      companyId: company._id,
      createdBy: employee,
      description: 'Personal Ergonomic Chair - Unauthorized Vendor',
      category: 'Office Supplies',
      dateOfExpense: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 650.0,
      currency: 'USD',
      amountBase: 650.0,
      baseCurrency: 'USD',
      exchangeRate: 1,
      paidBy: 'Personal Card',
      status: 'rejected',
      merchant: 'Custom Reseller',
      rejectionReason: 'Exceeds non-contracted equipment limit. Please order via catalog.',
      approvalRuleId: defaultRule,
      department: 'Engineering',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    }

    this.expenses.push(exp1, exp2, exp3, exp4, exp5)

    // Approvals for exp1 and exp2
    this.expenseApprovals.push(
      {
        _id: 'appr_001',
        expenseId: exp1._id,
        approverId: manager._id,
        sequenceIndex: 0,
        status: 'pending',
        comment: ''
      },
      {
        _id: 'appr_002',
        expenseId: exp1._id,
        approverId: admin._id,
        sequenceIndex: 1,
        status: 'pending',
        comment: ''
      },
      {
        _id: 'appr_003',
        expenseId: exp2._id,
        approverId: manager._id,
        sequenceIndex: 0,
        status: 'pending',
        comment: ''
      }
    )

    // Audit logs
    this.auditLogs.push(
      {
        _id: 'log_001',
        companyId: company._id,
        action: 'System Initialized',
        entityType: 'auth',
        actorName: 'System Engine',
        details: { message: 'ReimburseFlow MongoDB Atlas Engine ready.' },
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'log_002',
        companyId: company._id,
        action: 'Expense Approved',
        entityType: 'approval',
        actorName: 'Sarah Connor (Engineering Lead)',
        details: { expense: 'Figma Organization License', amount: 450, currency: 'EUR' },
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'log_003',
        companyId: company._id,
        action: 'Expense Rejected',
        entityType: 'approval',
        actorName: 'Alex Vance (Admin)',
        details: { expense: 'Personal Ergonomic Chair', reason: 'Non-contracted vendor' },
        createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString()
      }
    )
  }
}

export const memoryStore = new MemoryStore()
