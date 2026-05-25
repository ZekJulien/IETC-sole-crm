import { z } from 'zod'

export const UpdateExpenseSchema = z.object({
  id:                z.number().int().positive(),
  label:             z.string().min(1).optional(),
  amount:            z.number().positive().optional(),
  date:              z.coerce.date().optional(),
  expenseCategoryId: z.number().int().positive().optional(),
  projectId:         z.number().int().positive().nullable().optional(),
  notes:             z.string().nullable().optional(),
  keepReceiptIds:    z.array(z.number().int().positive()).optional(),
  newReceiptPaths:   z.array(z.string()).optional(),
})

export type UpdateExpenseDto = z.infer<typeof UpdateExpenseSchema>
