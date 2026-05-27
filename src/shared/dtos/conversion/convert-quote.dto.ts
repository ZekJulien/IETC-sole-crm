import { z } from 'zod'

export const ConvertQuoteSchema = z.object({
  quoteId:              z.number().int().positive(),
  projectName:          z.string().min(1),
  createDepositInvoice: z.boolean(),
  depositPercentage:    z.number().min(0).max(100),
  depositLabel:         z.string().min(1),
})

export type ConvertQuoteDto = z.infer<typeof ConvertQuoteSchema>
