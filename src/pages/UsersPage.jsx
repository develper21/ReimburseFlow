import UserManagement from '../components/Admin/UserManagement'
import { Users } from 'lucide-react'

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-display">Organization Directory</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400">
              Admin Only
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Manage teammates, hierarchy, approval roles, departments, and individual monthly spending caps.
          </p>
        </div>
      </div>

      <UserManagement />
    </div>
  )
}
