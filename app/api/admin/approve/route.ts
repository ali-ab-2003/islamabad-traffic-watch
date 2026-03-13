import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()

  const { report_id, approved } = await req.json()

  if (!report_id || approved === undefined) {
    return Response.json({ error: 'report_id and approved are required' }, { status: 400 })
  }

  // Fetch the report first
  const { data: report, error: fetchError } = await supabaseAdmin
    .from('community_reports')
    .select('*')
    .eq('id', report_id)
    .single()

  if (fetchError || !report) {
    return Response.json({ error: 'Report not found' }, { status: 404 })
  }

  // Mark as reviewed
  const { error: updateError } = await supabaseAdmin
    .from('community_reports')
    .update({
      approved,
      reviewed: true,
      reviewed_at: new Date().toISOString(),
      is_active: approved,
    })
    .eq('id', report_id)

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 })
  }

  // If approved, publish as a status update
  if (approved) {
    const { error: statusError } = await supabaseAdmin
      .from('status_updates')
      .insert({
        area_name: report.area_name,
        status: report.status,
        details: report.description,
        source: 'community',
        is_active: true,
        expires_at: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
      })

    if (statusError) {
      return Response.json({ error: statusError.message }, { status: 500 })
    }
  }

  return Response.json({
    success: true,
    action: approved ? 'approved and published' : 'rejected',
  })
}