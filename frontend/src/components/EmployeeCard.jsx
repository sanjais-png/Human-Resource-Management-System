import React from 'react'
import { Building2, Briefcase, Mail, Phone, Edit2, Eye, MapPin } from 'lucide-react'

export const EmployeeCard = ({ employee, onView, onEdit, canManage }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Present</span>
      case 'On Leave':
      case 'Leave':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">On Leave</span>
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">Absent</span>
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={employee.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.first_name + ' ' + employee.last_name)}&background=6366f1&color=fff`}
              alt={`${employee.first_name} ${employee.last_name}`}
              className="w-12 h-12 rounded-full border border-indigo-100 object-cover shadow-xs"
            />
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-tight">
                {employee.first_name} {employee.last_name}
              </h3>
              <p className="text-xs text-indigo-600 font-semibold mt-0.5">{employee.emp_code}</p>
            </div>
          </div>
          {getStatusBadge(employee.status)}
        </div>

        <div className="space-y-2 text-xs text-slate-600 mb-4 border-t border-slate-100 pt-3">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="font-medium text-slate-700">{employee.job_position}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{employee.department}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{employee.location || 'Headquarters'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{employee.email}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-3 border-t border-slate-100">
        <button
          onClick={() => onView(employee)}
          className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Profile</span>
        </button>

        {canManage && (
          <button
            onClick={() => onEdit(employee)}
            className="flex items-center justify-center p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition"
            title="Edit Employee"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
