import { NextRequest } from 'next/server'

export function isAdminAuthorized(req: NextRequest): boolean {
  const adminPassword = req.headers.get('x-admin-password')
  return adminPassword === process.env.ADMIN_SECRET_PASSWORD
}

export function unauthorizedResponse() {
  return Response.json(
    { error: 'Unauthorized' },
    { status: 401 }
  )
}