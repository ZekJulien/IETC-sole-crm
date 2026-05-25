import { z } from 'zod'

export const ExpenseFilterSchema = z.object({
  expenseCategoryId: z.number().int().positive().optional(),
  from:              z.coerce.date().optional(),
  to:                z.coerce.date().optional(),
}).optional()

export type ExpenseFilter = z.infer<typeof ExpenseFilterSchema>
