import { z } from 'zod'

export const ExpenseSumByMonthSchema = z.object({
  year: z.number().int(),
})

export type ExpenseSumByMonthDto = z.infer<typeof ExpenseSumByMonthSchema>
