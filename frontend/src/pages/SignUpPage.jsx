import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import {
  Building2,
  Lock,
  Mail,
  User,
  Briefcase,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Upload,
  Sparkles,
  KeyRound,
  Send
} from 'lucide-react'

export const SignUpPage = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    company: 'Odoo India',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    role: 'EMPLOYEE',
    department: 'Engineering',
    job_position: 'Software Engineer',
    otp_code: ''
  })

  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [demoOtpNotice, setDemoOtpNotice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.email) {
      setError('Please enter your email address first.')
      return
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.')
      return
    }

    setOtpLoading(true)

    try {
      const res = await axios.post('/api/auth/send-otp', { email: formData.email })
      setOtpSent(true)
      setSuccess(res.data.message)
      if (res.data.otp_code) {
        setDemoOtpNotice(`(OTP generated: ${res.data.otp_code})`)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP email.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.otp_code) {
      setError('Please enter the 6-digit OTP sent to your email.')
      return
    }

    setLoading(true)

    try {
      const res = await axios.post('/api/auth/signup', formData)
      localStorage.setItem('token', res.data.access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`
      setSuccess('Account created successfully! Auto-generated Login ID assigned. Redirecting to dashboard...')
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1200)
    } catch (err) {
      setError(err.response?.data?.detail || 'Sign up failed. Please check your details and OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center space-x-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Dayflow HRMS</h1>
        </div>
        <h2 className="mt-3 text-center text-xs text-slate-400 font-medium">
          Sign Up with OTP Email Verification (supportauthoodo@gmail.com)
        </h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-700">
          {error && (
            <div className="mb-4 bg-rose-950/80 border-l-4 border-rose-500 p-3.5 rounded text-xs text-rose-300 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-emerald-950/80 border-l-4 border-emerald-500 p-3.5 rounded text-xs text-emerald-300 flex flex-col space-y-1">
              <div className="flex items-center font-bold">
                <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 text-emerald-400" />
                <span>{success}</span>
              </div>
              {demoOtpNotice && (
                <div className="mt-1 p-2 bg-emerald-900/60 rounded-lg text-emerald-200 font-mono text-sm font-extrabold text-center border border-emerald-500/50">
                  {demoOtpNotice}
                </div>
              )}
            </div>
          )}

          <div className="mb-4 p-3 bg-indigo-950/60 border border-indigo-700/60 rounded-xl text-xs text-indigo-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>Login ID will be <strong>auto-generated</strong> (e.g. <code>OIJODO20260001</code>)</span>
            </div>
          </div>

          <form className="space-y-3.5" onSubmit={otpSent ? handleSubmit : handleSendOTP}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">Company Name :-</label>
                <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition shadow-md">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Logo</span>
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </div>
              <input
                type="text"
                required
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-purple-500 font-medium"
                placeholder="Odoo India"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email (OTP Target)</label>
                <input
                  type="email"
                  required
                  disabled={otpSent}
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  placeholder="john.doe@company.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="+1 555-0199"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  disabled={otpSent}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  disabled={otpSent}
                  value={formData.confirm_password}
                  onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                <select
                  value={formData.role}
                  disabled={otpSent}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-purple-500 font-medium disabled:opacity-50"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="HR">HR Officer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  disabled={otpSent}
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
              </div>
            </div>

            {/* OTP Verification Input Box */}
            {otpSent && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-purple-300 mb-1 flex items-center">
                  <KeyRound className="w-4 h-4 mr-1 text-purple-400" /> Enter 6-Digit Verification OTP:
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={formData.otp_code}
                  onChange={e => setFormData({ ...formData, otp_code: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-900 border-2 border-purple-500 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-white focus:ring-2 focus:ring-purple-400"
                  placeholder="123456"
                />
              </div>
            )}

            {!otpSent ? (
              <button
                type="submit"
                disabled={otpLoading}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition shadow-lg mt-2"
              >
                <Send className="w-4 h-4" />
                <span>{otpLoading ? 'Sending Verification OTP...' : 'Send OTP to Email'}</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition shadow-lg mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? 'Verifying & Creating Account...' : 'Verify OTP & Complete Sign Up'}</span>
              </button>
            )}
          </form>

          <div className="mt-5 text-center text-xs">
            <span className="text-slate-400">Already have an account? </span>
            <Link to="/login" className="font-bold text-purple-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
