import { z } from 'zod'

export const SumByMonthSchema = z.object({
  year:  z.number().int(),
  month: z.number().int().min(1).max(12),
})

export type SumByMonthDto = z.infer<typeof SumByMonthSchema>
