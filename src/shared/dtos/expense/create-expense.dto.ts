import { z } from 'zod'

export const CreateExpenseSchema = z.object({
  label:             z.string().min(1),
  amount:            z.number().positive(),
  date:              z.coerce.date().optional(),
  expenseCategoryId: z.number().int().positive(),
  projectId:         z.number().int().positive().nullable().optional(),
  notes:             z.string().nullable().optional(),
  receiptPaths:      z.array(z.string()).optional(),
})

export type CreateExpenseDto = z.infer<typeof CreateExpenseSchema>
