import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    action: {
      type: String,
      required: true
    },
    entityType: {
      type: String,
      enum: ['expense', 'approval', 'user', 'rule', 'budget', 'auth'],
      required: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    actorName: {
      type: String,
      default: 'System'
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema)
