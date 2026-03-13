export type AreaType = 'sector' | 'road' | 'landmark' | 'town'
export type StatusType = 'open' | 'blocked' | 'diversion' | 'slow'
export type ReasonType = 'VIP movement' | 'protest' | 'accident' | 'construction' | 'event' | 'other'
export type SourceType = 'ITP' | 'community'

export interface Area {
  id: string
  name_en: string
  name_ur: string | null
  type: AreaType
  lat: number | null
  lng: number | null
}

export interface StatusUpdate {
  id: string
  area_id: string | null
  area_name: string
  road_id: string | null
  road_name: string | null
  status: StatusType
  reason: ReasonType | null
  details: string | null
  direction: string | null
  source: SourceType
  tweet_url: string | null
  reported_at: string
  expires_at: string | null
  is_active: boolean
  upvotes: number
  flags: number
}

export interface CommunityReport {
  id: string
  area_name: string
  status: StatusType | null
  description: string | null
  submitted_at: string
  upvotes: number
  flags: number
  is_active: boolean
  approved: boolean
  reviewed: boolean
}

export interface AreaWithStatus extends Area {
  current_status: StatusUpdate | null
  road_alerts: StatusUpdate[]
}