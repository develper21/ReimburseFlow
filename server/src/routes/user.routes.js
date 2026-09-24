import express from 'express'
import { repo } from '../utils/repo.js'
import { protect, requireRole } from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, async (req, res) => {
  try {
    const users = await repo.listUsers(req.user.companyId)
    return res.json({ success: true, count: users.length, data: users })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/managers', protect, async (req, res) => {
  try {
    const managers = await repo.listManagers(req.user.companyId)
    return res.json({ success: true, data: managers })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const { email, password, fullName, role = 'employee', managerId, department, spendingLimit } = req.body
    const user = await repo.createUser({
      email,
      password,
      fullName,
      role,
      companyId: req.user.companyId,
      managerId,
      department,
      spendingLimit
    })
    return res.status(201).json({ success: true, data: user })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

router.put('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const user = await repo.updateUser(req.params.id, req.body)
    return res.json({ success: true, data: user })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

router.delete('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    await repo.deleteUser(req.params.id)
    return res.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

export default router
