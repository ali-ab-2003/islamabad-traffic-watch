'use client'
import { useState } from 'react'
import { STATUSES, STATUS_CONFIG, type Status } from '@/lib/constants'

interface Props {
  areaName: string
  onSubmitted?: () => void
}

export default function ReportButton({ areaName, onSubmitted }: Props) {
  const [open, setOpen]           = useState(false)
  const [status, setStatus]       = useState<Status>('blocked')
  const [description, setDesc]    = useState('')
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState('')

  async function handleSubmit() {
    setLoading(true)
    setError('')

    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ area_name: areaName, status, description }),
    })

    const data = await res.json()

    if (res.ok) {
      setDone(true)
      onSubmitted?.()
      setTimeout(() => {
        setOpen(false)
        setDone(false)
        setDesc('')
      }, 2500)
    } else {
      setError(data.error || 'Failed to submit. Try again.')
    }
    setLoading(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-zinc-500 hover:text-zinc-300
                   transition-colors flex items-center gap-1"
      >
        <span>⚠️</span> Report an issue
      </button>
    )
  }

  return (
    <div className="mt-3 pt-3 border-t border-zinc-700/50">
      {done ? (
        <p className="text-green-400 text-xs text-center py-2">
          ✅ Report submitted. Thank you!
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-zinc-400 text-xs font-medium">
            Report issue for <span className="text-white">{areaName}</span>
          </p>

          {/* Status picker */}
          <div className="grid grid-cols-2 gap-1.5">
            {STATUSES.filter(s => s !== 'open').map(s => {
              const cfg = STATUS_CONFIG[s]
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`py-1.5 rounded-lg text-xs font-medium
                    transition-all flex items-center justify-center gap-1
                    ${status === s
                      ? `${cfg.bg} text-white`
                      : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700'
                    }`}
                >
                  {cfg.emoji} {cfg.label}
                </button>
              )
            })}
            <button
              onClick={() => setStatus('open')}
              className={`py-1.5 rounded-lg text-xs font-medium col-span-2
                transition-all flex items-center justify-center gap-1
                ${status === 'open'
                  ? `${STATUS_CONFIG.open.bg} text-white`
                  : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700'
                }`}
            >
              {STATUS_CONFIG.open.emoji} Road is Clear
            </button>
          </div>

          {/* Description */}
          <textarea
            value={description}
            onChange={e => setDesc(e.target.value)}
            placeholder="Any details? (optional)"
            rows={2}
            className="w-full bg-zinc-800 border border-zinc-700/50
                       rounded-lg px-3 py-2 text-xs text-white
                       placeholder-zinc-600 focus:outline-none
                       focus:border-zinc-500 resize-none transition-all"
          />

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-white text-zinc-950 text-xs font-semibold
                         py-2 rounded-lg hover:bg-zinc-200
                         disabled:opacity-50 transition-all"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-2 bg-zinc-700/50 text-zinc-400
                         text-xs rounded-lg hover:bg-zinc-700 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}