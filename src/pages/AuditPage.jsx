import { useState } from 'react'
import { useAuditLogs } from '../hooks/useAnalytics'
import { format } from 'date-fns'
import { History, Shield, Search, FileText, CheckCircle2, User, Settings, Database } from 'lucide-react'

export default function AuditPage() {
  const { data: logs, isLoading } = useAuditLogs()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

  const filteredLogs = logs?.filter((log) => {
    const matchesSearch =
      (log.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.actorName || '').toLowerCase().includes(search.toLowerCase())
    const matchesType = filterType === 'all' || log.entityType === filterType
    return matchesSearch && matchesType
  }) || []

  const renderEntityBadge = (type) => {
    switch (type) {
      case 'approval':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            approval
          </span>
        )
      case 'expense':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#fd366e]/10 text-[#fd366e] border border-[#fd366e]/20">
            expense
          </span>
        )
      case 'user':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            user
          </span>
        )
      case 'rule':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            policy
          </span>
        )
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
            {type}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-display">System Activity & Audit Trail</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300">
              Immutable Log
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Complete compliance timeline recording every submission, approval decision, policy edit, and payout.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="aw-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search action or actor name..."
              className="aw-input w-full pl-10 pr-4 py-2 text-xs"
            />
          </div>

          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="aw-input w-full px-3 py-2 text-xs bg-[#131316] font-mono"
            >
              <option value="all">All Entity Events</option>
              <option value="expense">Expense Actions</option>
              <option value="approval">Approval Decisions</option>
              <option value="user">User Operations</option>
              <option value="rule">Policy Updates</option>
              <option value="budget">Budget Changes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-3">
          <div className="h-8 w-8 border-2 border-[#fd366e] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-zinc-500">Querying security audit trail...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="aw-card p-12 text-center">
          <h3 className="text-sm font-semibold text-white">No audit records found</h3>
          <p className="text-xs text-zinc-500 mt-1">Actions performed on the platform will be logged here.</p>
        </div>
      ) : (
        <div className="aw-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs divide-y divide-white/[0.06]">
              <thead className="bg-white/[0.02] text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Timestamp</th>
                  <th className="px-5 py-3.5 font-medium">Actor</th>
                  <th className="px-5 py-3.5 font-medium">Action Event</th>
                  <th className="px-5 py-3.5 font-medium">Target Entity</th>
                  <th className="px-5 py-3.5 font-medium">Payload Snapshot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredLogs.map((log) => {
                  const logDate = log.createdAt || log.timestamp || new Date()
                  return (
                    <tr key={log._id || log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 font-mono text-zinc-400 whitespace-nowrap">
                        {format(new Date(logDate), 'MMM dd, yyyy HH:mm:ss')}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-semibold text-white">{log.actorName || 'System'}</span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-medium text-white">
                        {log.action}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {renderEntityBadge(log.entityType)}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-zinc-400 max-w-sm truncate">
                        {JSON.stringify(log.details || {})}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
