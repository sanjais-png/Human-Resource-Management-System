import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Briefcase, Mail, Edit2, Eye, MapPin, Plane } from 'lucide-react'

export const EmployeeCard = ({ employee, onView, onEdit, canManage }) => {
  const navigate = useNavigate()

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            Present
          </span>
        )
      case 'On Leave':
      case 'Leave':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
            <Plane className="w-3 h-3 mr-1 text-indigo-600" />
            On Leave
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
            Absent
          </span>
        )
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 hover:shadow-md transition-all p-5 flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(`/profile/${employee.id}`)}>
            <div className="relative">
              <img
                src={employee.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.first_name + ' ' + employee.last_name)}&background=6366f1&color=fff`}
                alt={`${employee.first_name} ${employee.last_name}`}
                className="w-12 h-12 rounded-2xl border-2 border-indigo-100 object-cover shadow-xs group-hover:border-indigo-500 transition"
              />
              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                employee.status === 'Present' ? 'bg-emerald-500' :
                employee.status === 'On Leave' || employee.status === 'Leave' ? 'bg-indigo-500' :
                'bg-amber-500'
              }`}></span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-indigo-600 transition">
                {employee.first_name} {employee.last_name}
              </h3>
              <p className="text-xs text-indigo-600 font-semibold font-mono mt-0.5">{employee.emp_code}</p>
            </div>
          </div>
          {getStatusBadge(employee.status)}
        </div>

        <div className="space-y-2 text-xs text-slate-600 mb-4 border-t border-slate-100 pt-3">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <span className="font-semibold text-slate-800">{employee.job_position}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{employee.department} • {employee.company || 'Dayflow Corp'}</span>
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
          onClick={() => navigate(`/profile/${employee.id}`)}
          className="flex-1 flex items-center justify-center space-x-1.5 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Profile</span>
        </button>

        {canManage && onEdit && (
          <button
            onClick={() => onEdit(employee)}
            className="flex items-center justify-center p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 transition"
            title="Edit Employee"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
