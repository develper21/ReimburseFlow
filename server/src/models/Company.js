import mongoose from 'mongoose'

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    country: {
      type: String,
      default: 'United States'
    },
    baseCurrency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true
    },
    domain: {
      type: String,
      trim: true
    },
    settings: {
      requireReceiptAbove: { type: Number, default: 25 },
      autoApproveBelow: { type: Number, default: 0 },
      notifyOnSubmission: { type: Boolean, default: true },
      notifyOnApproval: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

export default mongoose.models.Company || mongoose.model('Company', companySchema)
