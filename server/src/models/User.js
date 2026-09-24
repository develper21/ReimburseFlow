import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'employee'],
      default: 'employee'
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    department: {
      type: String,
      default: 'Engineering',
      trim: true
    },
    avatar: {
      type: String,
      default: ''
    },
    spendingLimit: {
      type: Number,
      default: 5000
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'invited'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password
        return ret
      }
    },
    toObject: { virtuals: true }
  }
)

// Pre-save password hash
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.models.User || mongoose.model('User', userSchema)
