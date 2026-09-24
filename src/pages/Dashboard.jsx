import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useMyExpenses, useCompanyExpenses } from '../hooks/useExpenses'
import { usePendingApprovals } from '../hooks/useApprovals'
import { useAnalyticsOverview } from '../hooks/useAnalytics'
import {
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Building,
  BarChart3,
  Users,
  Plus,
  CheckSquare,
  AlertCircle
} from 'lucide-react'
import { formatCurrency } from '../lib/currency'

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile, company, isAdmin, isManager, isEmployee } = useAuth()
  const { data: myExpenses, isLoading: loadingMy } = useMyExpenses(profile?.id)
  const { data: pendingApprovals, isLoading: loadingPending } = usePendingApprovals(profile?.id)
  const { data: analytics } = useAnalyticsOverview()

  const currency = company?.baseCurrency || 'USD'

  const stats = {
    totalExpenses: myExpenses?.length || 0,
    pending: myExpenses?.filter((e) => e.status === 'pending').length || 0,
    approved: myExpenses?.filter((e) => e.status === 'approved').length || 0,
    rejected: myExpenses?.filter((e) => e.status === 'rejected').length || 0,
    totalAmount:
      myExpenses?.reduce((sum, e) => sum + parseFloat(e.amountBase || e.amount || 0), 0) || 0,
    pendingApprovalsCount: pendingApprovals?.length || 0
  }

  // Appwrite Console Metric Cards
  const statCards = [
    {
      label: 'My Total Submissions',
      value: stats.totalExpenses,
      subtext: `${stats.pending} awaiting review`,
      icon: Receipt,
      accent: 'pink',
      color: '#fd366e'
    },
    {
      label: 'Awaiting Approvals',
      value: isEmployee ? stats.pending : stats.pendingApprovalsCount,
      subtext: isEmployee ? 'In progress' : 'Requires your decision',
      icon: Clock,
      accent: 'amber',
      color: '#f99c00'
    },
    {
      label: 'Approved & Reimbursed',
      value: stats.approved,
      subtext: 'Processed successfully',
      icon: CheckCircle,
      accent: 'emerald',
      color: '#10b981'
    },
    {
      label: 'Rejected / Flagged',
      value: stats.rejected,
      subtext: 'Needs adjustment',
      icon: XCircle,
      accent: 'rose',
      color: '#f43f5e'
    }
  ]

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Appwrite Console Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#131316] via-[#16161c] to-[#131316] border border-white/[0.08] p-6 sm:p-8 shadow-aw-glow-card">
        {/* Background glow highlights */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#fd366e]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[#fe9567]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#fd366e] px-2.5 py-0.5 rounded-full bg-[#fd366e]/10 border border-[#fd366e]/20">
                Workspace Dashboard
              </span>
              <span className="text-[11px] font-mono text-zinc-500">•</span>
              <span className="text-[11px] font-mono text-zinc-400 capitalize">{profile?.role} Console</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
              Welcome back, {profile?.fullName || 'Teammate'}
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl">
              Track multi-currency reimbursements, manage hierarchical approval workflows, and maintain policy compliance for{' '}
              <span className="text-zinc-200 font-medium">{company?.name || 'ReimburseFlow Workspace'}</span>.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 sm:p-5 shrink-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#fd366e]/20 to-[#fe9567]/20 border border-[#fd366e]/30 flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6 text-[#fd366e]" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-mono">My Reimbursed Total</p>
              <p className="text-2xl font-bold text-white font-display mt-0.5">
                {formatCurrency(stats.totalAmount, currency)}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Base: {currency}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Metric Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="aw-card p-5 relative overflow-hidden group hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">{card.label}</span>
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center border"
                  style={{
                    backgroundColor: `${card.color}15`,
                    borderColor: `${card.color}30`
                  }}
                >
                  <Icon className="h-4 w-4" style={{ color: card.color }} />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white font-display">
                  {card.value}
                </span>
              </div>

              <p className="text-[11px] text-zinc-500 mt-2 font-mono">{card.subtext}</p>
            </div>
          )
        })}
      </section>

      {/* Main Grid: Shortcuts + Department Spend or Pending Reviews */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Workflow Quick Launch Tiles */}
        <div className="lg:col-span-2 space-y-6">
          <div className="aw-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold text-white font-display">Workflow Actions</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Essential tasks tailored for {profile?.role}</p>
              </div>
              <span className="text-xs font-mono text-[#fd366e] flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(isEmployee || isManager) && (
                <div
                  onClick={() => navigate('/expenses')}
                  className="aw-card-interactive p-5 cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-xl bg-[#fd366e]/15 border border-[#fd366e]/30 flex items-center justify-center text-[#fd366e] group-hover:scale-105 transition-transform">
                      <Plus className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-[#fd366e] transition-colors" />
                  </div>
                  <h4 className="text-sm font-semibold text-white mt-4">Log Expense Report</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Upload receipt, auto-parse OCR text, and route through policy approval.
                  </p>
                </div>
              )}

              {(isManager || isAdmin) && (
                <div
                  onClick={() => navigate('/approvals')}
                  className="aw-card-interactive p-5 cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-xl bg-[#f99c00]/15 border border-[#f99c00]/30 flex items-center justify-center text-[#f99c00] group-hover:scale-105 transition-transform">
                      <CheckSquare className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-[#f99c00] transition-colors" />
                  </div>
                  <h4 className="text-sm font-semibold text-white mt-4">Review Approvals</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Inspect pending team submissions, evaluate receipts, and approve/reject.
                  </p>
                </div>
              )}

              {(isAdmin || isManager) && (
                <div
                  onClick={() => navigate('/analytics')}
                  className="aw-card-interactive p-5 cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <h4 className="text-sm font-semibold text-white mt-4">Financial Analytics</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Examine spending breakdown, monthly burn trajectory, and department budgets.
                  </p>
                </div>
              )}

              {isAdmin && (
                <div
                  onClick={() => navigate('/users')}
                  className="aw-card-interactive p-5 cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                      <Users className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <h4 className="text-sm font-semibold text-white mt-4">Manage Team Members</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Assign managers, define roles, and configure organization spending limits.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Department Budget Gauges */}
          {analytics?.budgets && analytics.budgets.length > 0 && (isAdmin || isManager) && (
            <div className="aw-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-white font-display">Department Budgets</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Real-time spend against monthly allocations</p>
                </div>
                <button
                  onClick={() => navigate('/analytics')}
                  className="text-xs text-[#fd366e] font-mono hover:underline flex items-center gap-1"
                >
                  <span>Detailed View</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-4">
                {analytics.budgets.map((b) => {
                  const percent = Math.min(Math.round((b.spentAmount / b.monthlyBudget) * 100), 100)
                  const isWarning = percent > 85
                  return (
                    <div key={b._id || b.department} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-white">{b.department}</span>
                        <span className="font-mono text-zinc-400">
                          {formatCurrency(b.spentAmount, b.currency)} / {formatCurrency(b.monthlyBudget, b.currency)} ({percent}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isWarning
                              ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                              : 'bg-gradient-to-r from-[#fd366e] to-[#fe9567]'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pending Approvals or Recent Submissions Feed */}
        <div className="space-y-6">
          <div className="aw-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white font-display">
                {isManager || isAdmin ? 'Pending Decisions' : 'My Recent Submissions'}
              </h3>
              <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.08]">
                Real-time
              </span>
            </div>

            {(isManager || isAdmin) ? (
              pendingApprovals && pendingApprovals.length > 0 ? (
                <div className="space-y-3">
                  {pendingApprovals.slice(0, 4).map((item) => (
                    <div
                      key={item._id}
                      onClick={() => navigate('/approvals')}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#fd366e]/30 transition cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-xs font-semibold text-white truncate max-w-[160px]">
                          {item.expense?.description || 'Expense submission'}
                        </p>
                        <span className="text-xs font-mono font-bold text-white">
                          {formatCurrency(item.expense?.amount, item.expense?.currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[11px] text-zinc-400">
                        <span>{item.expense?.createdBy?.fullName || 'Employee'}</span>
                        <span className="text-[10px] font-mono text-[#f99c00] bg-[#f99c00]/10 px-1.5 py-0.5 rounded border border-[#f99c00]/20">
                          Pending Review
                        </span>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => navigate('/approvals')}
                    className="w-full text-center text-xs font-mono text-[#fd366e] hover:underline pt-2"
                  >
                    View all {pendingApprovals.length} pending approvals ➔
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-2">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-medium text-white">Inbox Clean</p>
                  <p className="text-[11px] text-zinc-500 mt-1">No pending approvals waiting for your review.</p>
                </div>
              )
            ) : (
              myExpenses && myExpenses.length > 0 ? (
                <div className="space-y-3">
                  {myExpenses.slice(0, 4).map((exp) => (
                    <div
                      key={exp._id || exp.id}
                      onClick={() => navigate('/expenses')}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/15 transition cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-xs font-medium text-white truncate max-w-[160px]">
                          {exp.description}
                        </p>
                        <span className="text-xs font-mono font-semibold text-white">
                          {formatCurrency(exp.amount, exp.currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-zinc-500">{exp.category}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            exp.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : exp.status === 'rejected'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {exp.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => navigate('/expenses')}
                    className="w-full text-center text-xs font-mono text-[#fd366e] hover:underline pt-2"
                  >
                    View all my submissions ➔
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="h-10 w-10 rounded-xl bg-zinc-800 border border-white/10 text-zinc-400 mx-auto flex items-center justify-center mb-2">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-medium text-white">No expenses yet</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Submit your first expense to track reimbursement.</p>
                </div>
              )
            )}
          </div>

          {/* Quick System Status Card */}
          <div className="aw-card p-5">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-3">
              Environment & Infrastructure
            </h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Database</span>
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  MongoDB Atlas
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Backend Framework</span>
                <span className="text-white">Express.js (Node 20+)</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Auth Standard</span>
                <span className="text-white">JWT Bearer (HMAC-SHA256)</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Design Reference</span>
                <span className="text-[#fd366e]">Appwrite Console UI</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
