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
  FileText
} from 'lucide-react'

export const TimeOffPage = () => {
  const { user } = useAuth()
  const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR'

  const [balance, setBalance] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    leave_type: 'Paid Time Off',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: ''
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
        reason: ''
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

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Time Off Management" />

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

          {/* Leave Balance Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Paid Time Off (PTO)</p>
                <h3 className="text-3xl font-extrabold text-indigo-600 mt-1">{balance?.paid_time_off ?? 24} Days</h3>
                <p className="text-[11px] text-slate-500 mt-1">Annual paid leave quota</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sick Leave</p>
                <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{balance?.sick_leave ?? 7} Days</h3>
                <p className="text-[11px] text-slate-500 mt-1">Medical & wellness leave</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unpaid Leave Taken</p>
                <h3 className="text-3xl font-extrabold text-slate-700 mt-1">{balance?.unpaid_leave ?? 0} Days</h3>
                <p className="text-[11px] text-slate-500 mt-1">Approved unpaid days</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Action Header */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {isAdminOrHR ? "All Employee Leave Requests" : "My Leave Requests"}
              </h2>
              <p className="text-xs text-slate-500">Track leave application status and submit new requests</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Request Time Off</span>
            </button>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading leave requests...</div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No leave requests found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      {isAdminOrHR && <th className="py-3.5 px-4">Employee</th>}
                      <th className="py-3.5 px-4">Leave Type</th>
                      <th className="py-3.5 px-4">Dates</th>
                      <th className="py-3.5 px-4">Duration</th>
                      <th className="py-3.5 px-4">Reason</th>
                      <th className="py-3.5 px-4">Status</th>
                      {isAdminOrHR && <th className="py-3.5 px-4 text-right">Review Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50 transition">
                        {isAdminOrHR && (
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {req.employee_name}
                            <span className="block text-[10px] text-slate-400 font-normal">{req.emp_code} • {req.department}</span>
                          </td>
                        )}
                        <td className="py-3 px-4 font-semibold text-slate-700">{req.leave_type}</td>
                        <td className="py-3 px-4 font-mono">
                          {req.start_date} to {req.end_date}
                        </td>
                        <td className="py-3 px-4 font-bold text-indigo-600">{req.duration_days} days</td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{req.reason}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            req.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        {isAdminOrHR && (
                          <td className="py-3 px-4 text-right">
                            {req.status === 'PENDING' ? (
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleReview(req.id, 'APPROVED')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold flex items-center space-x-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleReview(req.id, 'REJECTED')}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-semibold flex items-center space-x-1"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Reviewed by {req.reviewed_by || 'Admin'}</span>
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

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-800 text-base">Request Time Off</h3>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Type</label>
                    <select
                      value={formData.leave_type}
                      onChange={e => setFormData({ ...formData, leave_type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Paid Time Off">Paid Time Off (PTO)</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Unpaid Leave">Unpaid Leave</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        required
                        value={formData.start_date}
                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                      <input
                        type="date"
                        required
                        value={formData.end_date}
                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Leave</label>
                    <textarea
                      rows={3}
                      required
                      value={formData.reason}
                      onChange={e => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                      placeholder="Specify purpose of leave..."
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                      {submitLoading ? 'Submitting...' : 'Submit Request'}
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
