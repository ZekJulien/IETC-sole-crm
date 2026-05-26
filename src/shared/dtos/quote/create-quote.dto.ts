import { z } from 'zod'
import { QuoteStatus } from './quote-status.enum'
import { QuoteLineInputSchema } from './quote-line-input.dto'

export const CreateQuoteSchema = z.object({
  clientId:   z.number().int().positive(),
  projectId:  z.number().int().positive().nullable().optional(),
  issueDate:  z.coerce.date().optional(),
  validUntil: z.coerce.date(),
  status:     z.enum(QuoteStatus).optional(),
  notes:      z.string().nullable().optional(),
  lines:      z.array(QuoteLineInputSchema).min(1),
})

export type CreateQuoteDto = z.infer<typeof CreateQuoteSchema>
