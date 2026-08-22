import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Building2, Lock, Mail, AlertCircle, UserCheck, KeyRound } from 'lucide-react'

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your Login ID/Email or password.')
    } finally {
      setLoading(false)
    }
  }

  const quickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail)
    setPassword(demoPass)
    setError('')
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center space-x-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Dayflow HRMS</h1>
        </div>
        <h2 className="mt-4 text-center text-xs text-slate-400 font-medium">
          Sign In Page — Enter your Auto-Generated Login ID or Email
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-700">
          {error && (
            <div className="mb-4 bg-rose-950/80 border-l-4 border-rose-500 p-3.5 rounded text-xs text-rose-300 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Login ID / Email :-</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs text-white placeholder-slate-500 font-mono"
                  placeholder="OIJODO20240001 or name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password :-</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs text-white placeholder-slate-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Authenticating...' : 'SIGN IN'}
            </button>
          </form>

          <div className="mt-4 text-center text-xs">
            <span className="text-slate-400">Don't have an account? </span>
            <Link to="/signup" className="font-bold text-purple-400 hover:underline">
              Sign Up
            </Link>
          </div>

          <div className="mt-6 border-t border-slate-700 pt-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
              <UserCheck className="w-3.5 h-3.5 mr-1 text-purple-400" /> Quick Fill Demo Accounts:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickFill('admin@hrms.com', 'admin123')}
                className="py-1.5 px-2 bg-slate-900 hover:bg-slate-700 text-purple-300 border border-slate-700 text-[11px] font-semibold rounded transition text-center"
              >
                Admin (admin@hrms.com)
              </button>
              <button
                type="button"
                onClick={() => quickFill('hr@hrms.com', 'hr123456')}
                className="py-1.5 px-2 bg-slate-900 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-[11px] font-semibold rounded transition text-center"
              >
                HR (hr@hrms.com)
              </button>
              <button
                type="button"
                onClick={() => quickFill('john@hrms.com', 'emp123456')}
                className="py-1.5 px-2 bg-slate-900 hover:bg-slate-700 text-blue-300 border border-slate-700 text-[11px] font-semibold rounded transition text-center"
              >
                Employee (john@hrms.com)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
