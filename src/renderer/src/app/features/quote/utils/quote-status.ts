import { QuoteStatus } from '@shared/dtos/quote'

export const QUOTE_STATUSES: QuoteStatus[] = [
  QuoteStatus.DRAFT,
  QuoteStatus.SENT,
  QuoteStatus.ACCEPTED,
  QuoteStatus.REJECTED,
  QuoteStatus.EXPIRED,
]

export function quoteStatusKey(status: QuoteStatus | string): string {
  return 'quote.status.' + String(status).toLowerCase()
}
