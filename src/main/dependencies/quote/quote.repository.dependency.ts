import { getDbContext } from '../../core'
import { QuoteRepository } from '../../repositories/quote/quote.repository'

let _instance: QuoteRepository | null = null

export function getQuoteRepository(): QuoteRepository {
  if (!_instance) _instance = new QuoteRepository(getDbContext())
  return _instance
}
