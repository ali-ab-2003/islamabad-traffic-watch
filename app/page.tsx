'use client'
import { useSearch }       from '@/hooks/useSearch'
import { useActiveAlerts } from '@/hooks/useActiveAlerts'
import SearchBar           from '@/components/SearchBar'
import SearchResults       from '@/components/SearchResults'
import ActiveAlertsFeed    from '@/components/ActiveAlertsFeed'
import Link                from 'next/link'

export default function HomePage() {
  const search = useSearch()
  const feed   = useActiveAlerts()

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">

      {/* Header */}
      <div className="bg-zinc-900/95 backdrop-blur border-b border-zinc-800/60
                      sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3">

          {/* Title row */}
          <div className="flex items-center justify-between mb-3">
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
            {feed.alerts.length > 0 && (
              <span className="bg-red-500/20 text-red-400 text-xs font-semibold
                               px-2.5 py-1 rounded-full border border-red-500/20
                               animate-pulse">
                {feed.alerts.length} active
              </span>
            )}
          </div>

          {/* Search */}
          <SearchBar
            value={search.query}
            onChange={search.setQuery}
            loading={search.loading}
          />

          {/* Legend — scrollable on very small screens */}
          <div className="flex items-center gap-3 mt-2.5 text-xs text-zinc-600
                          overflow-x-auto pb-0.5 scrollbar-none">
            <span className="shrink-0">🔴 Blocked</span>
            <span className="shrink-0">🟡 Diversion</span>
            <span className="shrink-0">🟠 Slow</span>
            <span className="shrink-0">🟢 Open</span>
            <span className="shrink-0">⚪ No Reports</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {search.isSearching ? (
          <SearchResults
            results={search.results}
            loading={search.loading}
            query={search.query}
            onReported={feed.refetch}
          />
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-zinc-400 text-sm font-medium">
                {feed.loading
                  ? 'Loading...'
                  : feed.alerts.length > 0
                    ? `${feed.alerts.length} active alert${feed.alerts.length !== 1 ? 's' : ''}`
                    : 'Current road status'
                }
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <p className="text-zinc-600 text-xs">Live</p>
              </div>
            </div>
            <ActiveAlertsFeed alerts={feed.alerts} loading={feed.loading} />
          </div>
        )}
      </div>

      {/* Sticky bottom nav — mobile friendly */}
      <div className="fixed bottom-0 left-0 right-0 z-20
                      bg-zinc-900/95 backdrop-blur border-t border-zinc-800/60">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            <Link
              href="/"
              className="flex flex-col items-center gap-1 py-2 px-6
                         text-white"
            >
              <span className="text-xl">🏠</span>
              <span className="text-xs font-medium">Home</span>
            </Link>
            <Link
              href="/map"
              className="flex flex-col items-center gap-1 py-2 px-6
                         text-zinc-500 hover:text-white transition-colors"
            >
              <span className="text-xl">🗺️</span>
              <span className="text-xs">Map</span>
            </Link>
            <Link
              href="/report"
              className="flex flex-col items-center gap-1 py-2 px-6
                         text-zinc-500 hover:text-white transition-colors"
            >
              <span className="text-xl">⚠️</span>
              <span className="text-xs">Report</span>
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}