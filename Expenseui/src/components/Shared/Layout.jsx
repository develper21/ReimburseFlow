import { useState } from 'react'
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
  FileText
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, company, signOut, isAdmin, isManager } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
    { name: 'My Expenses', href: '/expenses', icon: Receipt, roles: ['employee', 'manager'] },
    { name: 'Approvals', href: '/approvals', icon: CheckSquare, roles: ['manager', 'admin'] },
    { name: 'All Expenses', href: '/all-expenses', icon: FileText, roles: ['admin', 'manager'] },
    { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
    { name: 'Approval Rules', href: '/rules', icon: Settings, roles: ['admin'] }
  ]

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(profile?.role)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <span className="text-xl font-bold text-primary-600">Expenseura</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
              {filteredNavigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.href)
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <span className="text-xl font-bold text-primary-600">Expenseura</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {filteredNavigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.href)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </button>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
              <p className="text-xs text-gray-500">{profile?.role}</p>
              <p className="text-xs text-gray-500">{company?.name}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-lg font-bold text-primary-600">Expenseura</span>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
