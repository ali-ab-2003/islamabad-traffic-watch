import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()

  const type = req.nextUrl.searchParams.get('type') || 'pending'

  let query = supabaseAdmin
    .from('community_reports')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (type === 'pending') {
    query = query.eq('reviewed', false).eq('approved', false)
  } else if (type === 'approved') {
    query = query.eq('approved', true)
  } else if (type === 'flagged') {
    query = query.gte('flags', 3)
  }

  const { data, error } = await query.limit(50)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ data })
}