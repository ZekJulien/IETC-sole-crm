import { z } from 'zod'
import { InvoiceStatus } from './invoice-status.enum'

export const UpdateInvoiceStatusSchema = z.object({
  id:     z.number().int().positive(),
  status: z.enum(InvoiceStatus),
})

export type UpdateInvoiceStatusDto = z.infer<typeof UpdateInvoiceStatusSchema>
