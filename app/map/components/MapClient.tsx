'use client'
import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { fixLeafletIcons } from '@/lib/leaflet-icons'
import { STATUS_CONFIG } from '@/lib/constants'
import 'leaflet/dist/leaflet.css'

interface Area {
  id: string
  name_en: string
  name_ur?: string
  type: string
  lat: number
  lng: number
  current_status: any | null
}

interface Props {
  areas: Area[]
  filter: string
}

const STATUS_COLORS: Record<string, string> = {
  blocked:   '#ef4444',
  diversion: '#eab308',
  slow:      '#f97316',
  open:      '#22c55e',
  none:      '#52525b',
}

// Islamabad center coordinates
const ISLAMABAD_CENTER: [number, number] = [33.6844, 73.0479]

function MapUpdater({ areas, filter }: { areas: Area[], filter: string }) {
  const map = useMap()

  useEffect(() => {
    // If filtering to alerts only, fit bounds to visible markers
    if (filter !== 'all') {
      const filtered = areas.filter(a => a.current_status?.status === filter)
      if (filtered.length > 0) {
        const bounds = filtered.map(a => [a.lat, a.lng] as [number, number])
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 })
      }
    }
  }, [filter, areas, map])

  return null
}

export default function MapClient({ areas, filter }: Props) {
  useEffect(() => { fixLeafletIcons() }, [])

  const filtered = filter === 'all'
    ? areas
    : areas.filter(a =>
        filter === 'all'
          ? true
          : a.current_status?.status === filter
      )

  return (
    <MapContainer
      center={ISLAMABAD_CENTER}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
      />

      <MapUpdater areas={areas} filter={filter} />

      {filtered.map(area => {
        const status = area.current_status?.status || 'none'
        const color  = STATUS_COLORS[status]
        const cfg    = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
        const radius = area.current_status ? 9 : 6

        return (
          <CircleMarker
            key={area.id}
            center={[area.lat, area.lng]}
            radius={radius}
            pathOptions={{
              color: 'white',
              weight: 1.5,
              fillColor: color,
              fillOpacity: 0.9,
            }}
          >
            <Popup className="traffic-popup">
              <div className="min-w-[180px]">
                {/* Area name */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-zinc-900 text-sm">
                      {area.name_en}
                    </p>
                    {area.name_ur && (
                      <p className="text-zinc-500 text-xs">{area.name_ur}</p>
                    )}
                  </div>
                  {cfg && (
                    <span className={`text-xs px-2 py-0.5 rounded-lg
                                      text-white font-medium shrink-0
                                      ${cfg.bg}`}>
                      {cfg.emoji} {cfg.label}
                    </span>
                  )}
                </div>

                {/* Status details */}
                {area.current_status ? (
                  <div className="space-y-1 text-xs text-zinc-600 border-t pt-2">
                    {area.current_status.road_name && (
                      <p>🛣️ {area.current_status.road_name}</p>
                    )}
                    {area.current_status.reason && (
                      <p className="capitalize">
                        📌 {area.current_status.reason}
                      </p>
                    )}
                    {area.current_status.direction && (
                      <p>↗️ {area.current_status.direction}</p>
                    )}
                    {area.current_status.details && (
                      <p className="leading-relaxed">
                        {area.current_status.details}
                      </p>
                    )}
                    <p className="text-zinc-400 pt-1">
                      {area.current_status.source === 'ITP'
                        ? '🚔 ITP Official'
                        : '👤 Community'
                      }
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 border-t pt-2">
                    No active alerts
                  </p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}