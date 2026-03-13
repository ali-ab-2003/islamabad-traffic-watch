import { STATUSES, STATUS_CONFIG, type Status } from '@/lib/constants'

interface Props {
  value: Status
  onChange: (status: Status) => void
}

export default function StatusPicker({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-zinc-400 text-xs mb-2 font-medium">
        Status
      </label>
      <div className="grid grid-cols-2 gap-2">
        {STATUSES.map(s => {
          const cfg = STATUS_CONFIG[s]
          const active = value === s
          return (
            <button
              key={s}
              onClick={() => onChange(s)}
              className={`py-2.5 rounded-xl text-sm font-medium transition-all
                flex items-center justify-center gap-2
                ${active
                  ? `${cfg.bg} text-white shadow-lg scale-[1.02]`
                  : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 hover:text-white'
                }`}
            >
              <span>{cfg.emoji}</span>
              <span>{cfg.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}