import express from 'express'
import { repo } from '../utils/repo.js'
import { protect, requireRole } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/expenses/my
router.get('/my', protect, async (req, res) => {
  try {
    const expenses = await repo.listMyExpenses(req.user.id)
    return res.json({ success: true, count: expenses.length, data: expenses })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

// @route   GET /api/expenses/company
router.get('/company', protect, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { status, category, search } = req.query
    const expenses = await repo.listCompanyExpenses(req.user.companyId, { status, category, search })
    return res.json({ success: true, count: expenses.length, data: expenses })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

// @route   GET /api/expenses/export
router.get('/export', protect, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { format = 'csv', status, category } = req.query
    const expenses = await repo.listCompanyExpenses(req.user.companyId, { status, category })

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', 'attachment; filename=reimburseflow_expenses.json')
      return res.json(expenses)
    }

    const headers = [
      'ID',
      'Employee Name',
      'Department',
      'Description',
      'Category',
      'Date',
      'Amount',
      'Currency',
      'Base Amount (USD)',
      'Payment Method',
      'Status',
      'Merchant'
    ]

    const rows = expenses.map((e) => [
      e._id || e.id,
      `"${(e.createdBy?.fullName || '').replace(/"/g, '""')}"`,
      `"${e.department || ''}"`,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      `"${e.category}"`,
      new Date(e.dateOfExpense || e.createdAt).toISOString().split('T')[0],
      e.amount,
      e.currency,
      e.amountBase,
      `"${e.paidBy || ''}"`,
      e.status,
      `"${(e.merchant || '').replace(/"/g, '""')}"`
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=reimburseflow_expenses.csv')
    return res.send(csvContent)
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

// @route   GET /api/expenses/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const expense = await repo.findExpenseById(req.params.id)
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' })
    }
    return res.json({ success: true, data: expense })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

// @route   POST /api/expenses
router.post('/', protect, async (req, res) => {
  try {
    const {
      description,
      category,
      dateOfExpense,
      amount,
      currency = 'USD',
      amountBase,
      baseCurrency = 'USD',
      exchangeRate = 1,
      paidBy = 'Personal Card',
      receiptPath,
      receiptName,
      approvalRuleId,
      merchant,
      department
    } = req.body

    if (!description || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide description, category, and amount'
      })
    }

    const parsedAmount = parseFloat(amount)
    const finalAmountBase = amountBase ? parseFloat(amountBase) : parsedAmount

    const expense = await repo.createExpense({
      companyId: req.user.companyId,
      createdBy: req.user,
      description,
      category,
      dateOfExpense: dateOfExpense ? new Date(dateOfExpense) : new Date(),
      amount: parsedAmount,
      currency: currency.toUpperCase(),
      amountBase: finalAmountBase,
      baseCurrency: baseCurrency.toUpperCase(),
      exchangeRate: parseFloat(exchangeRate) || 1,
      paidBy,
      status: 'pending',
      receiptPath,
      receiptName,
      approvalRuleId: approvalRuleId || null,
      merchant: merchant || '',
      department: department || req.user.department || 'General'
    })

    await repo.addAuditLog({
      companyId: req.user.companyId,
      action: 'Expense Submitted',
      entityType: 'expense',
      actorId: req.user.id,
      actorName: req.user.fullName,
      details: { amount: expense.amount, currency: expense.currency }
    })

    return res.status(201).json({
      success: true,
      message: 'Expense submitted successfully for approval',
      data: expense
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

// @route   DELETE /api/expenses/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await repo.deleteExpense(req.params.id)
    return res.json({ success: true, message: 'Expense deleted successfully' })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

export default router
