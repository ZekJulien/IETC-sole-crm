import { PdfService } from '../../services/pdf'
import { getInvoiceService } from '../invoice'
import { getQuoteService } from '../quote'
import { getCompanyService } from '../company'
import { getClientService } from '../client'

let _instance: PdfService | null = null

export function getPdfService(): PdfService {
  if (!_instance) {
    _instance = new PdfService(
      getInvoiceService(),
      getQuoteService(),
      getCompanyService(),
      getClientService(),
    )
  }
  return _instance
}
