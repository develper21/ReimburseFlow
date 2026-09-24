import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { isDBReady } from '../config/db.js'
import { memoryStore } from './memoryStore.js'
import User from '../models/User.js'
import Company from '../models/Company.js'
import Expense from '../models/Expense.js'
import ExpenseApproval from '../models/ExpenseApproval.js'
import ApprovalRule from '../models/ApprovalRule.js'
import DepartmentBudget from '../models/DepartmentBudget.js'
import AuditLog from '../models/AuditLog.js'

export const repo = {
  // --- Auth & Users ---
  findUserByEmail: async (email) => {
    if (isDBReady()) {
      return await User.findOne({ email }).select('+password')
    }
    return memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
  },

  findUserById: async (id) => {
    if (isDBReady()) {
      return await User.findById(id).select('-password')
    }
    return memoryStore.users.find((u) => u._id === id || u.id === id) || null
  },

  createUser: async (userData) => {
    if (isDBReady()) {
      return await User.create(userData)
    }
    const newUser = {
      _id: `usr_${Date.now()}`,
      id: `usr_${Date.now()}`,
      ...userData,
      password: userData.password,
      createdAt: new Date().toISOString()
    }
    memoryStore.users.push(newUser)
    return newUser
  },

  listUsers: async (companyId) => {
    if (isDBReady()) {
      return await User.find({ companyId }).populate('managerId', 'fullName email role').select('-password')
    }
    return memoryStore.users
  },

  listManagers: async (companyId) => {
    if (isDBReady()) {
      return await User.find({ companyId, role: { $in: ['admin', 'manager'] } }).select('fullName email role department')
    }
    return memoryStore.users.filter((u) => u.role === 'admin' || u.role === 'manager')
  },

  updateUser: async (id, updates) => {
    if (isDBReady()) {
      return await User.findByIdAndUpdate(id, updates, { new: true }).select('-password')
    }
    const idx = memoryStore.users.findIndex((u) => u._id === id || u.id === id)
    if (idx !== -1) {
      memoryStore.users[idx] = { ...memoryStore.users[idx], ...updates }
      return memoryStore.users[idx]
    }
    return null
  },

  deleteUser: async (id) => {
    if (isDBReady()) {
      return await User.findByIdAndDelete(id)
    }
    memoryStore.users = memoryStore.users.filter((u) => u._id !== id && u.id !== id)
    return true
  },

  // --- Companies ---
  findCompanyById: async (id) => {
    if (isDBReady()) {
      return await Company.findById(id)
    }
    return memoryStore.companies[0] || null
  },

  createCompany: async (companyData) => {
    if (isDBReady()) {
      return await Company.create(companyData)
    }
    const newComp = {
      _id: `comp_${Date.now()}`,
      id: `comp_${Date.now()}`,
      ...companyData,
      createdAt: new Date().toISOString()
    }
    memoryStore.companies.push(newComp)
    return newComp
  },

  // --- Expenses ---
  listMyExpenses: async (userId) => {
    if (isDBReady()) {
      return await Expense.find({ createdBy: userId }).populate('approvalRuleId', 'name ruleType').sort({ createdAt: -1 })
    }
    return memoryStore.expenses.filter((e) => {
      const creatorId = e.createdBy?._id || e.createdBy?.id || e.createdBy
      return creatorId === userId
    })
  },

  listCompanyExpenses: async (companyId, filters = {}) => {
    if (isDBReady()) {
      const q = { companyId }
      if (filters.status && filters.status !== 'all') q.status = filters.status
      if (filters.category && filters.category !== 'all') q.category = filters.category
      if (filters.search) {
        q.$or = [{ description: { $regex: filters.search, $options: 'i' } }, { merchant: { $regex: filters.search, $options: 'i' } }]
      }
      return await Expense.find(q).populate('createdBy', 'fullName email department role').sort({ createdAt: -1 })
    }

    return memoryStore.expenses.filter((e) => {
      const matchesStatus = !filters.status || filters.status === 'all' || e.status === filters.status
      const matchesCategory = !filters.category || filters.category === 'all' || e.category === filters.category
      const matchesSearch = !filters.search || (e.description || '').toLowerCase().includes(filters.search.toLowerCase())
      return matchesStatus && matchesCategory && matchesSearch
    })
  },

  findExpenseById: async (id) => {
    if (isDBReady()) {
      const exp = await Expense.findById(id).populate('createdBy', 'fullName email role department').populate('approvalRuleId')
      if (!exp) return null
      const approvals = await ExpenseApproval.find({ expenseId: id }).populate('approverId', 'fullName email role')
      return { ...exp.toObject(), approvals }
    }
    const exp = memoryStore.expenses.find((e) => e._id === id || e.id === id)
    if (!exp) return null
    const approvals = memoryStore.expenseApprovals.filter((a) => a.expenseId === id)
    return { ...exp, approvals }
  },

  createExpense: async (expenseData) => {
    if (isDBReady()) {
      return await Expense.create(expenseData)
    }
    const newExp = {
      _id: `exp_${Date.now()}`,
      id: `exp_${Date.now()}`,
      ...expenseData,
      createdAt: new Date().toISOString()
    }
    memoryStore.expenses.unshift(newExp)

    // Setup initial approval in memory
    const defaultManager = memoryStore.users.find((u) => u.role === 'manager')
    if (defaultManager) {
      memoryStore.expenseApprovals.push({
        _id: `appr_${Date.now()}`,
        expenseId: newExp._id,
        approverId: defaultManager._id,
        status: 'pending',
        sequenceIndex: 0
      })
    }
    return newExp
  },

  deleteExpense: async (id) => {
    if (isDBReady()) {
      await ExpenseApproval.deleteMany({ expenseId: id })
      return await Expense.findByIdAndDelete(id)
    }
    memoryStore.expenses = memoryStore.expenses.filter((e) => e._id !== id && e.id !== id)
    memoryStore.expenseApprovals = memoryStore.expenseApprovals.filter((a) => a.expenseId !== id)
    return true
  },

  // --- Approvals ---
  listPendingApprovals: async (approverId) => {
    if (isDBReady()) {
      const approvals = await ExpenseApproval.find({ approverId, status: 'pending' }).sort({ createdAt: -1 })
      const expIds = approvals.map((a) => a.expenseId)
      const expenses = await Expense.find({ _id: { $in: expIds } }).populate('createdBy', 'fullName email role department')
      const expMap = {}
      expenses.forEach((e) => { expMap[e._id.toString()] = e })
      return approvals.map((a) => ({ ...a.toObject(), expense: expMap[a.expenseId.toString()] || null })).filter((item) => item.expense && item.expense.status === 'pending')
    }

    const pending = memoryStore.expenseApprovals.filter((a) => a.approverId === approverId && a.status === 'pending')
    return pending.map((a) => {
      const expense = memoryStore.expenses.find((e) => e._id === a.expenseId || e.id === a.expenseId)
      return { ...a, expense }
    }).filter((item) => item.expense && item.expense.status === 'pending')
  },

  processApproval: async (expenseId, approverId, action, comment) => {
    if (isDBReady()) {
      let approval = await ExpenseApproval.findOne({ expenseId, approverId, status: 'pending' })
      if (!approval) {
        approval = await ExpenseApproval.create({ expenseId, approverId, sequenceIndex: 0, status: 'pending' })
      }
      approval.status = action
      approval.comment = comment || ''
      approval.actedAt = new Date()
      await approval.save()

      await Expense.findByIdAndUpdate(expenseId, {
        status: action === 'approved' ? 'approved' : 'rejected',
        rejectionReason: action === 'rejected' ? comment : null
      })
      return { success: true, status: action }
    }

    // In-memory process
    const approval = memoryStore.expenseApprovals.find(
      (a) => a.expenseId === expenseId && (a.approverId === approverId || a.status === 'pending')
    )
    if (approval) {
      approval.status = action
      approval.comment = comment || ''
      approval.actedAt = new Date().toISOString()
    }

    const exp = memoryStore.expenses.find((e) => e._id === expenseId || e.id === expenseId)
    if (exp) {
      exp.status = action === 'approved' ? 'approved' : 'rejected'
      if (action === 'rejected') exp.rejectionReason = comment
    }
    return { success: true, status: action }
  },

  listExpenseApprovals: async (expenseId) => {
    if (isDBReady()) {
      return await ExpenseApproval.find({ expenseId }).populate('approverId', 'fullName email role').sort({ sequenceIndex: 1 })
    }
    return memoryStore.expenseApprovals.filter((a) => a.expenseId === expenseId)
  },

  // --- Rules ---
  listRules: async (companyId) => {
    if (isDBReady()) {
      return await ApprovalRule.find({ companyId }).populate('approverIds', 'fullName email role')
    }
    return memoryStore.approvalRules
  },

  createRule: async (ruleData) => {
    if (isDBReady()) {
      return await ApprovalRule.create(ruleData)
    }
    const newRule = {
      _id: `rule_${Date.now()}`,
      id: `rule_${Date.now()}`,
      ...ruleData,
      createdAt: new Date().toISOString()
    }
    memoryStore.approvalRules.push(newRule)
    return newRule
  },

  updateRule: async (id, updates) => {
    if (isDBReady()) {
      return await ApprovalRule.findByIdAndUpdate(id, updates, { new: true })
    }
    const idx = memoryStore.approvalRules.findIndex((r) => r._id === id || r.id === id)
    if (idx !== -1) {
      memoryStore.approvalRules[idx] = { ...memoryStore.approvalRules[idx], ...updates }
      return memoryStore.approvalRules[idx]
    }
    return null
  },

  deleteRule: async (id) => {
    if (isDBReady()) {
      return await ApprovalRule.findByIdAndDelete(id)
    }
    memoryStore.approvalRules = memoryStore.approvalRules.filter((r) => r._id !== id && r.id !== id)
    return true
  },

  // --- Budgets ---
  listBudgets: async (companyId) => {
    if (isDBReady()) {
      return await DepartmentBudget.find({ companyId })
    }
    return memoryStore.departmentBudgets
  },

  updateBudget: async (companyId, department, monthlyBudget, currency) => {
    if (isDBReady()) {
      return await DepartmentBudget.findOneAndUpdate(
        { companyId, department },
        { monthlyBudget, currency },
        { new: true, upsert: true }
      )
    }
    const existing = memoryStore.departmentBudgets.find((b) => b.department === department)
    if (existing) {
      existing.monthlyBudget = monthlyBudget
      existing.currency = currency
      return existing
    }
    const newBudget = {
      _id: `bgt_${Date.now()}`,
      companyId,
      department,
      monthlyBudget,
      spentAmount: 0,
      currency
    }
    memoryStore.departmentBudgets.push(newBudget)
    return newBudget
  },

  // --- Analytics ---
  getAnalytics: async (companyId) => {
    const expenses = await repo.listCompanyExpenses(companyId)
    const totalSpend = expenses
      .filter((e) => e.status === 'approved' || e.status === 'reimbursed')
      .reduce((sum, e) => sum + (parseFloat(e.amountBase || e.amount) || 0), 0)

    const pendingAmount = expenses
      .filter((e) => e.status === 'pending')
      .reduce((sum, e) => sum + (parseFloat(e.amountBase || e.amount) || 0), 0)

    const totalCount = expenses.length
    const pendingCount = expenses.filter((e) => e.status === 'pending').length
    const approvedCount = expenses.filter((e) => e.status === 'approved' || e.status === 'reimbursed').length
    const rejectedCount = expenses.filter((e) => e.status === 'rejected').length

    // Category breakdown
    const catMap = {}
    expenses.forEach((e) => {
      const cat = e.category || 'General'
      const amt = parseFloat(e.amountBase || e.amount) || 0
      catMap[cat] = (catMap[cat] || 0) + amt
    })

    const categoryBreakdown = Object.entries(catMap).map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      percentage: totalSpend > 0 ? Math.round((amount / (totalSpend + pendingAmount)) * 100) : 0
    }))

    // 6-month trajectory
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const curMonth = new Date().getMonth()
    const monthlyTrends = []

    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(curMonth - i)
      const mName = months[d.getMonth()]
      const yr = d.getFullYear()
      const mNum = d.getMonth()

      const monthExpenses = expenses.filter((e) => {
        const expD = new Date(e.dateOfExpense || e.createdAt)
        return expD.getMonth() === mNum && expD.getFullYear() === yr
      })

      const monthTotal = monthExpenses.reduce((sum, e) => sum + (parseFloat(e.amountBase || e.amount) || 0), 0)
      monthlyTrends.push({
        month: `${mName} ${yr}`,
        shortMonth: mName,
        total: Math.round(monthTotal * 100) / 100,
        count: monthExpenses.length
      })
    }

    const budgets = await repo.listBudgets(companyId)
    const recentActivity = await repo.listAuditLogs(companyId)

    return {
      summary: {
        totalSpend: Math.round(totalSpend * 100) / 100,
        pendingAmount: Math.round(pendingAmount * 100) / 100,
        totalCount,
        pendingCount,
        approvedCount,
        rejectedCount,
        approvalRate: totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0
      },
      categoryBreakdown,
      monthlyTrends,
      budgets,
      recentActivity: recentActivity.slice(0, 8)
    }
  },

  // --- Audit Logs ---
  listAuditLogs: async (companyId) => {
    if (isDBReady()) {
      return await AuditLog.find({ companyId }).sort({ createdAt: -1 }).limit(100)
    }
    return memoryStore.auditLogs
  },

  addAuditLog: async (logData) => {
    if (isDBReady()) {
      return await AuditLog.create(logData)
    }
    const newLog = {
      _id: `log_${Date.now()}`,
      ...logData,
      createdAt: new Date().toISOString()
    }
    memoryStore.auditLogs.unshift(newLog)
    return newLog
  }
}
