import { useAuth } from '../hooks/useAuth'
import { useMyExpenses } from '../hooks/useExpenses'
import { usePendingApprovals } from '../hooks/useApprovals'
import { Receipt, CheckCircle, XCircle, Clock, TrendingUp, Sparkles } from 'lucide-react'
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

  const statCards = [
    {
      label: 'Total Expenses',
      value: stats.totalExpenses,
      icon: Receipt,
      chip: 'Submissions'
    },
    {
      label: 'Pending Reviews',
      value: stats.pending,
      icon: Clock,
      chip: 'Awaiting'
    },
    {
      label: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      chip: 'Completed'
    },
    {
      label: 'Rejected',
      value: stats.rejected,
      icon: XCircle,
      chip: 'Flagged'
    }
  ]

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-white/5 border border-white/10 p-6 md:p-8 shadow-card">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-primary-200">Welcome back</p>
            <h2 className="text-3xl font-semibold text-white mt-2">{profile?.full_name}</h2>
            <p className="text-slate-300 mt-2 max-w-2xl">
              Monitor reimbursements, unblock approvals, and maintain financial discipline for {company?.name || 'your workspace'}.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white/5 px-6 py-4 border border-white/10">
            <TrendingUp className="h-10 w-10 text-primary-300" />
            <div>
              <p className="text-sm text-slate-300">Total reimbursed</p>
              <p className="text-2xl font-semibold text-white">
                {formatCurrency(stats.totalAmount, company?.base_currency || 'USD')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-3xl bg-slate-900/60 border border-white/5 p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div className="h-11 w-11 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary-200" />
                </div>
                <span className="text-xs uppercase tracking-[0.25em] text-white/60">{card.chip}</span>
              </div>
              <p className="text-sm text-slate-300 mt-4">{card.label}</p>
              <p className="text-3xl font-semibold text-white mt-2">{card.value}</p>
            </div>
          )
        })}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-gradient-to-br from-primary-500/90 to-primary-700/70 p-6 md:p-8 shadow-card">
          <p className="text-sm text-white/80">Total Spend</p>
          <p className="text-4xl font-semibold text-white mt-3">
            {formatCurrency(stats.totalAmount, company?.base_currency || 'USD')}
          </p>
          <p className="text-white/70 mt-2">All reimbursements captured in platform</p>
        </div>

        {(profile?.role === 'manager' || profile?.role === 'admin') && (
          <div className="rounded-3xl bg-gradient-to-br from-purple-500/80 to-blue-600/70 p-6 md:p-8 shadow-card">
            <p className="text-sm text-white/80">Pending approvals</p>
            <p className="text-4xl font-semibold text-white mt-3">{stats.pendingApprovals}</p>
            <p className="text-white/70 mt-2">Waiting for your review</p>
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-white/5 border border-white/5 p-6 md:p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-slate-300">Workflow shortcuts</p>
            <h3 className="text-2xl font-semibold text-white mt-1">Quick Actions</h3>
          </div>
          <div className="flex items-center gap-2 text-primary-200 text-sm uppercase tracking-[0.2em]">
            <Sparkles className="h-4 w-4" /> curated for {profile?.role}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {(profile?.role === 'employee' || profile?.role === 'manager') && (
            <a
              href="/expenses"
              className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-primary-300 hover:bg-primary-500/10 transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary-500/20 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-primary-200" />
                </div>
                <div>
                  <p className="text-white font-medium">Submit Expense</p>
                  <p className="text-sm text-slate-300">Create a new report</p>
                </div>
              </div>
            </a>
          )}

          {(profile?.role === 'manager' || profile?.role === 'admin') && (
            <a
              href="/approvals"
              className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-primary-300 hover:bg-primary-500/10 transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-200" />
                </div>
                <div>
                  <p className="text-white font-medium">Review Approvals</p>
                  <p className="text-sm text-slate-300">{stats.pendingApprovals} pending</p>
                </div>
              </div>
            </a>
          )}

          {profile?.role === 'admin' && (
            <a
              href="/users"
              className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-primary-300 hover:bg-primary-500/10 transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-indigo-200" />
                </div>
                <div>
                  <p className="text-white font-medium">Manage Users</p>
                  <p className="text-sm text-slate-300">Onboard teammates</p>
                </div>
              </div>
            </a>
          )}
        </div>
      </section>
    </div>
  )
}
