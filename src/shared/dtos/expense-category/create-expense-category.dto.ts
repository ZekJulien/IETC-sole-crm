import { z } from 'zod'
import { HexColorSchema } from '../../validators'

export const CreateExpenseCategorySchema = z.object({
  name:       z.string().min(1),
  color:      HexColorSchema,
  deductible: z.boolean(),
})

export type CreateExpenseCategoryDto = z.infer<typeof CreateExpenseCategorySchema>
