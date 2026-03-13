import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q') || ''

  if (query.length < 2) {
    // Return recently updated areas when no search query
    const { data: recentStatuses } = await supabase
      .from('status_updates')
      .select('area_name, road_name, status, reason, details, direction, source, tweet_url, reported_at, upvotes, id')
      .eq('is_active', true)
      .order('reported_at', { ascending: false })
      .limit(8)

    return Response.json({ areas: [], recent: recentStatuses || [] })
  }

  // Search areas by English name
  const { data: areas, error } = await supabase
    .from('areas')
    .select('id, name_en, name_ur, type, lat, lng')
    .ilike('name_en', `%${query}%`)
    .order('type')
    .limit(8)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  // Also search roads by name
  const { data: roads } = await supabase
    .from('roads')
    .select('id, name_en, name_ur, road_type')
    .ilike('name_en', `%${query}%`)
    .limit(5)

  // For each area, get its latest active status update
  const areasWithStatus = await Promise.all(
    (areas || []).map(async (area) => {
      // Direct status on this area
      const { data: directStatus } = await supabase
        .from('status_updates')
        .select('*')
        .eq('area_name', area.name_en)
        .eq('is_active', true)
        .order('reported_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      // Alerts on roads that pass through this area
      const { data: roadAlerts } = await supabase
        .from('road_areas')
        .select('road_id')
        .eq('area_id', area.id)

      let roadStatusAlerts: any[] = []
      if (roadAlerts && roadAlerts.length > 0) {
        const roadIds = roadAlerts.map(r => r.road_id)
        const { data: roadStatuses } = await supabase
          .from('status_updates')
          .select('*')
          .in('road_id', roadIds)
          .eq('is_active', true)
          .order('reported_at', { ascending: false })
          .limit(3)

        roadStatusAlerts = roadStatuses || []
      }

      return {
        ...area,
        current_status: directStatus || null,
        road_alerts: roadStatusAlerts,
      }
    })
  )

  // For each road result, get its active status alerts
  const roadsWithStatus = await Promise.all(
    (roads || []).map(async (road) => {
      const { data: roadStatuses } = await supabase
        .from('status_updates')
        .select('*')
        .eq('road_id', road.id)
        .eq('is_active', true)
        .order('reported_at', { ascending: false })
        .limit(3)

      return {
        ...road,
        current_statuses: roadStatuses || [],
      }
    })
  )

  return Response.json({
    areas: areasWithStatus,
    roads: roadsWithStatus,
    recent: [],
  })
}