import { z } from 'zod'
import { QuoteStatus } from './quote-status.enum'

export const UpdateQuoteStatusSchema = z.object({
  id:     z.number().int().positive(),
  status: z.enum(QuoteStatus),
})

export type UpdateQuoteStatusDto = z.infer<typeof UpdateQuoteStatusSchema>
