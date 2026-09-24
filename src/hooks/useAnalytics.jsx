import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export const useAnalyticsOverview = () => {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const res = await api.get('/analytics/overview')
      return res.data
    },
    refetchInterval: 30000 // Refresh every 30s
  })
}

export const useAuditLogs = () => {
  return useQuery({
    queryKey: ['analytics', 'audit'],
    queryFn: async () => {
      const res = await api.get('/analytics/audit')
      return res.data || []
    }
  })
}
