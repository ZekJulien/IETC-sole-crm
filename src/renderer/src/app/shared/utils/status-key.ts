export function statusKey(prefix: string, value: string): string {
  return prefix + String(value).toLowerCase()
}
