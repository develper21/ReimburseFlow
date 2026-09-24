import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

import { connectDB, getDBStatus, isDBReady } from './config/db.js'
import { seedDatabase } from './utils/demoData.js'

import authRoutes from './routes/auth.routes.js'
import expenseRoutes from './routes/expense.routes.js'
import approvalRoutes from './routes/approval.routes.js'
import ruleRoutes from './routes/rule.routes.js'
import userRoutes from './routes/user.routes.js'
import budgetRoutes from './routes/budget.routes.js'
import analyticsRoutes from './routes/analytics.routes.js'
import uploadRoutes from './routes/upload.routes.js'
import seedRoutes from './routes/seed.routes.js'

const app = express()
const PORT = process.env.PORT || 5001

// Middlewares
app.use(
  cors({
    origin: '*',
    credentials: true
  })
)
app.use(morgan('dev'))
app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ extended: true, limit: '25mb' }))

// Health Check
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus()
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'ReimburseFlow Engine',
    port: PORT,
    database: dbStatus
  })
})

// Mount API Routes
app.use('/api/auth', authRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/approvals', approvalRoutes)
app.use('/api/rules', ruleRoutes)
app.use('/api/users', userRoutes)
app.use('/api/budgets', budgetRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/seed', seedRoutes)

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  })
})

// Connect to MongoDB and start Express server
const startServer = async () => {
  await connectDB()

  if (isDBReady()) {
    try {
      await seedDatabase()
    } catch (err) {
      console.warn('[Seed Warning]: Could not auto-seed Mongo:', err.message)
    }
  }

  app.listen(PORT, () => {
    console.log(`====================================================`)
    console.log(`  🚀 ReimburseFlow Backend Server Active!          `)
    console.log(`  🌐 Port: http://localhost:${PORT}               `)
    console.log(`  📊 Health: http://localhost:${PORT}/api/health     `)
    console.log(`  🎨 Appwrite-Themed Console Ready                 `)
    console.log(`====================================================`)
  })
}

startServer()

export default app
