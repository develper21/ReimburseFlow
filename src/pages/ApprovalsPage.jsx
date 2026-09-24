import PendingApprovals from '../components/Manager/PendingApprovals'
import { CheckSquare, ShieldCheck } from 'lucide-react'

export default function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-display">Approvals Review Hub</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f99c00]/10 border border-[#f99c00]/30 text-[#f99c00]">
              Manager / Admin
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Review pending team reimbursement requests, verify receipt documentation, and process authorizations.
          </p>
        </div>
      </div>

      <PendingApprovals />
    </div>
  )
}
