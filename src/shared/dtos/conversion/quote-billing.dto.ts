export interface QuoteBillingDto {
  quoteId:       number
  totalHt:       number
  totalTtc:      number
  invoicedHt:    number
  invoicedTtc:   number
  remainingHt:   number
  remainingTtc:  number
  fullyInvoiced: boolean
}
