import express from 'express'
import { repo } from '../utils/repo.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/overview', protect, async (req, res) => {
  try {
    const data = await repo.getAnalytics(req.user.companyId)
    return res.json({ success: true, data })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/audit', protect, async (req, res) => {
  try {
    const logs = await repo.listAuditLogs(req.user.companyId)
    return res.json({ success: true, count: logs.length, data: logs })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

export default router
