'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  Receipt,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  CheckCircle,
  Clock,
  UserCheck,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Approvals', href: '/approvals', icon: CheckCircle },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Workflows', href: '/workflows', icon: UserCheck },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { profile, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const filteredNavigation = navigation.filter((item) => {
    if (!profile) return false
    
    // Admin can see everything
    if (profile.role === 'admin') return true
    
    // Manager can see dashboard, expenses, approvals, settings
    if (profile.role === 'manager') {
      return ['dashboard', 'expenses', 'approvals', 'settings'].includes(
        item.href.split('/')[1]
      )
    }
    
    // Employee can see dashboard, expenses, settings
    if (profile.role === 'employee') {
      return ['dashboard', 'expenses', 'settings'].includes(
        item.href.split('/')[1]
      )
    }
    
    return false
  })

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-white shadow-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          {isOpen ? <X className="h-6 w-6 text-gray-600" /> : <Menu className="h-6 w-6 text-gray-600" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:shadow-lg',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-indigo-600">
            <h1 className="text-xl font-bold text-white">ExpenseFlow</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {profile ? getInitials(profile.full_name) : 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {profile?.role || 'User'}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
