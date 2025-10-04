'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useCurrency } from '@/hooks/useCurrency'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Expense } from '@/types/database'
import { 
  Plus, 
  Receipt, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Edit,
  Trash2,
  Loader2,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ExpensesPage() {
  const { profile } = useAuth()
  const { convert, format } = useCurrency()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [convertedAmounts, setConvertedAmounts] = useState<{ [key: string]: number }>({})
  const [convertingExpenses, setConvertingExpenses] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (profile) {
      fetchExpenses()
    }
  }, [profile])

  // Convert amounts when expenses change
  useEffect(() => {
    if (expenses.length > 0) {
      convertExpenseAmounts()
    }
  }, [expenses])

  const fetchExpenses = async () => {
    if (!profile) return

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('employee_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setExpenses(data || [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
      toast.error('Failed to fetch expenses')
    } finally {
      setLoading(false)
    }
  }

  const convertExpenseAmounts = async () => {
    const companyCurrency = 'USD' // This should come from company data
    
    for (const expense of expenses) {
      if (expense.currency === companyCurrency) {
        // No conversion needed
        setConvertedAmounts(prev => ({
          ...prev,
          [expense.id]: expense.amount
        }))
        continue
      }

      // Mark as converting
      setConvertingExpenses(prev => new Set(prev).add(expense.id))

      try {
        const conversion = await convert(expense.amount, expense.currency, companyCurrency)
        setConvertedAmounts(prev => ({
          ...prev,
          [expense.id]: conversion.convertedAmount
        }))
      } catch (error) {
        console.error(`Error converting expense ${expense.id}:`, error)
        // Keep original amount if conversion fails
        setConvertedAmounts(prev => ({
          ...prev,
          [expense.id]: expense.amount
        }))
      } finally {
        // Remove from converting set
        setConvertingExpenses(prev => {
          const newSet = new Set(prev)
          newSet.delete(expense.id)
          return newSet
        })
      }
    }
  }

  const deleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)

      if (error) throw error

      setExpenses(expenses.filter(e => e.id !== expenseId))
      toast.success('Expense deleted successfully')
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast.error('Failed to delete expense')
    }
  }

  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'all') return true
    return expense.status === filter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <Receipt className="h-5 w-5 text-gray-500" />
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
            <h1 className="text-2xl font-bold text-gray-900">My Expenses</h1>
            <p className="text-gray-600">Manage your expense claims</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={convertExpenseAmounts}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              title="Refresh exchange rates"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Rates
            </button>
            <Link
              href="/expenses/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Expense
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-4">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === filterOption.key
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Expenses List */}
        <div className="bg-white shadow rounded-lg">
          {filteredExpenses.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
              <p className="text-gray-500 mb-4">
                {filter === 'all' 
                  ? "You haven't submitted any expenses yet."
                  : `No ${filter} expenses found.`
                }
              </p>
              {filter === 'all' && (
                <Link
                  href="/expenses/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Your First Expense
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
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
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {format(expense.amount, expense.currency)}
                          </p>
                          {convertingExpenses.has(expense.id) && (
                            <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                          )}
                        </div>
                        {convertedAmounts[expense.id] && convertedAmounts[expense.id] !== expense.amount && (
                          <p className="text-xs text-gray-500">
                            ≈ {format(convertedAmounts[expense.id], 'USD')}
                          </p>
                        )}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(expense.status)}`}>
                          {expense.status}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/expenses/${expense.id}`}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {expense.status === 'draft' && (
                          <>
                            <Link
                              href={`/expenses/${expense.id}/edit`}
                              className="p-2 text-gray-400 hover:text-gray-600"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => deleteExpense(expense.id)}
                              className="p-2 text-gray-400 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
