import { InvoiceStatus } from '@shared/dtos/invoice'
import { statusKey } from '@app/utils'

export const INVOICE_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.DRAFT,
  InvoiceStatus.SENT,
  InvoiceStatus.PAID,
  InvoiceStatus.OVERDUE,
  InvoiceStatus.CANCELLED,
]

export function invoiceStatusKey(status: InvoiceStatus | string): string {
  return statusKey('invoice.status.', status)
}
