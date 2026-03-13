'use client'
import { useState } from 'react'
import { STATUS_CONFIG } from '@/lib/constants'
import { useAdminApi } from '@/hooks/useAdminApi'
import { formatDistanceToNow } from 'date-fns'

interface Report {
  id: string
  area_name: string
  status: string
  description?: string
  submitted_at: string
  upvotes: number
  flags: number
}

interface Props {
  reports: Report[]
  onActioned: () => void
}

export default function PendingReports({ reports, onActioned }: Props) {
  const api = useAdminApi()
  const [actioning, setActioning] = useState<string | null>(null)

  async function handleAction(id: string, approved: boolean) {
    setActioning(id)
    await api.approveReport(id, approved)
    onActioned()
    setActioning(null)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white">Community Reports</h2>
        {reports.length > 0 && (
          <span className="bg-amber-500/20 text-amber-400 text-xs font-semibold
                           px-2.5 py-1 rounded-full border border-amber-500/20">
            {reports.length} pending
          </span>
        )}
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-zinc-400 text-sm font-medium">All caught up!</p>
          <p className="text-zinc-600 text-xs mt-1">
            No pending community reports
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
          {reports.map(report => {
            const cfg = STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG]
              || STATUS_CONFIG.open
            const isActioning = actioning === report.id

            return (
              <div
                key={report.id}
                className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/30
                           hover:border-zinc-600/50 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-medium text-white text-sm">
                      {report.area_name}
                    </p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {formatDistanceToNow(
                        new Date(report.submitted_at),
                        { addSuffix: true }
                      )}
                    </p>
                  </div>
                  <span className={`${cfg.bg} text-white text-xs
                                    font-semibold px-2.5 py-1 rounded-lg shrink-0`}>
                    {cfg.emoji} {cfg.label}
                  </span>
                </div>

                {/* Description */}
                {report.description && (
                  <p className="text-zinc-400 text-xs leading-relaxed mb-3
                                bg-zinc-900/50 rounded-lg px-3 py-2">
                    "{report.description}"
                  </p>
                )}

                {/* Social proof */}
                {(report.upvotes > 0 || report.flags > 0) && (
                  <div className="flex items-center gap-3 mb-3">
                    {report.upvotes > 0 && (
                      <span className="text-green-400 text-xs">
                        👍 {report.upvotes} confirmed
                      </span>
                    )}
                    {report.flags > 0 && (
                      <span className="text-red-400 text-xs">
                        🚩 {report.flags} flagged
                      </span>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(report.id, true)}
                    disabled={isActioning}
                    className="flex-1 bg-green-600 hover:bg-green-500
                               active:scale-[0.98] text-white text-xs
                               font-semibold py-2 rounded-lg transition-all
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isActioning ? '...' : '✅ Approve & Publish'}
                  </button>
                  <button
                    onClick={() => handleAction(report.id, false)}
                    disabled={isActioning}
                    className="flex-1 bg-zinc-700/80 hover:bg-red-950
                               hover:text-red-400 active:scale-[0.98]
                               text-zinc-300 text-xs font-semibold py-2
                               rounded-lg transition-all
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isActioning ? '...' : '❌ Reject'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}