import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Building2, CheckCircle2, Server } from 'lucide-react'

function App() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get('/api/health')
      .then(res => {
        setHealth(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 border border-slate-100">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <Building2 className="w-10 h-10 text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-800">HRMS Portal</h1>
        </div>

        <p className="text-slate-600 text-center mb-6 text-sm">
          Human Resource Management System Foundation Initialized
        </p>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center">
              <Server className="w-4 h-4 mr-1.5 text-slate-400" /> API Health:
            </span>
            {loading ? (
              <span className="text-amber-600 font-medium">Checking...</span>
            ) : health ? (
              <span className="text-emerald-600 font-medium flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1" /> {health.status}
              </span>
            ) : (
              <span className="text-rose-600 font-medium">{error || 'Disconnected'}</span>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          Phase 1 Foundation Ready • React + Vite + Tailwind + FastAPI
        </div>
      </div>
    </div>
  )
}

export default App
