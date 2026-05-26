import { getDbContext } from '../../core'
import { InvoiceRepository } from '../../repositories/invoice/invoice.repository'

let _instance: InvoiceRepository | null = null

export function getInvoiceRepository(): InvoiceRepository {
  if (!_instance) _instance = new InvoiceRepository(getDbContext())
  return _instance
}
