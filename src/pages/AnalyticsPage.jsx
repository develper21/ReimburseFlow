import { useState } from 'react'
import { useAnalyticsOverview } from '../hooks/useAnalytics'
import { useBudgets, useUpdateBudget } from '../hooks/useBudgets'
import { useAuth } from '../hooks/useAuth'
import { formatCurrency } from '../lib/currency'
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Building,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  Plus
} from 'lucide-react'

export default function AnalyticsPage() {
  const { company, isAdmin } = useAuth()
  const { data: analytics, isLoading } = useAnalyticsOverview()
  const { data: budgets } = useBudgets()
  const updateBudget = useUpdateBudget()

  const [selectedDept, setSelectedDept] = useState('Engineering')
  const [budgetAmount, setBudgetAmount] = useState('15000')
  const [showBudgetModal, setShowBudgetModal] = useState(false)

  const currency = company?.baseCurrency || 'USD'

  const handleSaveBudget = async (e) => {
    e.preventDefault()
    try {
      await updateBudget.mutateAsync({
        department: selectedDept,
        monthlyBudget: parseFloat(budgetAmount),
        currency
      })
      setShowBudgetModal(false)
    } catch (err) {
      alert('Failed to update budget: ' + err.message)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <div className="h-8 w-8 border-2 border-[#fd366e] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-zinc-500">Aggregating financial intelligence...</p>
      </div>
    )
  }

  const summary = analytics?.summary || {
    totalSpend: 0,
    pendingAmount: 0,
    totalCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    approvalRate: 0
  }

  const categoryBreakdown = analytics?.categoryBreakdown || []
  const monthlyTrends = analytics?.monthlyTrends || []
  const currentBudgets = budgets || analytics?.budgets || []

  // Max spend for monthly bar scaling
  const maxMonthSpend = Math.max(...monthlyTrends.map((m) => m.total), 1)

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-display">Financial Analytics & Budgets</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              Intelligence Engine
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time expenditure telemetry, monthly burn velocity, department budget caps, and category trends.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowBudgetModal(true)}
            className="aw-btn-primary px-3.5 py-2 text-xs font-semibold shadow-aw-button"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Set Department Budget</span>
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="aw-card p-5">
          <span className="text-xs font-mono text-zinc-400">Total Settled Spend</span>
          <p className="text-2xl font-bold text-white font-display mt-2">
            {formatCurrency(summary.totalSpend, currency)}
          </p>
          <p className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {summary.approvedCount} approved claims
          </p>
        </div>

        <div className="aw-card p-5">
          <span className="text-xs font-mono text-zinc-400">Pending Review Pipeline</span>
          <p className="text-2xl font-bold text-white font-display mt-2">
            {formatCurrency(summary.pendingAmount, currency)}
          </p>
          <p className="text-[11px] text-[#f99c00] font-mono mt-1">
            {summary.pendingCount} submissions in queue
          </p>
        </div>

        <div className="aw-card p-5">
          <span className="text-xs font-mono text-zinc-400">Approval Acceptance Rate</span>
          <p className="text-2xl font-bold text-white font-display mt-2">
            {summary.approvalRate}%
          </p>
          <p className="text-[11px] text-zinc-400 font-mono mt-1">
            Across {summary.totalCount} total claims
          </p>
        </div>

        <div className="aw-card p-5">
          <span className="text-xs font-mono text-zinc-400">Base Currency</span>
          <p className="text-2xl font-bold text-white font-display mt-2">
            {currency}
          </p>
          <p className="text-[11px] text-[#fd366e] font-mono mt-1">
            Real-time dynamic conversion
          </p>
        </div>
      </div>

      {/* Monthly Spend Trajectory Chart */}
      <div className="aw-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white font-display">Monthly Expenditure Trajectory</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Historical reimbursement totals over past 6 billing cycles</p>
          </div>
          <span className="text-xs font-mono text-zinc-500 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">
            Cycle: Rolling 6M
          </span>
        </div>

        {/* Custom CSS Bar Chart */}
        <div className="grid grid-cols-6 gap-2 sm:gap-6 items-end h-56 pt-8 pb-2 border-b border-white/[0.08]">
          {monthlyTrends.map((m) => {
            const heightPercent = Math.max(Math.round((m.total / maxMonthSpend) * 100), 8)
            return (
              <div key={m.month} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatCurrency(m.total, currency)}
                </span>
                <div className="w-full max-w-[48px] rounded-t-xl bg-white/[0.04] group-hover:bg-[#fd366e]/20 border border-white/[0.06] group-hover:border-[#fd366e]/40 transition-all duration-300 relative overflow-hidden flex items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-[#fd366e] to-[#fe9567] shadow-aw-glow transition-all duration-500"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-zinc-400">{m.shortMonth}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Two-Column: Category Breakdown & Department Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="aw-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white font-display">Category Spend Distribution</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Where corporate capital is being deployed</p>
            </div>
            <PieChart className="h-4 w-4 text-[#fd366e]" />
          </div>

          <div className="space-y-4">
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No categories recorded yet.</p>
            ) : (
              categoryBreakdown.map((cat) => (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white">{cat.category}</span>
                    <span className="font-mono text-zinc-400">
                      {formatCurrency(cat.amount, currency)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-[#fd366e]"
                      style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Department Budgets & Utilization */}
        <div className="aw-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white font-display">Department Budgets</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Budget caps and monthly utilization thresholds</p>
            </div>
            <Building className="h-4 w-4 text-blue-400" />
          </div>

          <div className="space-y-4">
            {currentBudgets.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">
                No department budgets configured. Click "Set Department Budget" to create one.
              </p>
            ) : (
              currentBudgets.map((b) => {
                const percent = Math.min(Math.round((b.spentAmount / b.monthlyBudget) * 100), 100)
                const isOver = b.spentAmount > b.monthlyBudget
                const isWarning = percent > 85

                return (
                  <div key={b._id || b.department} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{b.department}</span>
                        {isOver && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Cap Exceeded
                          </span>
                        )}
                        {!isOver && isWarning && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Near Limit
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-white">
                        {formatCurrency(b.spentAmount, b.currency || currency)} / {formatCurrency(b.monthlyBudget, b.currency || currency)}
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver
                            ? 'bg-rose-500'
                            : isWarning
                            ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                            : 'bg-gradient-to-r from-blue-500 to-emerald-400'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Set Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="aw-card max-w-md w-full p-6 shadow-2xl border-white/15">
            <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-bold text-white font-display">Configure Department Budget</h3>
              <button onClick={() => setShowBudgetModal(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Department
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="aw-input w-full px-3 py-2 text-xs bg-[#131316]"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Monthly Budget Allocation ({currency})
                </label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  required
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="25000"
                  className="aw-input w-full px-3.5 py-2 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(false)}
                  className="aw-btn-secondary px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateBudget.isPending}
                  className="aw-btn-primary px-5 py-2 text-xs font-semibold shadow-aw-button"
                >
                  {updateBudget.isPending ? 'Saving...' : 'Save Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
