import { InvoiceStatus } from './invoice-status.enum'
import { InvoiceLineDto } from './invoice-line.dto'
import { PaymentDto } from './payment.dto'

export interface InvoiceVatBreakdownLine {
  rate:   number
  baseHt: number
  vat:    number
}

export interface InvoiceDto {
  id:           number
  number:       string
  issueDate:    Date
  supplyDate:   Date | null
  dueDate:      Date
  status:       InvoiceStatus
  notes:        string | null
  clientId:     number
  clientName:   string
  projectId:    number | null
  projectName:  string | null
  quoteId:      number | null
  quoteNumber:  string | null
  lines:        InvoiceLineDto[]
  payments:     PaymentDto[]
  vatBreakdown: InvoiceVatBreakdownLine[]
  totalHt:      number
  totalVat:     number
  totalTtc:     number
  paidAmount:   number
  balanceDue:   number
  createdAt:    Date
  updatedAt:    Date
}
