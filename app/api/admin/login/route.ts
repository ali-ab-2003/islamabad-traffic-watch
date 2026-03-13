import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (password !== process.env.ADMIN_SECRET_PASSWORD) {
    return Response.json({ error: 'Invalid password' }, { status: 401 })
  }

  const res = NextResponse.json({ success: true })

  // Set httpOnly cookie with the password as session token
  res.cookies.set('admin_session', password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return res
}