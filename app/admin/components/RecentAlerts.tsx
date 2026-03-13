'use client'
import { useState } from 'react'
import { STATUS_CONFIG } from '@/lib/constants'
import { useAdminApi } from '@/hooks/useAdminApi'
import { formatDistanceToNow } from 'date-fns'

interface Alert {
  id: string
  area_name: string
  road_name?: string
  status: string
  reason?: string
  direction?: string
  is_active: boolean
  reported_at: string
  source: string
  tweet_url?: string
}

interface Props {
  alerts: Alert[]
  onCleared: () => void
}

export default function RecentAlerts({ alerts, onCleared }: Props) {
  const api = useAdminApi()
  const [clearing, setClearing] = useState<string | null>(null)

  async function handleClear(id: string) {
    setClearing(id)
    await api.clearStatus(id)
    onCleared()
    setClearing(null)
  }

  const active = alerts.filter(a => a.is_active)
  const inactive = alerts.filter(a => !a.is_active)

  return (
    <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white">Recent Alerts</h2>
        <div className="flex items-center gap-2">
          {active.length > 0 && (
            <span className="bg-red-500/20 text-red-400 text-xs
                             font-semibold px-2.5 py-1 rounded-full border border-red-500/20">
              {active.length} active
            </span>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <p className="text-zinc-600 text-sm text-center py-6">
          No alerts posted yet
        </p>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1
                        scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700">
          {/* Active first */}
          {active.map(alert => (
            <AlertRow
              key={alert.id}
              alert={alert}
              clearing={clearing}
              onClear={handleClear}
            />
          ))}
          {/* Cleared ones dimmed */}
          {inactive.slice(0, 5).map(alert => (
            <AlertRow
              key={alert.id}
              alert={alert}
              clearing={clearing}
              onClear={handleClear}
              dimmed
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AlertRow({
  alert, clearing, onClear, dimmed = false
}: {
  alert: Alert
  clearing: string | null
  onClear: (id: string) => void
  dimmed?: boolean
}) {
  const cfg = STATUS_CONFIG[alert.status as keyof typeof STATUS_CONFIG]
    || STATUS_CONFIG.open

  return (
    <div className={`rounded-xl p-3 transition-all
      ${dimmed
        ? 'bg-zinc-800/30 opacity-40'
        : 'bg-zinc-800/60 hover:bg-zinc-800'
      }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm">{cfg.emoji}</span>
            <span className="text-sm font-medium text-white truncate">
              {alert.area_name}
            </span>
            {alert.road_name && (
              <span className="text-zinc-500 text-xs">
                · {alert.road_name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {alert.reason && (
              <span className="text-zinc-500 text-xs capitalize">
                {alert.reason}
              </span>
            )}
            {alert.direction && (
              <span className="text-zinc-600 text-xs">
                · {alert.direction}
              </span>
            )}
            <span className="text-zinc-700 text-xs">
              {formatDistanceToNow(new Date(alert.reported_at), { addSuffix: true })}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded-md
              ${alert.source === 'ITP'
                ? 'bg-blue-950 text-blue-400'
                : 'bg-zinc-800 text-zinc-500'
              }`}>
              {alert.source === 'ITP' ? '🚔 ITP' : '👤 Community'}
            </span>
          </div>
          {alert.tweet_url && (
            <a
              href={alert.tweet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-400 text-xs mt-0.5 inline-block"
            >
              View tweet →
            </a>
          )}
        </div>
        {alert.is_active && (
          <button
            onClick={() => onClear(alert.id)}
            disabled={clearing === alert.id}
            className="shrink-0 text-xs px-2.5 py-1 rounded-lg
                       bg-zinc-700/50 text-zinc-400
                       hover:bg-red-950 hover:text-red-400
                       disabled:opacity-50 transition-all"
          >
            {clearing === alert.id ? '...' : 'Clear'}
          </button>
        )}
      </div>
    </div>
  )
}