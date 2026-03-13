'use client'
import { useState, useEffect } from 'react'

export interface SearchArea {
  id: string
  name_en: string
  name_ur: string | null
  type: string
  lat: number | null
  lng: number | null
  current_status: any | null
  road_alerts: any[]
}

export interface SearchRoad {
  id: string
  name_en: string
  name_ur: string | null
  road_type: string
  current_statuses: any[]
}

export interface SearchResults {
  areas: SearchArea[]
  roads: SearchRoad[]
}

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults>({ areas: [], roads: [] })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.length < 2) {
      setResults({ areas: [], roads: [] })
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/areas?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults({
        areas: data.areas || [],
        roads: data.roads  || [],
      })
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const hasResults = results.areas.length > 0 || results.roads.length > 0
  const isSearching = query.length >= 2

  return { query, setQuery, results, loading, hasResults, isSearching }
}