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
  UserCheck,
  UserX,
  Calendar,
  UserPlus,
  Filter,
  RefreshCw
} from 'lucide-react'

export const DashboardPage = () => {
  const { user } = useAuth()
  const canManage = user?.role === 'ADMIN' || user?.role === 'HR'

  const [stats, setStats] = useState({
    total_employees: 0,
    present_today: 0,
    absent_today: 0,
    on_leave: 0
  })

  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState('All')

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, empRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/employees')
      ])
      setStats(statsRes.data)
      setEmployees(empRes.data)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSaveEmployee = async (formData, empId) => {
    if (empId) {
      await axios.put(`/api/employees/${empId}`, formData)
    } else {
      await axios.post('/api/employees', formData)
    }
    fetchData()
  }

  const handleOpenAddModal = () => {
    setEditingEmployee(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEditModal = (emp) => {
    setEditingEmployee(emp)
    setIsFormModalOpen(true)
  }

  // Filter employees locally by search & department
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      !searchQuery ||
      emp.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.job_position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.emp_code.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDept = selectedDept === 'All' || emp.department === selectedDept

    return matchesSearch && matchesDept
  })

  const departments = ['All', 'Engineering', 'Human Resources', 'Design', 'Marketing', 'Finance', 'Executive']

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} title="Dashboard Overview" />

        <main className="p-6 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Total Employees</p>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{stats.total_employees}</h3>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Present Today</p>
                <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{stats.present_today}</h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Absent Today</p>
                <h3 className="text-3xl font-extrabold text-rose-600 mt-1">{stats.absent_today}</h3>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                <UserX className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">On Leave</p>
                <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{stats.on_leave}</h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Action Header & Department Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
              <Filter className="w-4 h-4 text-slate-400 ml-1 flex-shrink-0" />
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
              <button
                onClick={fetchData}
                className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                title="Refresh Data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {canManage && (
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Add Employee</span>
                </button>
              )}
            </div>
          </div>

          {/* Employee Directory Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">
                Company Directory <span className="text-slate-400 text-sm font-medium">({filteredEmployees.length})</span>
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} className="bg-white p-5 rounded-xl border border-slate-200 h-44 animate-pulse"></div>
                ))}
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700">No Employees Found</h3>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or department filter.</p>
              </div>
            ) : (
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
            )}
          </div>
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
