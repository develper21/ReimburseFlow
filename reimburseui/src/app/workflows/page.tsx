'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { ApprovalWorkflow, User } from '@/types/database'
import { 
  Plus, 
  Settings, 
  Edit, 
  Trash2,
  Users,
  ArrowRight,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import toast from 'react-hot-toast'

interface WorkflowWithDetails extends ApprovalWorkflow {
  approver_details: User[]
}

export default function WorkflowsPage() {
  const { profile } = useAuth()
  const [workflows, setWorkflows] = useState<WorkflowWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<ApprovalWorkflow | null>(null)

  useEffect(() => {
    if (profile && profile.role === 'admin') {
      fetchWorkflows()
    }
  }, [profile])

  const fetchWorkflows = async () => {
    if (!profile) return

    try {
      const { data: workflowsData, error: workflowsError } = await supabase
        .from('approval_workflows')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })

      if (workflowsError) throw workflowsError

      // Fetch approver details for each workflow
      const workflowsWithDetails = await Promise.all(
        (workflowsData || []).map(async (workflow) => {
          const { data: approvers, error: approversError } = await supabase
            .from('users')
            .select('id, full_name, email, role')
            .in('id', workflow.approvers)

          if (approversError) throw approversError

          return {
            ...workflow,
            approver_details: approvers || []
          }
        })
      )

      setWorkflows(workflowsWithDetails)
    } catch (error) {
      console.error('Error fetching workflows:', error)
      toast.error('Failed to fetch workflows')
    } finally {
      setLoading(false)
    }
  }

  const toggleWorkflowStatus = async (workflowId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('approval_workflows')
        .update({ is_active: !isActive })
        .eq('id', workflowId)

      if (error) throw error

      setWorkflows(workflows.map(w => 
        w.id === workflowId ? { ...w, is_active: !isActive } : w
      ))
      toast.success(`Workflow ${!isActive ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error('Error toggling workflow:', error)
      toast.error('Failed to update workflow')
    }
  }

  const deleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return

    try {
      const { error } = await supabase
        .from('approval_workflows')
        .delete()
        .eq('id', workflowId)

      if (error) throw error

      setWorkflows(workflows.filter(w => w.id !== workflowId))
      toast.success('Workflow deleted successfully')
    } catch (error) {
      console.error('Error deleting workflow:', error)
      toast.error('Failed to delete workflow')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow h-32"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Approval Workflows</h1>
            <p className="text-gray-600">Manage expense approval workflows and rules</p>
          </div>
          <button
            onClick={() => {
              setEditingWorkflow(null)
              setIsModalOpen(true)
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </button>
        </div>

        {/* Workflows List */}
        <div className="space-y-4">
          {workflows.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
              <p className="text-gray-500 mb-4">
                Create your first approval workflow to define how expenses are approved.
              </p>
              <button
                onClick={() => {
                  setEditingWorkflow(null)
                  setIsModalOpen(true)
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </button>
            </div>
          ) : (
            workflows.map((workflow) => (
              <div key={workflow.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">{workflow.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      workflow.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {workflow.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleWorkflowStatus(workflow.id, workflow.is_active)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title={workflow.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {workflow.is_active ? (
                        <ToggleRight className="h-5 w-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingWorkflow(workflow)
                        setIsModalOpen(true)
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Edit workflow"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteWorkflow(workflow.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Delete workflow"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Approval Sequence */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Approval Sequence</h4>
                  <div className="flex items-center space-x-2">
                    {workflow.approver_details.map((approver, index) => (
                      <div key={approver.id} className="flex items-center">
                        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-md">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{approver.full_name}</span>
                          <span className="text-xs text-gray-500">({approver.role})</span>
                        </div>
                        {index < workflow.approver_details.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conditional Rules */}
                {workflow.conditional_rules && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Conditional Rules</h4>
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Type:</strong> {workflow.conditional_rules.type}
                      </p>
                      {workflow.conditional_rules.percentage && (
                        <p className="text-sm text-blue-800">
                          <strong>Percentage:</strong> {workflow.conditional_rules.percentage}%
                        </p>
                      )}
                      {workflow.conditional_rules.specific_approver_id && (
                        <p className="text-sm text-blue-800">
                          <strong>Specific Approver:</strong> {
                            workflow.approver_details.find(a => a.id === workflow.conditional_rules?.specific_approver_id)?.full_name
                          }
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Workflow Modal */}
        {isModalOpen && (
          <WorkflowModal
            workflow={editingWorkflow}
            onClose={() => {
              setIsModalOpen(false)
              setEditingWorkflow(null)
            }}
            onSave={fetchWorkflows}
            companyId={profile?.company_id || ''}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

// Workflow Modal Component
function WorkflowModal({ 
  workflow, 
  onClose, 
  onSave, 
  companyId 
}: {
  workflow: ApprovalWorkflow | null
  onClose: () => void
  onSave: () => void
  companyId: string
}) {
  const [formData, setFormData] = useState({
    name: workflow?.name || '',
    approvers: workflow?.approvers || [],
    approvalSequence: workflow?.approval_sequence || [],
    conditionalRules: workflow?.conditional_rules || null,
  })
  const [availableApprovers, setAvailableApprovers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchApprovers()
  }, [])

  const fetchApprovers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, role')
        .eq('company_id', companyId)
        .in('role', ['manager', 'admin'])

      if (error) throw error
      setAvailableApprovers(data || [])
    } catch (error) {
      console.error('Error fetching approvers:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (workflow) {
        // Update existing workflow
        const { error } = await supabase
          .from('approval_workflows')
          .update({
            name: formData.name,
            approvers: formData.approvers,
            approval_sequence: formData.approvalSequence,
            conditional_rules: formData.conditionalRules,
          })
          .eq('id', workflow.id)

        if (error) throw error
        toast.success('Workflow updated successfully')
      } else {
        // Create new workflow
        const { error } = await supabase
          .from('approval_workflows')
          .insert({
            company_id: companyId,
            name: formData.name,
            approvers: formData.approvers,
            approval_sequence: formData.approvalSequence,
            conditional_rules: formData.conditionalRules,
          })

        if (error) throw error
        toast.success('Workflow created successfully')
      }

      onSave()
      onClose()
    } catch (error: any) {
      console.error('Error saving workflow:', error)
      toast.error(error.message || 'Failed to save workflow')
    } finally {
      setLoading(false)
    }
  }

  const addApprover = (approverId: string) => {
    if (!formData.approvers.includes(approverId)) {
      const newApprovers = [...formData.approvers, approverId]
      const newSequence = [...formData.approvalSequence, newApprovers.length]
      setFormData({
        ...formData,
        approvers: newApprovers,
        approvalSequence: newSequence,
      })
    }
  }

  const removeApprover = (index: number) => {
    const newApprovers = formData.approvers.filter((_, i) => i !== index)
    const newSequence = formData.approvalSequence
      .filter((_, i) => i !== index)
      .map((seq, i) => i + 1)
    
    setFormData({
      ...formData,
      approvers: newApprovers,
      approvalSequence: newSequence,
    })
  }

  const moveApprover = (fromIndex: number, toIndex: number) => {
    const newApprovers = [...formData.approvers]
    const newSequence = [...formData.approvalSequence]
    
    const [movedApprover] = newApprovers.splice(fromIndex, 1)
    const [movedSequence] = newSequence.splice(fromIndex, 1)
    
    newApprovers.splice(toIndex, 0, movedApprover)
    newSequence.splice(toIndex, 0, movedSequence)
    
    setFormData({
      ...formData,
      approvers: newApprovers,
      approvalSequence: newSequence,
    })
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {workflow ? 'Edit Workflow' : 'Create Workflow'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workflow Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approvers
              </label>
              <div className="space-y-2">
                {formData.approvers.map((approverId, index) => {
                  const approver = availableApprovers.find(a => a.id === approverId)
                  return (
                    <div key={approverId} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                      <span className="text-sm text-gray-600">#{index + 1}</span>
                      <span className="flex-1 text-sm text-gray-900">
                        {approver?.full_name} ({approver?.role})
                      </span>
                      <div className="flex space-x-1">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => moveApprover(index, index - 1)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            ↑
                          </button>
                        )}
                        {index < formData.approvers.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveApprover(index, index + 1)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            ↓
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeApprover(index)}
                          className="text-red-400 hover:text-red-600"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addApprover(e.target.value)
                      e.target.value = ''
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Add an approver...</option>
                  {availableApprovers
                    .filter(approver => !formData.approvers.includes(approver.id))
                    .map((approver) => (
                      <option key={approver.id} value={approver.id}>
                        {approver.full_name} ({approver.role})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || formData.approvers.length === 0}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
