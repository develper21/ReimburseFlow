import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

/**
 * Fetch pending approvals for a user
 */
export const usePendingApprovals = (approverId) => {
  return useQuery({
    queryKey: ['approvals', 'pending', approverId],
    queryFn: async () => {
      // First get approvals
      const { data: approvals, error: approvalsError } = await supabase
        .from('expense_approvals')
        .select('*')
        .eq('approver_id', approverId)
        .eq('status', 'pending')
        .order('acted_at', { ascending: false })

      if (approvalsError) {
        console.error('Error fetching approvals:', approvalsError)
        throw approvalsError
      }

      if (!approvals || approvals.length === 0) {
        return []
      }

      // Then get expenses for those approvals
      const expenseIds = approvals.map(a => a.expense_id)
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .in('id', expenseIds)

      if (expensesError) {
        console.error('Error fetching expenses:', expensesError)
        throw expensesError
      }

      // Get creator profiles
      const creatorIds = expenses.map(e => e.created_by)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', creatorIds)

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
      }

      // Combine data
      const expenseMap = {}
      expenses.forEach(expense => {
        const creator = profiles?.find(p => p.id === expense.created_by)
        expenseMap[expense.id] = {
          ...expense,
          created_by_profile: creator
        }
      })

      return approvals.map(approval => ({
        ...approval,
        expense: expenseMap[approval.expense_id]
      }))
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
      const { data, error } = await supabase
        .from('expense_approvals')
        .select(`
          *,
          approver:profiles(full_name, role)
        `)
        .eq('expense_id', expenseId)
        .order('sequence_index', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!expenseId
  })
}

/**
 * Process approval (approve/reject)
 */
export const useProcessApproval = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ expenseId, approverId, action, comment }) => {
      const { data, error } = await supabase.rpc('process_approval', {
        p_expense_id: expenseId,
        p_approver_id: approverId,
        p_action: action,
        p_comment: comment
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    }
  })
}

/**
 * Fetch approval rules for a company
 */
export const useApprovalRules = (companyId) => {
  return useQuery({
    queryKey: ['approval-rules', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_rules')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
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
      const { data, error } = await supabase
        .from('approval_rules')
        .insert([ruleData])
        .select()
        .single()

      if (error) throw error
      return data
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
      const { data, error } = await supabase
        .from('approval_rules')
        .update(updates)
        .eq('id', ruleId)
        .select()
        .single()

      if (error) throw error
      return data
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
      const { error } = await supabase
        .from('approval_rules')
        .delete()
        .eq('id', ruleId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-rules'] })
    }
  })
}
