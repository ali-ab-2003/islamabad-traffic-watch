'use client'
import { useState, useEffect, useRef } from 'react'

interface Result {
  id: string
  name_en: string
  name_ur?: string
  type?: string
  road_type?: string
}

interface Props {
  label: string
  placeholder: string
  searchType: 'areas' | 'roads'
  value: string
  onChange: (value: string) => void
  onSelect: (result: Result) => void
}

export default function AreaRoadSearch({
  label, placeholder, searchType, value, onChange, onSelect
}: Props) {
  const [results, setResults] = useState<Result[]>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Debounced search
  useEffect(() => {
    if (value.length < 2) { setResults([]); setOpen(false); return }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/areas?q=${encodeURIComponent(value)}`)
      const data = await res.json()
      const items = searchType === 'areas'
        ? (data.areas || [])
        : (data.roads || [])
      setResults(items)
      setOpen(items.length > 0)
    }, 300)
    return () => clearTimeout(t)
  }, [value, searchType])

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-zinc-400 text-xs mb-1.5 font-medium">
        {label}
      </label>
      <input
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-2.5
                   text-white placeholder-zinc-600 focus:outline-none
                   focus:border-zinc-500 focus:bg-zinc-800
                   text-sm transition-all"
      />
      {open && results.length > 0 && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1.5
                        bg-zinc-800 border border-zinc-700 rounded-xl
                        shadow-2xl overflow-hidden">
          {results.slice(0, 6).map((r) => (
            <button
              key={r.id}
              onMouseDown={() => {
                onSelect(r)
                onChange(r.name_en)
                setOpen(false)
                setResults([])
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-zinc-700/80
                         transition-colors flex items-center justify-between group"
            >
              <span className="text-sm text-white">{r.name_en}</span>
              <div className="flex items-center gap-2">
                {r.name_ur && (
                  <span className="text-zinc-500 text-xs">{r.name_ur}</span>
                )}
                <span className="text-zinc-600 text-xs capitalize
                                 group-hover:text-zinc-400 transition-colors">
                  {r.type || r.road_type}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}