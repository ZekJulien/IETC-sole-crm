import { z } from 'zod'

export const InvoiceBalanceSchema = z.object({
  quoteId: z.number().int().positive(),
  label:   z.string().min(1),
})

export type InvoiceBalanceDto = z.infer<typeof InvoiceBalanceSchema>
