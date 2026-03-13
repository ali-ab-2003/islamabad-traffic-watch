import { STATUS_CONFIG } from '@/lib/constants'

interface Props {
  status: string
  size?: 'sm' | 'md'
}

export default function AlertBadge({ status, size = 'md' }: Props) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
    || STATUS_CONFIG.open

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-lg
      ${size === 'sm'
        ? 'text-xs px-2 py-0.5'
        : 'text-sm px-2.5 py-1'
      }
      ${cfg.bg} text-white`}>
      {cfg.emoji} {cfg.label}
    </span>
  )
}