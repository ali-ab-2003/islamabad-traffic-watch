'use client'
import { useState } from 'react'
import { STATUSES, STATUS_CONFIG, type Status } from '@/lib/constants'
import AreaRoadSearch from '@/app/admin/components/AreaRoadSearch'

interface Props {
  onSubmitted: () => void
}

export default function ReportForm({ onSubmitted }: Props) {
  const [areaValue, setAreaValue]   = useState('')
  const [areaName, setAreaName]     = useState('')
  const [status, setStatus]         = useState<Status>('blocked')
  const [description, setDesc]      = useState('')
  const [loading, setLoading]       = useState(false)
  const [done, setDone]             = useState(false)
  const [error, setError]           = useState('')
  const [roadValue, setRoadValue] = useState('')
  const [roadName, setRoadName]   = useState('')

  async function handleSubmit() {
    if (!areaName) { setError('Please select an area first'); return }

    setLoading(true)
    setError('')

    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        area_name:   areaName,
        road_name:   roadName || undefined,
        status,
        description: description || undefined,
      }),
    })

    const data = await res.json()

    if (res.ok) {
      setDone(true)
      onSubmitted()
    } else {
      setError(data.error || 'Failed to submit. Please try again.')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-8
                      text-center">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-white font-semibold text-lg mb-2">
          Report Submitted!
        </h3>
        <p className="text-zinc-400 text-sm leading-relaxed mb-6">
          Thank you for helping Islamabad commuters. Your report will be
          reviewed and published shortly.
        </p>
        <button
          onClick={() => {
            setDone(false)
            setAreaValue('')
            setAreaName('')
            setRoadValue('')
            setRoadName('')
            setDesc('')
            setStatus('blocked')
          }}
          className="bg-white text-zinc-950 text-sm font-semibold
                     px-6 py-2.5 rounded-xl hover:bg-zinc-100 transition-all"
        >
          Submit Another Report
        </button>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 space-y-5">
      {/* Area search */}
      <AreaRoadSearch
        label="Where is the issue? *"
        placeholder="F-10, Faizabad, G-9 Markaz..."
        searchType="areas"
        value={areaValue}
        onChange={v => { setAreaValue(v); if (!v) setAreaName('') }}
        onSelect={r => { setAreaName(r.name_en); setAreaValue(r.name_en) }}
      />

      <AreaRoadSearch
        label="Road (optional)"
        placeholder="Murree Road, Faisal Avenue..."
        searchType="roads"
        value={roadValue}
        onChange={v => { setRoadValue(v); if (!v) setRoadName('') }}
        onSelect={r => { setRoadName(r.name_en); setRoadValue(r.name_en) }}
      />

      {/* Status */}
      <div>
        <label className="block text-zinc-400 text-xs mb-2 font-medium">
          What is the situation? *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {STATUSES.map(s => {
            const cfg = STATUS_CONFIG[s]
            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`py-3 rounded-xl text-sm font-medium transition-all
                  flex items-center justify-center gap-2
                  ${status === s
                    ? `${cfg.bg} text-white shadow-lg scale-[1.02]`
                    : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 hover:text-white'
                  }`}
              >
                <span className="text-base">{cfg.emoji}</span>
                <span>{cfg.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-zinc-400 text-xs mb-1.5 font-medium">
          Details{' '}
          <span className="text-zinc-600 font-normal">(optional but helpful)</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDesc(e.target.value)}
          placeholder="e.g. VIP movement near Faizabad, traffic backed up towards Zero Point"
          rows={3}
          maxLength={280}
          className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl
                     px-4 py-3 text-white placeholder-zinc-600 text-sm
                     focus:outline-none focus:border-zinc-500 transition-all
                     resize-none"
        />
        <p className="text-zinc-600 text-xs mt-1 text-right">
          {description.length}/280
        </p>
      </div>

      {/* Guidelines */}
      <div className="bg-zinc-800/40 rounded-xl px-4 py-3 border border-zinc-700/30">
        <p className="text-zinc-500 text-xs leading-relaxed">
          📋 <span className="text-zinc-400 font-medium">Guidelines:</span>{' '}
          Only report genuine traffic issues. False reports are flagged by
          the community and removed. Reports with 3+ flags are auto-hidden.
        </p>
      </div>

      {error && (
        <div className="bg-red-950 border border-red-900 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !areaName}
        className="w-full bg-white text-zinc-950 font-semibold py-3.5
                   rounded-xl hover:bg-zinc-100 active:scale-[0.99]
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-all text-sm"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span> Submitting...
          </span>
        ) : '📤 Submit Report'}
      </button>
    </div>
  )
}