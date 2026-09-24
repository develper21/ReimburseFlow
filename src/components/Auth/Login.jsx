import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ShieldCheck, ArrowRight, Lock, Mail, Sparkles, Database, CheckCircle2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, demoSignIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn(email, password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || 'Invalid credentials. Please verify your email and password.')
    }
    setLoading(false)
  }

  const handleDemoLogin = async (role) => {
    setError('')
    setLoading(true)
    const result = await demoSignIn(role)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || `Could not log in as ${role}. Please ensure the backend is running.`)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Grids & Ambient Glow */}
      <div className="absolute inset-0 bg-aw-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-aw-mesh opacity-70 pointer-events-none" />

      {/* Decorative Glow Blob */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-[#fd366e]/20 to-[#fe9567]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-2xl bg-[#131316] border border-white/15 p-2.5 shadow-aw-glow flex items-center justify-center mb-4">
            <svg className="h-full w-full" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="22" fill="#fd366e" opacity="0.25" />
              <path d="M16 26C16 19.37 21.37 14 28 14H36C42.63 14 48 19.37 48 26C48 31 44.5 35 40 37L24 43C19.5 45 16 49 16 54" stroke="url(#login-rf-glow)" strokeWidth="6" strokeLinecap="round" />
              <circle cx="44" cy="44" r="5" fill="#fe9567" />
              <defs>
                <linearGradient id="login-rf-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fd366e" />
                  <stop offset="100%" stopColor="#fe9567" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight font-display">
            Sign in to ReimburseFlow
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Enterprise reimbursement intelligence powered by{' '}
            <span className="text-white font-mono font-medium">MongoDB Atlas</span>
          </p>
        </div>

        {/* 1-Click Demo Accounts Quick Selector */}
        <div className="mt-6 mx-4 sm:mx-0 p-4 rounded-2xl bg-[#131316]/90 border border-white/10 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#fd366e]" />
              1-Click Demo Testing
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Ready to test
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="px-2.5 py-2 rounded-xl bg-white/[0.04] hover:bg-[#fd366e]/15 border border-white/[0.08] hover:border-[#fd366e]/40 transition text-left group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#fd366e] font-semibold">Admin</span>
                <CheckCircle2 className="h-3 w-3 text-zinc-500 group-hover:text-[#fd366e]" />
              </div>
              <p className="text-xs font-medium text-white mt-1">Alex Vance</p>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('manager')}
              disabled={loading}
              className="px-2.5 py-2 rounded-xl bg-white/[0.04] hover:bg-blue-500/15 border border-white/[0.08] hover:border-blue-500/40 transition text-left group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-blue-400 font-semibold">Manager</span>
                <CheckCircle2 className="h-3 w-3 text-zinc-500 group-hover:text-blue-400" />
              </div>
              <p className="text-xs font-medium text-white mt-1">Sarah Connor</p>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('employee')}
              disabled={loading}
              className="px-2.5 py-2 rounded-xl bg-white/[0.04] hover:bg-emerald-500/15 border border-white/[0.08] hover:border-emerald-500/40 transition text-left group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">Employee</span>
                <CheckCircle2 className="h-3 w-3 text-zinc-500 group-hover:text-emerald-400" />
              </div>
              <p className="text-xs font-medium text-white mt-1">John Doe</p>
            </button>
          </div>
        </div>

        {/* Regular Login Card */}
        <div className="mt-4 mx-4 sm:mx-0 bg-[#131316]/80 backdrop-blur-2xl py-8 px-6 sm:px-8 border border-white/10 rounded-3xl shadow-aw-glow-card">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="aw-input w-full pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
            </div>

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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="aw-input w-full pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="aw-btn-primary w-full py-3 text-sm font-semibold mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Sign In to Console</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/[0.08] text-center">
            <p className="text-xs text-zinc-400">
              Need a new workspace for your organization?{' '}
              <Link to="/signup" className="text-[#fd366e] font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
