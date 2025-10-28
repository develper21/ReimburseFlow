import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import { useExpense, getReceiptUrl } from '../../hooks/useExpenses'
import { useExpenseApprovals } from '../../hooks/useApprovals'
import { formatCurrency } from '../../lib/currency'
import { format } from 'date-fns'

export default function ExpenseDetailModal({ expenseId, onClose }) {
  const { data: expense, isLoading } = useExpense(expenseId)
  const { data: approvals } = useExpenseApprovals(expenseId)
  const [receiptUrl, setReceiptUrl] = useState(null)

  useEffect(() => {
    if (expense?.receipt_path) {
      getReceiptUrl(expense.receipt_path).then(setReceiptUrl)
    }
  }, [expense])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!expense) return null

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getApprovalStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      skipped: 'bg-gray-100 text-gray-800'
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">Expense Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            {getStatusBadge(expense.status)}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Description
              </label>
              <p className="text-gray-900">{expense.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Category
              </label>
              <p className="text-gray-900">{expense.category}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Date of Expense
              </label>
              <p className="text-gray-900">
                {format(new Date(expense.date_of_expense), 'MMMM dd, yyyy')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Submitted By
              </label>
              <p className="text-gray-900">{expense.created_by_profile?.full_name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Amount
              </label>
              <p className="text-gray-900 text-lg font-semibold">
                {formatCurrency(expense.amount, expense.currency)}
              </p>
            </div>

            {expense.amount_base && expense.currency !== expense.base_currency && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Amount (Base Currency)
                </label>
                <p className="text-gray-900">
                  {formatCurrency(expense.amount_base, expense.base_currency)}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Payment Method
              </label>
              <p className="text-gray-900">{expense.paid_by}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Submitted On
              </label>
              <p className="text-gray-900">
                {format(new Date(expense.created_at), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>

          {/* Receipt */}
          {receiptUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt
              </label>
              <div className="border border-gray-200 rounded-lg p-4">
                <img
                  src={receiptUrl}
                  alt="Receipt"
                  className="max-h-96 mx-auto rounded"
                />
                <a
                  href={receiptUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download Receipt
                </a>
              </div>
            </div>
          )}

          {/* Approval History */}
          {approvals && approvals.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Approval History
              </label>
              <div className="space-y-3">
                {approvals.map((approval, index) => (
                  <div
                    key={approval.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {approval.approver?.full_name}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({approval.approver?.role})
                          </span>
                          {getApprovalStatusBadge(approval.status)}
                        </div>
                        {approval.comment && (
                          <p className="text-sm text-gray-600 mt-2">
                            {approval.comment}
                          </p>
                        )}
                        {approval.acted_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(approval.acted_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        Step {index + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
