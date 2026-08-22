import React from 'react'
import { useAuth } from '../context/AuthContext'
import { LogOut, Search, UserCheck } from 'lucide-react'

export const Header = ({ searchQuery, setSearchQuery, title = "Dashboard" }) => {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-4 flex-1 max-w-xl">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
        {setSearchQuery && (
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employees by name, department, position..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=6366f1&color=fff`}
            alt={user?.full_name}
            className="w-8 h-8 rounded-full border border-indigo-200"
          />
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-slate-800">{user?.full_name}</p>
            <p className="text-[10px] font-medium text-slate-500 uppercase">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-lg text-xs font-semibold border border-slate-200 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}
