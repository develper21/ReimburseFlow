import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      default: 'General'
    },
    dateOfExpense: {
      type: Date,
      default: Date.now
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      uppercase: true
    },
    amountBase: {
      type: Number,
      required: true
    },
    baseCurrency: {
      type: String,
      required: true,
      default: 'USD',
      uppercase: true
    },
    exchangeRate: {
      type: Number,
      default: 1
    },
    paidBy: {
      type: String,
      default: 'Personal Card'
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'reimbursed'],
      default: 'pending'
    },
    receiptPath: {
      type: String,
      default: null
    },
    receiptName: {
      type: String,
      default: null
    },
    approvalRuleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ApprovalRule',
      default: null
    },
    merchant: {
      type: String,
      default: ''
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    rejectionReason: {
      type: String,
      default: null
    },
    department: {
      type: String,
      default: 'General'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

export default mongoose.models.Expense || mongoose.model('Expense', expenseSchema)
