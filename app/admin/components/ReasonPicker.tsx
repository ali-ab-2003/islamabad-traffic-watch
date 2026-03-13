import { REASONS, type Reason } from '@/lib/constants'

const REASON_EMOJI: Record<Reason, string> = {
  'VIP movement':  '👑',
  'protest':       '✊',
  'accident':      '💥',
  'construction':  '🚧',
  'event':         '🎪',
  'other':         '📌',
}

interface Props {
  value: Reason
  onChange: (reason: Reason) => void
}

export default function ReasonPicker({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-zinc-400 text-xs mb-2 font-medium">
        Reason
      </label>
      <div className="flex flex-wrap gap-2">
        {REASONS.map(r => (
          <button
            key={r}
            onClick={() => onChange(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium
              transition-all flex items-center gap-1.5 capitalize
              ${value === r
                ? 'bg-zinc-100 text-zinc-900 shadow-sm'
                : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 hover:text-zinc-200'
              }`}
          >
            <span>{REASON_EMOJI[r]}</span>
            {r}
          </button>
        ))}
      </div>
    </div>
  )
}