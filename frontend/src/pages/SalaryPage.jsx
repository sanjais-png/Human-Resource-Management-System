import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import {
  DollarSign,
  ShieldAlert,
  Edit3,
  Save,
  CheckCircle2,
  Users,
  Building2,
  Lock,
  ArrowUpRight,
  MinusCircle
} from 'lucide-react'

export const SalaryPage = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [employees, setEmployees] = useState([])
  const [selectedEmpId, setSelectedEmpId] = useState(null)
  const [salaryData, setSalaryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingWage, setEditingWage] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false)
      setError('Access Denied. Salary management is restricted exclusively to System Administrators.')
      return
    }

    const fetchEmployeesList = async () => {
      try {
        const res = await axios.get('/api/employees')
        setEmployees(res.data)
        if (res.data.length > 0) {
          setSelectedEmpId(res.data[0].id)
        }
      } catch (err) {
        setError('Failed to fetch employee list.')
      } finally {
        setLoading(false)
      }
    }

    fetchEmployeesList()
  }, [isAdmin])

  const fetchSalaryDetails = async (empId) => {
    if (!empId) return
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(`/api/salary/${empId}`)
      setSalaryData(res.data)
      setEditingWage(res.data.monthly_wage.toString())
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load salary details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedEmpId && isAdmin) {
      fetchSalaryDetails(selectedEmpId)
    }
  }, [selectedEmpId, isAdmin])

  const handleUpdateSalary = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    setError('')
    setSuccess('')
    try {
      const wageVal = parseFloat(editingWage)
      const res = await axios.put(`/api/salary/${selectedEmpId}`, { monthly_wage: wageVal })
      setSalaryData(res.data)
      setSuccess('Monthly wage updated and salary components recalculated!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update salary.')
    } finally {
      setIsUpdating(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header title="Salary Information" />
          <main className="p-8 max-w-3xl mx-auto w-full">
            <div className="bg-rose-50 border border-rose-200 p-8 rounded-2xl text-center space-y-4 shadow-xs">
              <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
              <h2 className="text-xl font-bold text-rose-900">Access Denied (403 Forbidden)</h2>
              <p className="text-xs text-rose-700 max-w-md mx-auto">
                Salary information is strictly restricted to ADMIN users. HR and Employee roles do not have permission to view payroll structures.
              </p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Salary & Payroll Structure (ADMIN ONLY)" />

        <main className="p-6 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">{success}</span>
            </div>
          )}

          {/* Employee Selector Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Users className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-bold text-slate-700">Select Employee:</span>
              <select
                value={selectedEmpId || ''}
                onChange={e => setSelectedEmpId(Number(e.target.value))}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.emp_code}) - {emp.job_position}
                  </option>
                ))}
              </select>
            </div>

            {salaryData && (
              <form onSubmit={handleUpdateSalary} className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-700">Monthly Gross (₹):</span>
                <input
                  type="number"
                  step="1000"
                  value={editingWage}
                  onChange={e => setEditingWage(e.target.value)}
                  className="w-32 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold font-mono focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1 disabled:opacity-50 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isUpdating ? 'Saving...' : 'Recalculate'}</span>
                </button>
              </form>
            )}
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              Loading salary calculations...
            </div>
          ) : salaryData ? (
            <>
              {/* Summary KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Gross Wage</p>
                  <h3 className="text-2xl font-extrabold text-slate-800 font-mono">{salaryData.formatted_monthly_wage}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Annual: {salaryData.formatted_annual_wage}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Deductions (PF+PT)</p>
                  <h3 className="text-2xl font-extrabold text-rose-600 font-mono">₹{salaryData.total_deductions_monthly.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                  <p className="text-[11px] text-rose-500">Provident Fund & Statutory Tax</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md space-y-1">
                  <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Net Monthly In-Hand Pay</p>
                  <h3 className="text-2xl font-extrabold text-emerald-400 font-mono">{salaryData.formatted_net_monthly_pay}</h3>
                  <p className="text-[11px] text-slate-300">Take-home salary after deductions</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Annual Take-Home</p>
                  <h3 className="text-2xl font-extrabold text-indigo-600 font-mono">{salaryData.formatted_net_annual_pay}</h3>
                  <p className="text-[11px] text-indigo-500">Total yearly net compensation</p>
                </div>
              </div>

              {/* Components Breakdown Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-indigo-600" /> Statutory Salary Components Breakdown ({salaryData.employee_name})
                  </h3>
                  <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold">
                    Indian Compensation Rules
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Component Name</th>
                        <th className="py-3.5 px-4">Calculation Rule</th>
                        <th className="py-3.5 px-4 text-right">Monthly Amount</th>
                        <th className="py-3.5 px-4 text-right">Annual Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {salaryData.components.map((comp, idx) => {
                        const isDeduction = comp.name.includes('Deduction') || comp.name.includes('Tax')
                        return (
                          <tr key={idx} className={`hover:bg-slate-50 transition ${isDeduction ? 'bg-rose-50/30' : ''}`}>
                            <td className="py-3.5 px-4 font-bold font-sans text-slate-800 flex items-center">
                              {isDeduction ? (
                                <MinusCircle className="w-3.5 h-3.5 mr-1.5 text-rose-500 flex-shrink-0" />
                              ) : (
                                <ArrowUpRight className="w-3.5 h-3.5 mr-1.5 text-emerald-500 flex-shrink-0" />
                              )}
                              {comp.name}
                            </td>
                            <td className="py-3.5 px-4 font-sans text-slate-500 italic">{comp.rule}</td>
                            <td className={`py-3.5 px-4 text-right font-bold ${isDeduction ? 'text-rose-600' : 'text-slate-800'}`}>
                              {comp.formatted_monthly}
                            </td>
                            <td className={`py-3.5 px-4 text-right font-bold ${isDeduction ? 'text-rose-600' : 'text-indigo-600'}`}>
                              {comp.formatted_annual}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  )
}
