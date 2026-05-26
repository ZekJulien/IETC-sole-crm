import { InvoiceService } from '../../services/invoice/invoice.service'
import { getInvoiceRepository } from './invoice.repository.dependency'
import { getCompanyService } from '../company'

let _instance: InvoiceService | null = null

export function getInvoiceService(): InvoiceService {
  if (!_instance) _instance = new InvoiceService(getInvoiceRepository(), getCompanyService())
  return _instance
}
