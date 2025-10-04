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

      // Try to fetch user profile with better error handling
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle() // Use maybeSingle() instead of single() to handle missing records gracefully

      if (error) {
        // Handle specific error cases
        if (error.code === 'PGRST116' || error.message.includes('406')) {
          console.log('User profile not found - this is normal for new signups or users without profiles')
        } else {
          console.warn('Error fetching user profile:', error.message)
        }
        setProfile(null)
        setLoading(false)
        return
      }

      if (!data) {
        console.log('User profile not found - this is normal for new signups')
        setProfile(null)
        setLoading(false)
        return
      }
      
      setProfile(data)
    } catch (error: any) {
      console.warn('Error fetching user profile:', error?.message || error)
      setProfile(null)
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

    // Call the server-side signup API
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        fullName,
        companyName,
        country,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create account')
    }

    // Sign in the user after successful signup
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
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
