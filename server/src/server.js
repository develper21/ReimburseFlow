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

// Configure CORS Origins
const parseAllowedOrigins = () => {
  const envOrigins = process.env.CORS_ORIGIN
  if (!envOrigins || envOrigins.trim() === '*' || envOrigins.trim() === '') {
    return ['*']
  }
  return envOrigins.split(',').map((o) => o.trim()).filter(Boolean)
}

const allowedOrigins = parseAllowedOrigins()

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. Postman, curl, Render health checks)
    if (!origin) return callback(null, true)

    // Allow wildcard
    if (allowedOrigins.includes('*')) {
      return callback(null, true)
    }

    // Allow explicit origins in CORS_ORIGIN
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    // Allow Netlify deployment previews & main domain
    if (origin.endsWith('.netlify.app')) {
      return callback(null, true)
    }

    // Allow local development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true)
    }

    // Fallback allow to avoid unexpected deployment blocks
    return callback(null, true)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}

// Middlewares
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ extended: true, limit: '25mb' }))

// Root Ping Route (for Render Web Service status & health check)
app.get('/', (req, res) => {
  const dbStatus = getDBStatus()
  res.json({
    service: 'ReimburseFlow Enterprise Backend Engine',
    version: '2.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    healthCheck: '/api/health',
    database: dbStatus.mode
  })
})

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
