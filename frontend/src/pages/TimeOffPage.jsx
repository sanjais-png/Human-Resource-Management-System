import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import {
  Clock,
  Calendar,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Check,
  X,
  FileText,
  Upload,
  Search
} from 'lucide-react'

export const TimeOffPage = () => {
  const { user } = useAuth()
  const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR'

  const [balance, setBalance] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    leave_type: 'Paid Time Off',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: '',
    attachment_name: ''
  })

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [balRes, reqsRes] = await Promise.all([
        axios.get('/api/time-off/balance'),
        axios.get('/api/time-off/requests')
      ])
      setBalance(balRes.data)
      setRequests(reqsRes.data)
    } catch (err) {
      console.error('Error loading time off data:', err)
      setError('Failed to load leave records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const calculateDays = (start, end) => {
    const d1 = new Date(start)
    const d2 = new Date(end)
    const diff = Math.max(0, (d2 - d1) / (1000 * 60 * 60 * 24) + 1)
    return diff.toFixed(2)
  }

  const handleSubmitRequest = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    setError('')
    setSuccess('')
    try {
      await axios.post('/api/time-off/requests', formData)
      setSuccess('Time Off request submitted successfully!')
      setShowModal(false)
      setFormData({
        leave_type: 'Paid Time Off',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        reason: '',
        attachment_name: ''
      })
      fetchData()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit request.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleReview = async (requestId, status) => {
    setError('')
    setSuccess('')
    try {
      await axios.put(`/api/time-off/requests/${requestId}/review`, { status })
      setSuccess(`Request #${requestId} has been ${status.toLowerCase()}.`)
      fetchData()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Review action failed.')
    }
  }

  const filteredRequests = requests.filter(req => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      (req.employee_name && req.employee_name.toLowerCase().includes(q)) ||
      (req.leave_type && req.leave_type.toLowerCase().includes(q)) ||
      (req.status && req.status.toLowerCase().includes(q))
    )
  })

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Time Off Management" />

        <main className="p-6 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {error && (
            <div className="p-4 bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="font-semibold">{success}</span>
            </div>
          )}

          {/* Available Leave Stats Cards per Excalidraw */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-md flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-sky-400 uppercase tracking-wider">Paid Time Off</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{balance?.paid_time_off ?? 24} Days Available</h3>
                <p className="text-[11px] text-slate-400 mt-1">Annual paid leave quota</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-950/60 text-sky-400 border border-sky-800/50 flex items-center justify-center font-bold">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-md flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Sick Leave</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{balance?.sick_leave ?? 7} Days Available</h3>
                <p className="text-[11px] text-slate-400 mt-1">Medical & wellness leave</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/50 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-md flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Unpaid Leave</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{balance?.unpaid_leave ?? 30} Days Available</h3>
                <p className="text-[11px] text-slate-400 mt-1">Approved unpaid days</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800/50 flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Controls Bar & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={() => setShowModal(true)}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>NEW</span>
              </button>

              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Searchbar..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <p className="text-xs text-slate-400 italic text-right">
              {isAdminOrHR ? "Admins/HR can view & approve/reject leave requests for all employees" : "Employees can view only their own time off records"}
            </p>
          </div>

          {/* Table per Excalidraw Image 1 */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading leave requests...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No time off records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-700">
                    <tr>
                      <th className="py-3.5 px-4">Name</th>
                      <th className="py-3.5 px-4">Start Date</th>
                      <th className="py-3.5 px-4">End Date</th>
                      <th className="py-3.5 px-4">Time off Type</th>
                      <th className="py-3.5 px-4">Status</th>
                      {isAdminOrHR && <th className="py-3.5 px-4 text-center">Reject & Approve</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredRequests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-700/40 transition">
                        <td className="py-3 px-4 font-bold text-white">
                          {req.employee_name || 'My Self'}
                          <span className="block text-[10px] text-slate-400 font-mono font-normal">{req.emp_code}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">{req.start_date}</td>
                        <td className="py-3 px-4 font-mono text-slate-300">{req.end_date}</td>
                        <td className="py-3 px-4 font-semibold text-purple-300">{req.leave_type}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' :
                            req.status === 'REJECTED' ? 'bg-rose-950 text-rose-400 border border-rose-700' :
                            'bg-amber-950 text-amber-400 border border-amber-700'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        {isAdminOrHR && (
                          <td className="py-3 px-4 text-center">
                            {req.status === 'PENDING' ? (
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  title="Reject Leave"
                                  onClick={() => handleReview(req.id, 'REJECTED')}
                                  className="w-7 h-7 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition shadow-md"
                                >
                                  <X className="w-4 h-4 font-bold" />
                                </button>
                                <button
                                  title="Approve Leave"
                                  onClick={() => handleReview(req.id, 'APPROVED')}
                                  className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition shadow-md"
                                >
                                  <Check className="w-4 h-4 font-bold" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Reviewed</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Time Off Type Request Modal per Excalidraw Image 2 */}
          {showModal && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <h3 className="font-bold text-white text-base">Time off Type Request</h3>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitRequest} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Employee</label>
                    <input
                      type="text"
                      readOnly
                      value={user?.full_name || 'Current User'}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Time off Type</label>
                    <select
                      value={formData.leave_type}
                      onChange={e => setFormData({ ...formData, leave_type: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-purple-500 font-semibold"
                    >
                      <option value="Paid Time Off">Paid Time Off</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Unpaid Leave">Unpaid Leaves</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Validity Period (Start)</label>
                      <input
                        type="date"
                        required
                        value={formData.start_date}
                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-purple-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Validity Period (End)</label>
                      <input
                        type="date"
                        required
                        value={formData.end_date}
                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-purple-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Allocation (Duration)</label>
                    <div className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-purple-400 text-xs font-bold">
                      {calculateDays(formData.start_date, formData.end_date)} Days
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Attachment (For sick leave certificate)</label>
                    <div className="flex items-center space-x-2">
                      <label className="cursor-pointer px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 flex items-center space-x-1.5 transition">
                        <Upload className="w-4 h-4 text-purple-400" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={e => setFormData({ ...formData, attachment_name: e.target.files[0]?.name || '' })}
                        />
                      </label>
                      <span className="text-[11px] text-slate-400 truncate max-w-xs">{formData.attachment_name || 'No file selected'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Reason for Leave</label>
                    <textarea
                      rows={2}
                      required
                      value={formData.reason}
                      onChange={e => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-purple-500"
                      placeholder="Specify purpose of leave..."
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-700 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-600 transition"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="px-5 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-lg hover:bg-purple-700 disabled:opacity-50 transition"
                    >
                      {submitLoading ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
