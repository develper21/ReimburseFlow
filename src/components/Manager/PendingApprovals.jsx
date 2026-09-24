import { useState } from 'react'
import { CheckCircle2, XCircle, Eye, Clock, ShieldCheck, User, Calendar, Receipt } from 'lucide-react'
import { usePendingApprovals } from '../../hooks/useApprovals'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency } from '../../lib/currency'
import { format } from 'date-fns'
import ApprovalModal from './ApprovalModal'
import ExpenseDetailModal from '../Shared/ExpenseDetailModal'

export default function PendingApprovals() {
  const { profile } = useAuth()
  const { data: approvals, isLoading } = usePendingApprovals(profile?.id || profile?._id)
  const [selectedApproval, setSelectedApproval] = useState(null)
  const [selectedExpense, setSelectedExpense] = useState(null)

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <div className="h-8 w-8 border-2 border-[#fd366e] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-zinc-500">Checking pending approvals queue...</p>
      </div>
    )
  }

  if (!approvals || approvals.length === 0) {
    return (
      <div className="aw-card p-12 text-center">
        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-3">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-white">Approvals Queue is Clear</h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
          All team expense submissions have been reviewed. When new claims arrive, they will appear here.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-1">
          <span>{approvals.length} submissions awaiting your review</span>
          <span className="text-[#f99c00]">Decision Required</span>
        </div>

        {approvals.map((approval) => {
          const expense = approval.expense
          if (!expense) return null

          const expDate = expense.dateOfExpense || expense.date_of_expense || expense.createdAt
          const submitter = expense.createdBy || expense.created_by_profile

          return (
            <div
              key={approval._id || approval.id}
              className="aw-card p-5 hover:border-white/20 transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="aw-badge-pending px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium inline-flex items-center gap-1.5 shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 glow-dot-amber" />
                      Pending Approval
                    </span>
                    <h3 className="text-sm font-semibold text-white truncate font-display">
                      {expense.description}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-zinc-500 font-mono text-[11px] block">Submitted By</span>
                      <p className="font-medium text-white truncate">
                        {submitter?.fullName || submitter?.full_name || 'Team Member'}
                      </p>
                    </div>

                    <div>
                      <span className="text-zinc-500 font-mono text-[11px] block">Expense Date</span>
                      <p className="font-mono text-zinc-300">
                        {format(new Date(expDate), 'MMM dd, yyyy')}
                      </p>
                    </div>

                    <div>
                      <span className="text-zinc-500 font-mono text-[11px] block">Category</span>
                      <p className="text-zinc-300 truncate">{expense.category}</p>
                    </div>

                    <div>
                      <span className="text-zinc-500 font-mono text-[11px] block">Claim Amount</span>
                      <p className="font-mono font-bold text-white">
                        {formatCurrency(expense.amount, expense.currency)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/[0.06] shrink-0">
                  <button
                    onClick={() => setSelectedExpense(expense)}
                    className="aw-btn-secondary px-3 py-2 text-xs"
                    title="Inspect details and receipt"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Inspect</span>
                  </button>

                  <button
                    onClick={() => setSelectedApproval({ ...approval, action: 'approved' })}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => setSelectedApproval({ ...approval, action: 'rejected' })}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Decision Confirmation Modal */}
      {selectedApproval && (
        <ApprovalModal
          approval={selectedApproval}
          onClose={() => setSelectedApproval(null)}
        />
      )}

      {/* Expense Detail Viewer */}
      {selectedExpense && (
        <ExpenseDetailModal
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
        />
      )}
    </>
  )
}
