import { QuoteStatus } from './quote-status.enum'
import { QuoteLineDto } from './quote-line.dto'

export interface QuoteVatBreakdownLine {
  rate:   number
  baseHt: number
  vat:    number
}

export interface QuoteDto {
  id:           number
  number:       string
  issueDate:    Date
  validUntil:   Date
  status:       QuoteStatus
  notes:        string | null
  clientId:     number
  clientName:   string
  projectId:    number | null
  projectName:  string | null
  lines:        QuoteLineDto[]
  vatBreakdown: QuoteVatBreakdownLine[]
  totalHt:      number
  totalVat:     number
  totalTtc:     number
  createdAt:    Date
  updatedAt:    Date
}
