import mongoose from 'mongoose'

// Disable query buffering so Mongoose fails fast or switches to memoryStore immediately instead of hanging
mongoose.set('bufferCommands', false)

let isConnected = false

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.log('[MongoDB Notice] MONGODB_URI not set. Running with built-in memoryStore.')
    return false
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    })
    isConnected = true
    console.log(`[MongoDB Connected] Host: ${conn.connection.host}, DB: ${conn.connection.name}`)
    return true
  } catch (error) {
    console.warn(`[MongoDB Notice] MongoDB not directly reachable (${error.message}). Operating in resilient memoryStore mode.`)
    isConnected = false
    return false
  }
}

export const getDBStatus = () => ({
  connected: isConnected && mongoose.connection.readyState === 1,
  mode: isConnected ? 'mongodb-atlas' : 'memory-store-fallback',
  readyState: mongoose.connection.readyState,
  host: isConnected ? mongoose.connection.host : 'in-memory-engine',
  name: isConnected ? mongoose.connection.name : 'reimburseflow'
})

export const isDBReady = () => isConnected && mongoose.connection.readyState === 1
