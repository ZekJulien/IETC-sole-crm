import { QuoteService } from '../../services/quote/quote.service'
import { getQuoteRepository } from './quote.repository.dependency'
import { getCompanyService } from '../company'

let _instance: QuoteService | null = null

export function getQuoteService(): QuoteService {
  if (!_instance) _instance = new QuoteService(getQuoteRepository(), getCompanyService())
  return _instance
}
