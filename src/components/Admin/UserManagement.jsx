import { useState } from 'react'
import { Plus, Edit2, Trash2, Users, Search, Shield, Building } from 'lucide-react'
import { useCompanyUsers, useDeleteUser } from '../../hooks/useUsers'
import { useAuth } from '../../hooks/useAuth'
import UserModal from './UserModal'

export default function UserManagement() {
  const { company, profile } = useAuth()
  const { data: users, isLoading } = useCompanyUsers(company?._id || company?.id)
  const deleteUser = useDeleteUser()
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')

  const handleDelete = async (userId) => {
    if (userId === profile.id || userId === profile._id) {
      alert('You cannot delete your own admin account.')
      return
    }

    if (window.confirm('Are you sure you want to remove this teammate from the organization?')) {
      try {
        await deleteUser.mutateAsync(userId)
      } catch (error) {
        alert('Failed to delete user: ' + error.message)
      }
    }
  }

  const renderRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border bg-[#fd366e]/10 text-[#fd366e] border-[#fd366e]/30">
            Admin
          </span>
        )
      case 'manager':
        return (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border bg-blue-500/10 text-blue-400 border-blue-500/30">
            Manager
          </span>
        )
      default:
        return (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border bg-zinc-800 text-zinc-300 border-zinc-700">
            Employee
          </span>
        )
    }
  }

  const filteredUsers = users?.filter(
    (u) =>
      (u.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.department || '').toLowerCase().includes(search.toLowerCase())
  ) || []

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <div className="h-8 w-8 border-2 border-[#fd366e] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-zinc-500">Querying team directory...</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, department..."
              className="aw-input w-full pl-10 pr-4 py-2 text-xs"
            />
          </div>

          <button
            onClick={() => {
              setSelectedUser(null)
              setIsModalOpen(true)
            }}
            className="aw-btn-primary px-3.5 py-2 text-xs font-semibold shadow-aw-button w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Team Member</span>
          </button>
        </div>

        {/* Directory Table */}
        <div className="aw-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs divide-y divide-white/[0.06]">
              <thead className="bg-white/[0.02] text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Teammate</th>
                  <th className="px-5 py-3.5 font-medium">Role</th>
                  <th className="px-5 py-3.5 font-medium">Department</th>
                  <th className="px-5 py-3.5 font-medium">Manager</th>
                  <th className="px-5 py-3.5 font-medium">Spending Limit</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredUsers.map((user) => {
                  const id = user._id || user.id
                  const isCurrentUser = id === profile.id || id === profile._id

                  return (
                    <tr key={id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-[#fd366e]/15 border border-[#fd366e]/30 flex items-center justify-center font-bold text-xs text-[#fd366e]">
                            {user.fullName?.[0] || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-white">{user.fullName}</span>
                              {isCurrentUser && (
                                <span className="text-[10px] font-mono text-zinc-500">(You)</span>
                              )}
                            </div>
                            <span className="text-[11px] text-zinc-500 font-mono">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {renderRoleBadge(user.role)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-medium text-zinc-300">
                        {user.department || 'General'}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-zinc-400">
                        {user.managerId?.fullName || user.manager?.fullName || '—'}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono text-zinc-300">
                        ${user.spendingLimit?.toLocaleString() || '5,000'} /mo
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setIsModalOpen(true)
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition"
                            title="Edit User"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          {!isCurrentUser && (
                            <button
                              onClick={() => handleDelete(id)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                              title="Delete User"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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
      </div>

      {isModalOpen && (
        <UserModal
          user={selectedUser}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedUser(null)
          }}
        />
      )}
    </>
  )
}
