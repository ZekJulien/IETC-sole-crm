export function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export function lineNet(line: { quantity: number; unitPrice: number; discount?: number }): number {
  return (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0) * (1 - (Number(line.discount) || 0) / 100)
}

export interface VatBreakdownLine {
  rate:   number
  baseHt: number
  vat:    number
}

export interface DocumentTotals {
  totalHt:      number
  totalVat:     number
  totalTtc:     number
  vatBreakdown: VatBreakdownLine[]
}

export function computeDocumentTotals(
  lines: { quantity: number; unitPrice: number; discount?: number; vatRate: number }[],
): DocumentTotals {
  const byRate = new Map<number, number>()
  for (const line of lines) {
    const ht   = round2(lineNet(line))
    const rate = Number(line.vatRate) || 0
    byRate.set(rate, round2((byRate.get(rate) ?? 0) + ht))
  }
  const vatBreakdown: VatBreakdownLine[] = [...byRate.entries()]
    .map(([rate, baseHt]) => ({ rate, baseHt, vat: round2((baseHt * rate) / 100) }))
    .sort((a, b) => b.rate - a.rate)
  const totalHt  = round2(vatBreakdown.reduce((sum, b) => sum + b.baseHt, 0))
  const totalVat = round2(vatBreakdown.reduce((sum, b) => sum + b.vat, 0))
  return { totalHt, totalVat, totalTtc: round2(totalHt + totalVat), vatBreakdown }
}
