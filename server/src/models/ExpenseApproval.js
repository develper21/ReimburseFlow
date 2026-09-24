import mongoose from 'mongoose'

const expenseApprovalSchema = new mongoose.Schema(
  {
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
      required: true
    },
    approverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sequenceIndex: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'skipped'],
      default: 'pending'
    },
    comment: {
      type: String,
      default: ''
    },
    actedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

export default mongoose.models.ExpenseApproval || mongoose.model('ExpenseApproval', expenseApprovalSchema)
