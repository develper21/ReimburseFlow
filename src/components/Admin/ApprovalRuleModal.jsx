import { useState, useEffect } from 'react'
import { X, Loader2, Settings, ShieldCheck, Check, Percent, UserCheck } from 'lucide-react'
import { useCreateApprovalRule, useUpdateApprovalRule } from '../../hooks/useApprovals'
import { useManagers } from '../../hooks/useUsers'
import { useAuth } from '../../hooks/useAuth'

export default function ApprovalRuleModal({ rule, onClose }) {
  const { company } = useAuth()
  const createRule = useCreateApprovalRule()
  const updateRule = useUpdateApprovalRule()
  const { data: managers } = useManagers(company?._id || company?.id)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isManagerApprover: true,
    approverIds: [],
    sequenceOrder: true,
    ruleType: 'hybrid',
    percentageRequired: 60,
    specificApprover: '',
    isDefault: false
  })

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name || '',
        description: rule.description || '',
        isManagerApprover: rule.isManagerApprover ?? rule.is_manager_approver ?? true,
        approverIds: (rule.approverIds || rule.approver_ids || []).map((a) => (a._id ? a._id : a)),
        sequenceOrder: rule.sequenceOrder ?? rule.sequence_order ?? true,
        ruleType: rule.ruleType || rule.rule_type || 'hybrid',
        percentageRequired: rule.percentageRequired || rule.percentage_required || 60,
        specificApprover:
          rule.specificApprover?._id ||
          rule.specificApprover ||
          rule.specific_approver ||
          '',
        isDefault: Boolean(rule.isDefault)
      })
    }
  }, [rule])

  const handleApproverToggle = (approverId) => {
    setFormData((prev) => ({
      ...prev,
      approverIds: prev.approverIds.includes(approverId)
        ? prev.approverIds.filter((id) => id !== approverId)
        : [...prev.approverIds, approverId]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        isManagerApprover: Boolean(formData.isManagerApprover),
        approverIds: formData.approverIds,
        sequenceOrder: Boolean(formData.sequenceOrder),
        ruleType: formData.ruleType,
        percentageRequired: parseInt(formData.percentageRequired) || 60,
        specificApprover: formData.specificApprover || null,
        isDefault: Boolean(formData.isDefault)
      }

      if (rule) {
        await updateRule.mutateAsync({
          ruleId: rule._id || rule.id,
          updates: payload
        })
      } else {
        await createRule.mutateAsync(payload)
      }

      onClose()
    } catch (err) {
      console.error('Save rule error:', err)
      setError(err.message || 'Failed to save approval workflow rule.')
    }
  }

  const isLoading = createRule.isPending || updateRule.isPending

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
      <div className="aw-card max-w-2xl w-full p-6 my-8 shadow-2xl border-white/15">
        <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#fd366e]/15 border border-[#fd366e]/30 flex items-center justify-center text-[#fd366e]">
              <Settings className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white font-display">
              {rule ? 'Edit Approval Workflow Rule' : 'New Approval Policy Rule'}
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
              Rule Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Standard Multi-Tier Approval"
              className="aw-input w-full px-3.5 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Description & Scope
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain when this approval rule triggers..."
              className="aw-input w-full px-3.5 py-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Evaluation Strategy (Rule Type)
              </label>
              <select
                value={formData.ruleType}
                onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
                className="aw-input w-full px-3 py-2 text-xs bg-[#131316]"
              >
                <option value="percentage">Percentage Threshold (Consensus)</option>
                <option value="specific">Designated Executive Approver</option>
                <option value="hybrid">Hybrid (Executive OR Threshold)</option>
              </select>
            </div>

            {(formData.ruleType === 'percentage' || formData.ruleType === 'hybrid') && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Approval Percentage Required ({formData.percentageRequired}%)
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={formData.percentageRequired}
                  onChange={(e) =>
                    setFormData({ ...formData, percentageRequired: Number(e.target.value) })
                  }
                  className="w-full accent-[#fd366e] cursor-pointer mt-2"
                />
              </div>
            )}
          </div>

          {(formData.ruleType === 'specific' || formData.ruleType === 'hybrid') && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Designated Executive Approver (e.g. CFO / VP)
              </label>
              <select
                value={formData.specificApprover}
                onChange={(e) => setFormData({ ...formData, specificApprover: e.target.value })}
                className="aw-input w-full px-3 py-2 text-xs bg-[#131316]"
              >
                <option value="">Select executive approver...</option>
                {managers?.map((m) => (
                  <option key={m._id || m.id} value={m._id || m.id}>
                    {m.fullName} ({m.role} - {m.department})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Checkboxes for Manager requirement & Sequence */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={formData.isManagerApprover}
                onChange={(e) => setFormData({ ...formData, isManagerApprover: e.target.checked })}
                className="rounded bg-zinc-800 border-white/20 text-[#fd366e] focus:ring-0"
              />
              <span>Include employee's direct reporting manager in approval chain</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={formData.sequenceOrder}
                onChange={(e) => setFormData({ ...formData, sequenceOrder: e.target.checked })}
                className="rounded bg-zinc-800 border-white/20 text-[#fd366e] focus:ring-0"
              />
              <span>Sequential processing (Approvers must approve in order)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded bg-zinc-800 border-white/20 text-[#fd366e] focus:ring-0"
              />
              <span>Make this the default approval rule for new claims</span>
            </label>
          </div>

          {/* Additional Approvers Selector */}
          <div>
            <label className="block text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider mb-2">
              Additional Configured Approvers
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              {managers?.map((mgr) => {
                const id = mgr._id || mgr.id
                const isSelected = formData.approverIds.includes(id)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleApproverToggle(id)}
                    className={`flex items-center justify-between p-2 rounded-lg text-left text-xs transition border ${
                      isSelected
                        ? 'bg-[#fd366e]/15 border-[#fd366e]/40 text-white'
                        : 'bg-white/[0.02] border-white/[0.05] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{mgr.fullName}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#fd366e] shrink-0" />}
                  </button>
                )
              })}
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
                <span>{rule ? 'Update Rule' : 'Create Rule'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
