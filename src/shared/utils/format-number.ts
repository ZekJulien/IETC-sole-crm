export function formatNumber(format: string, counter: number, year: number): string {
  const month = new Date().getMonth() + 1
  return format
    .replace(/\{YYYY\}/g, String(year))
    .replace(/\{YY\}/g, String(year).slice(-2))
    .replace(/\{MM\}/g, String(month).padStart(2, '0'))
    .replace(/\{M\}/g, String(month))
    .replace(/\{#+\}/g, token => String(counter).padStart(token.length - 2, '0'))
}
