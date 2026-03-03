import { useState } from 'react'
import { CheckCircle, XCircle, Eye } from 'lucide-react'
import { usePendingApprovals, useProcessApproval } from '../../hooks/useApprovals'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency } from '../../lib/currency'
import { format } from 'date-fns'
import ApprovalModal from './ApprovalModal'
import ExpenseDetailModal from '../Shared/ExpenseDetailModal'

export default function PendingApprovals() {
  const { profile } = useAuth()
  const { data: approvals, isLoading } = usePendingApprovals(profile?.id)
  const [selectedApproval, setSelectedApproval] = useState(null)
  const [selectedExpenseId, setSelectedExpenseId] = useState(null)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!approvals || approvals.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
        <p className="mt-1 text-sm text-gray-500">
          All caught up! No expenses waiting for your approval.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {approvals.map((approval) => {
          const expense = approval.expense
          return (
            <div
              key={approval.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {expense.description}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Submitted by:</span>
                      <p className="font-medium text-gray-900">
                        {expense.created_by_profile?.full_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <p className="font-medium text-gray-900">
                        {format(new Date(expense.date_of_expense), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <p className="font-medium text-gray-900">{expense.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Amount:</span>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(expense.amount, expense.currency)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setSelectedExpenseId(expense.id)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                    title="View Details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedApproval({ ...approval, action: 'approved' })}
                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md"
                    title="Approve"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedApproval({ ...approval, action: 'rejected' })}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                    title="Reject"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selectedApproval && (
        <ApprovalModal
          approval={selectedApproval}
          onClose={() => setSelectedApproval(null)}
        />
      )}

      {selectedExpenseId && (
        <ExpenseDetailModal
          expenseId={selectedExpenseId}
          onClose={() => setSelectedExpenseId(null)}
        />
      )}
    </>
  )
}
