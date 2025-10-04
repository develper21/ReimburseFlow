'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useCurrency } from '@/hooks/useCurrency'
import { supabase } from '@/lib/supabase'
import { Company } from '@/types/database'
import { 
  Building, 
  User, 
  Mail, 
  Save,
  Globe,
  DollarSign,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { profile, user } = useAuth()
  const { getAvailableCurrencies } = useCurrency()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    email: profile?.email || '',
    companyName: '',
    currency: 'USD',
  })
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([])

  useEffect(() => {
    if (profile) {
      fetchCompany()
      setFormData(prev => ({
        ...prev,
        fullName: profile.full_name,
        email: profile.email,
      }))
    }
    // Load available currencies
    const currencies = getAvailableCurrencies()
    setAvailableCurrencies(currencies)
  }, [profile, getAvailableCurrencies])

  const fetchCompany = async () => {
    if (!profile) return

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profile.company_id)
        .single()

      if (error) throw error
      
      setCompany(data)
      setFormData(prev => ({
        ...prev,
        companyName: data.name,
        currency: data.currency,
      }))
    } catch (error) {
      console.error('Error fetching company:', error)
      toast.error('Failed to fetch company details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    try {
      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: formData.fullName,
        })
        .eq('id', profile.id)

      if (userError) throw userError

      // Update company (only if admin)
      if (profile.role === 'admin') {
        const { error: companyError } = await supabase
          .from('companies')
          .update({
            name: formData.companyName,
            currency: formData.currency,
          })
          .eq('id', profile.company_id)

        if (companyError) throw companyError
      }

      toast.success('Settings updated successfully')
    } catch (error: any) {
      console.error('Error updating settings:', error)
      toast.error(error.message || 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow h-64"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account and company settings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    disabled
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Email cannot be changed. Contact support if you need to update your email.
                </p>
              </div>
            </div>
          </div>

          {/* Company Information */}
          {profile?.role === 'admin' && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Building className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Company Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Default Currency
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      {availableCurrencies.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    This will be the default currency for new expenses.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Account Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Globe className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Role:</span>
                <span className="font-medium capitalize">{profile?.role}</span>
              </div>
              <div className="flex justify-between">
                <span>Company:</span>
                <span className="font-medium">{company?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Member since:</span>
                <span className="font-medium">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
