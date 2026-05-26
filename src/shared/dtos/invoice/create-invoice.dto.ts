import { z } from 'zod'
import { InvoiceStatus } from './invoice-status.enum'
import { InvoiceLineInputSchema } from './invoice-line-input.dto'

export const CreateInvoiceSchema = z.object({
  clientId:  z.number().int().positive(),
  projectId: z.number().int().positive().nullable().optional(),
  issueDate: z.coerce.date().optional(),
  dueDate:   z.coerce.date(),
  status:    z.enum(InvoiceStatus).optional(),
  notes:     z.string().nullable().optional(),
  lines:     z.array(InvoiceLineInputSchema).min(1),
})

export type CreateInvoiceDto = z.infer<typeof CreateInvoiceSchema>
