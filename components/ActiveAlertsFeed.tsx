import { formatDistanceToNow } from 'date-fns'
import AlertBadge from './AlertBadge'
import { STATUS_CONFIG } from '@/lib/constants'
import { FeedSkeleton } from './Skeletons'

interface Alert {
  id: string
  area_name: string
  road_name?: string
  status: string
  reason?: string
  details?: string
  direction?: string
  source: string
  tweet_url?: string
  reported_at: string
  upvotes: number
}

interface Props {
  alerts: Alert[]
  loading: boolean
}

export default function ActiveAlertsFeed({ alerts, loading }: Props) {
  if (loading) return <FeedSkeleton />
  // if (loading) {
  //   return (
  //     <div className="space-y-3">
  //       {[1, 2, 3].map(i => (
  //         <div key={i}
  //           className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-4 animate-pulse">
  //           <div className="flex justify-between items-start">
  //             <div className="space-y-2">
  //               <div className="h-4 bg-zinc-800 rounded w-32" />
  //               <div className="h-3 bg-zinc-800 rounded w-48" />
  //             </div>
  //             <div className="h-6 bg-zinc-800 rounded w-20" />
  //           </div>
  //         </div>
  //       ))}
  //     </div>
  //   )
  // }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🟢</div>
        <h3 className="text-white font-semibold text-lg mb-1">
          All Clear!
        </h3>
        <p className="text-zinc-500 text-sm">
          No active traffic alerts in Islamabad right now.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map(alert => {
        const cfg = STATUS_CONFIG[alert.status as keyof typeof STATUS_CONFIG]
          || STATUS_CONFIG.open

        return (
          <div
            key={alert.id}
            className={`rounded-2xl border p-4 transition-all
              ${cfg.light} border-zinc-700/40`}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-white">
                    {alert.area_name}
                  </h3>
                  {alert.road_name && (
                    <span className="text-zinc-400 text-sm">
                      · {alert.road_name}
                    </span>
                  )}
                </div>
                {alert.direction && (
                  <p className="text-zinc-400 text-xs mt-0.5">
                    ↗️ {alert.direction}
                  </p>
                )}
              </div>
              <AlertBadge status={alert.status} />
            </div>

            {/* Details */}
            {(alert.reason || alert.details) && (
              <div className="mt-2 space-y-1">
                {alert.reason && (
                  <p className="text-zinc-400 text-sm capitalize">
                    📌 {alert.reason}
                  </p>
                )}
                {alert.details && (
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {alert.details}
                  </p>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium
                  ${alert.source === 'ITP'
                    ? 'bg-blue-950 text-blue-400 border border-blue-900'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }`}>
                  {alert.source === 'ITP' ? '🚔 ITP Official' : '👤 Community'}
                </span>
                <span className="text-zinc-600 text-xs">
                  {formatDistanceToNow(
                    new Date(alert.reported_at),
                    { addSuffix: true }
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {alert.upvotes > 0 && (
                  <span className="text-zinc-500 text-xs">
                    👍 {alert.upvotes}
                  </span>
                )}
                {alert.tweet_url && (
                  <a
                    href={alert.tweet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300
                               text-xs transition-colors"
                  >
                    View tweet →
                  </a>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}