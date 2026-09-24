import express from 'express'
import { seedDatabase } from '../utils/demoData.js'

const router = express.Router()

// @route   POST /api/seed
// @desc    Seed database with demo company, admin, manager, employee, and sample expenses
router.post('/', async (req, res) => {
  try {
    const result = await seedDatabase()
    return res.json(result)
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

export default router
