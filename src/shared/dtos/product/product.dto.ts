export interface ProductDto {
  id:          number
  name:        string
  description: string | null
  unitPrice:   number
  vatRate:     number
  unit:        string | null
  archived:    boolean
  createdAt:   Date
  updatedAt:   Date
}
