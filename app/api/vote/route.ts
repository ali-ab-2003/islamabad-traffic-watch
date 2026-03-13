import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { target_type, target_id, vote_type } = body

  if (!target_type || !target_id || !vote_type) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Hash the IP for privacy — we never store raw IPs
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const ip_hash = crypto.createHash('sha256').update(ip).digest('hex')

  // Check if this IP already voted on this item
  const { data: existingVote } = await supabaseAdmin
    .from('votes')
    .select('id')
    .eq('ip_hash', ip_hash)
    .eq('target_id', target_id)
    .eq('vote_type', vote_type)
    .maybeSingle()

  if (existingVote) {
    return Response.json(
      { error: 'You have already voted on this' },
      { status: 409 }
    )
  }

  // Record the vote
  const { error: voteError } = await supabaseAdmin
    .from('votes')
    .insert({ ip_hash, target_type, target_id, vote_type })

  if (voteError) {
    return Response.json({ error: voteError.message }, { status: 500 })
  }

  // Increment the counter on the target row
  const table = target_type === 'status' ? 'status_updates' : 'community_reports'
  const column = vote_type === 'upvote' ? 'upvotes' : 'flags'

  const { data: current } = await supabaseAdmin
    .from(table)
    .select(column)
    .eq('id', target_id)
    .single()

  const newCount = ((current as Record<string, any>)?.[column] || 0) + 1

  const { error: updateError } = await supabaseAdmin
    .from(table)
    .update({ [column]: newCount })
    .eq('id', target_id)

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 })
  }

  return Response.json({
    success: true,
    new_count: newCount,
  })
}