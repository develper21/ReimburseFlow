import ApprovalRules from '../components/Admin/ApprovalRules'
import { Settings } from 'lucide-react'

export default function RulesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-display">Approval Workflow Rules</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
              Policy Engine
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Build and enforce conditional approval logic, percentage thresholds, and executive overrides.
          </p>
        </div>
      </div>

      <ApprovalRules />
    </div>
  )
}
