import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { LogOut, UserCheck, ShieldCheck, ShieldAlert, KeyRound, Building2 } from 'lucide-react'

export const DashboardPage = () => {
  const { user, logout } = useAuth()
  const [apiMessage, setApiMessage] = useState(null)
  const [apiError, setApiError] = useState(null)

  const testProtected = async () => {
    setApiMessage(null)
    setApiError(null)
    try {
      const res = await axios.get('/api/auth/protected')
      setApiMessage(res.data.message)
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Request failed')
    }
  }

  const testAdminOnly = async () => {
    setApiMessage(null)
    setApiError(null)
    try {
      const res = await axios.get('/api/auth/admin-only')
      setApiMessage(res.data.message)
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Access Denied')
    }
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold border border-purple-200">ADMIN</span>
      case 'HR':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">HR</span>
      default:
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold border border-blue-200">EMPLOYEE</span>
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 text-lg">HRMS Portal</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <UserCheck className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-slate-900">{user?.full_name}</span>
            {getRoleBadge(user?.role)}
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-xl shadow border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome to HRMS Dashboard</h2>
          <p className="text-slate-600 text-sm mb-4">
            Hour 1 Authentication + RBAC state active. Signed in as <strong>{user?.email}</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                <KeyRound className="w-4 h-4 mr-1 text-indigo-600" /> Protected API Test
              </h3>
              <p className="text-xs text-slate-600 mb-3">
                Verifies your JWT bearer token with the backend.
              </p>
              <button
                onClick={testProtected}
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700 transition"
              >
                Call Protected API
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1 text-purple-600" /> Admin-Only RBAC Test
              </h3>
              <p className="text-xs text-slate-600 mb-3">
                Tests backend RBAC requirement (Requires ADMIN role).
              </p>
              <button
                onClick={testAdminOnly}
                className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded hover:bg-purple-700 transition"
              >
                Call Admin-Only API
              </button>
            </div>
          </div>

          {(apiMessage || apiError) && (
            <div className="mt-6">
              {apiMessage && (
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded text-sm text-emerald-800 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{apiMessage}</span>
                </div>
              )}
              {apiError && (
                <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded text-sm text-rose-800 flex items-center">
                  <ShieldAlert className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
