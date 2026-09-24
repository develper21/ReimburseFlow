import { useState, useMemo } from 'react'
import { FileText, Eye, Trash2, Search, Filter, Receipt, ArrowUpDown, Calendar, DollarSign } from 'lucide-react'
import { useMyExpenses, useDeleteExpense } from '../../hooks/useExpenses'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency } from '../../lib/currency'
import { format } from 'date-fns'
import ExpenseDetailModal from '../Shared/ExpenseDetailModal'

export default function ExpenseList() {
  const { profile } = useAuth()
  const { data: expenses, isLoading } = useMyExpenses(profile?.id)
  const deleteExpense = useDeleteExpense()
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to permanently delete this expense?')) {
      try {
        await deleteExpense.mutateAsync(expenseId)
      } catch (error) {
        alert('Failed to delete expense: ' + error.message)
      }
    }
  }

  const filteredExpenses = useMemo(() => {
    if (!expenses) return []
    return expenses.filter((e) => {
      const matchesSearch =
        (e.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.merchant || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.category || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || e.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [expenses, searchTerm, statusFilter])

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="aw-badge-approved inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 glow-dot-emerald" />
            Approved
          </span>
        )
      case 'rejected':
        return (
          <span className="aw-badge-rejected inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Rejected
          </span>
        )
      default:
        return (
          <span className="aw-badge-pending inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 glow-dot-amber" />
            Pending Review
          </span>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <div className="h-8 w-8 border-2 border-[#fd366e] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-zinc-500">Loading expense submissions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search description, merchant, category..."
            className="aw-input w-full pl-10 pr-4 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-zinc-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="aw-input px-3 py-2 text-xs bg-[#131316] font-mono"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Appwrite Console Table */}
      {filteredExpenses.length === 0 ? (
        <div className="aw-card p-12 text-center">
          <div className="h-12 w-12 rounded-2xl bg-zinc-800/60 border border-white/10 text-zinc-400 mx-auto flex items-center justify-center mb-3">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">No expenses found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'No submissions matched your search criteria.'
              : 'Submit a new reimbursement request above to start tracking.'}
          </p>
        </div>
      ) : (
        <div className="aw-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs divide-y divide-white/[0.06]">
              <thead className="bg-white/[0.02] text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Date</th>
                  <th className="px-5 py-3.5 font-medium">Description</th>
                  <th className="px-5 py-3.5 font-medium">Category</th>
                  <th className="px-5 py-3.5 font-medium">Amount</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredExpenses.map((expense) => {
                  const expDate = expense.dateOfExpense || expense.date_of_expense || expense.createdAt
                  const id = expense._id || expense.id
                  return (
                    <tr
                      key={id}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => setSelectedExpense(expense)}
                    >
                      <td className="px-5 py-3.5 font-mono text-zinc-400 whitespace-nowrap">
                        {format(new Date(expDate), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-white max-w-xs truncate">
                        <div>
                          <span>{expense.description}</span>
                          {expense.merchant && (
                            <span className="block text-[11px] font-mono text-zinc-500">
                              {expense.merchant}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-zinc-300">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono">
                        <span className="text-white font-bold">
                          {formatCurrency(expense.amount, expense.currency)}
                        </span>
                        {expense.currency !== (expense.baseCurrency || 'USD') && (
                          <span className="block text-[10px] text-zinc-500">
                            ≈ {formatCurrency(expense.amountBase, expense.baseCurrency || 'USD')}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {renderStatusBadge(expense.status)}
                      </td>
                      <td
                        className="px-5 py-3.5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedExpense(expense)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition"
                            title="Inspect details & receipt"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {expense.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleDelete(id)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                              title="Delete submission"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expense Detail & Receipt Modal */}
      {selectedExpense && (
        <ExpenseDetailModal
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
        />
      )}
    </div>
  )
}
