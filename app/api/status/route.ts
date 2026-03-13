import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()

  const body = await req.json()
  const {
    area_name,
    road_name,
    status,
    reason,
    details,
    direction,
    tweet_url,
    expires_hours,
  } = body

  // Validate required fields
  if (!status) {
    return Response.json({ error: 'Status is required' }, { status: 400 })
  }
  if (!area_name && !road_name) {
    return Response.json(
      { error: 'Either area_name or road_name is required' },
      { status: 400 }
    )
  }

  // Look up area ID if area_name provided
  let area_id = null
  if (area_name) {
    const { data: area } = await supabaseAdmin
      .from('areas')
      .select('id')
      .ilike('name_en', area_name)
      .maybeSingle()
    area_id = area?.id || null
  }

  // Look up road ID if road_name provided
  let road_id = null
  if (road_name) {
    const { data: road } = await supabaseAdmin
      .from('roads')
      .select('id')
      .ilike('name_en', road_name)
      .maybeSingle()
    road_id = road?.id || null
  }

  // Calculate expiry time
  const expires_at = expires_hours
    ? new Date(Date.now() + expires_hours * 3600 * 1000).toISOString()
    : null

  // Insert the status update
  const { data, error } = await supabaseAdmin
    .from('status_updates')
    .insert({
      area_id,
      area_name: area_name || road_name,
      road_id,
      road_name: road_name || null,
      status,
      reason: reason || null,
      details: details || null,
      direction: direction || null,
      tweet_url: tweet_url || null,
      expires_at,
      source: 'ITP',
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true, data })
}

// GET: fetch recent status updates for admin dashboard
export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()

  const { data, error } = await supabaseAdmin
    .from('status_updates')
    .select('*')
    .order('reported_at', { ascending: false })
    .limit(20)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ data })
}