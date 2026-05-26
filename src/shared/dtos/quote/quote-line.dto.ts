export interface QuoteLineDto {
  id:          number
  description: string
  quantity:    number
  unitPrice:   number
  vatRate:     number
  productId:   number | null
  total:       number
}
