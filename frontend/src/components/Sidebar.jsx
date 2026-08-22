import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Users,
  User,
  CalendarCheck,
  Clock,
  DollarSign,
  Building2
} from 'lucide-react'

export const Sidebar = () => {
  const { user } = useAuth()

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'HR', 'EMPLOYEE']
    },
    {
      name: 'Employees',
      path: '/employees',
      icon: Users,
      roles: ['ADMIN', 'HR', 'EMPLOYEE']
    },
    {
      name: 'My Profile',
      path: '/profile/me',
      icon: User,
      roles: ['ADMIN', 'HR', 'EMPLOYEE']
    },
    {
      name: 'Attendance',
      path: '/attendance',
      icon: CalendarCheck,
      roles: ['ADMIN', 'HR', 'EMPLOYEE']
    },
    {
      name: 'Time Off',
      path: '/time-off',
      icon: Clock,
      roles: ['ADMIN', 'HR', 'EMPLOYEE']
    },
    {
      name: 'Salary Info',
      path: '/salary',
      icon: DollarSign,
      roles: ['ADMIN'],
      badge: 'Admin Only'
    }
  ]

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col flex-shrink-0 border-r border-slate-800">
      <div className="p-5 flex items-center space-x-3 border-b border-slate-800">
        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-white tracking-wide text-lg">HRMS Portal</h1>
          <p className="text-xs text-slate-400">Enterprise Edition</p>
        </div>
      </div>

      <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400">Current Role:</span>
        <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
          user?.role === 'ADMIN' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
          user?.role === 'HR' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
          'bg-blue-950 text-blue-300 border border-blue-800'
        }`}>
          {user?.role}
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isAllowed = item.roles.includes(user?.role)
          if (!isAllowed) return null

          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded border border-purple-700/50">
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <p className="font-medium text-slate-400 mb-1">{user?.full_name}</p>
        <p className="truncate">{user?.email}</p>
      </div>
    </aside>
  )
}
