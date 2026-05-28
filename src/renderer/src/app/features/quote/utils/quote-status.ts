import { QuoteStatus } from '@shared/dtos/quote'
import { statusKey } from '@app/utils'

export const QUOTE_STATUSES: QuoteStatus[] = [
  QuoteStatus.DRAFT,
  QuoteStatus.SENT,
  QuoteStatus.ACCEPTED,
  QuoteStatus.REJECTED,
  QuoteStatus.EXPIRED,
]

export function quoteStatusKey(status: QuoteStatus | string): string {
  return statusKey('quote.status.', status)
}
