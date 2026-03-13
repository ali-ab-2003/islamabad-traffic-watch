'use client'
import { useSearch }        from '@/hooks/useSearch'
import { useActiveAlerts }  from '@/hooks/useActiveAlerts'
import SearchBar            from '../components/SearchBar'
import SearchResults        from '../components/SearchResults'
import ActiveAlertsFeed     from '../components/ActiveAlertsFeed'

export default function HomePage() {
  const search  = useSearch()
  const feed    = useActiveAlerts()

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800/60 sticky top-0 z-10
                      backdrop-blur-sm bg-zinc-900/95">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🚦</span>
              <div>
                <h1 className="text-white font-bold text-lg leading-none">
                  Islamabad Traffic
                </h1>
                <p className="text-zinc-500 text-xs mt-0.5">
                  Live road status
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {feed.alerts.length > 0 && (
                <span className="bg-red-500/20 text-red-400 text-xs font-semibold
                                 px-2.5 py-1 rounded-full border border-red-500/20
                                 animate-pulse">
                  {feed.alerts.length} active
                </span>
              )}
              <a
                href="/report"
                className="text-zinc-400 hover:text-white text-sm transition-colors"
              >
                Report
              </a>
            </div>
          </div>

          {/* Search bar */}
          <SearchBar
            value={search.query}
            onChange={search.setQuery}
            loading={search.loading}
          />

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 text-xs text-zinc-600">
            <span>🔴 Blocked</span>
            <span>🟡 Diversion</span>
            <span>🟠 Slow</span>
            <span>🟢 Open</span>
            <span>⚪ No Reports</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-5">
        {search.isSearching ? (
          <SearchResults
            results={search.results}
            loading={search.loading}
            query={search.query}
            onReported={feed.refetch}
          />
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-400 text-sm font-medium">
                {feed.loading
                  ? 'Loading alerts...'
                  : feed.alerts.length > 0
                    ? `${feed.alerts.length} active alert${feed.alerts.length > 1 ? 's' : ''}`
                    : 'Current road status'
                }
              </p>
              <p className="text-zinc-600 text-xs">
                Updates live
              </p>
            </div>
            <ActiveAlertsFeed
              alerts={feed.alerts}
              loading={feed.loading}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-2xl mx-auto px-4 pb-8 mt-8">
        <div className="border-t border-zinc-800/60 pt-6 flex items-center
                        justify-between text-xs text-zinc-600">
          <p>Data from @ITP_Offical + community reports</p>
          <a href="/admin" className="hover:text-zinc-400 transition-colors">
            Admin
          </a>
        </div>
      </div>
    </div>
  )
}