import { useState } from 'react'
import { X, Loader } from 'lucide-react'
import { useProcessApproval } from '../../hooks/useApprovals'
import { useAuth } from '../../hooks/useAuth'

export default function ApprovalModal({ approval, onClose }) {
  const { profile } = useAuth()
  const processApproval = useProcessApproval()
  const [comment, setComment] = useState('')

  const isApprove = approval.action === 'approved'
  const expense = approval.expense

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await processApproval.mutateAsync({
        expenseId: expense.id,
        approverId: profile.id,
        action: approval.action,
        comment: comment || null
      })

      onClose()
    } catch (error) {
      console.error('Error processing approval:', error)
      alert('Failed to process approval. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {isApprove ? 'Approve' : 'Reject'} Expense
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">Expense:</p>
          <p className="font-medium text-gray-900">{expense.description}</p>
          <p className="text-sm text-gray-600 mt-2">Amount:</p>
          <p className="font-medium text-gray-900">
            {expense.currency} {expense.amount}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment {isApprove ? '(optional)' : '(required)'}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required={!isApprove}
              placeholder={
                isApprove
                  ? 'Add a comment (optional)...'
                  : 'Please provide a reason for rejection...'
              }
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              disabled={processApproval.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processApproval.isPending}
              className={`flex-1 px-4 py-2 text-white rounded-md flex items-center justify-center ${
                isApprove
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {processApproval.isPending ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Processing...
                </>
              ) : (
                <>{isApprove ? 'Approve' : 'Reject'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
