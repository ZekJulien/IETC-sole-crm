import type { VatRegime } from './vat-regime.enum'

export interface CompanySettingsDto {
  companyId:                 string
  defaultVatRate:            number
  vatRegime:                 VatRegime
  paymentTermsDays:          number
  paymentConditions:         string | null
  dashboardNote:             string | null
  invoiceNumberFormat:       string
  invoiceNumberCounter:      number
  invoiceCounterResetYearly: boolean
  invoiceCounterYear:        number
  quoteNumberFormat:         string
  quoteNumberCounter:        number
  quoteCounterResetYearly:   boolean
  quoteCounterYear:          number
  createdAt:                 Date
  updatedAt:                 Date
}
