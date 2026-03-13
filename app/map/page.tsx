'use client'
import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import MapFilters from './components/MapFilters'
import MapLegend from './components/MapLegend'

// Must be dynamically imported — Leaflet doesn't support SSR
const MapClient = dynamic(() => import('./components/MapClient'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-zinc-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-pulse">🗺️</div>
        <p className="text-zinc-400 text-sm">Loading map...</p>
      </div>
    </div>
  ),
})

type Filter = 'all' | 'blocked' | 'diversion' | 'slow'

export default function MapPage() {
  const [areas, setAreas]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    fetch('/api/areas/all')
      .then(r => r.json())
      .then(data => {
        setAreas(data.areas || [])
        setLoading(false)
      })
  }, [])

  // Count alerts per status for filter badges
  const counts = useMemo(() => {
    const c: Record<string, number> = {
      blocked: 0, diversion: 0, slow: 0
    }
    areas.forEach(a => {
      const s = a.current_status?.status
      if (s && s in c) c[s]++
    })
    return c
  }, [areas])

  const activeCount = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800/60
                      px-4 py-3 shrink-0 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-zinc-500 hover:text-white transition-colors text-sm"
              >
                ← Back
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-xl">🗺️</span>
                <div>
                  <h1 className="text-white font-bold leading-none">
                    Islamabad Traffic Map
                  </h1>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    {loading
                      ? 'Loading...'
                      : `${areas.length} areas · ${activeCount} active alerts`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-zinc-500 text-xs">Live</span>
            </div>
          </div>

          {/* Filters */}
          <MapFilters
            active={filter}
            onChange={setFilter}
            counts={counts}
          />
        </div>
      </div>

      {/* Map — takes remaining height */}
      <div className="flex-1 relative">
        {!loading && (
          <MapClient areas={areas} filter={filter} />
        )}
        <MapLegend />
      </div>
    </div>
  )
}