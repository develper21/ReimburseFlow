import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

/**
 * Fetch all users in company
 */
export const useCompanyUsers = (companyId) => {
  return useQuery({
    queryKey: ['users', companyId],
    queryFn: async () => {
      const res = await api.get('/users')
      return res.data || []
    },
    enabled: !!companyId
  })
}

/**
 * Fetch managers/approvers in company
 */
export const useManagers = (companyId) => {
  return useQuery({
    queryKey: ['managers', companyId],
    queryFn: async () => {
      const res = await api.get('/users/managers')
      return res.data || []
    },
    enabled: !!companyId
  })
}

/**
 * Create new user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userData) => {
      const res = await api.post('/users', userData)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['managers'] })
    }
  })
}

/**
 * Update user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, updates }) => {
      const res = await api.put(`/users/${userId}`, updates)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['managers'] })
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
      const res = await api.delete(`/users/${userId}`)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['managers'] })
    }
  })
}
