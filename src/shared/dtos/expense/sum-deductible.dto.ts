import { z } from 'zod'

export const SumDeductibleSchema = z.object({
  year: z.number().int(),
})

export type SumDeductibleDto = z.infer<typeof SumDeductibleSchema>
