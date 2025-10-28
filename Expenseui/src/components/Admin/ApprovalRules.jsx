import { useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { useApprovalRules, useDeleteApprovalRule } from '../../hooks/useApprovals'
import { useAuth } from '../../hooks/useAuth'
import ApprovalRuleModal from './ApprovalRuleModal'

export default function ApprovalRules() {
  const { company } = useAuth()
  const { data: rules, isLoading } = useApprovalRules(company?.id)
  const deleteRule = useDeleteApprovalRule()
  const [selectedRule, setSelectedRule] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleDelete = async (ruleId) => {
    if (window.confirm('Are you sure you want to delete this approval rule?')) {
      try {
        await deleteRule.mutateAsync(ruleId)
      } catch (error) {
        alert('Failed to delete rule')
      }
    }
  }

  const getRuleTypeBadge = (type) => {
    const styles = {
      percentage: 'bg-blue-100 text-blue-800',
      specific: 'bg-purple-100 text-purple-800',
      hybrid: 'bg-green-100 text-green-800'
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[type]}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Approval Rules</h2>
          <p className="text-gray-600">Configure expense approval workflows</p>
        </div>
        <button
          onClick={() => {
            setSelectedRule(null)
            setIsModalOpen(true)
          }}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </button>
      </div>

      <div className="grid gap-4">
        {rules?.map((rule) => (
          <div
            key={rule.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {rule.name}
                  </h3>
                  {getRuleTypeBadge(rule.rule_type)}
                </div>

                {rule.description && (
                  <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Manager Approval:</span>
                    <p className="font-medium text-gray-900">
                      {rule.is_manager_approver ? 'Required' : 'Not Required'}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500">Sequence:</span>
                    <p className="font-medium text-gray-900">
                      {rule.sequence_order ? 'Sequential' : 'Parallel'}
                    </p>
                  </div>

                  {rule.rule_type === 'percentage' && (
                    <div>
                      <span className="text-gray-500">Approval Threshold:</span>
                      <p className="font-medium text-gray-900">
                        {rule.percentage_required}%
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-gray-500">Additional Approvers:</span>
                    <p className="font-medium text-gray-900">
                      {rule.approver_ids?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => {
                    setSelectedRule(rule)
                    setIsModalOpen(true)
                  }}
                  className="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-md"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(rule.id)}
                  className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {(!rules || rules.length === 0) && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No approval rules configured yet.</p>
            <p className="text-sm text-gray-400 mt-1">
              Create a rule to enable expense approvals.
            </p>
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
