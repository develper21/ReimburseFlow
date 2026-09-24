import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Layout from './components/Shared/Layout'
import Login from './components/Auth/Login'
import SignUp from './components/Auth/SignUp'
import Dashboard from './pages/Dashboard'
import ExpensesPage from './pages/ExpensesPage'
import ApprovalsPage from './pages/ApprovalsPage'
import AllExpensesPage from './pages/AllExpensesPage'
import UsersPage from './pages/UsersPage'
import RulesPage from './pages/RulesPage'
import AnalyticsPage from './pages/AnalyticsPage'
import AuditPage from './pages/AuditPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 2 * 60 * 1000
    }
  }
})

function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 border-2 border-[#fd366e] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-zinc-400">Authenticating session...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(profile?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Layout>{children}</Layout>
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 border-2 border-[#fd366e] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-zinc-400">Loading...</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/expenses"
        element={
          <ProtectedRoute allowedRoles={['employee', 'manager', 'admin']}>
            <ExpensesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/approvals"
        element={
          <ProtectedRoute allowedRoles={['manager', 'admin']}>
            <ApprovalsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/all-expenses"
        element={
          <ProtectedRoute allowedRoles={['manager', 'admin']}>
            <AllExpensesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute allowedRoles={['manager', 'admin']}>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/rules"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <RulesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/audit"
        element={
          <ProtectedRoute allowedRoles={['manager', 'admin']}>
            <AuditPage />
          </ProtectedRoute>
        }
      />

      {/* Default Fallback Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}
