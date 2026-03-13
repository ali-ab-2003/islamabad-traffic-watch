const LEGEND_ITEMS = [
  { color: 'bg-red-500',    label: 'Blocked' },
  { color: 'bg-yellow-500', label: 'Diversion' },
  { color: 'bg-orange-500', label: 'Slow Traffic' },
  { color: 'bg-green-500',  label: 'Open' },
  { color: 'bg-zinc-600',   label: 'No Reports' },
]

export default function MapLegend() {
  return (
    <div className="absolute bottom-8 left-4 z-[1000]
                    bg-zinc-900/95 backdrop-blur border border-zinc-700/60
                    rounded-2xl px-4 py-3 shadow-xl">
      <p className="text-zinc-400 text-xs font-medium mb-2 uppercase tracking-wider">
        Legend
      </p>
      <div className="space-y-1.5">
        {LEGEND_ITEMS.map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${item.color}
                            border-2 border-white/20 shrink-0`} />
            <span className="text-zinc-300 text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}