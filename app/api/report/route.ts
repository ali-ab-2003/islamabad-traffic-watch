import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Simple in-memory rate limiter (resets on server restart)
// For production you'd use Redis, but this is fine for free tier
const ipSubmissions = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const oneHour = 3600 * 1000
  const submissions = ipSubmissions.get(ip) || []

  // Keep only submissions from the last hour
  const recent = submissions.filter(t => now - t < oneHour)
  ipSubmissions.set(ip, recent)

  // Allow max 5 submissions per hour per IP
  if (recent.length >= 5) return true

  recent.push(now)
  ipSubmissions.set(ip, recent)
  return false
}

export async function POST(req: NextRequest) {
  // Get IP for rate limiting
  const ip = req.headers.get('x-forwarded-for') || 'unknown'

  if (isRateLimited(ip)) {
    return Response.json(
      { error: 'Too many reports. Please wait before submitting again.' },
      { status: 429 }
    )
  }

  const body = await req.json()
  const { area_name, status, description } = body

  if (!area_name || area_name.trim().length < 2) {
    return Response.json({ error: 'Area name is required' }, { status: 400 })
  }

  if (!status) {
    return Response.json({ error: 'Status is required' }, { status: 400 })
  }

  // Check if area already has an active status
  const { data: existingStatus } = await supabaseAdmin
    .from('status_updates')
    .select('id')
    .eq('area_name', area_name)
    .eq('is_active', true)
    .maybeSingle()

  // If no existing status, auto-approve and publish immediately
  // If there is one, queue for admin review
  const autoApprove = !existingStatus

  const { data, error } = await supabaseAdmin
    .from('community_reports')
    .insert({
      area_name: area_name.trim(),
      status,
      description: description?.trim() || null,
      approved: autoApprove,
      is_active: autoApprove,
    })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  // If auto-approved, also create a status_update entry
  if (autoApprove) {
    await supabaseAdmin.from('status_updates').insert({
      area_name: area_name.trim(),
      status,
      details: description?.trim() || null,
      source: 'community',
      is_active: true,
      expires_at: new Date(Date.now() + 3 * 3600 * 1000).toISOString(), // 3hr auto-expire
    })
  }

  return Response.json({
    success: true,
    auto_approved: autoApprove,
    message: autoApprove
      ? 'Your report is now live. Thank you!'
      : 'Report submitted for review. Thank you!',
  })
}