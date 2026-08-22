import React, { useState, useEffect } from 'react'
import { X, Save, UserPlus, AlertCircle } from 'lucide-react'

export const EmployeeModal = ({ isOpen, onClose, onSave, employee = null }) => {
  const isEditing = !!employee

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: 'Engineering',
    job_position: 'Software Engineer',
    manager_name: 'System Admin',
    company: 'HRMS Corp',
    location: 'Headquarters',
    date_of_joining: '2026-01-15',
    status: 'Present',
    role: 'EMPLOYEE',
    create_user: true,
    password: 'emp123456'
  })

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department: employee.department || 'Engineering',
        job_position: employee.job_position || 'Software Engineer',
        manager_name: employee.manager_name || '',
        company: employee.company || 'HRMS Corp',
        location: employee.location || 'Headquarters',
        date_of_joining: employee.date_of_joining || '2026-01-15',
        status: employee.status || 'Present',
        role: 'EMPLOYEE',
        create_user: false,
        password: ''
      })
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        department: 'Engineering',
        job_position: 'Software Engineer',
        manager_name: 'System Admin',
        company: 'HRMS Corp',
        location: 'Headquarters',
        date_of_joining: new Date().toISOString().split('T')[0],
        status: 'Present',
        role: 'EMPLOYEE',
        create_user: true,
        password: 'emp123456'
      })
    }
    setError('')
  }, [employee, isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.first_name || !formData.last_name || !formData.email) {
      setError('Please fill in all required fields (First Name, Last Name, Email).')
      return
    }
    setError('')
    setSubmitting(true)

    try {
      await onSave(formData, employee?.id)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save employee. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-lg">{isEditing ? 'Edit Employee Details' : 'Add New Employee'}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="e.g. Alex"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                name="last_name"
                required
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="e.g. Smith"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="alex.smith@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="+1 555-0199"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Position</label>
              <input
                type="text"
                name="job_position"
                value={formData.job_position}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Software Engineer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Manager Name</label>
              <input
                type="text"
                name="manager_name"
                value={formData.manager_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Joining</label>
              <input
                type="date"
                name="date_of_joining"
                value={formData.date_of_joining}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Attendance Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">On Leave</option>
              </select>
            </div>
          </div>

          {!isEditing && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 mt-4">
              <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  name="create_user"
                  checked={formData.create_user}
                  onChange={handleChange}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Generate Login Credentials & User Account</span>
              </label>

              {formData.create_user && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">User System Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="EMPLOYEE">EMPLOYEE</option>
                      <option value="HR">HR Manager</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Initial Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-indigo-500"
                      placeholder="Default: emp123456"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm flex items-center space-x-1.5 disabled:opacity-50 transition"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : isEditing ? 'Update Employee' : 'Create Employee'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
