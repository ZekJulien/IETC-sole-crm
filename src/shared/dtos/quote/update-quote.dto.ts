import { z } from 'zod'
import { QuoteStatus } from './quote-status.enum'
import { QuoteLineInputSchema } from './quote-line-input.dto'

export const UpdateQuoteSchema = z.object({
  id:         z.number().int().positive(),
  clientId:   z.number().int().positive().optional(),
  projectId:  z.number().int().positive().nullable().optional(),
  issueDate:  z.coerce.date().optional(),
  validUntil: z.coerce.date().optional(),
  status:     z.enum(QuoteStatus).optional(),
  notes:      z.string().nullable().optional(),
  lines:      z.array(QuoteLineInputSchema).min(1).optional(),
})

export type UpdateQuoteDto = z.infer<typeof UpdateQuoteSchema>
