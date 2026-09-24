import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { convertCurrency } from '../lib/currency'

/**
 * Fetch expenses for current user
 */
export const useMyExpenses = (userId) => {
  return useQuery({
    queryKey: ['expenses', 'my', userId],
    queryFn: async () => {
      const res = await api.get('/expenses/my')
      return res.data || []
    },
    enabled: !!userId
  })
}

/**
 * Fetch all expenses for company (admin/manager view)
 */
export const useCompanyExpenses = (companyId, filters = {}) => {
  return useQuery({
    queryKey: ['expenses', 'company', companyId, filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.status && filters.status !== 'all') params.append('status', filters.status)
      if (filters.category && filters.category !== 'all') params.append('category', filters.category)
      if (filters.search) params.append('search', filters.search)
      if (filters.department && filters.department !== 'all') params.append('department', filters.department)

      const queryString = params.toString() ? `?${params.toString()}` : ''
      const res = await api.get(`/expenses/company${queryString}`)
      return res.data || []
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
      const res = await api.get(`/expenses/${expenseId}`)
      return res.data
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
        amount,
        currency,
        baseCurrency = 'USD'
      } = expenseData

      // Convert to base currency if needed
      let amountBase = amount
      let exchangeRate = 1
      if (currency !== baseCurrency) {
        amountBase = await convertCurrency(amount, currency, baseCurrency)
        exchangeRate = amount > 0 ? (amountBase / amount) : 1
      }

      const payload = {
        ...expenseData,
        amountBase,
        exchangeRate
      }

      const res = await api.post('/expenses', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    }
  })
}

/**
 * Upload receipt file to backend
 */
export const useUploadReceipt = () => {
  return useMutation({
    mutationFn: async ({ file }) => {
      const formData = new FormData()
      formData.append('receipt', file)

      const res = await api.post('/upload', formData)
      return res.data?.url || res.data?.path
    }
  })
}

/**
 * Helper to get receipt URL
 */
export const getReceiptUrl = async (path) => {
  return path || null
}

/**
 * Update expense (draft or pending)
 */
export const useUpdateExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ expenseId, updates }) => {
      const res = await api.put(`/expenses/${expenseId}`, updates)
      return res.data
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
      const res = await api.delete(`/expenses/${expenseId}`)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    }
  })
}
