import { useState, useEffect } from 'react'
import { X, Loader2, User, Mail, Lock, Shield, Building, DollarSign } from 'lucide-react'
import { useCreateUser, useUpdateUser, useManagers } from '../../hooks/useUsers'
import { useAuth } from '../../hooks/useAuth'

export default function UserModal({ user, onClose }) {
  const { company } = useAuth()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const { data: managers } = useManagers(company?._id || company?.id)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'employee',
    managerId: '',
    department: 'Engineering',
    spendingLimit: '5000'
  })

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        password: '',
        fullName: user.fullName || user.full_name || '',
        role: user.role || 'employee',
        managerId: user.managerId?._id || user.managerId || user.manager_id || '',
        department: user.department || 'Engineering',
        spendingLimit: user.spendingLimit ? String(user.spendingLimit) : '5000'
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      if (user) {
        await updateUser.mutateAsync({
          userId: user._id || user.id,
          updates: {
            fullName: formData.fullName,
            role: formData.role,
            managerId: formData.managerId || null,
            department: formData.department,
            spendingLimit: parseFloat(formData.spendingLimit) || 5000
          }
        })
      } else {
        if (!formData.password || formData.password.length < 6) {
          setError('Password must be at least 6 characters')
          return
        }

        await createUser.mutateAsync({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          role: formData.role,
          managerId: formData.managerId || null,
          department: formData.department,
          spendingLimit: parseFloat(formData.spendingLimit) || 5000
        })
      }

      onClose()
    } catch (err) {
      console.error('Error saving user:', err)
      setError(err.message || 'Failed to save teammate profile.')
    }
  }

  const isLoading = createUser.isPending || updateUser.isPending

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="aw-card max-w-lg w-full p-6 shadow-2xl border-white/15">
        <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <User className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white font-display">
              {user ? 'Edit Teammate Settings' : 'Add Team Member'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Marcus Wright"
              className="aw-input w-full px-3.5 py-2 text-xs"
            />
          </div>

          {!user && (
            <>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Work Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com"
                  className="aw-input w-full px-3.5 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="aw-input w-full px-3.5 py-2 text-xs"
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Role & Privileges
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="aw-input w-full px-3 py-2 text-xs bg-[#131316]"
              >
                <option value="employee">Employee (Submissions)</option>
                <option value="manager">Manager (Approver)</option>
                <option value="admin">Admin (Full Control)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Reporting Manager
              </label>
              <select
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                className="aw-input w-full px-3 py-2 text-xs bg-[#131316]"
              >
                <option value="">No Direct Manager</option>
                {managers
                  ?.filter((m) => !user || (m._id !== user._id && m.id !== user.id))
                  .map((mgr) => (
                    <option key={mgr._id || mgr.id} value={mgr._id || mgr.id}>
                      {mgr.fullName} ({mgr.role})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Monthly Spending Limit ($)
              </label>
              <input
                type="number"
                value={formData.spendingLimit}
                onChange={(e) => setFormData({ ...formData, spendingLimit: e.target.value })}
                placeholder="5000"
                className="aw-input w-full px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="aw-btn-secondary px-4 py-2 text-xs"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="aw-btn-primary px-5 py-2 text-xs font-semibold shadow-aw-button"
            >
              {isLoading ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="animate-spin h-3.5 w-3.5" />
                  <span>Saving...</span>
                </div>
              ) : (
                <span>{user ? 'Update Profile' : 'Add Teammate'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
