import { useState } from 'react'
import { X, Download, ExternalLink, Calendar, Tag, CreditCard, User, Clock, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react'
import { useExpense } from '../../hooks/useExpenses'
import { useExpenseApprovals } from '../../hooks/useApprovals'
import { formatCurrency } from '../../lib/currency'
import { format } from 'date-fns'

export default function ExpenseDetailModal({ expense: propExpense, expenseId: propId, onClose }) {
  const expenseId = propId || propExpense?._id || propExpense?.id
  const { data: fetchedExpense, isLoading } = useExpense(expenseId)
  const { data: fetchedApprovals } = useExpenseApprovals(expenseId)

  const expense = fetchedExpense || propExpense
  const approvals = fetchedApprovals || expense?.approvals || []

  if (!expense && isLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="aw-card p-6 flex items-center gap-3">
          <div className="h-5 w-5 border-2 border-[#fd366e] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-zinc-300">Loading expense details...</span>
        </div>
      </div>
    )
  }

  if (!expense) return null

  const receiptUrl = expense.receiptPath || expense.receipt_path
  const expDate = expense.dateOfExpense || expense.date_of_expense || expense.createdAt

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="aw-card max-w-3xl w-full my-8 overflow-hidden shadow-2xl border-white/15 animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#fd366e]/15 border border-[#fd366e]/30 flex items-center justify-center text-[#fd366e]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">Expense Submission Details</h2>
              <p className="text-[11px] text-zinc-500 font-mono">ID: {expense._id || expense.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Status & Amount Highlight Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Total Claim</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-2xl sm:text-3xl font-bold font-display text-white">
                  {formatCurrency(expense.amount, expense.currency)}
                </span>
                {expense.currency !== (expense.baseCurrency || 'USD') && (
                  <span className="text-xs font-mono text-zinc-400">
                    ({formatCurrency(expense.amountBase, expense.baseCurrency || 'USD')} base)
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                Status
              </span>
              {expense.status === 'approved' ? (
                <span className="aw-badge-approved px-3 py-1 rounded-full text-xs font-mono font-semibold inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Approved
                </span>
              ) : expense.status === 'rejected' ? (
                <span className="aw-badge-rejected px-3 py-1 rounded-full text-xs font-mono font-semibold inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  Rejected
                </span>
              ) : (
                <span className="aw-badge-pending px-3 py-1 rounded-full text-xs font-mono font-semibold inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  Pending Review
                </span>
              )}
            </div>
          </div>

          {/* Rejection notice if present */}
          {expense.rejectionReason && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              <p className="font-semibold font-mono text-[11px] uppercase tracking-wider text-rose-400 mb-1">
                Approver Feedback / Rejection Note:
              </p>
              <p>{expense.rejectionReason}</p>
            </div>
          )}

          {/* Key Information Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-zinc-500 font-mono block mb-1">Description</span>
              <p className="text-sm font-medium text-white">{expense.description}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-zinc-500 font-mono block mb-1">Category & Merchant</span>
              <p className="text-sm font-medium text-white">
                {expense.category} {expense.merchant ? `• ${expense.merchant}` : ''}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-zinc-500 font-mono block mb-1">Date of Expense</span>
              <p className="text-sm font-mono text-white">
                {format(new Date(expDate), 'MMMM dd, yyyy')}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-zinc-500 font-mono block mb-1">Payment Method & Department</span>
              <p className="text-sm text-white">
                {expense.paidBy || 'Personal Card'} • {expense.department || 'General'}
              </p>
            </div>
          </div>

          {/* Receipt Preview Section */}
          {receiptUrl && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold uppercase text-zinc-400">
                  Attached Receipt
                </span>
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#fd366e] font-mono hover:underline flex items-center gap-1"
                >
                  <span>Open Full Size</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d0d10] p-4 overflow-hidden flex justify-center">
                {receiptUrl.startsWith('data:application/pdf') ? (
                  <div className="py-8 text-center">
                    <p className="text-xs text-zinc-400 mb-2">PDF Document Attached</p>
                    <a
                      href={receiptUrl}
                      download="receipt.pdf"
                      className="aw-btn-secondary px-4 py-2 text-xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download PDF Receipt
                    </a>
                  </div>
                ) : (
                  <img
                    src={receiptUrl}
                    alt="Receipt proof"
                    className="max-h-72 object-contain rounded-xl border border-white/10 shadow-md"
                  />
                )}
              </div>
            </div>
          )}

          {/* Approval Chain Timeline */}
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-3">
              Approval Chain Timeline
            </h3>

            {approvals.length > 0 ? (
              <div className="space-y-3">
                {approvals.map((approval, idx) => (
                  <div
                    key={approval._id || idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]"
                  >
                    <div className="mt-0.5">
                      {approval.status === 'approved' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : approval.status === 'rejected' ? (
                        <XCircle className="h-4 w-4 text-rose-400" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white">
                          {approval.approverId?.fullName || approval.approver?.fullName || 'Assigned Approver'}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400 capitalize">
                          {approval.status}
                        </span>
                      </div>
                      {approval.comment && (
                        <p className="text-xs text-zinc-400 mt-1 italic">"{approval.comment}"</p>
                      )}
                      {approval.actedAt && (
                        <p className="text-[10px] font-mono text-zinc-400 mt-1">
                          Acted on {format(new Date(approval.actedAt), 'MMM dd, yyyy h:mm a')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 font-mono">No approval records generated yet.</p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-white/[0.02] flex justify-end">
          <button
            onClick={onClose}
            className="aw-btn-secondary px-5 py-2 text-xs font-medium"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  )
}
