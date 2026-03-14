import StatusCard from './StatusCard'
import AlertBadge from './AlertBadge'
import { type SearchResults as Results } from '@/hooks/useSearch'
import { SearchResultSkeleton } from './Skeletons'

interface Props {
  results: Results
  loading: boolean
  query: string
  onReported: () => void
}

export default function SearchResults({
  results, loading, query, onReported
}: Props) {
  if (loading) {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => <SearchResultSkeleton key={i} />)}
    </div>
  )
  }

  const noResults = results.areas.length === 0 && results.roads.length === 0

  if (noResults) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-zinc-400 text-sm">
          No results for <span className="text-white">"{query}"</span>
        </p>
        <p className="text-zinc-600 text-xs mt-2">
          Try a sector (F-10), road (Murree Road), or landmark (Faizabad)
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Area results */}
      {results.areas.length > 0 && (
        <div>
          {results.roads.length > 0 && (
            <p className="text-zinc-500 text-xs font-medium mb-3 uppercase tracking-wider">
              Areas & Sectors
            </p>
          )}
          <div className="space-y-3">
            {results.areas.map(area => (
              <StatusCard
                key={area.id}
                name={area.name_en}
                nameUrdu={area.name_ur}
                type={area.type}
                currentStatus={area.current_status}
                roadAlerts={area.road_alerts}
                onReported={onReported}
              />
            ))}
          </div>
        </div>
      )}

      {/* Road results */}
      {results.roads.length > 0 && (
        <div>
          {results.areas.length > 0 && (
            <p className="text-zinc-500 text-xs font-medium mb-3 uppercase tracking-wider">
              Roads
            </p>
          )}
          <div className="space-y-3">
            {results.roads.map(road => (
              <div key={road.id}
                className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-semibold text-white">{road.name_en}</h3>
                    {road.name_ur && (
                      <p className="text-zinc-500 text-sm">{road.name_ur}</p>
                    )}
                    <p className="text-zinc-600 text-xs mt-0.5 capitalize">
                      {road.road_type}
                    </p>
                  </div>
                  {road.current_statuses.length === 0 ? (
                    <span className="text-xs text-zinc-600 bg-zinc-800/50
                                     px-2.5 py-1 rounded-lg border border-zinc-700/30">
                      ⚪ Clear
                    </span>
                  ) : (
                    <AlertBadge status={road.current_statuses[0].status} />
                  )}
                </div>

                {road.current_statuses.length > 0 && (
                  <div className="space-y-2 mt-3 pt-3 border-t border-zinc-700/30">
                    {road.current_statuses.map((s: any) => (
                      <div key={s.id}
                        className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-zinc-300 text-sm">
                            Near {s.area_name}
                          </span>
                          {s.direction && (
                            <span className="text-zinc-600 text-xs ml-1">
                              · {s.direction}
                            </span>
                          )}
                          {s.reason && (
                            <span className="text-zinc-500 text-xs ml-1 capitalize">
                              · {s.reason}
                            </span>
                          )}
                        </div>
                        <AlertBadge status={s.status} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}