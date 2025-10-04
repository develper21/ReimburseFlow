'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useCurrency } from '@/hooks/useCurrency'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  FileText
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ExpenseWithDetails {
  id: string
  amount: number
  currency: string
  category: string
  description: string
  expense_date: string
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
    comments: string
    approved_at: string
    sequence_order: number
    approver: {
      id: string
      full_name: string
    }
  }[]
}

export default function ApprovalsPage() {
  const { profile } = useAuth()
  const { convert, format } = useCurrency()
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [convertedAmounts, setConvertedAmounts] = useState<{ [key: string]: number }>({})
  const [converting, setConverting] = useState(false)

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
          (approval: { approver_id: string; status: string }) => approval.approver_id === profile.id && approval.status === 'pending'
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

  const convertExpenseAmounts = async () => {
    if (!profile) return

    setConverting(true)
    try {
      // Get company currency
      const { data: company } = await supabase
        .from('companies')
        .select('currency')
        .eq('id', profile.company_id)
        .single()

      const companyCurrency = company?.currency || 'USD'

      for (const expense of expenses) {
        try {
          if (expense.currency === companyCurrency) {
            setConvertedAmounts(prev => ({
              ...prev,
              [expense.id]: expense.amount
            }))
          } else {
            const conversion = await convert(expense.amount, expense.currency, companyCurrency)
            setConvertedAmounts(prev => ({
              ...prev,
              [expense.id]: conversion.convertedAmount
            }))
          }
        } catch (error) {
          console.error(`Error converting expense ${expense.id}:`, error)
          setConvertedAmounts(prev => ({
            ...prev,
            [expense.id]: expense.amount
          }))
        }
      }
    } catch (error) {
      console.error('Error in currency conversion:', error)
    } finally {
      setConverting(false)
    }
  }

  useEffect(() => {
    if (profile && (profile.role === 'manager' || profile.role === 'admin')) {
      fetchApprovals()
    }
  }, [profile, filter])

  // Convert amounts when expenses change
  useEffect(() => {
    if (expenses.length > 0) {
      convertExpenseAmounts()
    }
  }, [expenses])

  const handleApproval = async (expenseId: string, action: 'approve' | 'reject', comments: string = '') => {
    if (!profile) return

    setActionLoading(true)
    try {
      // Update the approval record
      const { error } = await supabase
        .from('expense_approvals')
        .update({
          status: action,
          comments: comments || null,
          approved_at: new Date().toISOString(),
        })
        .eq('expense_id', expenseId)
        .eq('approver_id', profile.id)

      if (error) throw error

      // Check if all approvals are complete
      const { data: remainingApprovals } = await supabase
        .from('expense_approvals')
        .select('status')
        .eq('expense_id', expenseId)
        .eq('status', 'pending')

      if (!remainingApprovals || remainingApprovals.length === 0) {
        // All approvals complete, update expense status
        const finalStatus = action === 'approve' ? 'approved' : 'rejected'
        const { error: expenseError } = await supabase
          .from('expenses')
          .update({ status: finalStatus })
          .eq('id', expenseId)

        if (expenseError) throw expenseError
      }

      toast.success(`Expense ${action}d successfully`)
      fetchApprovals() // Refresh the list
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error handling approval:', error)
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expense Approvals</h1>
            <p className="text-gray-600">Review and approve expense claims</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'pending'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'all'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-white shadow rounded-lg">
          {expenses.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
              <p className="text-gray-500">
                {filter === 'pending'
                  ? 'No pending expenses to approve.'
                  : 'No expenses found.'
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
                          {expense.category} • {formatDate(expense.expense_date)} • {expense.employee.full_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {format(expense.amount, expense.currency)}
                        </p>
                        {convertedAmounts[expense.id] && convertedAmounts[expense.id] !== expense.amount && (
                          <p className="text-xs text-gray-500">
                            ≈ {format(convertedAmounts[expense.id], 'USD')}
                          </p>
                        )}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(expense.status)}`}>
                          {expense.status}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedExpense(expense)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="View details"
                      >
                        <User className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {isModalOpen && selectedExpense && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Review Expense
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedExpense.description}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(selectedExpense.amount, selectedExpense.currency)}
                    {convertedAmounts[selectedExpense.id] && convertedAmounts[selectedExpense.id] !== selectedExpense.amount && (
                      <span className="ml-2 text-gray-500">
                        (≈ {format(convertedAmounts[selectedExpense.id], 'USD')})
                      </span>
                    )}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedExpense.employee.full_name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Comments</label>
                  <textarea
                    id="comments"
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Add your comments (optional)"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const comments = (document.getElementById('comments') as HTMLTextAreaElement)?.value || ''
                    handleApproval(selectedExpense.id, 'reject', comments)
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => {
                    const comments = (document.getElementById('comments') as HTMLTextAreaElement)?.value || ''
                    handleApproval(selectedExpense.id, 'approve', comments)
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}