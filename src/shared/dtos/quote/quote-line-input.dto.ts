import { z } from 'zod'

export const QuoteLineInputSchema = z.object({
  id:          z.number().int().positive().optional(),
  description: z.string().min(1),
  quantity:    z.number().positive(),
  unitPrice:   z.number().nonnegative(),
  vatRate:     z.number().min(0).max(100),
  productId:   z.number().int().positive().nullable().optional(),
})

export type QuoteLineInput = z.infer<typeof QuoteLineInputSchema>
