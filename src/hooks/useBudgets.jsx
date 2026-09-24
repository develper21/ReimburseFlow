import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export const useBudgets = () => {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const res = await api.get('/budgets')
      return res.data || []
    }
  })
}

export const useUpdateBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (budgetData) => {
      const res = await api.post('/budgets', budgetData)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    }
  })
}
