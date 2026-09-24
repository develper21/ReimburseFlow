import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  try {
    let token = null

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing. Please sign in.'
      })
    }

    const secret = process.env.JWT_SECRET || 'reimburseflow_super_secret_jwt_key_2026_appwrite_theme'

    // Decode token
    let decoded
    try {
      decoded = jwt.verify(token, secret)
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please sign in again.'
      })
    }

    // Attach user from database or decoded payload
    try {
      const user = await User.findById(decoded.id).select('-password')
      if (user) {
        req.user = user
      } else {
        // Fallback to token payload if user record is cached/fallback
        req.user = {
          _id: decoded.id,
          id: decoded.id,
          email: decoded.email,
          fullName: decoded.fullName,
          role: decoded.role,
          companyId: decoded.companyId
        }
      }
    } catch {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        email: decoded.email,
        fullName: decoded.fullName,
        role: decoded.role,
        companyId: decoded.companyId
      }
    }

    next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Authentication error: ${error.message}`
    })
  }
}

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user?.role || 'anonymous'}' is not authorized to access this resource`
      })
    }
    next()
  }
}
