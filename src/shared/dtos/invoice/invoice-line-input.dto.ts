import { z } from 'zod'

export const InvoiceLineInputSchema = z.object({
  id:          z.number().int().positive().optional(),
  description: z.string().min(1),
  quantity:    z.number().positive(),
  unitPrice:   z.number().nonnegative(),
  discount:    z.number().min(0).max(100).optional(),
  vatRate:     z.number().min(0).max(100),
  productId:   z.number().int().positive().nullable().optional(),
})

export type InvoiceLineInput = z.infer<typeof InvoiceLineInputSchema>
