import { z } from 'zod'

export const InvoiceSumByMonthSchema = z.object({
  year: z.number().int(),
})

export type InvoiceSumByMonthDto = z.infer<typeof InvoiceSumByMonthSchema>
