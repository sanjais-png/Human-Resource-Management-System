import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import { EmployeeCard } from '../components/EmployeeCard'
import { EmployeeModal } from '../components/EmployeeModal'
import { EmployeeDetailModal } from '../components/EmployeeDetailModal'
import {
  Users,
  UserPlus,
  Search,
  LayoutGrid,
  List,
  Edit2,
  Eye,
  ShieldAlert,
  Building2
} from 'lucide-react'

export const EmployeesPage = () => {
  const { user } = useAuth()
  const canManage = user?.role === 'ADMIN' || user?.role === 'HR'

  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState('All')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/employees')
      setEmployees(res.data)
    } catch (err) {
      console.error('Failed to fetch employees:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleSaveEmployee = async (formData, empId) => {
    if (empId) {
      await axios.put(`/api/employees/${empId}`, formData)
    } else {
      await axios.post('/api/employees', formData)
    }
    fetchEmployees()
  }

  const handleOpenAddModal = () => {
    setEditingEmployee(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEditModal = (emp) => {
    setEditingEmployee(emp)
    setIsFormModalOpen(true)
  }

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      !searchQuery ||
      emp.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.job_position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.emp_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDept = selectedDept === 'All' || emp.department === selectedDept

    return matchesSearch && matchesDept
  })

  const departments = ['All', 'Engineering', 'Human Resources', 'Design', 'Marketing', 'Finance', 'Executive']

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} title="Employee Management" />

        <main className="p-6 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {/* Notice banner for Employee role */}
          {!canManage && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-2xl flex items-center space-x-3 text-xs">
              <ShieldAlert className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span>
                You are currently viewing the company employee directory. Employee creation and editing privileges are restricted to <strong>ADMIN</strong> and <strong>HR</strong> managers.
              </span>
            </div>
          )}

          {/* Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
              {departments.map(dept => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex-shrink-0 ${
                    selectedDept === dept
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              <div className="bg-slate-100 p-1 rounded-lg flex items-center border border-slate-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md text-xs font-medium transition ${
                    viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md text-xs font-medium transition ${
                    viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {canManage && (
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Create Employee</span>
                </button>
              )}
            </div>
          </div>

          {/* Content Area */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-xs text-slate-500 mt-3 font-medium">Loading employee directory...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Employees Found</h3>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEmployees.map(emp => (
                <EmployeeCard
                  key={emp.id}
                  employee={emp}
                  onView={setSelectedEmployee}
                  onEdit={handleOpenEditModal}
                  canManage={canManage}
                />
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Employee</th>
                      <th className="py-3.5 px-4">Emp Code</th>
                      <th className="py-3.5 px-4">Login ID</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4">Job Position</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 flex items-center space-x-3">
                          <img
                            src={emp.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.first_name + ' ' + emp.last_name)}&background=6366f1&color=fff`}
                            alt={emp.first_name}
                            className="w-8 h-8 rounded-full border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-800">{emp.first_name} {emp.last_name}</p>
                            <p className="text-[11px] text-slate-400">{emp.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{emp.emp_code}</td>
                        <td className="py-3 px-4 font-mono text-slate-700">{emp.login_id}</td>
                        <td className="py-3 px-4 font-medium text-slate-700">{emp.department}</td>
                        <td className="py-3 px-4 text-slate-600">{emp.job_position}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            emp.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                            emp.status === 'On Leave' || emp.status === 'Leave' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedEmployee(emp)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canManage && (
                            <button
                              onClick={() => handleOpenEditModal(emp)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                              title="Edit Employee"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <EmployeeModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveEmployee}
        employee={editingEmployee}
      />

      <EmployeeDetailModal
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        employee={selectedEmployee}
      />
    </div>
  )
}
