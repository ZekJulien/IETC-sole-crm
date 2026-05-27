export interface InvoiceLineDto {
  id:          number
  description: string
  quantity:    number
  unitPrice:   number
  discount:    number
  vatRate:     number
  productId:   number | null
  total:       number
}
