import mongoose from 'mongoose'

const approvalRuleSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    isManagerApprover: {
      type: Boolean,
      default: false
    },
    approverIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    sequenceOrder: {
      type: Boolean,
      default: true
    },
    ruleType: {
      type: String,
      enum: ['percentage', 'specific', 'hybrid'],
      default: 'percentage'
    },
    percentageRequired: {
      type: Number,
      default: 60,
      min: 1,
      max: 100
    },
    specificApprover: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    minAmount: {
      type: Number,
      default: 0
    },
    maxAmount: {
      type: Number,
      default: null
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

export default mongoose.models.ApprovalRule || mongoose.model('ApprovalRule', approvalRuleSchema)
