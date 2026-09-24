import { useState, useMemo } from 'react'
import { useCompanyExpenses } from '../hooks/useExpenses'
import { useAuth } from '../hooks/useAuth'
import { formatCurrency } from '../lib/currency'
import { format } from 'date-fns'
import { Eye, Download, Search, Filter, FileSpreadsheet, FileCode, CheckCircle2, Clock, XCircle } from 'lucide-react'
import ExpenseDetailModal from '../components/Shared/ExpenseDetailModal'
import { EXPENSE_CATEGORIES } from '../lib/constants'

export default function AllExpensesPage() {
  const { company } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedExpense, setSelectedExpense] = useState(null)

  const { data: expenses, isLoading } = useCompanyExpenses(company?._id || company?.id, {
    status: statusFilter,
    category: categoryFilter,
    search: searchTerm
  })

  const handleExport = (formatType = 'csv') => {
    const token = localStorage.getItem('reimburseflow_token')
    const params = new URLSearchParams()
    params.append('format', formatType)
    if (statusFilter !== 'all') params.append('status', statusFilter)
    if (categoryFilter !== 'all') params.append('category', categoryFilter)

    const url = `http://localhost:5000/api/expenses/export?${params.toString()}`

    // Fetch and download
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = `reimburseflow_expenses_${new Date().toISOString().split('T')[0]}.${formatType}`
        document.body.appendChild(a)
        a.click()
        a.remove()
      })
      .catch((err) => alert('Export failed: ' + err.message))
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-display">All Company Expenses</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
              Audit & Finance Explorer
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Global repository of all submitted, approved, and rejected organization reimbursements.
          </p>
        </div>

        {/* 1-Click Export Suite */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="aw-btn-secondary px-3.5 py-2 text-xs font-mono"
            title="Download CSV report"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => handleExport('json')}
            className="aw-btn-secondary px-3.5 py-2 text-xs font-mono"
            title="Download JSON dataset"
          >
            <FileCode className="h-3.5 w-3.5 text-[#fd366e]" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="aw-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search description, employee, merchant..."
              className="aw-input w-full pl-9 pr-3 py-2 text-xs"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="aw-input w-full px-3 py-2 text-xs bg-[#131316] font-mono"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="aw-input w-full px-3 py-2 text-xs bg-[#131316]"
            >
              <option value="all">All Categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-3">
          <div className="h-8 w-8 border-2 border-[#fd366e] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-zinc-500">Querying company expenses...</p>
        </div>
      ) : !expenses || expenses.length === 0 ? (
        <div className="aw-card p-12 text-center">
          <h3 className="text-sm font-semibold text-white">No expenses match your filters</h3>
          <p className="text-xs text-zinc-500 mt-1">Adjust search keywords or filter dropdowns above.</p>
        </div>
      ) : (
        <div className="aw-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs divide-y divide-white/[0.06]">
              <thead className="bg-white/[0.02] text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Date</th>
                  <th className="px-5 py-3.5 font-medium">Employee</th>
                  <th className="px-5 py-3.5 font-medium">Description</th>
                  <th className="px-5 py-3.5 font-medium">Category</th>
                  <th className="px-5 py-3.5 font-medium">Amount</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {expenses.map((expense) => {
                  const expDate = expense.dateOfExpense || expense.date_of_expense || expense.createdAt
                  const submitter = expense.createdBy || expense.created_by_profile
                  const id = expense._id || expense.id

                  return (
                    <tr
                      key={id}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => setSelectedExpense(expense)}
                    >
                      <td className="px-5 py-3.5 font-mono text-zinc-400 whitespace-nowrap">
                        {format(new Date(expDate), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="font-medium text-white">{submitter?.fullName || 'Teammate'}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{submitter?.department || 'General'}</p>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-white max-w-xs truncate">
                        <div>
                          <span>{expense.description}</span>
                          {expense.merchant && (
                            <span className="block text-[10px] font-mono text-zinc-500">
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
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedExpense(expense)
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedExpense && (
        <ExpenseDetailModal
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
        />
      )}
    </div>
  )
}
