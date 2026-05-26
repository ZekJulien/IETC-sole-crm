import { InvoiceStatus } from '@shared/dtos/invoice'

export const INVOICE_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.DRAFT,
  InvoiceStatus.SENT,
  InvoiceStatus.PAID,
  InvoiceStatus.OVERDUE,
  InvoiceStatus.CANCELLED,
]

export function invoiceStatusKey(status: InvoiceStatus | string): string {
  return 'invoice.status.' + String(status).toLowerCase()
}
