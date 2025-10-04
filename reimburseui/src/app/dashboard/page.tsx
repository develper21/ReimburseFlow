'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useCurrency } from '@/hooks/useCurrency'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Receipt, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { Expense } from '@/types/database'

interface DashboardStats {
  totalExpenses: number
  pendingExpenses: number
  approvedExpenses: number
  rejectedExpenses: number
  totalAmount: number
  pendingAmount: number
  totalAmountConverted: number
  pendingAmountConverted: number
  companyCurrency: string
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const { convert, format } = useCurrency()
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    pendingExpenses: 0,
    approvedExpenses: 0,
    rejectedExpenses: 0,
    totalAmount: 0,
    pendingAmount: 0,
    totalAmountConverted: 0,
    pendingAmountConverted: 0,
    companyCurrency: 'USD',
  })
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [converting, setConverting] = useState(false)

  useEffect(() => {
    if (profile) {
      fetchDashboardData()
    } else {
      // If no profile, still set loading to false to show appropriate message
      setLoading(false)
    }
  }, [profile])

  const fetchDashboardData = async () => {
    if (!profile) return

    try {
      // First get company currency
      const { data: company } = await supabase
        .from('companies')
        .select('currency')
        .eq('id', profile.company_id)
        .single()

      const companyCurrency = company?.currency || 'USD'

      // Fetch expenses based on user role
      let query = supabase
        .from('expenses')
        .select('*')

      if (profile.role === 'employee') {
        query = query.eq('employee_id', profile.id)
      } else if (profile.role === 'manager') {
        // Get expenses from employees under this manager
        const { data: employees } = await supabase
          .from('users')
          .select('id')
          .eq('manager_id', profile.id)

        if (employees && employees.length > 0) {
          const employeeIds = employees.map(emp => emp.id)
          query = query.in('employee_id', employeeIds)
        } else {
          query = query.eq('employee_id', profile.id) // Fallback to own expenses
        }
      }
      // Admin can see all expenses in their company

      const { data: expenses, error } = await query

      if (error) throw error

      if (expenses) {
        // Calculate stats
        const totalExpenses = expenses.length
        const pendingExpenses = expenses.filter(e => e.status === 'pending').length
        const approvedExpenses = expenses.filter(e => e.status === 'approved').length
        const rejectedExpenses = expenses.filter(e => e.status === 'rejected').length
        
        const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)
        const pendingAmount = expenses
          .filter(e => e.status === 'pending')
          .reduce((sum, e) => sum + e.amount, 0)

        // Convert amounts to company currency
        setConverting(true)
        let totalAmountConverted = 0
        let pendingAmountConverted = 0

        for (const expense of expenses) {
          try {
            if (expense.currency === companyCurrency) {
              totalAmountConverted += expense.amount
              if (expense.status === 'pending') {
                pendingAmountConverted += expense.amount
              }
            } else {
              const conversion = await convert(expense.amount, expense.currency, companyCurrency)
              totalAmountConverted += conversion.convertedAmount
              if (expense.status === 'pending') {
                pendingAmountConverted += conversion.convertedAmount
              }
            }
          } catch (error) {
            console.error('Error converting amount:', error)
            // Use original amount if conversion fails
            totalAmountConverted += expense.amount
            if (expense.status === 'pending') {
              pendingAmountConverted += expense.amount
            }
          }
        }

        setStats({
          totalExpenses,
          pendingExpenses,
          approvedExpenses,
          rejectedExpenses,
          totalAmount,
          pendingAmount,
          totalAmountConverted,
          pendingAmountConverted,
          companyCurrency,
        })

        // Get recent expenses (last 5)
        setRecentExpenses(expenses.slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
      setConverting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow h-32"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // If no profile, show appropriate message
  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Setup Required</h2>
            <p className="text-gray-600 mb-4">
              Your user profile is not set up yet. Please contact your administrator to complete your profile setup.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const statCards = [
    {
      title: 'Total Expenses',
      value: stats.totalExpenses,
      icon: Receipt,
      color: 'bg-blue-500',
    },
    {
      title: 'Pending',
      value: stats.pendingExpenses,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Approved',
      value: stats.approvedExpenses,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Rejected',
      value: stats.rejectedExpenses,
      icon: XCircle,
      color: 'bg-red-500',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {profile?.full_name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your expenses today.
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={converting}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
            title="Refresh data and exchange rates"
          >
            {converting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {converting ? 'Converting...' : 'Refresh'}
          </button>
        </div>

        {/* Stats Cards - First Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statCards.map((stat) => (
            <div key={stat.title} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.color} flex-shrink-0`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 min-w-0">
                  <p className="text-sm font-medium text-gray-600 truncate">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Amount Summary - Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-500 flex-shrink-0">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 min-w-0">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {format(stats.totalAmountConverted, stats.companyCurrency)}
                </p>
                {converting && (
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Converting currencies...
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-500 flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 min-w-0">
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {format(stats.pendingAmountConverted, stats.companyCurrency)}
                </p>
                {converting && (
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Converting currencies...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Expenses</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentExpenses.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No expenses found</p>
              </div>
            ) : (
              recentExpenses.map((expense) => (
                <div key={expense.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {expense.description}
                        </h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full self-start ${
                          expense.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : expense.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {expense.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {expense.category} • {formatDate(expense.expense_date)}
                      </p>
                    </div>
                    <div className="text-right sm:ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {format(expense.amount, expense.currency)}
                      </p>
                      {expense.currency !== stats.companyCurrency && (
                        <p className="text-xs text-gray-500">
                          ≈ {format(expense.amount, stats.companyCurrency)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
