import { describe, it, expect } from 'vitest'
import { computeDocumentTotals, lineNet, round2 } from '../src/shared/utils/document-totals'

describe('round2', () => {
  it('arrondit au centime', () => {
    expect(round2(33.333)).toBe(33.33)
    expect(round2(0)).toBe(0)
    expect(round2(-1.234)).toBe(-1.23)
  })
})

describe('lineNet', () => {
  it('calcule le net (sans remise)', () => {
    expect(lineNet({ quantity: 2, unitPrice: 50 })).toBe(100)
  })

  it('applique la remise en pourcentage', () => {
    expect(lineNet({ quantity: 1, unitPrice: 100, discount: 10 })).toBe(90)
  })

  it('coerce les strings remontees du formulaire', () => {
    expect(lineNet({ quantity: '2' as unknown as number, unitPrice: '50' as unknown as number })).toBe(100)
    expect(lineNet({ quantity: 1, unitPrice: 100, discount: '' as unknown as number })).toBe(100)
  })
})

describe('computeDocumentTotals', () => {
  it('cas simple : 1 ligne 100 @ 21%', () => {
    const r = computeDocumentTotals([{ quantity: 1, unitPrice: 100, vatRate: 21 }])
    expect(r.totalHt).toBe(100)
    expect(r.totalVat).toBe(21)
    expect(r.totalTtc).toBe(121)
    expect(r.vatBreakdown).toEqual([{ rate: 21, baseHt: 100, vat: 21 }])
  })

  it('multi-taux : ventilation 21% + 6%, triee decroissante', () => {
    const r = computeDocumentTotals([
      { quantity: 2, unitPrice: 50,  vatRate: 21 },
      { quantity: 1, unitPrice: 100, vatRate: 6  },
    ])
    expect(r.totalHt).toBe(200)
    expect(r.totalVat).toBe(27)
    expect(r.totalTtc).toBe(227)
    expect(r.vatBreakdown).toEqual([
      { rate: 21, baseHt: 100, vat: 21 },
      { rate: 6,  baseHt: 100, vat: 6  },
    ])
  })

  it('arrondi par ligne : 3 x 33,33 = 100,00 exact (pas 99,99)', () => {
    const r = computeDocumentTotals([
      { quantity: 1, unitPrice: 33.33, vatRate: 21 },
      { quantity: 1, unitPrice: 33.33, vatRate: 21 },
      { quantity: 1, unitPrice: 33.34, vatRate: 21 },
    ])
    expect(r.totalHt).toBe(100)
    expect(r.totalTtc).toBe(121)
  })

  it('remise de 10%', () => {
    const r = computeDocumentTotals([
      { quantity: 1, unitPrice: 100, discount: 10, vatRate: 21 },
    ])
    expect(r.totalHt).toBe(90)
    expect(r.totalVat).toBe(18.9)
    expect(r.totalTtc).toBe(108.9)
  })

  it('coerce les strings du formulaire (qty / price / discount / vatRate)', () => {
    const r = computeDocumentTotals([
      {
        quantity:  '2'  as unknown as number,
        unitPrice: '50' as unknown as number,
        discount:  ''   as unknown as number,
        vatRate:   '21' as unknown as number,
      },
    ])
    expect(r.totalHt).toBe(100)
    expect(r.totalTtc).toBe(121)
  })

  it('liste vide : totaux a 0 et breakdown vide', () => {
    const r = computeDocumentTotals([])
    expect(r.totalHt).toBe(0)
    expect(r.totalVat).toBe(0)
    expect(r.totalTtc).toBe(0)
    expect(r.vatBreakdown).toEqual([])
  })
})
