export const STATUSES = ['blocked', 'diversion', 'slow', 'open'] as const
export type Status = typeof STATUSES[number]

export const REASONS = [
  'VIP movement', 'protest', 'accident',
  'construction', 'event', 'other'
] as const
export type Reason = typeof REASONS[number]

export const EXPIRES_OPTIONS = [
  { label: '2 hrs',  value: 2 },
  { label: '4 hrs',  value: 4 },
  { label: '6 hrs',  value: 6 },
  { label: '12 hrs', value: 12 },
  { label: 'Manual', value: null },
] as const

export const STATUS_CONFIG: Record<Status, {
  color: string
  bg: string
  border: string
  light: string
  emoji: string
  label: string
}> = {
  blocked: {
    color:  'text-red-400',
    bg:     'bg-red-500',
    border: 'border-red-500',
    light:  'bg-red-950',
    emoji:  '🔴',
    label:  'Blocked',
  },
  diversion: {
    color:  'text-yellow-400',
    bg:     'bg-yellow-500',
    border: 'border-yellow-500',
    light:  'bg-yellow-950',
    emoji:  '🟡',
    label:  'Diversion',
  },
  slow: {
    color:  'text-orange-400',
    bg:     'bg-orange-500',
    border: 'border-orange-500',
    light:  'bg-orange-950',
    emoji:  '🟠',
    label:  'Slow Traffic',
  },
  open: {
    color:  'text-green-400',
    bg:     'bg-green-500',
    border: 'border-green-500',
    light:  'bg-green-950',
    emoji:  '🟢',
    label:  'Open',
  },
}