import { useState } from 'react'
import { X, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { useProcessApproval } from '../../hooks/useApprovals'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency } from '../../lib/currency'

export default function ApprovalModal({ approval, onClose }) {
  const { profile } = useAuth()
  const processApproval = useProcessApproval()
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const isApprove = approval.action === 'approved'
  const expense = approval.expense

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!isApprove && !comment.trim()) {
      setError('Please provide a justification reason for rejection')
      return
    }

    try {
      await processApproval.mutateAsync({
        expenseId: expense._id || expense.id,
        approverId: profile.id || profile._id,
        action: approval.action,
        comment: comment.trim() || (isApprove ? 'Approved by manager' : 'Rejected')
      })

      onClose()
    } catch (err) {
      console.error('Error processing approval:', err)
      setError(err.message || 'Failed to process approval.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="aw-card max-w-md w-full p-6 shadow-2xl border-white/15">
        <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            {isApprove ? (
              <div className="h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <XCircle className="h-4 w-4" />
              </div>
            )}
            <h2 className="text-base font-bold text-white font-display">
              {isApprove ? 'Approve Expense' : 'Reject Expense Claim'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Expense Summary Chip */}
        <div className="mb-4 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-1">
          <p className="font-semibold text-white truncate">{expense.description}</p>
          <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px] pt-1">
            <span>{expense.createdBy?.fullName || 'Employee'}</span>
            <span className="text-white font-bold">
              {formatCurrency(expense.amount, expense.currency)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Decision Comments {isApprove ? '(Optional)' : '(Required)'}
            </label>
            <textarea
              className="aw-input w-full px-3 py-2 text-xs"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required={!isApprove}
              placeholder={
                isApprove
                  ? 'Add an optional note (e.g. Approved per project budget)...'
                  : 'Specify reason for rejection (e.g. Missing receipt, exceeds category limit)...'
              }
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="aw-btn-secondary px-4 py-2 text-xs"
              disabled={processApproval.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processApproval.isPending}
              className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition flex items-center justify-center gap-1.5 ${
                isApprove
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
              }`}
            >
              {processApproval.isPending ? (
                <>
                  <Loader2 className="animate-spin h-3.5 w-3.5" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Confirm {isApprove ? 'Approval' : 'Rejection'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
