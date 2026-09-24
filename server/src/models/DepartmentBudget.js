import mongoose from 'mongoose'

const departmentBudgetSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    monthlyBudget: {
      type: Number,
      required: true,
      default: 10000
    },
    spentAmount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true
    },
    period: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly'],
      default: 'monthly'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

export default mongoose.models.DepartmentBudget || mongoose.model('DepartmentBudget', departmentBudgetSchema)
