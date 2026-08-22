import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react'
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
  Hash
} from 'lucide-react'

export const ProfilePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'private', 'resume'
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const [editForm, setEditForm] = useState({
    phone: '',
    personal_email: '',
    address: '',
    skills: '',
    resume_summary: '',
    marital_status: '',
    date_of_birth: '',
    gender: '',
    nationality: ''
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
        marital_status: res.data.marital_status || 'Single',
        date_of_birth: res.data.date_of_birth || '1995-05-20',
        gender: res.data.gender || 'Male',
        nationality: res.data.nationality || 'Indian'
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load employee profile.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [id])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg('')
    try {
      const endpoint = isOwnProfile ? '/api/profile/me' : `/api/profile/${id}`
      const res = await axios.put(endpoint, editForm)
      setProfile(res.data)
      setIsEditing(false)
      setSuccessMsg('Profile details updated successfully!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const skillsList = profile?.skills
    ? profile.skills.split(',').map(s => s.trim()).filter(Boolean)
    : []

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title={isOwnProfile ? "My Employee Profile" : "Employee Profile"} />

        <main className="p-6 flex-1 max-w-5xl w-full mx-auto space-y-6">
          {error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-8 rounded-2xl text-center space-y-3">
              <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
              <h2 className="text-lg font-bold">Profile Access Restricted</h2>
              <p className="text-xs text-rose-600 max-w-md mx-auto">{error}</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition"
              >
                Back to Dashboard
              </button>
            </div>
          ) : loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-xs text-slate-500 mt-3 font-medium">Loading profile details...</p>
            </div>
          ) : (
            <>
              {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold">{successMsg}</span>
                </div>
              )}

              {/* Top Banner Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-8 pt-6 relative">
                  <span className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-mono border border-white/20">
                    {profile.emp_code}
                  </span>
                </div>

                <div className="px-8 pb-6 flex flex-col md:flex-row md:items-end justify-between -mt-12 gap-4 border-b border-slate-100">
                  <div className="flex items-end space-x-4">
                    <img
                      src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.first_name + ' ' + profile.last_name)}&background=6366f1&color=fff`}
                      alt={profile.first_name}
                      className="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-md bg-white"
                    />
                    <div className="mb-1">
                      <h1 className="text-2xl font-bold text-slate-800 leading-tight">
                        {profile.first_name} {profile.last_name}
                      </h1>
                      <p className="text-xs font-semibold text-indigo-600 flex items-center mt-0.5">
                        <Briefcase className="w-3.5 h-3.5 mr-1" /> {profile.job_position} • {profile.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      profile.status === 'Present' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      profile.status === 'On Leave' || profile.status === 'Leave' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {profile.status}
                    </span>

                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center space-x-1.5 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="px-8 flex space-x-6 border-b border-slate-200 bg-slate-50/50">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-3 text-xs font-bold border-b-2 transition ${
                      activeTab === 'overview'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Profile Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('private')}
                    className={`py-3 text-xs font-bold border-b-2 transition ${
                      activeTab === 'private'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Personal & Private Information
                  </button>
                  <button
                    onClick={() => setActiveTab('resume')}
                    className={`py-3 text-xs font-bold border-b-2 transition ${
                      activeTab === 'resume'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Skills & Resume Section
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {isEditing ? (
                /* Edit Form Mode */
                <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <h2 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center">
                    <Edit3 className="w-4 h-4 mr-2 text-indigo-600" /> Edit Profile Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Work Phone</label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Personal Email</label>
                      <input
                        type="email"
                        value={editForm.personal_email}
                        onChange={e => setEditForm({ ...editForm, personal_email: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                        placeholder="personal@gmail.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={editForm.date_of_birth}
                        onChange={e => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                      <select
                        value={editForm.gender}
                        onChange={e => setEditForm({ ...editForm, gender: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Marital Status</label>
                      <select
                        value={editForm.marital_status}
                        onChange={e => setEditForm({ ...editForm, marital_status: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Home Address</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                      placeholder="Street, City, Country"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Skills (comma-separated)</label>
                    <input
                      type="text"
                      value={editForm.skills}
                      onChange={e => setEditForm({ ...editForm, skills: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                      placeholder="Python, React, SQL, Management"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Resume Summary</label>
                    <textarea
                      rows={4}
                      value={editForm.resume_summary}
                      onChange={e => setEditForm({ ...editForm, resume_summary: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                      placeholder="Write your professional bio and key accomplishments..."
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-xs hover:bg-indigo-700 flex items-center space-x-1.5 disabled:opacity-50 transition"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                    </button>
                  </div>
                </form>
              ) : activeTab === 'overview' ? (
                /* Tab 1: Profile Overview */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Employment Details</h3>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-slate-400 font-medium">Employee Code</p>
                        <p className="font-bold text-indigo-600 font-mono mt-0.5">{profile.emp_code}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium">System Login ID</p>
                        <p className="font-bold text-slate-800 font-mono mt-0.5">{profile.login_id}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium">Company</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{profile.company}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium">Location</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{profile.location}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium">Manager</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{profile.manager_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium">Date of Joining</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{profile.date_of_joining}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <h3 className="font-bold text-slate-800 text-xs mb-2 flex items-center">
                        <Award className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Core Competencies & Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {skillsList.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold rounded-lg"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Work Contact</h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <p className="text-slate-400 font-medium flex items-center">
                          <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" /> Work Email
                        </p>
                        <p className="font-semibold text-slate-800 truncate mt-0.5">{profile.email}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium flex items-center">
                          <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" /> Work Phone
                        </p>
                        <p className="font-semibold text-slate-800 mt-0.5">{profile.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> Address
                        </p>
                        <p className="font-semibold text-slate-800 mt-0.5">{profile.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'private' ? (
                /* Tab 2: Personal & Private Information */
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center">
                      <User className="w-4 h-4 mr-1.5 text-indigo-600" /> Private Personal Information
                    </h3>
                    <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">Confidential</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-slate-400 font-medium">Personal Email</p>
                      <p className="font-semibold text-slate-800 mt-1">{profile.personal_email || 'Not provided'}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-slate-400 font-medium">Date of Birth</p>
                      <p className="font-semibold text-slate-800 mt-1">{profile.date_of_birth || 'N/A'}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-slate-400 font-medium">Gender</p>
                      <p className="font-semibold text-slate-800 mt-1">{profile.gender || 'N/A'}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-slate-400 font-medium">Nationality</p>
                      <p className="font-semibold text-slate-800 mt-1">{profile.nationality || 'N/A'}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-slate-400 font-medium">Marital Status</p>
                      <p className="font-semibold text-slate-800 mt-1">{profile.marital_status || 'N/A'}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-slate-400 font-medium">PAN Number</p>
                      <p className="font-bold font-mono text-slate-800 mt-1">{profile.pan_number || 'N/A'}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-slate-400 font-medium">UAN Number</p>
                      <p className="font-bold font-mono text-slate-800 mt-1">{profile.uan_number || 'N/A'}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 md:col-span-2">
                      <p className="text-slate-400 font-medium">Full Residential Address</p>
                      <p className="font-semibold text-slate-800 mt-1">{profile.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Tab 3: Skills & Resume Section */
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center">
                      <FileText className="w-4 h-4 mr-1.5 text-indigo-600" /> Resume & Professional Summary
                    </h3>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Professional Bio</h4>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                      {profile.resume_summary || 'No resume summary provided yet.'}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
