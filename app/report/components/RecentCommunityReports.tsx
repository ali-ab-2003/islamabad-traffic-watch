'use client'
import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import AlertBadge from '../../../components/AlertBadge'

interface Report {
  id: string
  area_name: string
  status: string
  description?: string
  submitted_at: string
  upvotes: number
}

interface Props {
  refreshKey: number
}

export default function RecentCommunityReports({ refreshKey }: Props) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/report?limit=5')
      .then(r => r.json())
      .then(data => {
        setReports(data.reports || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [refreshKey])

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i}
            className="bg-zinc-900 border border-zinc-800/60 rounded-xl
                       p-4 animate-pulse">
            <div className="flex justify-between">
              <div className="h-4 bg-zinc-800 rounded w-28" />
              <div className="h-5 bg-zinc-800 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-600 text-sm">
          No community reports yet. Be the first!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {reports.map(report => (
        <div
          key={report.id}
          className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-4
                     hover:border-zinc-700/60 transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-white text-sm font-medium">
                {report.area_name}
              </p>
              {report.description && (
                <p className="text-zinc-500 text-xs mt-1 leading-relaxed line-clamp-2">
                  {report.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-zinc-600 text-xs">
                  {formatDistanceToNow(
                    new Date(report.submitted_at),
                    { addSuffix: true }
                  )}
                </span>
                {report.upvotes > 0 && (
                  <span className="text-zinc-500 text-xs">
                    · 👍 {report.upvotes}
                  </span>
                )}
              </div>
            </div>
            <AlertBadge status={report.status} size="sm" />
          </div>
        </div>
      ))}
    </div>
  )
}