import React from 'react'
import { X, Building2, Briefcase, Mail, Phone, Calendar, MapPin, User, Hash, UserCheck } from 'lucide-react'

export const EmployeeDetailModal = ({ isOpen, onClose, employee }) => {
  if (!isOpen || !employee) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        <div className="bg-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <img
              src={employee.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.first_name + ' ' + employee.last_name)}&background=6366f1&color=fff`}
              alt={employee.first_name}
              className="w-16 h-16 rounded-full border-2 border-indigo-400 object-cover shadow-md"
            />
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">
                {employee.first_name} {employee.last_name}
              </h2>
              <p className="text-xs text-indigo-300 font-semibold">{employee.job_position}</p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="bg-indigo-900/80 text-indigo-200 border border-indigo-700/60 px-2 py-0.5 rounded text-[11px] font-mono">
                  {employee.emp_code}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  employee.status === 'Present' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  employee.status === 'On Leave' || employee.status === 'Leave' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {employee.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 text-sm text-slate-700">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
            <div>
              <p className="text-xs text-slate-400 font-medium flex items-center mb-0.5">
                <Hash className="w-3.5 h-3.5 mr-1" /> Login ID
              </p>
              <p className="font-semibold text-slate-800 font-mono text-xs">{employee.login_id}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium flex items-center mb-0.5">
                <Building2 className="w-3.5 h-3.5 mr-1" /> Department
              </p>
              <p className="font-semibold text-slate-800">{employee.department}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Work Email</p>
                <p className="font-medium text-slate-800">{employee.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Phone</p>
                <p className="font-medium text-slate-800">{employee.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <UserCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Manager</p>
                <p className="font-medium text-slate-800">{employee.manager_name || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Location</p>
                <p className="font-medium text-slate-800">{employee.company} • {employee.location || 'Headquarters'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Date of Joining</p>
                <p className="font-medium text-slate-800">{employee.date_of_joining}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
