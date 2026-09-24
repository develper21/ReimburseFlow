import express from 'express'
import { repo } from '../utils/repo.js'
import { protect, requireRole } from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, async (req, res) => {
  try {
    const rules = await repo.listRules(req.user.companyId)
    return res.json({ success: true, count: rules.length, data: rules })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const rule = await repo.createRule({ ...req.body, companyId: req.user.companyId })
    return res.status(201).json({ success: true, data: rule })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

router.put('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const rule = await repo.updateRule(req.params.id, req.body)
    return res.json({ success: true, data: rule })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

router.delete('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    await repo.deleteRule(req.params.id)
    return res.json({ success: true, message: 'Rule deleted successfully' })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

export default router
