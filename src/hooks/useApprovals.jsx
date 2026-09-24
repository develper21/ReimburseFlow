import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

/**
 * Fetch pending approvals for current user
 */
export const usePendingApprovals = (approverId) => {
  return useQuery({
    queryKey: ['approvals', 'pending', approverId],
    queryFn: async () => {
      const res = await api.get('/approvals/pending')
      return res.data || []
    },
    enabled: !!approverId
  })
}

/**
 * Fetch approval history for an expense
 */
export const useExpenseApprovals = (expenseId) => {
  return useQuery({
    queryKey: ['approvals', 'expense', expenseId],
    queryFn: async () => {
      const res = await api.get(`/approvals/history/${expenseId}`)
      return res.data || []
    },
    enabled: !!expenseId
  })
}

/**
 * Process approval (approve or reject with comment)
 */
export const useProcessApproval = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ expenseId, action, comment }) => {
      const res = await api.post('/approvals/process', {
        expenseId,
        action,
        comment
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    }
  })
}

/**
 * Fetch approval rules for company
 */
export const useApprovalRules = (companyId) => {
  return useQuery({
    queryKey: ['approval-rules', companyId],
    queryFn: async () => {
      const res = await api.get('/rules')
      return res.data || []
    },
    enabled: !!companyId
  })
}

/**
 * Create approval rule
 */
export const useCreateApprovalRule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ruleData) => {
      const res = await api.post('/rules', ruleData)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-rules'] })
    }
  })
}

/**
 * Update approval rule
 */
export const useUpdateApprovalRule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ruleId, updates }) => {
      const res = await api.put(`/rules/${ruleId}`, updates)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-rules'] })
    }
  })
}

/**
 * Delete approval rule
 */
export const useDeleteApprovalRule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ruleId) => {
      const res = await api.delete(`/rules/${ruleId}`)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-rules'] })
    }
  })
}
