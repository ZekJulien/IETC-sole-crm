import { z } from 'zod'
import { InvoiceStatus } from './invoice-status.enum'
import { InvoiceLineInputSchema } from './invoice-line-input.dto'

export const UpdateInvoiceSchema = z.object({
  id:        z.number().int().positive(),
  clientId:  z.number().int().positive().optional(),
  projectId: z.number().int().positive().nullable().optional(),
  issueDate: z.coerce.date().optional(),
  dueDate:   z.coerce.date().optional(),
  status:    z.enum(InvoiceStatus).optional(),
  notes:     z.string().nullable().optional(),
  lines:     z.array(InvoiceLineInputSchema).min(1).optional(),
})

export type UpdateInvoiceDto = z.infer<typeof UpdateInvoiceSchema>
