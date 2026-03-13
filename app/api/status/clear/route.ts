import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()

  const { status_id } = await req.json()

  if (!status_id) {
    return Response.json({ error: 'status_id is required' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('status_updates')
    .update({ is_active: false })
    .eq('id', status_id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}