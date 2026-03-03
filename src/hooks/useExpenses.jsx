import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { convertCurrency } from '../lib/currency'

/**
 * Fetch expenses for the current user
 */
export const useMyExpenses = (userId) => {
  return useQuery({
    queryKey: ['expenses', 'my', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!userId
  })
}

/**
 * Fetch all expenses for a company (admin/manager view)
 */
export const useCompanyExpenses = (companyId, filters = {}) => {
  return useQuery({
    queryKey: ['expenses', 'company', companyId, filters],
    queryFn: async () => {
      let query = supabase
        .from('expenses')
        .select('*, created_by_profile:profiles!expenses_created_by_fkey(full_name)')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    enabled: !!companyId
  })
}

/**
 * Fetch single expense details
 */
export const useExpense = (expenseId) => {
  return useQuery({
    queryKey: ['expense', expenseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          created_by_profile:profiles!expenses_created_by_fkey(full_name, role),
          approvals:expense_approvals(
            *,
            approver:profiles(full_name, role)
          )
        `)
        .eq('id', expenseId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!expenseId
  })
}

/**
 * Create a new expense
 */
export const useCreateExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (expenseData) => {
      const {
        companyId,
        userId,
        description,
        category,
        dateOfExpense,
        amount,
        currency,
        baseCurrency,
        paidBy,
        receiptPath,
        approvalRuleId
      } = expenseData

      // Convert to base currency
      let amountBase = amount
      if (currency !== baseCurrency) {
        amountBase = await convertCurrency(amount, currency, baseCurrency)
      }

      // Insert expense
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert([{
          company_id: companyId,
          created_by: userId,
          description,
          category,
          date_of_expense: dateOfExpense,
          amount,
          currency,
          amount_base: amountBase,
          base_currency: baseCurrency,
          paid_by: paidBy,
          status: 'pending',
          receipt_path: receiptPath,
          approval_rule_id: approvalRuleId
        }])
        .select()
        .single()

      if (expenseError) throw expenseError

      // Get approval rule to create approval records (if provided)
      if (approvalRuleId) {
        const { data: rule, error: ruleError } = await supabase
          .from('approval_rules')
          .select('*')
          .eq('id', approvalRuleId)
          .single()

        if (ruleError) {
          console.error('Error fetching approval rule:', ruleError)
          // Continue without approvals if rule not found
        } else {
          console.log('Approval rule found:', rule)
          
          // Create approval records
          const approvals = []
          let sequenceIndex = 0

          // Add manager if required
          if (rule.is_manager_approver) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('manager_id')
              .eq('id', userId)
              .single()

            console.log('User profile for manager lookup:', profile)

            if (profileError) {
              console.error('Error fetching user profile:', profileError)
            } else if (profile?.manager_id) {
              console.log('Adding manager as approver:', profile.manager_id)
              approvals.push({
                expense_id: expense.id,
                approver_id: profile.manager_id,
                sequence_index: sequenceIndex++,
                status: 'pending'
              })
            } else {
              console.warn('No manager assigned to user')
            }
          }

          // Add configured approvers
          if (rule.approver_ids && rule.approver_ids.length > 0) {
            console.log('Adding configured approvers:', rule.approver_ids)
            for (const approverId of rule.approver_ids) {
              approvals.push({
                expense_id: expense.id,
                approver_id: approverId,
                sequence_index: sequenceIndex++,
                status: 'pending'
              })
            }
          }

          console.log('Total approvals to create:', approvals)

          if (approvals.length > 0) {
            const { error: approvalsError } = await supabase
              .from('expense_approvals')
              .insert(approvals)

            if (approvalsError) {
              console.error('Error creating approvals:', approvalsError)
              throw approvalsError
            } else {
              console.log('Approvals created successfully')
            }
          } else {
            console.warn('No approvals created - check approval rule configuration')
          }
        }
      } else {
        console.warn('No approval rule ID provided')
      }

      return expense
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    }
  })
}

/**
 * Upload receipt to Supabase Storage
 */
export const useUploadReceipt = () => {
  return useMutation({
    mutationFn: async ({ file, userId }) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Storage upload error:', error)
        throw new Error(`Upload failed: ${error.message}`)
      }

      return data.path
    }
  })
}

/**
 * Get signed URL for receipt
 */
export const getReceiptUrl = async (path) => {
  if (!path) return null

  const { data, error } = await supabase.storage
    .from('receipts')
    .createSignedUrl(path, 3600) // 1 hour expiry

  if (error) {
    console.error('Error getting receipt URL:', error)
    return null
  }

  return data.signedUrl
}

/**
 * Update expense (draft only)
 */
export const useUpdateExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ expenseId, updates }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', expenseId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    }
  })
}

/**
 * Delete expense
 */
export const useDeleteExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (expenseId) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    }
  })
}
