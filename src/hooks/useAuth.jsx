import { useState, useEffect, createContext, useContext } from 'react'
import { api, setToken, removeToken, getToken } from '../lib/api'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verify and load session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken()
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await api.get('/auth/me')
        if (response.success) {
          setUser(response.user)
          setProfile(response.user)
          setCompany(response.company)
        } else {
          removeToken()
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err.message)
        removeToken()
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Sign Up
  const signUp = async (email, password, fullName, companyName, country, baseCurrency) => {
    try {
      setLoading(true)
      const res = await api.post('/auth/register', {
        email,
        password,
        fullName,
        companyName,
        country: country || 'United States',
        baseCurrency: baseCurrency || 'USD'
      })

      if (res.success && res.token) {
        setToken(res.token)
        setUser(res.user)
        setProfile(res.user)
        setCompany(res.company)
        return { success: true }
      }
      return { success: false, error: res.message || 'Registration failed' }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Sign In with email & password
  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const res = await api.post('/auth/login', { email, password })

      if (res.success && res.token) {
        setToken(res.token)
        setUser(res.user)
        setProfile(res.user)
        setCompany(res.company)
        return { success: true }
      }
      return { success: false, error: res.message || 'Invalid credentials' }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // 1-Click Demo Sign In for Testing
  const demoSignIn = async (role = 'admin') => {
    try {
      setLoading(true)
      const res = await api.post('/auth/demo-login', { role })

      if (res.success && res.token) {
        setToken(res.token)
        setUser(res.user)
        setProfile(res.user)
        setCompany(res.company)
        return { success: true }
      }
      return { success: false, error: res.message }
    } catch (error) {
      console.error('Demo sign in error:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Sign Out
  const signOut = async () => {
    removeToken()
    setUser(null)
    setProfile(null)
    setCompany(null)
    return { success: true }
  }

  const value = {
    user,
    profile,
    company,
    loading,
    signUp,
    signIn,
    demoSignIn,
    signOut,
    isAdmin: profile?.role === 'admin',
    isManager: profile?.role === 'manager',
    isEmployee: profile?.role === 'employee'
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
