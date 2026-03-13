import { formatDistanceToNow } from 'date-fns'
import AlertBadge from './AlertBadge'
import ReportButton from './ReportButton'
import { STATUS_CONFIG } from '@/lib/constants'

interface StatusUpdate {
  id: string
  status: string
  reason?: string
  details?: string
  direction?: string
  source: string
  tweet_url?: string
  reported_at: string
  road_name?: string
  upvotes: number
}

interface Props {
  name: string
  nameUrdu?: string | null
  type: string
  currentStatus: StatusUpdate | null
  roadAlerts?: StatusUpdate[]
  onReported?: () => void
}

export default function StatusCard({
  name, nameUrdu, type, currentStatus, roadAlerts = [], onReported
}: Props) {
  const hasAlert    = !!currentStatus
  const hasRoadAlerts = roadAlerts.length > 0
  const cfg = hasAlert
    ? STATUS_CONFIG[currentStatus!.status as keyof typeof STATUS_CONFIG]
    : null

  return (
    <div className={`rounded-2xl border transition-all
      ${hasAlert
        ? `${cfg!.light} border-${cfg!.border.replace('border-', '')} border-opacity-50`
        : 'bg-zinc-900 border-zinc-800/60'
      }`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-white text-base leading-tight">
                {name}
              </h3>
              {nameUrdu && (
                <span className="text-zinc-500 text-sm">{nameUrdu}</span>
              )}
            </div>
            <p className="text-zinc-600 text-xs mt-0.5 capitalize">{type}</p>
          </div>

          {hasAlert ? (
            <AlertBadge status={currentStatus!.status} />
          ) : (
            <span className="text-xs text-zinc-600 bg-zinc-800/50
                             px-2.5 py-1 rounded-lg border border-zinc-700/30">
              ⚪ No Reports
            </span>
          )}
        </div>

        {/* Active status details */}
        {hasAlert && (
          <div className="mt-3 space-y-1.5">
            {currentStatus!.road_name && (
              <p className="text-zinc-300 text-sm">
                🛣️ <span className="font-medium">{currentStatus!.road_name}</span>
              </p>
            )}
            {currentStatus!.direction && (
              <p className="text-zinc-400 text-sm">
                ↗️ {currentStatus!.direction}
              </p>
            )}
            {currentStatus!.reason && (
              <p className="text-zinc-400 text-sm capitalize">
                📌 {currentStatus!.reason}
              </p>
            )}
            {currentStatus!.details && (
              <p className="text-zinc-400 text-sm leading-relaxed">
                {currentStatus!.details}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium
                  ${currentStatus!.source === 'ITP'
                    ? 'bg-blue-950 text-blue-400 border border-blue-900'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                  {currentStatus!.source === 'ITP' ? '🚔 ITP Official' : '👤 Community'}
                </span>
                <span className="text-zinc-600 text-xs">
                  {formatDistanceToNow(
                    new Date(currentStatus!.reported_at),
                    { addSuffix: true }
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {currentStatus!.upvotes > 0 && (
                  <span className="text-zinc-500 text-xs">
                    👍 {currentStatus!.upvotes}
                  </span>
                )}
                {currentStatus!.tweet_url && (
                  <a
                    href={currentStatus!.tweet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                  >
                    View tweet →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Road alerts on this area */}
        {hasRoadAlerts && (
          <div className="mt-3 pt-3 border-t border-zinc-700/30 space-y-2">
            <p className="text-zinc-500 text-xs font-medium">
              Roads through this area:
            </p>
            {roadAlerts.map(alert => (
              <div key={alert.id}
                className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-zinc-300 text-xs font-medium">
                    {alert.road_name}
                  </span>
                  {alert.direction && (
                    <span className="text-zinc-600 text-xs ml-1">
                      · {alert.direction}
                    </span>
                  )}
                </div>
                <AlertBadge status={alert.status} size="sm" />
              </div>
            ))}
          </div>
        )}

        {/* Report button */}
        <div className="mt-3">
          <ReportButton areaName={name} onSubmitted={onReported} />
        </div>
      </div>
    </div>
  )
}