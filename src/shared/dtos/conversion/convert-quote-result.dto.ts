import { QuoteDto } from '../quote'

export interface ConvertQuoteResultDto {
  quote:     QuoteDto
  projectId: number
  invoiceId: number | null
}
