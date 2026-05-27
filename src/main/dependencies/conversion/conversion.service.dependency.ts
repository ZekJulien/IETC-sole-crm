import { ConversionService } from '../../services/conversion'
import { getQuoteService } from '../quote'
import { getProjectService } from '../project'
import { getInvoiceService } from '../invoice'
import { getCompanyService } from '../company'

let _instance: ConversionService | null = null

export function getConversionService(): ConversionService {
  if (!_instance) {
    _instance = new ConversionService(
      getQuoteService(),
      getProjectService(),
      getInvoiceService(),
      getCompanyService(),
    )
  }
  return _instance
}
