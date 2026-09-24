import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  CheckSquare,
  FileText,
  BarChart3,
  History,
  Plus,
  ExternalLink,
  Database,
  Building,
  ChevronRight,
  ShieldAlert
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, company, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  // Appwrite Console Navigation Structure
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
    { name: 'My Expenses', href: '/expenses', icon: Receipt, roles: ['employee', 'manager'] },
    { name: 'Approvals Hub', href: '/approvals', icon: CheckSquare, roles: ['manager', 'admin'] },
    { name: 'All Expenses', href: '/all-expenses', icon: FileText, roles: ['admin', 'manager'] },
    { name: 'Analytics & Budgets', href: '/analytics', icon: BarChart3, roles: ['admin', 'manager'] },
    { name: 'Team Members', href: '/users', icon: Users, roles: ['admin'] },
    { name: 'Approval Rules', href: '/rules', icon: Settings, roles: ['admin'] },
    { name: 'Activity Audit', href: '/audit', icon: History, roles: ['admin', 'manager'] }
  ]

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(profile?.role || 'employee')
  )

  // Current page title from pathname
  const currentPage = navigation.find((item) => item.href === location.pathname)?.name || 'Dashboard'

  // Appwrite-style logo brand header
  const BrandLogo = (
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
      <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-[#131316] border border-white/10 shadow-aw-glow">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[#fd366e]/30 to-[#fe9567]/30 blur-sm" />
        <svg className="relative h-6 w-6" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="22" fill="#fd366e" opacity="0.25" />
          <path d="M16 26C16 19.37 21.37 14 28 14H36C42.63 14 48 19.37 48 26C48 31 44.5 35 40 37L24 43C19.5 45 16 49 16 54" stroke="url(#nav-rf-glow)" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="44" cy="44" r="5" fill="#fe9567" />
          <defs>
            <linearGradient id="nav-rf-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fd366e" />
              <stop offset="100%" stopColor="#fe9567" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-white tracking-tight">ReimburseFlow</span>
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#fd366e]/15 border border-[#fd366e]/30 text-[#fd366e]">
            v2.0
          </span>
        </div>
        <p className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
          <Database className="h-3 w-3 text-emerald-400" />
          Mongo Atlas
        </p>
      </div>
    </div>
  )

  // Navigation Items
  const SidebarNav = ({ onNavigate }) => (
    <div className="flex-1 flex flex-col justify-between px-3 py-4">
      <div className="space-y-1">
        {/* Workspace Quick Indicator */}
        <div className="mb-4 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center shrink-0">
              <Building className="h-3.5 w-3.5 text-[#fd366e]" />
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-white truncate">{company?.name || 'Workspace'}</p>
              <p className="text-[10px] text-zinc-400 font-mono">{company?.baseCurrency || 'USD'} • {profile?.role?.toUpperCase()}</p>
            </div>
          </div>
        </div>

        <p className="px-3 text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2">
          Workspace Navigation
        </p>

        {filteredNavigation.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          return (
            <button
              key={item.name}
              onClick={() => {
                navigate(item.href)
                onNavigate?.()
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-[#fd366e]/15 to-[#fe9567]/10 text-white border border-[#fd366e]/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive ? 'text-[#fd366e]' : 'text-zinc-400 group-hover:text-zinc-200'
                  }`}
                />
                <span className="font-sans">{item.name}</span>
              </div>
              {isActive && (
                <div className="h-1.5 w-1.5 rounded-full bg-[#fd366e] shadow-[0_0_8px_#fd366e]" />
              )}
            </button>
          )
        })}
      </div>

      {/* User profile & Logout */}
      <div className="mt-6 pt-4 border-t border-white/[0.08] space-y-3">
        <div className="px-2 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-lg bg-[#fd366e]/20 border border-[#fd366e]/40 flex items-center justify-center font-bold text-xs text-[#fd366e] shrink-0">
              {profile?.fullName?.[0] || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{profile?.fullName}</p>
              <p className="text-[10px] text-zinc-400 truncate">{profile?.email}</p>
            </div>
          </div>
          <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${
            profile?.role === 'admin'
              ? 'bg-[#fd366e]/10 text-[#fd366e] border-[#fd366e]/30'
              : profile?.role === 'manager'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
          }`}>
            {profile?.role}
          </span>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] relative flex flex-col font-sans">
      {/* Background Appwrite Subtle Mesh & Grid */}
      <div className="fixed inset-0 bg-aw-grid pointer-events-none opacity-40 z-0" />
      <div className="fixed inset-0 bg-aw-mesh pointer-events-none opacity-50 z-0" />

      {/* Mobile Sidebar Modal */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 flex flex-col w-72 h-full bg-[#0d0d10] border-r border-white/10 shadow-2xl">
            <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
              {BrandLogo}
              <button onClick={() => setSidebarOpen(false)} className="text-zinc-400 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* App Structure */}
      <div className="relative z-10 flex flex-1 min-h-screen">
        {/* Desktop Appwrite Console Sidebar */}
        <aside className="hidden lg:flex lg:w-64 xl:w-72 flex-col border-r border-white/[0.08] bg-[#0d0d10]/90 backdrop-blur-xl shrink-0">
          <div className="h-16 px-5 border-b border-white/[0.08] flex items-center">
            {BrandLogo}
          </div>
          <SidebarNav />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar Navigation */}
          <header className="sticky top-0 z-30 h-16 border-b border-white/[0.08] bg-[#09090b]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="hidden sm:inline-block text-zinc-300 font-sans font-medium">ReimburseFlow</span>
                <ChevronRight className="h-3 w-3 text-zinc-500 hidden sm:inline-block" />
                <span className="text-white font-medium">{currentPage}</span>
              </div>
            </div>

            {/* Top Right Quick Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Mongo Atlas Engine
              </div>

              {(profile?.role === 'employee' || profile?.role === 'manager') && (
                <button
                  onClick={() => navigate('/expenses')}
                  className="aw-btn-primary px-3.5 py-1.5 text-xs font-semibold shadow-aw-button"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Log Expense</span>
                </button>
              )}
            </div>
          </header>

          {/* Page Content Body */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl w-full mx-auto">
            {children}
          </main>

          {/* Appwrite-styled Subtle Footer */}
          <footer className="border-t border-white/[0.06] py-4 px-6 text-center text-xs text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="flex items-center gap-1.5">
              <span>ReimburseFlow Platform</span>
              <span>•</span>
              <span className="text-[#fd366e]">Appwrite Design Language</span>
            </p>
            <p className="font-mono text-[11px] text-zinc-400">
              MongoDB Atlas • Express Node.js Engine
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
