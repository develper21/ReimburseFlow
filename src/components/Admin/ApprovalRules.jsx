import { useState } from 'react'
import { Plus, Edit2, Trash2, Settings, ShieldCheck, CheckCircle2, UserCheck, Star } from 'lucide-react'
import { useApprovalRules, useDeleteApprovalRule } from '../../hooks/useApprovals'
import { useAuth } from '../../hooks/useAuth'
import ApprovalRuleModal from './ApprovalRuleModal'

export default function ApprovalRules() {
  const { company } = useAuth()
  const { data: rules, isLoading } = useApprovalRules(company?._id || company?.id)
  const deleteRule = useDeleteApprovalRule()
  const [selectedRule, setSelectedRule] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleDelete = async (ruleId) => {
    if (window.confirm('Are you sure you want to delete this approval rule?')) {
      try {
        await deleteRule.mutateAsync(ruleId)
      } catch (error) {
        alert('Failed to delete rule: ' + error.message)
      }
    }
  }

  const renderRuleTypeBadge = (type) => {
    switch (type) {
      case 'hybrid':
        return (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border bg-purple-500/10 text-purple-400 border-purple-500/30">
            Hybrid Rule
          </span>
        )
      case 'specific':
        return (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border bg-[#fd366e]/10 text-[#fd366e] border-[#fd366e]/30">
            Designated Exec
          </span>
        )
      default:
        return (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border bg-blue-500/10 text-blue-400 border-blue-500/30">
            Consensus %
          </span>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <div className="h-8 w-8 border-2 border-[#fd366e] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-zinc-500">Querying approval workflow rules...</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono text-zinc-400">
            {rules?.length || 0} active policies controlling reimbursement routing
          </p>
          <button
            onClick={() => {
              setSelectedRule(null)
              setIsModalOpen(true)
            }}
            className="aw-btn-primary px-3.5 py-2 text-xs font-semibold shadow-aw-button"
          >
            <Plus className="h-4 w-4" />
            <span>Create Rule</span>
          </button>
        </div>

        {rules?.length === 0 ? (
          <div className="aw-card p-12 text-center">
            <h3 className="text-sm font-semibold text-white">No approval rules configured</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Create an approval rule to enforce manager sign-offs or percentage consensus.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules?.map((rule) => {
              const id = rule._id || rule.id
              const isManagerReq = rule.isManagerApprover ?? rule.is_manager_approver
              const isSeq = rule.sequenceOrder ?? rule.sequence_order
              const ruleType = rule.ruleType || rule.rule_type
              const pct = rule.percentageRequired || rule.percentage_required

              return (
                <div
                  key={id}
                  className="aw-card p-5 relative overflow-hidden group hover:border-white/20 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-sm font-bold text-white font-display">{rule.name}</h3>
                        {rule.isDefault && (
                          <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Star className="h-3 w-3 fill-amber-400" />
                            Default
                          </span>
                        )}
                        {renderRuleTypeBadge(ruleType)}
                      </div>

                      {rule.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2">{rule.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedRule(rule)
                          setIsModalOpen(true)
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition"
                        title="Edit Rule"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete Rule"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 mt-4 border-t border-white/[0.06] text-xs">
                    <div>
                      <span className="text-zinc-500 font-mono text-[11px] block">Manager Review</span>
                      <p className="font-medium text-white">{isManagerReq ? 'Mandatory' : 'Optional'}</p>
                    </div>

                    <div>
                      <span className="text-zinc-500 font-mono text-[11px] block">Evaluation Order</span>
                      <p className="font-medium text-white">{isSeq ? 'Sequential Order' : 'Parallel Any'}</p>
                    </div>

                    {ruleType !== 'specific' && (
                      <div>
                        <span className="text-zinc-500 font-mono text-[11px] block">Threshold</span>
                        <p className="font-mono text-[#fd366e]">{pct}% approvals needed</p>
                      </div>
                    )}

                    {rule.specificApprover && (
                      <div>
                        <span className="text-zinc-500 font-mono text-[11px] block">Executive Approver</span>
                        <p className="text-white truncate">
                          {rule.specificApprover?.fullName || 'Assigned Lead'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <ApprovalRuleModal
          rule={selectedRule}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedRule(null)
          }}
        />
      )}
    </>
  )
}
