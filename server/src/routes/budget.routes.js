import express from 'express'
import { repo } from '../utils/repo.js'
import { protect, requireRole } from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, async (req, res) => {
  try {
    const budgets = await repo.listBudgets(req.user.companyId)
    return res.json({ success: true, data: budgets })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const { department, monthlyBudget, currency = 'USD' } = req.body
    const budget = await repo.updateBudget(req.user.companyId, department, parseFloat(monthlyBudget), currency)
    return res.status(201).json({ success: true, data: budget })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

export default router
