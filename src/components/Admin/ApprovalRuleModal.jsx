import { useState, useEffect } from 'react'
import { X, Loader } from 'lucide-react'
import { useCreateApprovalRule, useUpdateApprovalRule } from '../../hooks/useApprovals'
import { useManagers } from '../../hooks/useUsers'
import { useAuth } from '../../hooks/useAuth'
import { RULE_TYPES } from '../../lib/constants'

export default function ApprovalRuleModal({ rule, onClose }) {
  const { company } = useAuth()
  const createRule = useCreateApprovalRule()
  const updateRule = useUpdateApprovalRule()
  const { data: managers } = useManagers(company?.id)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isManagerApprover: false,
    approverIds: [],
    sequenceOrder: true,
    ruleType: 'percentage',
    percentageRequired: 60,
    specificApproverId: ''
  })

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name || '',
        description: rule.description || '',
        isManagerApprover: rule.is_manager_approver || false,
        approverIds: rule.approver_ids || [],
        sequenceOrder: rule.sequence_order !== false,
        ruleType: rule.rule_type || 'percentage',
        percentageRequired: rule.percentage_required || 60,
        specificApproverId: rule.specific_approver || ''
      })
    }
  }, [rule])

  const handleApproverToggle = (approverId) => {
    setFormData(prev => ({
      ...prev,
      approverIds: prev.approverIds.includes(approverId)
        ? prev.approverIds.filter(id => id !== approverId)
        : [...prev.approverIds, approverId]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const ruleData = {
        company_id: company.id,
        name: formData.name,
        description: formData.description,
        is_manager_approver: formData.isManagerApprover,
        approver_ids: formData.approverIds,
        sequence_order: formData.sequenceOrder,
        rule_type: formData.ruleType,
        percentage_required: formData.ruleType === 'percentage' || formData.ruleType === 'hybrid' 
          ? formData.percentageRequired 
          : null,
        specific_approver: formData.ruleType === 'specific' || formData.ruleType === 'hybrid'
          ? formData.specificApproverId || null
          : null
      }

      if (rule) {
        await updateRule.mutateAsync({
          ruleId: rule.id,
          updates: ruleData
        })
      } else {
        await createRule.mutateAsync(ruleData)
      }

      onClose()
    } catch (error) {
      console.error('Error saving rule:', error)
      alert('Failed to save rule. Please try again.')
    }
  }

  const isLoading = createRule.isPending || updateRule.isPending

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {rule ? 'Edit Approval Rule' : 'Create Approval Rule'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rule Name *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Standard Approval Flow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rule Type *
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.ruleType}
              onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
            >
              <option value={RULE_TYPES.PERCENTAGE}>Percentage - Requires % of approvers</option>
              <option value={RULE_TYPES.SPECIFIC}>Specific - Requires specific approver</option>
              <option value={RULE_TYPES.HYBRID}>Hybrid - Specific OR percentage</option>
            </select>
          </div>

          {(formData.ruleType === 'percentage' || formData.ruleType === 'hybrid') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approval Percentage Required *
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.percentageRequired}
                onChange={(e) => setFormData({ ...formData, percentageRequired: parseInt(e.target.value) })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Percentage of approvers that must approve (1-100)
              </p>
            </div>
          )}

          {(formData.ruleType === 'specific' || formData.ruleType === 'hybrid') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specific Approver {formData.ruleType === 'specific' ? '*' : '(Optional)'}
              </label>
              <select
                required={formData.ruleType === 'specific'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.specificApproverId}
                onChange={(e) => setFormData({ ...formData, specificApproverId: e.target.value })}
              >
                <option value="">Select approver</option>
                {managers?.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.full_name} ({manager.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isManagerApprover"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={formData.isManagerApprover}
              onChange={(e) => setFormData({ ...formData, isManagerApprover: e.target.checked })}
            />
            <label htmlFor="isManagerApprover" className="ml-2 block text-sm text-gray-700">
              Require employee's manager approval
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="sequenceOrder"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={formData.sequenceOrder}
              onChange={(e) => setFormData({ ...formData, sequenceOrder: e.target.checked })}
            />
            <label htmlFor="sequenceOrder" className="ml-2 block text-sm text-gray-700">
              Sequential approval (approvers must approve in order)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Approvers
            </label>
            <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
              {managers && managers.length > 0 ? (
                <div className="space-y-2">
                  {managers.map((manager) => (
                    <div key={manager.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`approver-${manager.id}`}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={formData.approverIds.includes(manager.id)}
                        onChange={() => handleApproverToggle(manager.id)}
                      />
                      <label htmlFor={`approver-${manager.id}`} className="ml-2 block text-sm text-gray-700">
                        {manager.full_name} ({manager.role})
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No managers available</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Saving...
                </>
              ) : (
                <>{rule ? 'Update' : 'Create'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
