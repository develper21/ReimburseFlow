'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  FileText,
  MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ExpenseWithDetails {
  id: string
  amount: number
  currency: string
  category: string
  description: string
  expense_date: string
  receipt_url: string | null
  status: string
  created_at: string
  employee: {
    id: string
    full_name: string
    email: string
  }
  approvals: {
    id: string
    approver_id: string
    status: string
    comments: string | null
    approved_at: string | null
    sequence_order: number
    approver: {
      id: string
      full_name: string
    }
  }[]
}

export default function ApprovalsPage() {
  const { profile } = useAuth()
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (profile && (profile.role === 'manager' || profile.role === 'admin')) {
      fetchApprovals()
    }
  }, [profile, filter])

  const fetchApprovals = async () => {
    if (!profile) return

    try {
      let query = supabase
        .from('expenses')
        .select(`
          *,
          employee:users!expenses_employee_id_fkey(id, full_name, email),
          approvals:expense_approvals(
            id,
            approver_id,
            status,
            comments,
            approved_at,
            sequence_order,
            approver:users!expense_approvals_approver_id_fkey(id, full_name)
          )
        `)
        .order('created_at', { ascending: false })

      if (filter === 'pending') {
        query = query.eq('status', 'pending')
      }

      const { data, error } = await query

      if (error) throw error

      // Filter expenses that the current user needs to approve
      const filteredExpenses = data?.filter(expense => {
        if (profile.role === 'admin') return true
        
        // For managers, show expenses from their team or expenses they need to approve
        const needsApproval = expense.approvals?.some(
          approval => approval.approver_id === profile.id && approval.status === 'pending'
        )
        
        const isFromTeam = expense.employee.id !== profile.id && 
          expense.employee.id !== profile.id // This would need to be expanded to check team members
        
        return needsApproval || isFromTeam
      }) || []

      setExpenses(filteredExpenses)
    } catch (error) {
      console.error('Error fetching approvals:', error)
      toast.error('Failed to fetch approvals')
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (expenseId: string, action: 'approve' | 'reject', comments: string = '') => {
    if (!profile) return

    setActionLoading(true)
    try {
      // Update the approval record
      const { error: approvalError } = await supabase
        .from('expense_approvals')
        .update({
          status: action,
          comments: comments || null,
          approved_at: new Date().toISOString(),
        })
        .eq('expense_id', expenseId)
        .eq('approver_id', profile.id)
        .eq('status', 'pending')

      if (approvalError) throw approvalError

      // Check if this was the final approval needed
      const { data: remainingApprovals } = await supabase
        .from('expense_approvals')
        .select('status')
        .eq('expense_id', expenseId)
        .eq('status', 'pending')

      // If no more pending approvals, update expense status
      if (!remainingApprovals || remainingApprovals.length === 0) {
        const { error: expenseError } = await supabase
          .from('expenses')
          .update({ status: action === 'approve' ? 'approved' : 'rejected' })
          .eq('id', expenseId)

        if (expenseError) throw expenseError
      }

      toast.success(`Expense ${action}d successfully`)
      setIsModalOpen(false)
      setSelectedExpense(null)
      fetchApprovals()
    } catch (error) {
      console.error(`Error ${action}ing expense:`, error)
      toast.error(`Failed to ${action} expense`)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow h-24"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Approvals</h1>
          <p className="text-gray-600">Review and approve expense claims</p>
        </div>

        {/* Filters */}
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'pending'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Approval
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'all'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Expenses
          </button>
        </div>

        {/* Expenses List */}
        <div className="bg-white shadow rounded-lg">
          {expenses.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses to review</h3>
              <p className="text-gray-500">
                {filter === 'pending' 
                  ? "All caught up! No pending approvals."
                  : "No expenses found."
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {expenses.map((expense) => (
                <div key={expense.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(expense.status)}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {expense.description}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {expense.category} • {formatDate(expense.expense_date)}
                        </p>
                        <div className="flex items-center mt-1">
                          <User className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">
                            {expense.employee.full_name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(expense.amount, expense.currency)}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(expense.status)}`}>
                          {expense.status}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedExpense(expense)
                          setIsModalOpen(true)
                        }}
                        className="px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approval Modal */}
        {isModalOpen && selectedExpense && (
          <ApprovalModal
            expense={selectedExpense}
            onClose={() => {
              setIsModalOpen(false)
              setSelectedExpense(null)
            }}
            onApprove={(comments) => handleApproval(selectedExpense.id, 'approve', comments)}
            onReject={(comments) => handleApproval(selectedExpense.id, 'reject', comments)}
            loading={actionLoading}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

// Approval Modal Component
function ApprovalModal({ 
  expense, 
  onClose, 
  onApprove, 
  onReject, 
  loading 
}: {
  expense: ExpenseWithDetails
  onClose: () => void
  onApprove: (comments: string) => void
  onReject: (comments: string) => void
  loading: boolean
}) {
  const [comments, setComments] = useState('')
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)

  const handleSubmit = () => {
    if (action) {
      if (action === 'approve') {
        onApprove(comments)
      } else {
        onReject(comments)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Review Expense</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">{expense.description}</h4>
              <p className="text-sm text-gray-500">{expense.category}</p>
              <p className="text-sm text-gray-500">
                {formatDate(expense.expense_date)} • {formatCurrency(expense.amount, expense.currency)}
              </p>
              <p className="text-sm text-gray-500">By: {expense.employee.full_name}</p>
            </div>

            {expense.receipt_url && (
              <div>
                <a
                  href={expense.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-500 text-sm"
                >
                  View Receipt
                </a>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Add any comments..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setAction('approve')}
                disabled={loading}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md ${
                  action === 'approve'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                } disabled:opacity-50`}
              >
                Approve
              </button>
              <button
                onClick={() => setAction('reject')}
                disabled={loading}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md ${
                  action === 'reject'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                } disabled:opacity-50`}
              >
                Reject
              </button>
            </div>

            {action && (
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md text-white ${
                    action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50`}
                >
                  {loading ? 'Processing...' : `Confirm ${action === 'approve' ? 'Approval' : 'Rejection'}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
