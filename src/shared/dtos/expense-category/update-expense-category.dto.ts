import { z } from 'zod'
import { HexColorSchema } from '../../validators'

export const UpdateExpenseCategorySchema = z.object({
  id:         z.number().int().positive(),
  name:       z.string().min(1).optional(),
  color:      HexColorSchema.optional(),
  deductible: z.boolean().optional(),
})

export type UpdateExpenseCategoryDto = z.infer<typeof UpdateExpenseCategorySchema>
