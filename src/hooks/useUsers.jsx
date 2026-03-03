import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

/**
 * Fetch all users in a company
 */
export const useCompanyUsers = (companyId) => {
  return useQuery({
    queryKey: ['users', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          manager:profiles!profiles_manager_id_fkey(full_name)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!companyId
  })
}

/**
 * Fetch managers in a company (for assignment)
 */
export const useManagers = (companyId) => {
  return useQuery({
    queryKey: ['managers', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('company_id', companyId)
        .in('role', ['admin', 'manager'])
        .order('full_name', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!companyId
  })
}

/**
 * Create a new user (admin only)
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userData) => {
      const { email, password, fullName, role, companyId, managerId } = userData

      // Step 1: Sign up the user (this creates auth user)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user')

      // Step 2: Create/Update profile with role and company
      const { data, error } = await supabase
        .from('profiles')
        .upsert([{
          id: authData.user.id,
          full_name: fullName,
          role,
          company_id: companyId,
          manager_id: managerId || null
        }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

/**
 * Update user profile
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, updates }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

/**
 * Delete user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId) => {
      // Delete profile (auth user will remain but won't have access)
      // Note: For full deletion, you need a server-side function
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}
