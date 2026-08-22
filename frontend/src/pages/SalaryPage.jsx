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
  MinusCircle,
  Sparkles
} from 'lucide-react'

export const SalaryPage = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [employees, setEmployees] = useState([])
  const [selectedEmpId, setSelectedEmpId] = useState(null)
  const [salaryData, setSalaryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingWage, setEditingWage] = useState('50000')
  const [workingDays, setWorkingDays] = useState(5)
  const [breakHours, setBreakHours] = useState(1)
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
    if (e) e.preventDefault()
    setIsUpdating(true)
    setError('')
    setSuccess('')
    try {
      const wageVal = parseFloat(editingWage)
      const res = await axios.put(`/api/salary/${selectedEmpId}`, { monthly_wage: wageVal })
      setSalaryData(res.data)
      setSuccess(`Salary updated successfully for ${res.data.employee_name}!`)
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update salary.')
    } finally {
      setIsUpdating(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen bg-slate-50 text-slate-800">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header title="Salary Information" />
          <main className="p-8 max-w-3xl mx-auto w-full">
            <div className="bg-rose-50 border border-rose-200 p-8 rounded-2xl text-center space-y-4 shadow-xs">
              <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
              <h2 className="text-xl font-bold text-rose-900">Access Denied (403 Forbidden)</h2>
              <p className="text-xs text-rose-700 max-w-md mx-auto">
                Salary information is strictly restricted to ADMIN users. HR and Employee roles do not have permission to view or edit payroll structures.
              </p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const currentWage = parseFloat(editingWage) || 50000
  const basicSalary = currentWage * 0.50
  const hra = basicSalary * 0.50
  const standardAllowance = 4167.0
  const perfBonus = Math.round(basicSalary * 0.0833 * 100) / 100
  const lta = Math.round(basicSalary * 0.0833 * 100) / 100
  const fixedAllowance = Math.max(Math.round((currentWage - (basicSalary + hra + standardAllowance + perfBonus + lta)) * 100) / 100, 0)
  const pfEmployee = Math.round(basicSalary * 0.12 * 100) / 100
  const pfEmployer = Math.round(basicSalary * 0.12 * 100) / 100
  const professionalTax = 200.0

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Salary & Payroll Customization (ADMIN ONLY)" />

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

          {/* Header Note Box */}
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <span>
                <strong>Salary Info tab Should only be visible to Admin</strong> — As Admin, you can select any employee and customize their monthly wage & salary components.
              </span>
            </div>
          </div>

          {/* Employee Selector Bar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <Users className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-bold text-slate-700">Select Employee to Customize:</span>
                <select
                  value={selectedEmpId || ''}
                  onChange={e => setSelectedEmpId(Number(e.target.value))}
                  className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.emp_code}) — {emp.job_position}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Monthly & Yearly Wage Input Header per Excalidraw Image 1 */}
            {salaryData && (
              <form onSubmit={handleUpdateSalary} className="space-y-4 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Month Wage :-</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        step="1000"
                        value={editingWage}
                        onChange={e => setEditingWage(e.target.value)}
                        className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 w-full"
                      />
                      <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">/ Month</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Yearly wage :-</label>
                    <div className="flex items-center space-x-3">
                      <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-lg font-mono font-bold text-emerald-600 w-full">
                        ₹{(currentWage * 12).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">/ Yearly</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2 text-xs">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500">No of working days in a week:</span>
                      <input
                        type="number"
                        value={workingDays}
                        onChange={e => setWorkingDays(e.target.value)}
                        className="w-16 px-2 py-1 bg-slate-50 border border-slate-300 rounded text-center text-slate-900 font-mono font-bold"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500">Break Times:</span>
                      <input
                        type="number"
                        value={breakHours}
                        onChange={e => setBreakHours(e.target.value)}
                        className="w-16 px-2 py-1 bg-slate-50 border border-slate-300 rounded text-center text-slate-900 font-mono font-bold"
                      />
                      <span className="text-slate-500">/ hrs</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-2 transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isUpdating ? 'Updating Salary...' : 'Save & Apply Salary Changes'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              Loading salary details...
            </div>
          ) : salaryData ? (
            /* Salary Components Table matching Excalidraw Image 1 */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-6">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
                Salary Structure Components ({salaryData.employee_name})
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <p className="font-bold text-slate-900">Basic Salary</p>
                    <p className="text-[11px] text-slate-500">Define Basic salary from company cost compute it based on monthly wages</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-slate-900 text-sm">₹{basicSalary.toFixed(2)} ₹ / month</span>
                    <span className="ml-3 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-bold">50.00 %</span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <p className="font-bold text-slate-900">House Rent Allowance</p>
                    <p className="text-[11px] text-slate-500">HRA provided to employees 50% of the basic salary</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-slate-900 text-sm">₹{hra.toFixed(2)} ₹ / month</span>
                    <span className="ml-3 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-bold">50.00 %</span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <p className="font-bold text-slate-900">Standard Allowance</p>
                    <p className="text-[11px] text-slate-500">A standard allowance is a predetermined, fixed amount provided to employee as part of their salary</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-slate-900 text-sm">₹{standardAllowance.toFixed(2)} ₹ / month</span>
                    <span className="ml-3 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-bold">16.67 %</span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <p className="font-bold text-slate-900">Performance Bonus</p>
                    <p className="text-[11px] text-slate-500">Variable amount paid during payroll. The value defined by company and calculated as a % of basic salary</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-slate-900 text-sm">₹{perfBonus.toFixed(2)} ₹ / month</span>
                    <span className="ml-3 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-bold">8.33 %</span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <p className="font-bold text-slate-900">Leave Travel Allowance</p>
                    <p className="text-[11px] text-slate-500">LTA is paid by company to employees to cover travel expenses and calculated as a % of basic salary</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-slate-900 text-sm">₹{lta.toFixed(2)} ₹ / month</span>
                    <span className="ml-3 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-bold">8.33 %</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pb-2">
                  <div>
                    <p className="font-bold text-slate-900">Fixed Allowance</p>
                    <p className="text-[11px] text-slate-500">Fixed allowance portion of wages is determined after calculating all salary components</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-slate-900 text-sm">₹{fixedAllowance.toFixed(2)} ₹ / month</span>
                    <span className="ml-3 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-bold">11.67 %</span>
                  </div>
                </div>
              </div>

              {/* Provident Fund (PF) Contribution */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-900 text-xs">Provident Fund (PF) Contribution</h4>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <div>
                      <span className="font-semibold text-slate-700">Employee:</span>
                      <p className="text-[10px] text-slate-500">PF is calculated based on the basic salary</p>
                    </div>
                    <div className="font-mono text-right">
                      <span className="text-rose-600 font-bold">₹{pfEmployee.toFixed(2)} ₹ / month</span>
                      <span className="ml-3 px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[11px] font-bold">12.00 %</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pb-2">
                    <div>
                      <span className="font-semibold text-slate-700">Employer:</span>
                      <p className="text-[10px] text-slate-500">PF is calculated based on the basic salary</p>
                    </div>
                    <div className="font-mono text-right">
                      <span className="text-emerald-600 font-bold">₹{pfEmployer.toFixed(2)} ₹ / month</span>
                      <span className="ml-3 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold">12.00 %</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax Deductions */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs">Tax Deductions</h4>
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-700">Professional Tax:</span>
                    <p className="text-[10px] text-slate-500">Professional Tax deducted from the gross salary</p>
                  </div>
                  <div className="font-mono text-right">
                    <span className="text-rose-600 font-bold">₹{professionalTax.toFixed(2)} ₹ / month</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
