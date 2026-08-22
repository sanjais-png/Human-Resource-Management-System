import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import {
  User,
  Building2,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Award,
  ShieldAlert,
  Edit3,
  Save,
  CheckCircle2,
  Lock,
  CreditCard,
  Heart,
  Smile,
  Plus,
  Plane,
  DollarSign,
  AlertCircle,
  Clock,
  Sparkles,
  Shield,
  X
} from 'lucide-react'

export const ProfilePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [profile, setProfile] = useState(null)
  const [salaryData, setSalaryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [activeTab, setActiveTab] = useState('resume') // 'resume', 'private', 'salary', 'security'
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Add Skill / Cert Modals State
  const [showSkillModal, setShowSkillModal] = useState(false)
  const [newSkillInput, setNewSkillInput] = useState('')
  const [showCertModal, setShowCertModal] = useState(false)
  const [newCertInput, setNewCertInput] = useState('')

  // Edit Bio Modal State
  const [editingBioField, setEditingBioField] = useState(null) // 'summary', 'love', 'hobbies'
  const [bioTextInput, setBioTextInput] = useState('')

  // Wage Editing State for Admin
  const [monthlyWageInput, setMonthlyWageInput] = useState(50000)
  const [workingDays, setWorkingDays] = useState(5)
  const [breakHours, setBreakHours] = useState(1)

  const [editForm, setEditForm] = useState({
    phone: '',
    personal_email: '',
    address: '',
    skills: '',
    resume_summary: '',
    marital_status: '',
    date_of_birth: '',
    gender: '',
    nationality: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    pan_no: '',
    uan_no: '',
    what_i_love: '',
    hobbies: '',
    certifications: ''
  })

  const isOwnProfile = !id || id === 'me'

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const endpoint = isOwnProfile ? '/api/profile/me' : `/api/profile/${id}`
      const res = await axios.get(endpoint)
      setProfile(res.data)

      setEditForm({
        phone: res.data.phone || '',
        personal_email: res.data.personal_email || '',
        address: res.data.address || '',
        skills: res.data.skills || '',
        resume_summary: res.data.resume_summary || '',
        marital_status: res.data.marital_status || '',
        date_of_birth: res.data.date_of_birth || '',
        gender: res.data.gender || '',
        nationality: res.data.nationality || '',
        bank_name: res.data.bank_name || '',
        account_number: res.data.account_number || '',
        ifsc_code: res.data.ifsc_code || '',
        pan_no: res.data.pan_number || res.data.pan_no || '',
        uan_no: res.data.uan_number || res.data.uan_no || '',
        what_i_love: res.data.what_i_love || '',
        hobbies: res.data.hobbies || '',
        certifications: res.data.certifications || ''
      })

      if (isAdmin && res.data.id) {
        try {
          const salRes = await axios.get(`/api/salary/${res.data.id}`)
          setSalaryData(salRes.data)
          setMonthlyWageInput(salRes.data.monthly_wage)
        } catch (salErr) {
          console.warn('Salary info fetch warning:', salErr)
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load employee profile.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [id, isAdmin])

  const saveProfileField = async (payload) => {
    setSaving(true)
    setSuccessMsg('')
    setError('')
    try {
      const endpoint = isOwnProfile ? '/api/profile/me' : `/api/profile/${profile.id}`
      await axios.put(endpoint, payload)
      setSuccessMsg('Profile updated successfully!')
      fetchProfile()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddSkill = async (e) => {
    e.preventDefault()
    if (!newSkillInput.trim()) return
    const currentSkills = editForm.skills ? editForm.skills.split(',').map(s => s.trim()) : []
    const updatedSkills = [...currentSkills, newSkillInput.trim()].join(', ')
    setShowSkillModal(false)
    setNewSkillInput('')
    await saveProfileField({ skills: updatedSkills })
  }

  const handleAddCertification = async (e) => {
    e.preventDefault()
    if (!newCertInput.trim()) return
    const currentCerts = editForm.certifications ? editForm.certifications.split(',').map(c => c.trim()) : []
    const updatedCerts = [...currentCerts, newCertInput.trim()].join(', ')
    setShowCertModal(false)
    setNewCertInput('')
    await saveProfileField({ certifications: updatedCerts })
  }

  const handleSaveBio = async (e) => {
    e.preventDefault()
    const payload = {}
    if (editingBioField === 'summary') payload.resume_summary = bioTextInput
    if (editingBioField === 'love') payload.what_i_love = bioTextInput
    if (editingBioField === 'hobbies') payload.hobbies = bioTextInput
    setEditingBioField(null)
    await saveProfileField(payload)
  }

  const handleSaveProfileForm = async (e) => {
    e.preventDefault()
    await saveProfileField(editForm)
    setIsEditing(false)
  }

  const handleUpdateSalary = async (newWage) => {
    if (!profile?.id) return
    try {
      const res = await axios.put(`/api/salary/${profile.id}`, { monthly_wage: parseFloat(newWage) })
      setSalaryData(res.data)
      setSuccessMsg('Salary components auto-calculated and updated!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update salary.')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 text-slate-800">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header title="My Profile" />
          <main className="p-6 flex-1 flex items-center justify-center">
            <div className="text-xs text-slate-500 font-medium">Loading profile details...</div>
          </main>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen bg-slate-50 text-slate-800">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header title="My Profile" />
          <main className="p-6 flex-1 max-w-4xl mx-auto w-full">
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{error || 'Profile not found.'}</span>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Dynamic Component Calculations per Excalidraw Image 1 & 2
  const currentWage = parseFloat(monthlyWageInput) || 50000
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
        <Header title="My Profile" />

        <main className="p-6 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Professional Clean Profile Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="relative">
                  <img
                    src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.first_name + ' ' + profile.last_name)}&background=4f46e5&color=fff`}
                    alt={profile.first_name}
                    className="w-24 h-24 rounded-2xl border-2 border-indigo-500 object-cover shadow-sm bg-slate-100"
                  />
                </div>

                <div className="space-y-1 text-center md:text-left">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  <p className="text-xs text-indigo-600 font-mono font-semibold">
                    Login ID: <strong className="text-slate-800">{profile.emp_code}</strong>
                  </p>
                  <p className="text-xs text-slate-600 flex items-center justify-center md:justify-start space-x-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400 mr-1" /> {profile.email}
                  </p>
                  <p className="text-xs text-slate-600 flex items-center justify-center md:justify-start space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400 mr-1" /> {profile.phone || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Right Side Organization Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 min-w-[260px] space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500 font-semibold">Company:</span>
                  <span className="font-bold text-slate-800">{profile.company || 'Odoo India'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500 font-semibold">Department:</span>
                  <span className="font-bold text-indigo-600">{profile.department || 'Engineering'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500 font-semibold">Manager:</span>
                  <span className="font-bold text-slate-800">{profile.manager_name || 'Sarah Jenkins'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Location:</span>
                  <span className="font-bold text-slate-800">{profile.location || 'Headquarters'}</span>
                </div>
              </div>
            </div>

            {/* Clean Professional Tabs */}
            <div className="px-6 flex space-x-6 border-b border-slate-200 bg-slate-50/50">
              <button
                onClick={() => setActiveTab('resume')}
                className={`py-3.5 text-xs font-bold border-b-2 transition ${
                  activeTab === 'resume'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Resume
              </button>
              <button
                onClick={() => setActiveTab('private')}
                className={`py-3.5 text-xs font-bold border-b-2 transition ${
                  activeTab === 'private'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Private Info
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('salary')}
                  className={`py-3.5 text-xs font-bold border-b-2 transition ${
                    activeTab === 'salary'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Salary Info <span className="ml-1 px-1.5 py-0.5 rounded bg-indigo-50 text-[10px] text-indigo-700 font-bold border border-indigo-200">Admin</span>
                </button>
              )}
              <button
                onClick={() => setActiveTab('security')}
                className={`py-3.5 text-xs font-bold border-b-2 transition ${
                  activeTab === 'security'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Security
              </button>
            </div>
          </div>

          {/* TAB 1: RESUME per Excalidraw Image 1 */}
          {activeTab === 'resume' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left 2 Columns: Bio Summaries */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-indigo-600" /> About
                    </h3>
                    <button
                      onClick={() => {
                        setEditingBioField('summary')
                        setBioTextInput(editForm.resume_summary)
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {editForm.resume_summary || 'Click the edit icon to add your professional summary...'}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center">
                      <Heart className="w-4 h-4 mr-2 text-rose-500" /> What I love about my job
                    </h3>
                    <button
                      onClick={() => {
                        setEditingBioField('love')
                        setBioTextInput(editForm.what_i_love)
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {editForm.what_i_love || 'Click the edit icon to describe what inspires you about your role...'}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center">
                      <Smile className="w-4 h-4 mr-2 text-amber-500" /> My interests and hobbies
                    </h3>
                    <button
                      onClick={() => {
                        setEditingBioField('hobbies')
                        setBioTextInput(editForm.hobbies)
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {editForm.hobbies || 'Click the edit icon to share your personal hobbies and interests...'}
                  </p>
                </div>
              </div>

              {/* Right 1 Column: Dynamic Skills & Certifications */}
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {editForm.skills ? (
                      editForm.skills.split(',').map((sk, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold">
                          {sk.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No skills added yet.</span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowSkillModal(true)}
                    className="mt-2 w-full py-2 bg-slate-50 hover:bg-slate-100 text-indigo-600 text-xs font-bold rounded-xl border border-slate-200 flex items-center justify-center space-x-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Skills</span>
                  </button>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Certification</h3>
                  </div>
                  <div className="space-y-2 pt-1">
                    {editForm.certifications ? (
                      editForm.certifications.split(',').map((cert, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-center space-x-2">
                          <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <span>{cert.trim()}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No certifications added yet.</span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowCertModal(true)}
                    className="mt-2 w-full py-2 bg-slate-50 hover:bg-slate-100 text-indigo-600 text-xs font-bold rounded-xl border border-slate-200 flex items-center justify-center space-x-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Certification</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVATE INFO per Excalidraw Image 2 */}
          {activeTab === 'private' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Private Information & Bank Records</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Details'}</span>
                </button>
              </div>

              {isEditing ? (
                /* Editable Form Mode */
                <form onSubmit={handleSaveProfileForm} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={editForm.date_of_birth}
                        onChange={e => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Residing Address</label>
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Nationality</label>
                      <input
                        type="text"
                        value={editForm.nationality}
                        onChange={e => setEditForm({ ...editForm, nationality: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Personal Email</label>
                      <input
                        type="email"
                        value={editForm.personal_email}
                        onChange={e => setEditForm({ ...editForm, personal_email: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Gender</label>
                      <select
                        value={editForm.gender}
                        onChange={e => setEditForm({ ...editForm, gender: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Marital Status</label>
                      <select
                        value={editForm.marital_status}
                        onChange={e => setEditForm({ ...editForm, marital_status: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                      >
                        <option value="">Select Marital Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                      </select>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs border-t border-slate-200 pt-4 mb-2">Bank Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={editForm.bank_name}
                        onChange={e => setEditForm({ ...editForm, bank_name: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Account Number</label>
                      <input
                        type="text"
                        value={editForm.account_number}
                        onChange={e => setEditForm({ ...editForm, account_number: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">IFSC Code</label>
                      <input
                        type="text"
                        value={editForm.ifsc_code}
                        onChange={e => setEditForm({ ...editForm, ifsc_code: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">PAN No</label>
                      <input
                        type="text"
                        value={editForm.pan_no}
                        onChange={e => setEditForm({ ...editForm, pan_no: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">UAN No</label>
                      <input
                        type="text"
                        value={editForm.uan_no}
                        onChange={e => setEditForm({ ...editForm, uan_no: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-xs hover:bg-indigo-700 transition"
                    >
                      {saving ? 'Saving Details...' : 'Save Private Info'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Display Mode */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Personal Details */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">Personal Details</h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Date of Birth:</span>
                        <span className="font-mono text-slate-800 font-semibold">{editForm.date_of_birth || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Residing Address:</span>
                        <span className="text-slate-800 font-semibold">{editForm.address || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Nationality:</span>
                        <span className="text-slate-800 font-semibold">{editForm.nationality || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Personal Email:</span>
                        <span className="text-indigo-600 font-mono font-semibold">{editForm.personal_email || profile.email}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Gender:</span>
                        <span className="text-slate-800 font-semibold">{editForm.gender || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Marital Status:</span>
                        <span className="text-slate-800 font-semibold">{editForm.marital_status || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Date of Joining:</span>
                        <span className="font-mono text-emerald-600 font-bold">{profile.date_of_joining || '2024-01-15'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Bank Details */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">Bank Details</h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Account Number:</span>
                        <span className="font-mono text-slate-900 font-bold">{editForm.account_number || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Bank Name:</span>
                        <span className="text-slate-800 font-semibold">{editForm.bank_name || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">IFSC Code:</span>
                        <span className="font-mono text-indigo-600 font-semibold">{editForm.ifsc_code || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">PAN No:</span>
                        <span className="font-mono text-slate-800 font-semibold">{editForm.pan_no || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">UAN No:</span>
                        <span className="font-mono text-slate-800 font-semibold">{editForm.uan_no || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Emp Code:</span>
                        <span className="font-mono text-indigo-600 font-bold">{profile.emp_code}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SALARY INFO (ADMIN ONLY) per Excalidraw Image 1 & 2 */}
          {activeTab === 'salary' && isAdmin && (
            <div className="space-y-6">
              {/* Header Note Box */}
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <span>
                    <strong>Salary Info tab Should only be visible to Admin</strong> — Salary components auto-calculate dynamically based on Monthly Wage.
                  </span>
                </div>
              </div>

              {/* Monthly & Yearly Wage Input Header */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Month Wage :-</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        value={monthlyWageInput}
                        onChange={e => {
                          setMonthlyWageInput(e.target.value)
                          handleUpdateSalary(e.target.value)
                        }}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-500">No of working days in a week:</span>
                    <input
                      type="number"
                      value={workingDays}
                      onChange={e => setWorkingDays(e.target.value)}
                      className="w-16 px-2 py-1 bg-slate-50 border border-slate-300 rounded text-center text-slate-900 font-mono font-bold"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
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
              </div>

              {/* Salary Components Table per Excalidraw Image 1 */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-6">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Salary Components</h3>

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
            </div>
          )}

          {/* TAB 4: SECURITY */}
          {activeTab === 'security' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-md space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center border-b border-slate-100 pb-2">
                <Lock className="w-4 h-4 mr-2 text-indigo-600" /> System Password & Security
              </h3>

              <form className="space-y-4 text-xs" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Change Password
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Add Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">+ Add New Skill</h3>
              <button onClick={() => setShowSkillModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddSkill} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newSkillInput}
                  onChange={e => setNewSkillInput(e.target.value)}
                  placeholder="e.g. React.js, Python, PostgreSQL"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSkillModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 font-semibold rounded-lg hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition"
                >
                  Add Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Certification Modal */}
      {showCertModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">+ Add New Certification</h3>
              <button onClick={() => setShowCertModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddCertification} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Certification Title</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCertInput}
                  onChange={e => setNewCertInput(e.target.value)}
                  placeholder="e.g. AWS Solutions Architect"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 font-semibold rounded-lg hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition"
                >
                  Add Certification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Bio Section Modal */}
      {editingBioField && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                Edit {editingBioField === 'summary' ? 'About Section' : editingBioField === 'love' ? 'What I Love About My Job' : 'My Interests and Hobbies'}
              </h3>
              <button onClick={() => setEditingBioField(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveBio} className="space-y-3 text-xs">
              <div>
                <textarea
                  rows={4}
                  required
                  value={bioTextInput}
                  onChange={e => setBioTextInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter details..."
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBioField(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 font-semibold rounded-lg hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition"
                >
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
