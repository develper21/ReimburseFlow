'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { User } from '@/types/database'

interface AuthContextType {
  user: SupabaseUser | null
  profile: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, companyName: string, country: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, profile, loading, setUser, setProfile, setLoading, signOut: storeSignOut } = useAuthStore()

  useEffect(() => {
    // If Supabase is not configured, skip auth initialization
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, skipping auth initialization')
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('Error getting session:', error.message)
        setLoading(false)
        return
      }
      
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    }).catch((error) => {
      console.warn('Error in getSession:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      try {
        subscription.unsubscribe()
      } catch (error) {
        console.warn('Error unsubscribing from auth:', error)
      }
    }
  }, [setUser, setProfile, setLoading])

  const fetchUserProfile = async (userId: string) => {
    try {
      // Check if Supabase is properly configured before making database calls
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured, skipping user profile fetch')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // If user profile doesn't exist yet, that's okay for new signups
        if (error.code === 'PGRST116') {
          console.log('User profile not found - this is normal for new signups')
          setProfile(null)
        } else {
          console.warn('Error fetching user profile:', error.message)
        }
        setLoading(false)
        return
      }
      
      setProfile(data)
    } catch (error) {
      console.warn('Error fetching user profile:', error)
      // Don't throw error, just log it and continue
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please set up your environment variables.')
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, fullName: string, companyName: string, country: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please set up your environment variables.')
    }

    // Get currency based on country
    const currencyMap: Record<string, string> = {
      'US': 'USD',
      'GB': 'GBP',
      'EU': 'EUR',
      'IN': 'INR',
      'CA': 'CAD',
      'AU': 'AUD',
    }
    const currency = currencyMap[country] || 'USD'

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    if (data.user) {
      // Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          currency,
        })
        .select()
        .single()

      if (companyError) throw companyError

      // Create admin user
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email,
          full_name: fullName,
          role: 'admin',
          company_id: company.id,
          is_manager_approver: true,
        })

      if (userError) throw userError
    }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, signing out locally')
      storeSignOut()
      return
    }
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.warn('Error signing out:', error.message)
      }
    } catch (error) {
      console.warn('Error in signOut:', error)
    } finally {
      storeSignOut()
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
