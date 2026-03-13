import { supabase } from '@/lib/supabase'

export async function GET() {
  // Get all areas
  const { data: areas, error } = await supabase
    .from('areas')
    .select('id, name_en, name_ur, type, lat, lng')
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  // Get all currently active status updates in one query
  const { data: activeStatuses } = await supabase
    .from('status_updates')
    .select('area_name, road_name, status, reason, reported_at, source')
    .eq('is_active', true)

  // Build a lookup map for fast matching
  const statusByArea: Record<string, any> = {}
  for (const status of activeStatuses || []) {
    if (status.area_name && !statusByArea[status.area_name]) {
      statusByArea[status.area_name] = status
    }
  }

  // Attach status to each area
  const areasWithStatus = (areas || []).map(area => ({
    ...area,
    current_status: statusByArea[area.name_en] || null,
  }))

  return Response.json({ areas: areasWithStatus })
}