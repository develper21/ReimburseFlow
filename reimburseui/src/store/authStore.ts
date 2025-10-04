import { create } from 'zustand'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { User } from '@/types/database'

interface AuthState {
  user: SupabaseUser | null
  profile: User | null
  loading: boolean
  setUser: (user: SupabaseUser | null) => void
  setProfile: (profile: User | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  signOut: () => set({ user: null, profile: null, loading: false }),
}))
