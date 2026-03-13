'use client'

interface Props {
  value: string
  onChange: (val: string) => void
  loading: boolean
}

export default function SearchBar({ value, onChange, loading }: Props) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
        {loading
          ? <span className="animate-spin inline-block">⏳</span>
          : <span>🔍</span>
        }
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search area, sector, or road..."
        className="w-full bg-zinc-900 border border-zinc-700/60 rounded-2xl
                   pl-11 pr-4 py-4 text-white placeholder-zinc-500
                   focus:outline-none focus:border-zinc-500 focus:bg-zinc-800/80
                   text-base transition-all shadow-lg"
        autoFocus
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2
                     text-zinc-500 hover:text-zinc-300 transition-colors text-lg"
        >
          ×
        </button>
      )}
    </div>
  )
}