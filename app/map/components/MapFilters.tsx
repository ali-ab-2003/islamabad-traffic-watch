type Filter = 'all' | 'blocked' | 'diversion' | 'slow'

interface Props {
  active: Filter
  onChange: (filter: Filter) => void
  counts: Record<string, number>
}

const FILTERS: { key: Filter; label: string; emoji: string; color: string }[] = [
  { key: 'all',       label: 'All',       emoji: '🗺️',  color: 'bg-zinc-700 text-white' },
  { key: 'blocked',   label: 'Blocked',   emoji: '🔴',  color: 'bg-red-600 text-white' },
  { key: 'diversion', label: 'Diversion', emoji: '🟡',  color: 'bg-yellow-600 text-white' },
  { key: 'slow',      label: 'Slow',      emoji: '🟠',  color: 'bg-orange-600 text-white' },
]

export default function MapFilters({ active, onChange, counts }: Props) {
  return (
    <div className="overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
      <div className="flex items-center gap-2 w-max">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => onChange(f.key)}
            className={`flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl
                        text-xs font-medium transition-all
                        ${active === f.key
                          ? f.color + ' shadow-lg scale-105'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                        }`}
          >
            <span>{f.emoji}</span>
            <span>{f.label}</span>
            {f.key !== 'all' && counts[f.key] > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold
                ${active === f.key ? 'bg-white/20' : 'bg-zinc-700'}`}>
                {counts[f.key]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}