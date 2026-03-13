'use client'
import { useState, useEffect, useCallback } from 'react'

const STATUSES = ['blocked', 'diversion', 'slow', 'open'] as const
const REASONS = ['VIP movement', 'protest', 'accident', 'construction', 'event', 'other'] as const
const EXPIRES = [
  { label: '2 hours', value: 2 },
  { label: '4 hours', value: 4 },
  { label: '6 hours', value: 6 },
  { label: '12 hours', value: 12 },
  { label: 'Manual only', value: null },
]

const STATUS_COLORS: Record<string, string> = {
  blocked:   'bg-red-500',
  diversion: 'bg-yellow-500',
  slow:      'bg-orange-500',
  open:      'bg-green-500',
}

const STATUS_EMOJI: Record<string, string> = {
  blocked: '🔴', diversion: '🟡', slow: '🟠', open: '🟢',
}

export default function AdminDashboard() {
  // ── Post alert form state ──────────────────────────────
  const [areaQuery, setAreaQuery] = useState('')
  const [areaResults, setAreaResults] = useState<any[]>([])
  const [selectedArea, setSelectedArea] = useState('')
  const [roadQuery, setRoadQuery] = useState('')
  const [roadResults, setRoadResults] = useState<any[]>([])
  const [selectedRoad, setSelectedRoad] = useState('')
  const [status, setStatus] = useState<string>('blocked')
  const [reason, setReason] = useState<string>('VIP movement')
  const [details, setDetails] = useState('')
  const [direction, setDirection] = useState('')
  const [tweetUrl, setTweetUrl] = useState('')
  const [expiresHours, setExpiresHours] = useState<number | null>(4)
  const [publishing, setPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState<string>('')
  const [adminPassword, setAdminPassword] = useState('')

  // ── Recent alerts state ────────────────────────────────
  const [recentAlerts, setRecentAlerts] = useState<any[]>([])
  const [clearing, setClearing] = useState<string | null>(null)

  // ── Community reports state ────────────────────────────
  const [pendingReports, setPendingReports] = useState<any[]>([])
  const [actioning, setActioning] = useState<string | null>(null)

  // Load password from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('admin_password') || ''
    setAdminPassword(saved)
  }, [])

  const savePassword = (p: string) => {
    setAdminPassword(p)
    localStorage.setItem('admin_password', p)
  }

  // Fetch recent alerts
  const fetchRecentAlerts = useCallback(async () => {
    if (!adminPassword) return
    const res = await fetch('/api/status', {
      headers: { 'x-admin-password': adminPassword },
    })
    if (res.ok) {
      const data = await res.json()
      setRecentAlerts(data.data || [])
    }
  }, [adminPassword])

  // Fetch pending community reports
  const fetchPendingReports = useCallback(async () => {
    if (!adminPassword) return
    const res = await fetch('/api/admin/reports?type=pending', {
      headers: { 'x-admin-password': adminPassword },
    })
    if (res.ok) {
      const data = await res.json()
      setPendingReports(data.data || [])
    }
  }, [adminPassword])

  useEffect(() => {
    if (adminPassword) {
      fetchRecentAlerts()
      fetchPendingReports()
    }
  }, [adminPassword, fetchRecentAlerts, fetchPendingReports])

  // Area autocomplete
  useEffect(() => {
    if (areaQuery.length < 2) { setAreaResults([]); return }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/areas?q=${encodeURIComponent(areaQuery)}`)
      const data = await res.json()
      setAreaResults(data.areas || [])
    }, 300)
    return () => clearTimeout(t)
  }, [areaQuery])

  // Road autocomplete
  useEffect(() => {
    if (roadQuery.length < 2) { setRoadResults([]); return }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/areas?q=${encodeURIComponent(roadQuery)}`)
      const data = await res.json()
      setRoadResults(data.roads || [])
    }, 300)
    return () => clearTimeout(t)
  }, [roadQuery])

  // Publish alert
  async function publishAlert() {
    if (!selectedArea && !selectedRoad) {
      setPublishResult('❌ Please select an area or road')
      return
    }
    setPublishing(true)
    setPublishResult('')

    const res = await fetch('/api/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': adminPassword,
      },
      body: JSON.stringify({
        area_name: selectedArea || undefined,
        road_name: selectedRoad || undefined,
        status,
        reason,
        details: details || undefined,
        direction: direction || undefined,
        tweet_url: tweetUrl || undefined,
        expires_hours: expiresHours,
      }),
    })

    if (res.ok) {
      setPublishResult('✅ Alert published successfully!')
      setSelectedArea('')
      setSelectedRoad('')
      setAreaQuery('')
      setRoadQuery('')
      setDetails('')
      setDirection('')
      setTweetUrl('')
      fetchRecentAlerts()
    } else {
      const err = await res.json()
      setPublishResult(`❌ Error: ${err.error}`)
    }
    setPublishing(false)
  }

  // Clear an alert
  async function clearAlert(id: string) {
    setClearing(id)
    const res = await fetch('/api/status/clear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': adminPassword,
      },
      body: JSON.stringify({ status_id: id }),
    })
    if (res.ok) fetchRecentAlerts()
    setClearing(null)
  }

  // Approve or reject community report
  async function actionReport(reportId: string, approved: boolean) {
    setActioning(reportId)
    const res = await fetch('/api/admin/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': adminPassword,
      },
      body: JSON.stringify({ report_id: reportId, approved }),
    })
    if (res.ok) fetchPendingReports()
    setActioning(null)
  }

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Password field — shown if not saved */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6">
        <label className="text-zinc-400 text-sm block mb-2">Admin Password</label>
        <input
          type="password"
          value={adminPassword}
          onChange={e => savePassword(e.target.value)}
          placeholder="Enter to unlock dashboard"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2
                     text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500
                     text-sm transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── LEFT: Post New Alert ──────────────────────── */}
        <div className="space-y-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h2 className="font-semibold text-lg mb-4">🚔 Post ITP Alert</h2>

            {/* Area selector */}
            <div className="mb-4 relative">
              <label className="text-zinc-400 text-xs mb-1 block">Area / Sector</label>
              <input
                value={selectedArea || areaQuery}
                onChange={e => {
                  setSelectedArea('')
                  setAreaQuery(e.target.value)
                }}
                placeholder="e.g. F-10, Faizabad, G-9..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5
                           text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500
                           text-sm transition-colors"
              />
              {areaResults.length > 0 && !selectedArea && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-zinc-800
                                border border-zinc-700 rounded-xl overflow-hidden shadow-xl">
                  {areaResults.map((a: any) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setSelectedArea(a.name_en)
                        setAreaQuery(a.name_en)
                        setAreaResults([])
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-zinc-700
                                 text-sm text-white transition-colors flex items-center gap-2"
                    >
                      <span className="text-zinc-500 text-xs capitalize">{a.type}</span>
                      {a.name_en}
                      {a.name_ur && <span className="text-zinc-500 text-xs">{a.name_ur}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Road selector */}
            <div className="mb-4 relative">
              <label className="text-zinc-400 text-xs mb-1 block">Road (optional)</label>
              <input
                value={selectedRoad || roadQuery}
                onChange={e => {
                  setSelectedRoad('')
                  setRoadQuery(e.target.value)
                }}
                placeholder="e.g. Murree Road, Faisal Avenue..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5
                           text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500
                           text-sm transition-colors"
              />
              {roadResults.length > 0 && !selectedRoad && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-zinc-800
                                border border-zinc-700 rounded-xl overflow-hidden shadow-xl">
                  {roadResults.map((r: any) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setSelectedRoad(r.name_en)
                        setRoadQuery(r.name_en)
                        setRoadResults([])
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-zinc-700
                                 text-sm text-white transition-colors"
                    >
                      {r.name_en}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="mb-4">
              <label className="text-zinc-400 text-xs mb-2 block">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`py-2 rounded-xl text-sm font-medium capitalize transition-all
                      ${status === s
                        ? `${STATUS_COLORS[s]} text-white`
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                  >
                    {STATUS_EMOJI[s]} {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div className="mb-4">
              <label className="text-zinc-400 text-xs mb-2 block">Reason</label>
              <div className="flex flex-wrap gap-2">
                {REASONS.map(r => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize
                      ${reason === r
                        ? 'bg-zinc-200 text-zinc-900'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Direction */}
            <div className="mb-4">
              <label className="text-zinc-400 text-xs mb-1 block">
                Direction <span className="text-zinc-600">(optional)</span>
              </label>
              <input
                value={direction}
                onChange={e => setDirection(e.target.value)}
                placeholder="e.g. towards Zero Point"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5
                           text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500
                           text-sm transition-colors"
              />
            </div>

            {/* Details */}
            <div className="mb-4">
              <label className="text-zinc-400 text-xs mb-1 block">
                Details <span className="text-zinc-600">(optional)</span>
              </label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Any additional info from the tweet..."
                rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5
                           text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500
                           text-sm transition-colors resize-none"
              />
            </div>

            {/* Tweet URL */}
            <div className="mb-4">
              <label className="text-zinc-400 text-xs mb-1 block">
                Tweet URL <span className="text-zinc-600">(optional)</span>
              </label>
              <input
                value={tweetUrl}
                onChange={e => setTweetUrl(e.target.value)}
                placeholder="https://x.com/ITP_Offical/status/..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5
                           text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500
                           text-sm transition-colors"
              />
            </div>

            {/* Expires */}
            <div className="mb-5">
              <label className="text-zinc-400 text-xs mb-2 block">Auto-clears in</label>
              <div className="flex flex-wrap gap-2">
                {EXPIRES.map(e => (
                  <button
                    key={String(e.value)}
                    onClick={() => setExpiresHours(e.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                      ${expiresHours === e.value
                        ? 'bg-zinc-200 text-zinc-900'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Publish button */}
            <button
              onClick={publishAlert}
              disabled={publishing || (!selectedArea && !selectedRoad)}
              className="w-full bg-white text-zinc-950 font-semibold py-3 rounded-xl
                         hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors"
            >
              {publishing ? 'Publishing...' : '🚀 Publish Alert'}
            </button>

            {publishResult && (
              <p className="mt-3 text-sm text-center text-zinc-300">{publishResult}</p>
            )}
          </div>

          {/* Recent alerts */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h2 className="font-semibold mb-4">
              Recent Alerts
              <span className="text-zinc-500 text-sm font-normal ml-2">
                ({recentAlerts.filter(a => a.is_active).length} active)
              </span>
            </h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recentAlerts.length === 0 && (
                <p className="text-zinc-600 text-sm">No alerts yet</p>
              )}
              {recentAlerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-3 rounded-xl
                    ${alert.is_active ? 'bg-zinc-800' : 'bg-zinc-900 opacity-50'}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{STATUS_EMOJI[alert.status]}</span>
                      <span className="text-sm font-medium truncate">{alert.area_name}</span>
                      {alert.road_name && (
                        <span className="text-zinc-500 text-xs truncate">
                          via {alert.road_name}
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-500 text-xs mt-0.5 capitalize">
                      {alert.reason} · {new Date(alert.reported_at).toLocaleTimeString()}
                    </p>
                  </div>
                  {alert.is_active && (
                    <button
                      onClick={() => clearAlert(alert.id)}
                      disabled={clearing === alert.id}
                      className="ml-2 text-xs text-zinc-500 hover:text-red-400
                                 transition-colors shrink-0"
                    >
                      {clearing === alert.id ? '...' : 'Clear'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Community Reports ──────────────────── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-4">
            👤 Community Reports
            {pendingReports.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold
                               px-2 py-0.5 rounded-full">
                {pendingReports.length}
              </span>
            )}
          </h2>

          {pendingReports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-600 text-4xl mb-2">✓</p>
              <p className="text-zinc-500 text-sm">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {pendingReports.map((report: any) => (
                <div
                  key={report.id}
                  className="bg-zinc-800 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{report.area_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                          ${STATUS_COLORS[report.status]} text-white`}>
                          {STATUS_EMOJI[report.status]} {report.status}
                        </span>
                        <span className="text-zinc-500 text-xs">
                          {new Date(report.submitted_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {report.description && (
                    <p className="text-zinc-400 text-xs mb-3 leading-relaxed">
                      {report.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => actionReport(report.id, true)}
                      disabled={actioning === report.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white
                                 text-xs font-semibold py-2 rounded-lg transition-colors
                                 disabled:opacity-50"
                    >
                      {actioning === report.id ? '...' : '✅ Approve'}
                    </button>
                    <button
                      onClick={() => actionReport(report.id, false)}
                      disabled={actioning === report.id}
                      className="flex-1 bg-zinc-700 hover:bg-red-900 text-zinc-300
                                 text-xs font-semibold py-2 rounded-lg transition-colors
                                 disabled:opacity-50"
                    >
                      {actioning === report.id ? '...' : '❌ Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}