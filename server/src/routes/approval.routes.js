import express from 'express'
import { repo } from '../utils/repo.js'
import { protect, requireRole } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/approvals/pending
router.get('/pending', protect, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const list = await repo.listPendingApprovals(req.user.id)
    return res.json({ success: true, count: list.length, data: list })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

// @route   POST /api/approvals/process
router.post('/process', protect, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { expenseId, action, comment } = req.body
    if (!expenseId || !action) {
      return res.status(400).json({ success: false, message: 'expenseId and action required' })
    }

    const result = await repo.processApproval(expenseId, req.user.id, action, comment)

    await repo.addAuditLog({
      companyId: req.user.companyId,
      action: `Expense ${action === 'approved' ? 'Approved' : 'Rejected'}`,
      entityType: 'approval',
      actorId: req.user.id,
      actorName: req.user.fullName,
      details: { expenseId, action, comment }
    })

    return res.json({ success: true, message: `Expense ${action} successfully`, data: result })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

// @route   GET /api/approvals/history/:expenseId
router.get('/history/:expenseId', protect, async (req, res) => {
  try {
    const history = await repo.listExpenseApprovals(req.params.expenseId)
    return res.json({ success: true, data: history })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

export default router
