interface Stat {
  label: string
  value: number | string
  emoji: string
  color: string
}

interface Props {
  activeAlerts: number
  pendingReports: number
  totalAreas: number
}

export default function StatsBanner({
  activeAlerts, pendingReports, totalAreas
}: Props) {
  const stats: Stat[] = [
    {
      label:  'Active Alerts',
      value:  activeAlerts,
      emoji:  '🚨',
      color:  activeAlerts > 0 ? 'text-red-400' : 'text-zinc-400',
    },
    {
      label:  'Pending Reports',
      value:  pendingReports,
      emoji:  '📋',
      color:  pendingReports > 0 ? 'text-amber-400' : 'text-zinc-400',
    },
    {
      label:  'Areas in DB',
      value:  totalAreas,
      emoji:  '🗺️',
      color:  'text-blue-400',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {stats.map(stat => (
        <div
          key={stat.label}
          className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{stat.emoji}</span>
            <span className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </span>
          </div>
          <p className="text-zinc-500 text-xs">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}