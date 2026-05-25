export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h && m) return `${h}h${String(m).padStart(2, '0')}`
  if (h)      return `${h}h`
  return `${m}m`
}

export function toMinutes(hours: number, minutes: number): number {
  return Math.max(0, Math.trunc(hours)) * 60 + Math.max(0, Math.trunc(minutes))
}

export function splitDuration(minutes: number): { hours: number; minutes: number } {
  return { hours: Math.floor(minutes / 60), minutes: minutes % 60 }
}
