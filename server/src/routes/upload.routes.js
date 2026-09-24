import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Configure multer storage
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|pdf/
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new Error('Only images (JPEG, PNG, WebP) and PDFs are allowed'))
  }
})

// @route   POST /api/upload
// @desc    Upload receipt file and return access URL / Data URI
router.post('/', protect, upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a receipt file' })
    }

    // Convert buffer to data URI for universal inline preview
    const base64Data = req.file.buffer.toString('base64')
    const mimeType = req.file.mimetype
    const dataUri = `data:${mimeType};base64,${base64Data}`

    return res.json({
      success: true,
      data: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        url: dataUri,
        path: dataUri
      }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

export default router
