'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAdminApi } from '@/hooks/useAdminApi'
import AlertForm from './components/AlertForm'
import RecentAlerts from './components/RecentAlerts'
import PendingReports from './components/PendingReports'
import StatsBanner from './components/StatsBanner'

export default function AdminDashboard() {
  const api = useAdminApi()
  const [alerts, setAlerts]   = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [password, setPassword] = useState('')

  const refresh = useCallback(async () => {
    const [a, r] = await Promise.all([
      api.fetchRecentAlerts(),
      api.fetchPendingReports(),
    ])
    setAlerts(a)
    setReports(r)
  }, [api])

  // Load on mount and when password changes
  useEffect(() => {
    const saved = localStorage.getItem('admin_password') || ''
    setPassword(saved)
  }, [])

  useEffect(() => {
    if (password) refresh()
  }, [password, refresh])

  const activeAlerts = alerts.filter(a => a.is_active).length

  return (
    <div className="text-white">
      {/* Page title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Islamabad Traffic Watch — Admin
          </p>
        </div>
        <button
          onClick={refresh}
          className="text-zinc-500 hover:text-white text-sm
                     transition-colors flex items-center gap-1.5"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Password input */}
      <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 mb-6">
        <label className="text-zinc-400 text-xs font-medium block mb-1.5">
          Admin Password
        </label>
        <input
          type="password"
          defaultValue={password}
          onChange={e => {
            localStorage.setItem('admin_password', e.target.value)
            setPassword(e.target.value)
          }}
          placeholder="Required to post or view alerts"
          className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl
                     px-4 py-2.5 text-white placeholder-zinc-600 text-sm
                     focus:outline-none focus:border-zinc-500 transition-all"
        />
      </div>

      {/* Stats */}
      <StatsBanner
        activeAlerts={activeAlerts}
        pendingReports={reports.length}
        totalAreas={136}
      />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          <AlertForm onPublished={refresh} />
          <RecentAlerts alerts={alerts} onCleared={refresh} />
        </div>

        {/* Right column */}
        <PendingReports reports={reports} onActioned={refresh} />
      </div>
    </div>
  )
}