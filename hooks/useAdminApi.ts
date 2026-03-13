import { useCallback } from 'react'

export function useAdminApi() {
  const getPassword = () =>
    typeof window !== 'undefined'
      ? localStorage.getItem('admin_password') || ''
      : ''

  const headers = useCallback((extra?: Record<string, string>) => ({
    'Content-Type': 'application/json',
    'x-admin-password': getPassword(),
    ...extra,
  }), [])

  const postStatus = useCallback(async (body: Record<string, any>) => {
    const res = await fetch('/api/status', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    })
    return res.json()
  }, [headers])

  const clearStatus = useCallback(async (statusId: string) => {
    const res = await fetch('/api/status/clear', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ status_id: statusId }),
    })
    return res.json()
  }, [headers])

  const fetchRecentAlerts = useCallback(async () => {
    const res = await fetch('/api/status', { headers: headers() })
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  }, [headers])

  const fetchPendingReports = useCallback(async () => {
    const res = await fetch('/api/admin/reports?type=pending', {
      headers: headers(),
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  }, [headers])

  const approveReport = useCallback(async (
    reportId: string,
    approved: boolean
  ) => {
    const res = await fetch('/api/admin/approve', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ report_id: reportId, approved }),
    })
    return res.json()
  }, [headers])

  return {
    postStatus,
    clearStatus,
    fetchRecentAlerts,
    fetchPendingReports,
    approveReport,
  }
}