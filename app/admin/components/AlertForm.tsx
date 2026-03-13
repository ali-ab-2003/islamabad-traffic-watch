'use client'
import { useState } from 'react'
import AreaRoadSearch from './AreaRoadSearch'
import StatusPicker from './StatusPicker'
import ReasonPicker from './ReasonPicker'
import { EXPIRES_OPTIONS, type Status, type Reason } from '@/lib/constants'
import { useAdminApi } from '@/hooks/useAdminApi'

interface Props {
  onPublished: () => void
}

export default function AlertForm({ onPublished }: Props) {
  const api = useAdminApi()

  const [areaValue, setAreaValue]   = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [roadValue, setRoadValue]   = useState('')
  const [selectedRoad, setSelectedRoad] = useState('')
  const [status, setStatus]         = useState<Status>('blocked')
  const [reason, setReason]         = useState<Reason>('VIP movement')
  const [details, setDetails]       = useState('')
  const [direction, setDirection]   = useState('')
  const [tweetUrl, setTweetUrl]     = useState('')
  const [expires, setExpires]       = useState<number | null>(4)
  const [loading, setLoading]       = useState(false)
  const [message, setMessage]       = useState<{type: 'success'|'error', text: string} | null>(null)

  async function handlePublish() {
    if (!selectedArea && !selectedRoad) {
      setMessage({ type: 'error', text: 'Please select an area or road first' })
      return
    }
    setLoading(true)
    setMessage(null)

    const result = await api.postStatus({
      area_name:    selectedArea  || undefined,
      road_name:    selectedRoad  || undefined,
      status,
      reason,
      details:      details       || undefined,
      direction:    direction     || undefined,
      tweet_url:    tweetUrl      || undefined,
      expires_hours: expires,
    })

    if (result.success) {
      setMessage({ type: 'success', text: 'Alert published successfully!' })
      setAreaValue(''); setSelectedArea('')
      setRoadValue(''); setSelectedRoad('')
      setDetails(''); setDirection(''); setTweetUrl('')
      onPublished()
    } else {
      setMessage({ type: 'error', text: result.error || 'Something went wrong' })
    }
    setLoading(false)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">🚔</span>
        <h2 className="font-semibold text-white">Post ITP Alert</h2>
      </div>

      <AreaRoadSearch
        label="Area / Sector *"
        placeholder="F-10, Faizabad, G-9/1..."
        searchType="areas"
        value={areaValue}
        onChange={v => { setAreaValue(v); if (!v) setSelectedArea('') }}
        onSelect={r => setSelectedArea(r.name_en)}
      />

      <AreaRoadSearch
        label="Road (optional)"
        placeholder="Murree Road, Faisal Avenue..."
        searchType="roads"
        value={roadValue}
        onChange={v => { setRoadValue(v); if (!v) setSelectedRoad('') }}
        onSelect={r => setSelectedRoad(r.name_en)}
      />

      <StatusPicker value={status} onChange={setStatus} />
      <ReasonPicker value={reason} onChange={setReason} />

      {/* Direction */}
      <div>
        <label className="block text-zinc-400 text-xs mb-1.5 font-medium">
          Direction <span className="text-zinc-600 font-normal">(optional)</span>
        </label>
        <input
          value={direction}
          onChange={e => setDirection(e.target.value)}
          placeholder="e.g. towards Zero Point"
          className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl
                     px-4 py-2.5 text-white placeholder-zinc-600 text-sm
                     focus:outline-none focus:border-zinc-500 transition-all"
        />
      </div>

      {/* Details */}
      <div>
        <label className="block text-zinc-400 text-xs mb-1.5 font-medium">
          Details <span className="text-zinc-600 font-normal">(optional)</span>
        </label>
        <textarea
          value={details}
          onChange={e => setDetails(e.target.value)}
          placeholder="Additional info from the tweet..."
          rows={2}
          className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl
                     px-4 py-2.5 text-white placeholder-zinc-600 text-sm
                     focus:outline-none focus:border-zinc-500 transition-all resize-none"
        />
      </div>

      {/* Tweet URL */}
      <div>
        <label className="block text-zinc-400 text-xs mb-1.5 font-medium">
          Tweet URL <span className="text-zinc-600 font-normal">(optional)</span>
        </label>
        <input
          value={tweetUrl}
          onChange={e => setTweetUrl(e.target.value)}
          placeholder="https://x.com/ITP_Offical/status/..."
          className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl
                     px-4 py-2.5 text-white placeholder-zinc-600 text-sm
                     focus:outline-none focus:border-zinc-500 transition-all"
        />
      </div>

      {/* Expires */}
      <div>
        <label className="block text-zinc-400 text-xs mb-2 font-medium">
          Auto-clears in
        </label>
        <div className="flex flex-wrap gap-2">
          {EXPIRES_OPTIONS.map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => setExpires(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${expires === opt.value
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Publish button */}
      <button
        onClick={handlePublish}
        disabled={loading || (!selectedArea && !selectedRoad)}
        className="w-full bg-white text-zinc-950 font-semibold py-3 rounded-xl
                   hover:bg-zinc-100 active:scale-[0.99]
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-all text-sm"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span> Publishing...
          </span>
        ) : '🚀 Publish Alert'}
      </button>

      {message && (
        <div className={`text-sm text-center py-2 px-3 rounded-lg
          ${message.type === 'success'
            ? 'bg-green-950 text-green-400 border border-green-900'
            : 'bg-red-950 text-red-400 border border-red-900'
          }`}>
          {message.text}
        </div>
      )}
    </div>
  )
}