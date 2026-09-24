import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Building, Mail, Lock, User, Globe, DollarSign, ArrowRight, ShieldCheck } from 'lucide-react'
import { SUPPORTED_CURRENCIES } from '../../lib/currency'

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    country: 'United States',
    baseCurrency: 'USD'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    const result = await signUp(
      formData.email,
      formData.password,
      formData.fullName,
      formData.companyName,
      formData.country,
      formData.baseCurrency
    )

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || 'Failed to create workspace. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Grids & Ambient Glow */}
      <div className="absolute inset-0 bg-aw-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-aw-mesh opacity-70 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-[#131316] border border-white/15 p-2.5 shadow-aw-glow flex items-center justify-center mb-3">
            <svg className="h-full w-full" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="22" fill="#fd366e" opacity="0.25" />
              <path d="M16 26C16 19.37 21.37 14 28 14H36C42.63 14 48 19.37 48 26C48 31 44.5 35 40 37L24 43C19.5 45 16 49 16 54" stroke="url(#signup-rf-glow)" strokeWidth="6" strokeLinecap="round" />
              <circle cx="44" cy="44" r="5" fill="#fe9567" />
              <defs>
                <linearGradient id="signup-rf-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fd366e" />
                  <stop offset="100%" stopColor="#fe9567" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight font-display">
            Create your organization workspace
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Set up your organization, currencies, and initial administrator account.
          </p>
        </div>

        <div className="mx-4 sm:mx-0 bg-[#131316]/80 backdrop-blur-2xl py-8 px-6 sm:px-8 border border-white/10 rounded-3xl shadow-aw-glow-card">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-300">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Company / Organization Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Building className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Acme Global Inc"
                    className="aw-input w-full pl-10 pr-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Your Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    className="aw-input w-full pl-10 pr-4 py-2.5 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Country
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Globe className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="United States"
                    className="aw-input w-full pl-10 pr-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Base Accounting Currency
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <select
                    name="baseCurrency"
                    value={formData.baseCurrency}
                    onChange={handleChange}
                    className="aw-input w-full pl-10 pr-4 py-2.5 text-sm bg-[#131316]"
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-[#131316]">
                        {c.code} - {c.name} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Admin Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@company.com"
                  className="aw-input w-full pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="aw-input w-full pl-10 pr-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className="aw-input w-full pl-10 pr-4 py-2.5 text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="aw-btn-primary w-full py-3 text-sm font-semibold mt-4 shadow-aw-button"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Workspace...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Create Workspace & Admin Account</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/[0.08] text-center">
            <p className="text-xs text-zinc-400">
              Already have an organization workspace?{' '}
              <Link to="/login" className="text-[#fd366e] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
