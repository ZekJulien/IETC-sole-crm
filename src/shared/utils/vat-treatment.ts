import { VatRegime } from '../dtos/company/vat-regime.enum'

export type VatTreatment = 'NORMAL' | 'FRANCHISE' | 'REVERSE_CHARGE'

const EU_CODES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'EL',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
])

const NAME_TO_CODE: Record<string, string> = {
  belgique: 'BE', belgie: 'BE', belgië: 'BE', belgien: 'BE', belgium: 'BE',
  france: 'FR', frankrijk: 'FR', frankreich: 'FR',
  allemagne: 'DE', germany: 'DE', duitsland: 'DE', deutschland: 'DE',
  'pays-bas': 'NL', netherlands: 'NL', nederland: 'NL', niederlande: 'NL', hollande: 'NL',
  luxembourg: 'LU', luxemburg: 'LU',
  italie: 'IT', italy: 'IT', italië: 'IT', italien: 'IT', italia: 'IT',
  espagne: 'ES', spain: 'ES', spanje: 'ES', spanien: 'ES', españa: 'ES',
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function vatPrefix(vatNumber: string | null): string | null {
  if (!vatNumber) return null
  const match = vatNumber.trim().toUpperCase().match(/^([A-Z]{2})/)
  return match ? match[1] : null
}

function countryToCode(country: string | null): string | null {
  if (!country) return null
  const trimmed = country.trim().toUpperCase()
  if (trimmed.length === 2 && /^[A-Z]{2}$/.test(trimmed)) return trimmed
  return NAME_TO_CODE[normalize(country)] ?? null
}

export function resolveVatTreatment(opts: {
  companyRegime:    VatRegime | string
  clientCountry:    string | null
  clientVatNumber:  string | null
}): VatTreatment {
  if (opts.companyRegime === VatRegime.FRANCHISE) return 'FRANCHISE'

  const hasVat = !!opts.clientVatNumber && opts.clientVatNumber.trim().length > 0
  const code   = countryToCode(opts.clientCountry) ?? vatPrefix(opts.clientVatNumber)
  if (hasVat && code && code !== 'BE' && EU_CODES.has(code)) return 'REVERSE_CHARGE'

  return 'NORMAL'
}
