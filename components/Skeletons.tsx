export function AlertCardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <div className="h-4 bg-zinc-800 rounded-lg w-28" />
            <div className="h-3 bg-zinc-800 rounded w-20" />
          </div>
          <div className="h-3 bg-zinc-800 rounded w-36" />
          <div className="h-3 bg-zinc-800 rounded w-24" />
        </div>
        <div className="h-6 bg-zinc-800 rounded-lg w-20 shrink-0" />
      </div>
    </div>
  )
}

export function SearchResultSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-zinc-800 rounded-lg w-24" />
          <div className="h-3 bg-zinc-800 rounded w-16" />
        </div>
        <div className="h-6 bg-zinc-800 rounded-lg w-16 shrink-0" />
      </div>
    </div>
  )
}

export function ReportCardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-zinc-800 rounded-lg w-28" />
          <div className="h-3 bg-zinc-800 rounded w-44" />
          <div className="h-3 bg-zinc-800 rounded w-20" />
        </div>
        <div className="h-6 bg-zinc-800 rounded-lg w-16 shrink-0" />
      </div>
    </div>
  )
}

export function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => <AlertCardSkeleton key={i} />)}
    </div>
  )
}