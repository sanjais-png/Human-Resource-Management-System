import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  LogOut,
  LogIn,
  AlertCircle,
  Users,
  Search,
  Filter,
  RefreshCw,
  Zap
} from 'lucide-react'

export const AttendancePage = () => {
  const { user } = useAuth()
  const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR'

  const [activeTab, setActiveTab] = useState('my') // 'my' or 'all'
  const [todayAtt, setTodayAtt] = useState(null)
  const [myHistory, setMyHistory] = useState([])
  const [allAttendance, setAllAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Admin Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const fetchAttendanceData = async () => {
    setLoading(true)
    setError('')
    try {
      const [todayRes, historyRes] = await Promise.all([
        axios.get('/api/attendance/today'),
        axios.get('/api/attendance/history')
      ])
      setTodayAtt(todayRes.data)
      setMyHistory(historyRes.data)

      if (isAdminOrHR) {
        const params = {}
        if (searchQuery) params.search = searchQuery
        if (dateFilter) params.date_filter = dateFilter
        const allRes = await axios.get('/api/attendance/admin/all', { params })
        setAllAttendance(allRes.data)
      }
    } catch (err) {
      console.error('Failed to load attendance data:', err)
      setError('Failed to load attendance records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendanceData()
  }, [searchQuery, dateFilter, isAdminOrHR])

  const handleCheckIn = async () => {
    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await axios.post('/api/attendance/check-in', {})
      setTodayAtt(res.data)
      setSuccess('Successfully checked in for today!')
      fetchAttendanceData()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Check in failed.')
    } fontally: {
      setActionLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await axios.post('/api/attendance/check-out', {})
      setTodayAtt(res.data)
      setSuccess('Successfully checked out! Work hours calculated.')
      fetchAttendanceData()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Check out failed.')
    } finally {
      setActionLoading(false)
    }
  }

  const formatTime = (isoString) => {
    if (!isoString) return '--:--'
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return isoString.slice(11, 16)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} title="Attendance Management" />

        <main className="p-6 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">{success}</span>
            </div>
          )}

          {/* Admin / HR Tab Navigation */}
          {isAdminOrHR && (
            <div className="flex space-x-3 bg-white p-2 rounded-xl border border-slate-200 shadow-xs max-w-md">
              <button
                onClick={() => setActiveTab('my')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  activeTab === 'my'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                My Today's Punch & History
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  activeTab === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Employees Attendance
              </button>
            </div>
          )}

          {activeTab === 'my' ? (
            <>
              {/* Check In / Check Out Card Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <CalendarCheck className="w-6 h-6 text-indigo-400" />
                    <h2 className="text-xl font-extrabold tracking-tight">Today's Attendance Status</h2>
                  </div>
                  <p className="text-xs text-slate-300">
                    Date: <strong className="text-white font-mono">{new Date().toISOString().split('T')[0]}</strong> • Status: {' '}
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-900/80 text-emerald-200 border border-emerald-700">
                      {todayAtt ? todayAtt.status : 'Not Checked In'}
                    </span>
                  </p>

                  <div className="flex items-center space-x-6 pt-2 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-400">Check In Time: </span>
                      <strong className="text-white font-mono text-sm">{todayAtt?.check_in ? formatTime(todayAtt.check_in) : '--:--'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Check Out Time: </span>
                      <strong className="text-white font-mono text-sm">{todayAtt?.check_out ? formatTime(todayAtt.check_out) : '--:--'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Hours Logged: </span>
                      <strong className="text-emerald-400 font-mono text-sm">{todayAtt ? `${todayAtt.work_hours} hrs` : '0.0 hrs'}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 flex-shrink-0">
                  <button
                    onClick={handleCheckIn}
                    disabled={actionLoading || (todayAtt && !!todayAtt.check_in)}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-sm rounded-xl shadow-lg flex items-center space-x-2 transition border border-emerald-500"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Check In</span>
                  </button>

                  <button
                    onClick={handleCheckOut}
                    disabled={actionLoading || !todayAtt || !todayAtt.check_in || (todayAtt && !!todayAtt.check_out)}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-sm rounded-xl shadow-lg flex items-center space-x-2 transition border border-rose-500"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Check Out</span>
                  </button>
                </div>
              </div>

              {/* Personal Attendance History Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-indigo-600" /> My Attendance History
                  </h3>
                  <button onClick={fetchAttendanceData} className="p-1 text-slate-400 hover:text-slate-600">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-xs text-slate-500">Loading history...</div>
                ) : myHistory.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">No attendance records found yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4">Date</th>
                          <th className="py-3.5 px-4">Check In</th>
                          <th className="py-3.5 px-4">Check Out</th>
                          <th className="py-3.5 px-4">Work Hours</th>
                          <th className="py-3.5 px-4">Extra Hours</th>
                          <th className="py-3.5 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {myHistory.map(row => (
                          <tr key={row.id} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-4 font-bold text-slate-800">{row.date}</td>
                            <td className="py-3 px-4 text-emerald-700">{formatTime(row.check_in)}</td>
                            <td className="py-3 px-4 text-rose-700">{formatTime(row.check_out)}</td>
                            <td className="py-3 px-4 font-bold text-slate-800">{row.work_hours} hrs</td>
                            <td className="py-3 px-4 text-indigo-600">{row.extra_hours > 0 ? `+${row.extra_hours} hrs` : '0.0 hrs'}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                                row.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                                row.status === 'Leave' ? 'bg-amber-100 text-amber-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Admin All Attendance View */
            <div className="space-y-6">
              {/* Admin Search & Date Filter Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <span className="text-xs font-semibold text-slate-500 flex items-center">
                    <Filter className="w-4 h-4 mr-1 text-slate-400" /> Filter Date:
                  </span>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                  {dateFilter && (
                    <button
                      onClick={() => setDateFilter('')}
                      className="text-xs text-indigo-600 font-semibold hover:underline"
                    >
                      Clear Date
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-500">Total Logs: {allAttendance.length}</span>
                  <button onClick={fetchAttendanceData} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
                    <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Company Attendance Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center">
                    <Users className="w-4 h-4 mr-2 text-indigo-600" /> Company Attendance Logs
                  </h3>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-xs text-slate-500">Loading company logs...</div>
                ) : allAttendance.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">No attendance logs matching search criteria.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4">Employee</th>
                          <th className="py-3.5 px-4">Emp Code</th>
                          <th className="py-3.5 px-4">Department</th>
                          <th className="py-3.5 px-4">Date</th>
                          <th className="py-3.5 px-4">Check In</th>
                          <th className="py-3.5 px-4">Check Out</th>
                          <th className="py-3.5 px-4">Work Hours</th>
                          <th className="py-3.5 px-4">Extra Hours</th>
                          <th className="py-3.5 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allAttendance.map(row => (
                          <tr key={row.id} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-4 font-bold text-slate-800">{row.employee_name}</td>
                            <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{row.emp_code}</td>
                            <td className="py-3 px-4 text-slate-700">{row.department}</td>
                            <td className="py-3 px-4 font-mono font-semibold text-slate-800">{row.date}</td>
                            <td className="py-3 px-4 font-mono text-emerald-700">{formatTime(row.check_in)}</td>
                            <td className="py-3 px-4 font-mono text-rose-700">{formatTime(row.check_out)}</td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-800">{row.work_hours} hrs</td>
                            <td className="py-3 px-4 font-mono text-indigo-600">{row.extra_hours > 0 ? `+${row.extra_hours} hrs` : '0.0 hrs'}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                row.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                                row.status === 'Leave' ? 'bg-amber-100 text-amber-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
