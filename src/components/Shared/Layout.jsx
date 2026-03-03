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
  ShieldCheck
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const ROLE_PRIMARY_ACTION = {
  employee: {
    label: 'Log an Expense',
    href: '/expenses',
    description: 'Create a submission in seconds',
    icon: Receipt
  },
  manager: {
    label: 'Review Approvals',
    href: '/approvals',
    description: 'Keep reimbursements moving',
    icon: CheckSquare
  },
  admin: {
    label: 'Manage Workforce',
    href: '/users',
    description: 'Bring new teammates online',
    icon: Users
  }
}

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, company, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
    { name: 'My Expenses', href: '/expenses', icon: Receipt, roles: ['employee', 'manager'] },
    { name: 'Approvals', href: '/approvals', icon: CheckSquare, roles: ['manager', 'admin'] },
    { name: 'All Expenses', href: '/all-expenses', icon: FileText, roles: ['admin', 'manager'] },
    { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
    { name: 'Approval Rules', href: '/rules', icon: Settings, roles: ['admin'] }
  ]

  const filteredNavigation = navigation.filter(item => item.roles.includes(profile?.role))

  const primaryAction = useMemo(() => {
    return ROLE_PRIMARY_ACTION[profile?.role] || null
  }, [profile?.role])

  const BrandAccent = (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center">
        <ShieldCheck className="h-5 w-5 text-primary-200" />
      </div>
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-primary-200">{company?.name || 'Expenseura'}</p>
        <p className="text-xl font-semibold text-white">ReimburseFlow</p>
      </div>
    </div>
  )

  const SidebarNav = ({ onNavigate }) => (
    <nav className="flex-1 px-4 py-6 space-y-1">
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
            className={`group w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 ${
              isActive
                ? 'bg-white/15 text-white shadow-card'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="flex items-center gap-3">
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary-200' : 'text-slate-400 group-hover:text-primary-200'}`} />
              {item.name}
            </span>
            <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-primary-300' : 'bg-transparent group-hover:bg-primary-200'}`} />
          </button>
        )
      })}
    </nav>
  )

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50">
      <div className="absolute inset-0 bg-grid-slate opacity-40" aria-hidden="true" />
      <div className="absolute inset-0 bg-mesh-primary opacity-60 mix-blend-screen" aria-hidden="true" />

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 flex flex-col w-72 h-full bg-slate-900/90 border-r border-white/10">
            <div className="flex items-center justify-between h-20 px-5 border-b border-white/5">
              {BrandAccent}
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="relative z-10 flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:w-72 xl:w-80 flex-col border-r border-white/5 bg-white/5 backdrop-blur-2xl">
          <div className="h-24 px-6 border-b border-white/5 flex items-center">
            {BrandAccent}
          </div>
          <div className="flex-1 overflow-y-auto">
            <SidebarNav />
          </div>
          <div className="border-t border-white/5 p-6 space-y-3">
            <div>
              <p className="text-sm font-medium text-white">{profile?.full_name}</p>
              <p className="text-xs text-slate-300 capitalize">{profile?.role}</p>
              <p className="text-xs text-slate-400">{company?.name}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 text-sm font-medium text-white hover:bg-white/20 transition"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <div className="lg:hidden sticky top-0 z-20 flex items-center justify-between h-16 px-4 border-b border-white/10 bg-slate-950/80 backdrop-blur">
            <button onClick={() => setSidebarOpen(true)} className="text-white">
              <Menu className="h-6 w-6" />
            </button>
            <span className="text-lg font-semibold">{company?.name || 'ReimburseFlow'}</span>
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-xs font-semibold">{profile?.full_name?.[0] || '?'}</span>
            </div>
          </div>

          <header className="border-b border-white/5 bg-white/5 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm text-primary-100 mb-2">Expense Intelligence</p>
                <h1 className="text-3xl font-semibold text-white">{company?.name || 'ReimburseFlow Workspace'}</h1>
                <p className="text-slate-300 mt-2 max-w-xl">
                  Track reimbursements, enforce approval workflows, and surface real-time spending signals across your organization.
                </p>
              </div>
              {primaryAction && (
                <button
                  onClick={() => navigate(primaryAction.href)}
                  className="w-full lg:w-auto px-6 py-4 rounded-2xl bg-primary-500 text-white font-semibold shadow-brand hover:bg-primary-400 transition"
                >
                  <div className="flex items-center gap-3">
                    {(() => {
                      const Icon = primaryAction.icon
                      return <Icon className="h-5 w-5" />
                    })()}
                    <div className="text-left">
                      <p>{primaryAction.label}</p>
                      <p className="text-sm font-normal text-white/80">{primaryAction.description}</p>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </header>

          <main className="flex-1">
            <div className="py-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
