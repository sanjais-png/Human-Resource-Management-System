import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import {
  Calendar as CalendarIcon,
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserCheck,
  UserX,
  FileSpreadsheet,
  Timer
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

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [liveShiftTime, setLiveShiftTime] = useState('00:00:00')

  const fetchAttendanceData = async () => {
    setLoading(true)
    setError('')
    try {
      const [todayRes, myRes] = await Promise.all([
        axios.get('/api/attendance/today'),
        axios.get('/api/attendance/my-history')
      ])
      setTodayAtt(todayRes.data)
      setMyHistory(myRes.data)

      if (isAdminOrHR) {
        const allRes = await axios.get('/api/attendance/all', {
          params: { date: selectedDate, search: searchQuery }
        })
        setAllAttendance(allRes.data)
      }
    } catch (err) {
      console.error('Failed to fetch attendance data:', err)
      setError('Failed to load attendance records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendanceData()
  }, [searchQuery, selectedDate, isAdminOrHR])

  // Live timer interval ticker for active check in
  useEffect(() => {
    if (!todayAtt || !todayAtt.check_in || todayAtt.check_out) {
      setLiveShiftTime('00:00:00')
      return
    }

    const updateLiveTimer = () => {
      try {
        const formattedIso = todayAtt.check_in.includes('T') ? todayAtt.check_in : todayAtt.check_in.replace(' ', 'T')
        const startTime = new Date(formattedIso).getTime()
        const now = new Date().getTime()
        const diffSeconds = Math.max(Math.floor((now - startTime) / 1000), 0)

        const hours = Math.floor(diffSeconds / 3600)
        const minutes = Math.floor((diffSeconds % 3600) / 60)
        const seconds = diffSeconds % 60

        const pad = (num) => String(num).padStart(2, '0')
        setLiveShiftTime(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`)
      } catch (e) {
        setLiveShiftTime('00:00:00')
      }
    }

    updateLiveTimer()
    const timerId = setInterval(updateLiveTimer, 1000)
    return () => clearInterval(timerId)
  }, [todayAtt])

  const handleCheckIn = async () => {
    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await axios.post('/api/attendance/check-in', {})
      setTodayAtt(res.data)
      setSuccess('Successfully checked in for today!')
      window.dispatchEvent(new Event('attendanceUpdated'))
      fetchAttendanceData()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Check in failed.')
    } finally {
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
      window.dispatchEvent(new Event('attendanceUpdated'))
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
      const formattedIso = isoString.includes('T') ? isoString : isoString.replace(' ', 'T')
      const d = new Date(formattedIso)
      if (isNaN(d.getTime())) return isoString.slice(11, 16) || isoString
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    } catch (e) {
      return isoString.slice(11, 16) || isoString
    }
  }

  // Summary Calculations per Excalidraw Image 4
  const daysPresent = myHistory.filter(h => h.status === 'Present').length
  const leavesCount = myHistory.filter(h => h.status === 'Leave').length
  const totalWorkingDays = myHistory.length || 22

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
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

          {/* Admin / HR Tab Toggle */}
          {isAdminOrHR && (
            <div className="flex space-x-3 bg-white p-1.5 rounded-xl border border-slate-200 max-w-md shadow-xs">
              <button
                onClick={() => setActiveTab('my')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  activeTab === 'my'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                My Punch & History
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  activeTab === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Admin Attendances List View
              </button>
            </div>
          )}

          {/* Employee Summary Stats Bar per Excalidraw Image 4 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Count of days present</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">{daysPresent} Days</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                🟢
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Leaves count</p>
                <p className="text-2xl font-extrabold text-amber-600 mt-0.5">{leavesCount} Days</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
                ✈️
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Total working days</p>
                <p className="text-2xl font-extrabold text-indigo-600 mt-0.5">{totalWorkingDays} Days</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
                <CalendarIcon className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Today's Punch Status</p>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  {todayAtt?.check_in ? (
                    todayAtt.check_out ? (
                      'Checked Out'
                    ) : (
                      <span className="text-emerald-600 font-mono flex items-center space-x-1">
                        <span>Checked In</span>
                        <span className="font-extrabold text-slate-900 ml-1">({liveShiftTime})</span>
                      </span>
                    )
                  ) : (
                    'Not Checked In'
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCheckIn}
                  disabled={actionLoading || (todayAtt && !!todayAtt.check_in)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white font-bold text-xs rounded-lg transition"
                >
                  Check IN
                </button>
                <button
                  onClick={handleCheckOut}
                  disabled={actionLoading || !todayAtt || !todayAtt.check_in || (todayAtt && !!todayAtt.check_out)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-30 text-white font-bold text-xs rounded-lg transition"
                >
                  Check Out
                </button>
              </div>
            </div>
          </div>

          {activeTab === 'my' ? (
            /* Employee Attendance View per Excalidraw Image 4 */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-indigo-600" /> Attendance Log History
                </h3>
                <span className="text-xs text-slate-500 font-mono">Date Range: {selectedDate}</span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-slate-500">Loading attendance history...</div>
              ) : myHistory.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No attendance records found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                      <tr>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4">Check In</th>
                        <th className="py-3.5 px-4">Check Out</th>
                        <th className="py-3.5 px-4">Work Hours</th>
                        <th className="py-3.5 px-4">Extra hours</th>
                        <th className="py-3.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {myHistory.map(row => (
                        <tr key={row.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 font-bold text-slate-900">{row.date}</td>
                          <td className="py-3 px-4 text-emerald-600 font-bold">{formatTime(row.check_in)}</td>
                          <td className="py-3 px-4 text-rose-600 font-bold">{formatTime(row.check_out)}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{row.work_hours} hrs</td>
                          <td className="py-3 px-4 text-indigo-600">{row.extra_hours > 0 ? `+${row.extra_hours} hrs` : '0.0 hrs'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-sans font-bold ${
                              row.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              row.status === 'Leave' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-rose-50 text-rose-700 border border-rose-200'
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
          ) : (
            /* Admin / HR Officer Attendance List View per Excalidraw Image 3 */
            <div className="space-y-4">
              {/* Date Controls & Searchbar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const d = new Date(selectedDate)
                      d.setDate(d.getDate() - 1)
                      setSelectedDate(d.toISOString().split('T')[0])
                    }}
                    className="p-2 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => {
                      const d = new Date(selectedDate)
                      d.setDate(d.getDate() + 1)
                      setSelectedDate(d.toISOString().split('T')[0])
                    }}
                    className="p-2 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Searchbar..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Attendances List View Table per Excalidraw Image 3 */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm">Attendances List view — For Admin/HR Officer</h3>
                  <span className="text-xs text-slate-500 font-mono">Date: {selectedDate}</span>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-xs text-slate-500">Loading company attendances...</div>
                ) : allAttendance.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">No attendance records found for this date.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3.5 px-4">Emp</th>
                          <th className="py-3.5 px-4">Check In</th>
                          <th className="py-3.5 px-4">Check Out</th>
                          <th className="py-3.5 px-4">Work Hours</th>
                          <th className="py-3.5 px-4">Extra hours</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {allAttendance.map(row => (
                          <tr key={row.id} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-4 font-bold text-slate-900 font-sans">
                              {row.employee_name}
                              <span className="block text-[10px] text-slate-400 font-mono">{row.emp_code}</span>
                            </td>
                            <td className="py-3 px-4 text-emerald-600 font-bold">{formatTime(row.check_in)}</td>
                            <td className="py-3 px-4 text-rose-600 font-bold">{formatTime(row.check_out)}</td>
                            <td className="py-3 px-4 font-bold text-slate-800">{row.work_hours} hrs</td>
                            <td className="py-3 px-4 text-indigo-600">{row.extra_hours > 0 ? `+${row.extra_hours} hrs` : '0.0 hrs'}</td>
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
