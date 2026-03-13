'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useActiveAlerts() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchAlerts() {
    const { data } = await supabase
      .from('status_updates')
      .select('*')
      .eq('is_active', true)
      .order('reported_at', { ascending: false })
      .limit(20)
    setAlerts(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchAlerts()

    // Realtime subscription — updates live when admin posts
    const channel = supabase
      .channel('status_updates_feed')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'status_updates',
        },
        () => fetchAlerts()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return { alerts, loading, refetch: fetchAlerts }
}