import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { LogOut, Search, Clock, Timer, CheckCircle2 } from 'lucide-react'

export const Header = ({ searchQuery, setSearchQuery, title = "Dashboard" }) => {
  const { user, logout } = useAuth()
  const [checkInTime, setCheckInTime] = useState(null)
  const [isCheckedOut, setIsCheckedOut] = useState(false)
  const [elapsedTime, setElapsedTime] = useState('00:00:00')

  const checkStatus = async () => {
    try {
      const res = await axios.get('/api/attendance/today')
      if (res.data && res.data.check_in && !res.data.check_out) {
        setCheckInTime(res.data.check_in)
        setIsCheckedOut(false)
      } else {
        setCheckInTime(null)
        setIsCheckedOut(true)
      }
    } catch (err) {
      console.warn('Header attendance status check error:', err)
    }
  }

  // Fetch today's check-in status on mount and listen to window events
  useEffect(() => {
    checkStatus()

    // Poll every 3 seconds for background updates
    const pollInterval = setInterval(checkStatus, 3000)

    // Listen for instant attendance action events
    window.addEventListener('attendanceUpdated', checkStatus)

    return () => {
      clearInterval(pollInterval)
      window.removeEventListener('attendanceUpdated', checkStatus)
    }
  }, [])

  // Live seconds ticker
  useEffect(() => {
    if (!checkInTime || isCheckedOut) {
      setElapsedTime('00:00:00')
      return
    }

    const updateTimer = () => {
      try {
        const formattedIso = checkInTime.includes('T') ? checkInTime : checkInTime.replace(' ', 'T')
        const startTime = new Date(formattedIso).getTime()
        const now = new Date().getTime()
        const diffSeconds = Math.max(Math.floor((now - startTime) / 1000), 0)

        const hours = Math.floor(diffSeconds / 3600)
        const minutes = Math.floor((diffSeconds % 3600) / 60)
        const seconds = diffSeconds % 60

        const pad = (num) => String(num).padStart(2, '0')
        setElapsedTime(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`)
      } catch (e) {
        setElapsedTime('00:00:00')
      }
    }

    updateTimer()
    const timerInterval = setInterval(updateTimer, 1000)
    return () => clearInterval(timerInterval)
  }, [checkInTime, isCheckedOut])

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs z-10">
      <div className="flex items-center space-x-4 flex-1 max-w-xl">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
        {setSearchQuery && (
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employees by name, department, position..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Live Running Shift Timer — Displays ONLY during active check-in, disappears instantly on check-out */}
        {checkInTime && !isCheckedOut && (
          <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl shadow-xs animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <Timer className="w-4 h-4 text-emerald-600" />
            <div className="flex items-center space-x-1 font-mono text-xs font-bold">
              <span className="text-[10px] text-emerald-600 uppercase font-sans tracking-wider">Shift Time:</span>
              <span className="text-emerald-900 text-sm font-extrabold">{elapsedTime}</span>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=6366f1&color=fff`}
            alt={user?.full_name}
            className="w-8 h-8 rounded-full border border-indigo-200"
          />
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-slate-800">{user?.full_name}</p>
            <p className="text-[10px] font-medium text-slate-500 uppercase">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-lg text-xs font-semibold border border-slate-200 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}
