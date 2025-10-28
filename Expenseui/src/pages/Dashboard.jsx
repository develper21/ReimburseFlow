import { useAuth } from '../hooks/useAuth'
import { useMyExpenses } from '../hooks/useExpenses'
import { usePendingApprovals } from '../hooks/useApprovals'
import { Receipt, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatCurrency } from '../lib/currency'

export default function Dashboard() {
  const { profile, company } = useAuth()
  const { data: myExpenses } = useMyExpenses(profile?.id)
  const { data: pendingApprovals } = usePendingApprovals(profile?.id)

  const stats = {
    totalExpenses: myExpenses?.length || 0,
    pending: myExpenses?.filter(e => e.status === 'pending').length || 0,
    approved: myExpenses?.filter(e => e.status === 'approved').length || 0,
    rejected: myExpenses?.filter(e => e.status === 'rejected').length || 0,
    totalAmount: myExpenses?.reduce((sum, e) => sum + parseFloat(e.amount_base || e.amount), 0) || 0,
    pendingApprovals: pendingApprovals?.length || 0
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name}!
        </h1>
        <p className="text-gray-600 mt-1">{company?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Receipt className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Expenses</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalExpenses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow p-6 text-white">
          <h3 className="text-lg font-medium mb-2">Total Amount</h3>
          <p className="text-3xl font-bold">
            {formatCurrency(stats.totalAmount, company?.base_currency || 'USD')}
          </p>
          <p className="text-sm text-primary-100 mt-1">All time expenses</p>
        </div>

        {(profile?.role === 'manager' || profile?.role === 'admin') && (
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <h3 className="text-lg font-medium mb-2">Pending Approvals</h3>
            <p className="text-3xl font-bold">{stats.pendingApprovals}</p>
            <p className="text-sm text-purple-100 mt-1">Waiting for your review</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(profile?.role === 'employee' || profile?.role === 'manager') && (
            <a
              href="/expenses"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
            >
              <Receipt className="h-6 w-6 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Submit Expense</p>
                <p className="text-sm text-gray-500">Create new expense</p>
              </div>
            </a>
          )}

          {(profile?.role === 'manager' || profile?.role === 'admin') && (
            <a
              href="/approvals"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
            >
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Review Approvals</p>
                <p className="text-sm text-gray-500">{stats.pendingApprovals} pending</p>
              </div>
            </a>
          )}

          {profile?.role === 'admin' && (
            <a
              href="/users"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
            >
              <Receipt className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-500">Add or edit users</p>
              </div>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
