'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
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
  FileText
} from 'lucide-react'
import { Expense } from '@/types/database'

interface DashboardStats {
  totalExpenses: number
  pendingExpenses: number
  approvedExpenses: number
  rejectedExpenses: number
  totalAmount: number
  pendingAmount: number
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    pendingExpenses: 0,
    approvedExpenses: 0,
    rejectedExpenses: 0,
    totalAmount: 0,
    pendingAmount: 0,
  })
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) {
      fetchDashboardData()
    }
  }, [profile])

  const fetchDashboardData = async () => {
    if (!profile) return

    try {
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

        setStats({
          totalExpenses,
          pendingExpenses,
          approvedExpenses,
          rejectedExpenses,
          totalAmount,
          pendingAmount,
        })

        // Get recent expenses (last 5)
        setRecentExpenses(expenses.slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.full_name}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your expenses today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <div key={stat.title} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Amount Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-500">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalAmount, 'USD')}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-500">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.pendingAmount, 'USD')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Expenses</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentExpenses.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No expenses found</p>
              </div>
            ) : (
              recentExpenses.map((expense) => (
                <div key={expense.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium text-gray-900">
                          {expense.description}
                        </h4>
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          expense.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : expense.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {expense.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {expense.category} • {formatDate(expense.expense_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(expense.amount, expense.currency)}
                      </p>
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
